#!/usr/bin/env python3
"""
Compute per-user equivalence-class coverage from q1_attempts.csv.

Input:
  - q1_attempts.csv (default) with columns like:
      _id, failedAttempts, oracleEquivalenceMap.1, oracleEquivalenceMap.2, ...

Output:
  - q1_equiv_hits_summary.csv with:
      _id, failedAttempts, classes_hit, total_classes, hit_ratio, hit_indices

Behavior:
  - An equivalence class is "hit" if the corresponding cell under
    'oracleEquivalenceMap.*' for that user is non-empty.
  - Skips oracleEquivalenceMap keys with numeric suffixes 1, 2, and 3.
  - hit_ratio is like "5/8" for 5 hits out of 8 classes (after skipping).
  - hit_indices lists which class numbers were hit, e.g. "4,8,9".
  - Flexible: if _id/failedAttempts are missing, blanks are written.

Usage:
  python3 make_equiv_summary.py \
      --in q1_attempts.csv \
      --out q1_equiv_hits_summary.csv
"""

import csv
import argparse
import sys
from typing import List

PREFIX = "oracleEquivalenceMap."
EXCLUDE_SUFFIXES = {1, 2, 3}  # <<— skip these keys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="in_path", default="q1_attempts.csv",
                    help="Input CSV path (default: q1_attempts.csv)")
    ap.add_argument("--out", dest="out_path", default="q1_equiv_hits_summary.csv",
                    help="Output CSV path (default: q1_equiv_hits_summary.csv)")
    args = ap.parse_args()

    try:
        with open(args.in_path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.reader(f)
            rows = list(reader)
    except FileNotFoundError:
        print(f"ERROR: Couldn't find input file: {args.in_path}", file=sys.stderr)
        sys.exit(1)

    if not rows:
        print("ERROR: Input CSV is empty.", file=sys.stderr)
        sys.exit(1)

    header: List[str] = rows[0]
    data_rows = rows[1:]

    # Identify oracleEquivalenceMap.* columns and sort by numeric suffix if possible.
    # Exclude numeric suffixes in EXCLUDE_SUFFIXES.
    eq_indices = []
    for idx, col in enumerate(header):
        if col.startswith(PREFIX):
            try:
                suffix_str = col.split(".", 1)[1]
                suffix = int(suffix_str)
            except Exception:
                # Non-numeric suffix goes to the end and is NOT excluded
                suffix = float("inf")

            # Skip if numeric and in the exclude set
            if suffix != float("inf") and suffix in EXCLUDE_SUFFIXES:
                continue

            eq_indices.append((idx, suffix, col))

    # Sort by numeric suffix (inf goes last)
    eq_indices.sort(key=lambda t: t[1])
    eq_only_indices = [i for (i, _, _) in eq_indices]
    total_classes = len(eq_only_indices)

    # Optional columns
    try:
        id_idx = header.index("_id")
    except ValueError:
        id_idx = None

    try:
        fa_idx = header.index("failedAttempts")
    except ValueError:
        fa_idx = None

    out_header = ["_id", "failedAttempts", "classes_hit", "total_classes", "hit_ratio", "hit_indices"]

    with open(args.out_path, "w", encoding="utf-8", newline="") as out_f:
        writer = csv.writer(out_f)
        writer.writerow(out_header)

        for r in data_rows:
            # Safe getters
            _id = r[id_idx].strip() if id_idx is not None and id_idx < len(r) else ""
            failed_attempts = r[fa_idx].strip() if fa_idx is not None and fa_idx < len(r) else ""

            # Count hits (non-empty cells) and record which indices
            classes_hit = 0
            hit_list = []
            for i, (_, suffix, colname) in zip(eq_only_indices, eq_indices):
                val = r[i].strip() if i < len(r) else ""
                if val != "":
                    classes_hit += 1
                    # Prefer numeric suffix if available; else use the column name
                    if suffix != float("inf"):
                        hit_list.append(str(suffix))
                    else:
                        hit_list.append(colname)

            hit_ratio = f"{classes_hit}/{total_classes}" if total_classes > 0 else "0/0"
            hit_indices_str = ",".join(hit_list)

            writer.writerow([_id, failed_attempts, classes_hit, total_classes, hit_ratio, hit_indices_str])

    print(f"Done. Wrote: {args.out_path}")

if __name__ == "__main__":
    main()
