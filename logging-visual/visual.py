#!/usr/bin/env python3
"""
visual.py — Whole-class analytics for student interaction logs (RELATIVE TIME).

Usage:
  python visual.py path/to/activity.json

Outputs:
- events.csv
- student_activity_summary.csv
- top_paths.csv (most frequent session paths)

Shows plots:
- Learning funnel (counts)
- Event-to-event transition heatmap
- (Optional) Per-student timelines (absolute time)
- NEW: Event density vs relative time (aligned to session start)
- NEW: Stage-by-relative-time heatmap
- NEW: Global raster (all sessions aligned to t=0)

Tune these constants to your dataset:
- SESSION_GAP_SECONDS: inactivity gap to break sessions (default 15 min)
- REL_BIN: bin size for relative time plots ("30S", "1min", "5min", etc.)
- REL_MAX_MINUTES: cap for x-axis (ignore ultra-long tails)
"""

import sys
import json
from datetime import datetime, timedelta
from collections import Counter
from textwrap import shorten
from pathlib import Path

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


# ----------------- CONFIG -----------------
SESSION_GAP_SECONDS = 15 * 60   # 15 minutes
REL_BIN = "1min"                # bin size for relative-time plots
REL_MAX_MINUTES = 120           # only show first 120 minutes of each session
SHOW_ABSOLUTE_TIMELINE = False  # set True if you still want the per-student absolute plot
TOP_N_TRANSITIONS = 12          # transition heatmap size
TOP_K_PATHS = 15                # number of top paths to print/save
# ------------------------------------------


# ---------- Utilities ----------
def parse_ts(ts):
    """Parse Mongo-ish timestamps into aware datetime objects (works on Python 3.6+)."""
    if ts is None:
        return None

    # Extract ISO string
    if isinstance(ts, dict) and "$date" in ts:
        s = ts["$date"]
    elif isinstance(ts, str):
        s = ts
    else:
        return None

    # Normalize trailing Z → +00:00 (UTC)
    s = s.replace("Z", "+00:00")

    # 1) Try Python 3.7+ API if available
    try:
        return datetime.fromisoformat(s)  # type: ignore[attr-defined]
    except Exception:
        pass

    # 2) Try common strptime patterns
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f%z",
                "%Y-%m-%dT%H:%M:%S%z",
                "%Y-%m-%d %H:%M:%S.%f%z",
                "%Y-%m-%d %H:%M:%S%z"):
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            continue

    # 3) Fallback: pandas parser
    try:
        return pd.to_datetime(s, utc=True).to_pydatetime()
    except Exception:
        return None


def load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def to_events_table(data: dict) -> pd.DataFrame:
    """
    Flatten nested JSON into a tidy events DataFrame.
    Columns: email, timestamp, component, action, event, name, content_preview, output_preview
    """
    rows = []
    for user_blob in data.get("activities", []):
        email = user_blob.get("email")
        for e in user_blob.get("activities", []):
            ts = parse_ts(e.get("timestamp"))
            comp = e.get("component", "")
            action = e.get("action", e.get("action", ""))
            name = e.get("name", "")
            content = e.get("content", e.get("input", ""))
            output = e.get("output", "")
            rows.append(
                {
                    "email": email,
                    "timestamp": ts,
                    "component": comp,
                    "action": action,
                    "event": f"{comp}:{action}" if comp and action else (comp or action),
                    "name": name,
                    "content_preview": shorten(
                        str(content).replace("\r", " ").replace("\n", " "),
                        width=120,
                        placeholder="…",
                    ),
                    "output_preview": shorten(
                        str(output).replace("\r", " ").replace("\n", " "),
                        width=120,
                        placeholder="…",
                    ),
                }
            )

    df = pd.DataFrame(rows).sort_values("timestamp").reset_index(drop=True)
    return df


def first_time(df: pd.DataFrame, mask: pd.Series):
    subset = df[mask]
    return subset["timestamp"].min() if not subset.empty else pd.NaT


