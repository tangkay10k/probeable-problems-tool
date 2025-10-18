#!/usr/bin/env python3
"""
Unpaired comparison of total_count for 2024 vs 2025 using Welch's t-test only.

Outputs:
  - probe_totals_comparison.png  (boxplots + ECDFs)
  - probe_totals_results.txt     (readable summary + Welch stats)

Expected CSV format (header):
id,total_count
68d9d1efc078163b8fb2176b,0
...

Usage:
  python compare_and_plot_probes_welch.py \
      --y2024 2024_total_counts.csv \
      --y2025 2025_total_counts.csv \
      --png probe_totals_comparison.png \
      --txt probe_totals_results.txt
"""

import argparse
import csv
import math
from pathlib import Path
import statistics as stats
import matplotlib.pyplot as plt

def read_counts(path: Path):
    vals = []
    with path.open("r", encoding="utf-8") as f:
        r = csv.DictReader(f)
        if "total_count" not in r.fieldnames:
            raise ValueError(f"{path} missing required 'total_count' column")
        for row in r:
            try:
                vals.append(float(row["total_count"]))
            except Exception:
                pass
    return vals

def describe(x):
    if not x:
        return dict(n=0, mean=float("nan"), median=float("nan"), sd=float("nan"),
                    min=float("nan"), max=float("nan"), total=0.0)
    return dict(
        n=len(x),
        mean=sum(x)/len(x),
        median=stats.median(x),
        sd=(stats.stdev(x) if len(x) > 1 else 0.0),
        min=min(x),
        max=max(x),
        total=sum(x),
    )

def welch_t_test(x, y):
    """
    Welch's t-test (unequal variances).
    Returns: t, df (Welch–Satterthwaite), two-sided p via normal approx,
             mean_diff (y - x), SE
    """
    n1, n2 = len(x), len(y)
    if n1 < 2 or n2 < 2:
        return float("nan"), float("nan"), float("nan"), float("nan"), float("nan")
    m1, m2 = sum(x)/n1, sum(y)/n2
    # population variance estimate (use pvariance to align with SE formula); stdev also fine
    s1 = stats.pvariance(x)
    s2 = stats.pvariance(y)
    se = math.sqrt(s1/n1 + s2/n2)
    if se == 0:
        return float("nan"), float("nan"), float("nan"), (m2 - m1), 0.0
    t = (m2 - m1) / se
    df_num = (s1/n1 + s2/n2)**2
    df_den = (s1*s1)/(n1*n1*(n1-1)) + (s2*s2)/(n2*n2*(n2-1))
    df = df_num/df_den if df_den > 0 else float("inf")
    # Two-sided p via normal approximation (conservative if df small)
    p_norm = math.erfc(abs(t) / math.sqrt(2.0))
    return t, df, p_norm, (m2 - m1), se

def ecdf(values):
    xs = sorted(values)
    n = len(xs)
    if n == 0:
        return [], []
    ys = [(i+1)/n for i in range(n)]
    return xs, ys

def make_figure(a, b, outfile):
    # One figure with two panels: boxplots and ECDFs
    fig = plt.figure(figsize=(9, 4.5))
    gs = fig.add_gridspec(1, 1, wspace=0.25)

    # Left: boxplots
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.boxplot([a, b], labels=["2024", "2025"], showfliers=True)
    ax1.set_ylabel("total_count")

    fig.suptitle("2024 vs 2025: Total Student Probes", fontsize=12)
    fig.tight_layout()
    fig.savefig(outfile, dpi=200)
    plt.close(fig)

def write_report(path, d24, d25, t, df, p, mean_diff, se):
    def fmt(d):
        return (f"n={d['n']}, mean={d['mean']:.3f}, median={d['median']:.3f}, "
                f"sd={d['sd']:.3f}, min={d['min']:.0f}, max={d['max']:.0f}, total={d['total']:.0f}")

    if not math.isnan(p):
        direction = "higher" if mean_diff > 0 else "lower" if mean_diff < 0 else "the same"
        if p < 0.05:
            conclusion = f"Significant difference (Welch p≈{p:.4g}); 2025 mean is {direction} than 2024."
        else:
            conclusion = f"No statistically significant difference (Welch p≈{p:.4g})."
    else:
        conclusion = "Not enough data to test."

    with open(path, "w", encoding="utf-8") as f:
        f.write("Probe Totals per ID: 2024 vs 2025 (Welch's t-test)\n")
        f.write("===================================================\n\n")
        f.write("Summary statistics\n")
        f.write(f"2024: {fmt(d24)}\n")
        f.write(f"2025: {fmt(d25)}\n\n")

        f.write("Welch's t-test (unequal variances)\n")
        f.write(f"Mean difference (2025 - 2024): {mean_diff:.3f}\n")
        f.write(f"SE: {se:.3f}\n")
        f.write(f"t = {t:.3f}, df ≈ {df:.1f}, two-sided p ≈ {p:.6g}\n\n")

        f.write("Conclusion\n")
        f.write(f"{conclusion}\n")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--y2024", default="2024_total_counts.csv")
    ap.add_argument("--y2025", default="2025_total_counts.csv")
    ap.add_argument("--png", default="probe_totals_comparison.png")
    ap.add_argument("--txt", default="probe_totals_results.txt")
    args = ap.parse_args()

    a = read_counts(Path(args.y2024))  # 2024
    b = read_counts(Path(args.y2025))  # 2025

    d24 = describe(a)
    d25 = describe(b)

    t, df, p, mean_diff, se = welch_t_test(a, b)

    # Save figure + report
    make_figure(a, b, args.png)
    write_report(args.txt, d24, d25, t, df, p, mean_diff, se)

    print(f"Wrote {args.png}")
    print(f"Wrote {args.txt}")

if __name__ == "__main__":
    main()