def to_student_summary(events: pd.DataFrame) -> pd.DataFrame:
    """
    Compute per-student metrics & stage timings (absolute timestamps in output).
    """
    summaries = []
    for email, g in events.groupby("email"):
        g = g.sort_values("timestamp")
        first_seen = g["timestamp"].min()
        last_seen = g["timestamp"].max()
        duration_min = None
        if pd.notna(first_seen) and pd.notna(last_seen):
            duration_min = round((last_seen - first_seen).total_seconds() / 60, 2)

        # Stage timestamps
        t_view_task = first_time(g, (g["component"] == "MODAL") & (g["name"].str.contains("Task", na=False)))
        t_ready = first_time(
            g, (g["component"] == "BUTTON") & (g["name"].str.contains("ready to code", case=False, na=False))
        )
        t_ai_exec = first_time(g, (g["component"] == "AI_AGENT") & (g["action"] == "EXECUTE"))
        t_tests = first_time(g, (g["component"] == "TESTS") & (g["action"] == "EXECUTE"))
        t_submit = first_time(g, (g["component"] == "BUTTON") & (g["action"] == "SUBMIT"))

        def dt_minutes(a, b):
            if pd.isna(a) or pd.isna(b):
                return None
            return round((b - a).total_seconds() / 60, 2)

        summaries.append(
            {
                "email": email,
                "total_events": len(g),
                "unique_components": g["component"].nunique(),
                "chat_messages": int(((g["component"] == "CHAT_APP") & (g["action"].isin(["TYPED", "SEND"]))).sum()),
                "oracle_runs": int(((g["component"] == "ORACLE") & (g["action"] == "EXECUTE")).sum()),
                "ai_executes": int(((g["component"] == "AI_AGENT") & (g["action"] == "EXECUTE")).sum()),
                "tests_runs": int(((g["component"] == "TESTS") & (g["action"] == "EXECUTE")).sum()),
                "submits": int(((g["component"] == "BUTTON") & (g["action"] == "SUBMIT")).sum()),
                "first_seen": first_seen,
                "last_seen": last_seen,
                "session_minutes": duration_min,
                "mins_to_ready_to_code": dt_minutes(t_view_task, t_ready),
                "mins_to_tests": dt_minutes(t_ready, t_tests),
                "mins_to_submit": dt_minutes(t_ready, t_submit),
            }
        )
    return pd.DataFrame(summaries).sort_values("email").reset_index(drop=True)


# ---------- Stage bucketing ----------
def stage_bucket(row):
    """Map raw events into coarse 'stages' for aggregate visuals."""
    comp = row.get("component", "")
    action = row.get("action", "")
    name = row.get("name", "") or ""

    if comp == "MODAL" and "Task" in name:
        return "Viewed Task"
    if comp == "BUTTON" and isinstance(name, str) and "ready to code" in name.lower():
        return "Ready to Code"
    if comp == "AI_AGENT" and action == "EXECUTE":
        return "AI Execute"
    if comp == "ORACLE" and action == "EXECUTE":
        return "Oracle Run"
    if comp == "TESTS" and action == "EXECUTE":
        return "Ran Tests"
    if comp == "BUTTON" and action == "SUBMIT":
        return "Submitted"
    if comp == "CHAT_APP" and action in ("TYPED", "SEND"):
        return "Chat"
    if comp == "CODE_EDITOR" and action == "TYPED":
        return "Code Edit"
    if comp == "BUTTON" and action == "CLICKED":
        return "Button Click"
    if comp == "MODAL" and action == "CLICKED":
        return "Modal Click"
    return f"{comp}:{action}" if comp and action else (comp or action or "Other")


def add_stage(events: pd.DataFrame) -> pd.DataFrame:
    e = events.copy()
    e["stage"] = e.apply(stage_bucket, axis=1)
    return e


# ---------- Sessions & Relative Time ----------
def sessionize(events: pd.DataFrame, gap_seconds: int = SESSION_GAP_SECONDS) -> pd.DataFrame:
    """
    Add session ids and relative time since session start.
    Columns added:
      - session_id (int)
      - session_start (datetime)
      - t_rel (Timedelta)
      - t_rel_min (float, minutes)
    """
    e = events.sort_values(["email", "timestamp"]).copy()
    session_ids = []
    session_starts = []

    sid = -1
    last_email = None
    last_ts = None
    for _, row in e.iterrows():
        email = row["email"]
        ts = pd.to_datetime(row["timestamp"])

        if (email != last_email) or last_ts is None:
            sid += 1
            session_start = ts
        else:
            gap = (ts - last_ts).total_seconds()
            if gap > gap_seconds:
                sid += 1
                session_start = ts
            else:
                session_start = session_starts[-1]  # continue current session

        session_ids.append(sid)
        session_starts.append(session_start)
        last_email = email
        last_ts = ts

    e["session_id"] = session_ids
    e["session_start"] = session_starts
    e["t_rel"] = pd.to_datetime(e["timestamp"]) - pd.to_datetime(e["session_start"])
    e["t_rel_min"] = e["t_rel"].dt.total_seconds() / 60.0
    return e


def rel_time_mask(e: pd.DataFrame, max_minutes: int = REL_MAX_MINUTES) -> pd.Series:
    """Mask to keep only first max_minutes of each session."""
    return (e["t_rel_min"] >= 0) & (e["t_rel_min"] <= float(max_minutes))


def rel_bin_edges(freq_str: str) -> float:
    """
    Return bin width in minutes for a pandas offset alias like "30S", "1min", "5min".
    """
    s = freq_str.lower()
    if s.endswith("s"):
        return float(s[:-1]) / 60.0
    if s.endswith("min"):
        return float(s[:-3])
    if s.endswith("h"):
        return float(s[:-1]) * 60.0
    # default to minutes if plain integer
    try:
        return float(s)
    except Exception:
        return 1.0


# ---------- Aggregate Plots (Relative Time) ----------
def plot_event_density_relative(e: pd.DataFrame, freq=REL_BIN, max_minutes=REL_MAX_MINUTES):
    """All-students event volume vs relative time (aligned to session start)."""
    e = add_stage(e)
    e = sessionize(e)
    e = e[rel_time_mask(e, max_minutes)].copy()

    # Bin t_rel_min
    width_min = rel_bin_edges(freq)
    e["rel_bin"] = (e["t_rel_min"] // width_min) * width_min

    counts = e.groupby("rel_bin").size().sort_index()
    xs = counts.index.values
    ys = counts.values

    plt.figure(figsize=(10, 3.5))
    plt.plot(xs, ys, linewidth=1.5)
    plt.title(f"Event Density vs Relative Time (All Sessions, bin={freq})")
    plt.xlabel("Minutes since session start")
    plt.ylabel("Events")
    plt.tight_layout()
    plt.show()


def plot_stage_time_heatmap_relative(e: pd.DataFrame, freq=REL_BIN, max_minutes=REL_MAX_MINUTES):
    """Heatmap: rows=stage, cols=relative-time bins; value=counts (all sessions)."""
    e = add_stage(e)
    e = sessionize(e)
    e = e[rel_time_mask(e, max_minutes)].copy()

    width_min = rel_bin_edges(freq)
    e["rel_bin"] = (e["t_rel_min"] // width_min) * width_min

    mat = e.groupby(["rel_bin", "stage"]).size().unstack(fill_value=0).T.sort_index()
    xs = mat.columns.values
    plt.figure(figsize=(12, max(3.5, 0.3 * len(mat))))
    plt.imshow(mat.values, aspect="auto")
    plt.title(f"Stage Activity vs Relative Time (All Sessions, bin={freq})")
    plt.xlabel("Minutes since session start")
    plt.ylabel("Stage")
    # x ticks (sparse)
    if len(xs) > 1:
        idxs = np.linspace(0, len(xs) - 1, num=min(12, len(xs))).astype(int)
        plt.xticks(idxs, [f"{xs[i]:.0f}" for i in idxs], rotation=45, ha="right")
    plt.yticks(range(len(mat.index)), mat.index)
    plt.tight_layout()
    plt.show()


def plot_global_raster_relative(e: pd.DataFrame, max_minutes=REL_MAX_MINUTES):
    """Scatter all events vs relative time (y=stage)."""
    e = add_stage(e)
    e = sessionize(e)
    e = e[rel_time_mask(e, max_minutes)].copy()

    # stage order by overall frequency
    order = e["stage"].value_counts().index.tolist()
    stage_to_y = {st: i for i, st in enumerate(order)}

    plt.figure(figsize=(11, 4))
    xs = e["t_rel_min"].values
    ys = [stage_to_y[s] for s in e["stage"]]
    plt.scatter(xs, ys, s=12, alpha=0.8)
    plt.yticks(range(len(order)), order)
    plt.xlabel("Minutes since session start")
    plt.ylabel("Stage")
    plt.title("Global Event Raster (Aligned by Session Start)")
    plt.tight_layout()
    plt.show()


# ---------- Paths (Whole-class, session-based) ----------
def top_paths(events: pd.DataFrame, path_len: int = 5, dedupe_repeats: bool = True,
              gap_seconds: int = SESSION_GAP_SECONDS, k: int = TOP_K_PATHS) -> pd.DataFrame:
    """
    Extract most frequent stage paths across all students.
    Sessionized to avoid cross-session jumps.
    """
    e = add_stage(events)
    e = sessionize(e, gap_seconds)

    paths = Counter()
    for sid, g in e.sort_values(["session_id", "t_rel"]).groupby("session_id"):
        stages = g["stage"].tolist()
        if dedupe_repeats:
            deduped = []
            for s in stages:
                if not deduped or deduped[-1] != s:
                    deduped.append(s)
            stages = deduped
        # n-grams up to path_len
        for i in range(len(stages)):
            for L in range(2, min(path_len, len(stages) - i) + 1):
                paths[tuple(stages[i:i+L])] += 1

    top = paths.most_common(k)
    df = pd.DataFrame(
        [{"path": " → ".join(p), "length": len(p), "count": c} for p, c in top]
    )
    return df


# ---------- Original (absolute-time) Plots ----------
def plot_funnel(events: pd.DataFrame):
    stage_defs = [
        ("Viewed Task", (events["component"] == "MODAL") & (events["name"].str.contains("Task", na=False))),
        ("Ready to Code", (events["component"] == "BUTTON") & (events["name"].str.contains("ready to code", case=False, na=False))),
        ("AI Execute", (events["component"] == "AI_AGENT") & (events["action"] == "EXECUTE")),
        ("Ran Tests", (events["component"] == "TESTS") & (events["action"] == "EXECUTE")),
        ("Submitted", (events["component"] == "BUTTON") & (events["action"] == "SUBMIT")),
    ]
    stage_labels = [name for name, _ in stage_defs]
    stage_counts = [int(mask.sum()) for _, mask in stage_defs]

    plt.figure(figsize=(8, 4))
    plt.bar(stage_labels, stage_counts)
    plt.title("Learning Funnel (All Users)")
    plt.xlabel("Stage")
    plt.ylabel("Event Count")
    plt.xticks(rotation=15, ha="right")
    plt.tight_layout()
    plt.show()


def plot_transition_heatmap(events: pd.DataFrame, top_n: int = TOP_N_TRANSITIONS):
    # Build transition counts by student
    def transition_counts(df):
        df = df.sort_values("timestamp")
        seq = df["event"].tolist()
        c = Counter()
        for a, b in zip(seq, seq[1:]):
            c[(a, b)] += 1
        return c

    all_trans = Counter()
    for _, g in events.groupby("email"):
        all_trans.update(transition_counts(g))

    # Compact set of frequent events
    top_events = pd.Series([x for pair in all_trans.keys() for x in pair]).value_counts().head(top_n).index.tolist()
    labels = top_events
    idx = {lab: i for i, lab in enumerate(labels)}
    mat = np.zeros((len(labels), len(labels)), dtype=int)
    for (a, b), c in all_trans.items():
        if a in idx and b in idx:
            mat[idx[a], idx[b]] = c

    plt.figure(figsize=(9, 6))
    plt.imshow(mat, aspect="auto")
    plt.title("Top Event-to-Event Transitions")
    plt.xlabel("Next Event")
    plt.ylabel("Current Event")
    plt.xticks(range(len(labels)), labels, rotation=45, ha="right")
    plt.yticks(range(len(labels)), labels)
    for i in range(len(labels)):
        for j in range(len(labels)):
            if mat[i, j] > 0:
                plt.text(j, i, str(mat[i, j]), ha="center", va="center")
    plt.tight_layout()
    plt.show()


def plot_timelines(events: pd.DataFrame):
    # (Optional) Absolute-time per-student scatter
    event_order = events["event"].value_counts().index.tolist()
    event_to_y = {ev: i for i, ev in enumerate(event_order)}
    plt.figure(figsize=(11, 4))
    for email, g in events.groupby("email"):
        xs = pd.to_datetime(g["timestamp"])
        ys = [event_to_y[e] for e in g["event"]]
        plt.scatter(xs, ys, label=email, s=30)
    plt.yticks(range(len(event_order)), event_order)
    plt.xlabel("Absolute Time")
    plt.ylabel("Event Type")
    plt.title("Per-Student Event Timelines (Absolute)")
    plt.legend(loc="upper left", bbox_to_anchor=(1.02, 1.0))
    plt.tight_layout()
    plt.show()


# ---------- Main ----------
def main():
    if len(sys.argv) < 2:
        print("Usage: python visual.py activity.json")
        sys.exit(1)

    in_path = Path(sys.argv[1]).expanduser().resolve()
    data = load_json(in_path)

    events = to_events_table(data)
    events.to_csv("events.csv", index=False)

    summary = to_student_summary(events)
    summary.to_csv("student_activity_summary.csv", index=False)

    # Absolute-time overview (kept for reference)
    plot_funnel(events)
    plot_transition_heatmap(events)
    if SHOW_ABSOLUTE_TIMELINE:
        plot_timelines(events)

    # Relative-time (aligned) whole-class views
    plot_event_density_relative(events, freq=REL_BIN, max_minutes=REL_MAX_MINUTES)
    plot_stage_time_heatmap_relative(events, freq=REL_BIN, max_minutes=REL_MAX_MINUTES)
    plot_global_raster_relative(events, max_minutes=REL_MAX_MINUTES)

    # Frequent paths (session-based)
    paths_df = top_paths(events, path_len=5, dedupe_repeats=True,
                         gap_seconds=SESSION_GAP_SECONDS, k=TOP_K_PATHS)
    paths_df.to_csv("top_paths.csv", index=False)
    print("\nTop session paths:")
    print(paths_df.to_string(index=False))

    print("\nWrote files:")
    print(" - events.csv")
    print(" - student_activity_summary.csv")
    print(" - top_paths.csv")


if __name__ == "__main__":
    main()
