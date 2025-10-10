#!/usr/bin/env python3
"""
Reads hit_summary-style CSV and writes:
  1) pearson_input.csv    -> the cleaned numeric columns actually used
  2) pearson_results.csv  -> N, r, p, 95% CI, regression slope/intercept, R^2, etc.
  3) hit_vs_failed.png    -> scatter with regression line
  4) pearson_results.txt  -> human-readable text summary

Expected columns in input CSV:
  _id, failedAttempts, classes_hit, total_classes
"""

import argparse
import csv
import math
import sys
from typing import Tuple

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def fisher_ci(r: float, n: int, alpha: float = 0.05) -> Tuple[float, float]:
    """95% CI for Pearson r via Fisher z-transform."""
    if n < 4 or not np.isfinite(r) or abs(r) >= 1:
        return (float("nan"), float("nan"))
    z = np.arctanh(r)
    se = 1.0 / math.sqrt(n - 3)
    # 1.95996... ~ z_0.975
    zcrit = 1.959963984540054
    lo = z - zcrit * se
    hi = z + zcrit * se
    return (math.tanh(lo), math.tanh(hi))

def p_value_from_r(r: float, n: int) -> float:
    """
    Two-sided p-value for Pearson r using t = r*sqrt((n-2)/(1-r^2)) with df=n-2.
    Requires SciPy for the t CDF. If SciPy isn't available, returns NaN.
    """
    try:
        from scipy import stats
    except Exception:
        return float("nan")
    if n < 3 or not np.isfinite(r) or abs(r) == 1:
        return float("nan")
    t = r * math.sqrt((n - 2) / max(1e-15, 1 - r * r))
    df = n - 2
    return 2 * (1 - stats.t.cdf(abs(t), df=df))

def write_txt_summary(path: str, n: int, x_col: str, y_col: str,
                      r: float, p: float, ci_lo: float, ci_hi: float,
                      intercept: float, slope: float, r2: float, slope_se: float) -> None:
    def fmt(x, digs=4):
        if isinstance(x, float) and (math.isnan(x) or math.isinf(x)):
            return "NaN"
        return f"{x:.{digs}f}"
    lines = [
        "Pearson Correlation Summary",
        "===========================",
        f"Sample size (n):        {n}",
        f"X column:               {x_col}",
        f"Y column:               {y_col}",
        "",
        f"Pearson r:              {fmt(r)}",
        f"95% CI for r:          [{fmt(ci_lo)}, {fmt(ci_hi)}]",
        f"Two-sided p-value:      {fmt(p) if not (math.isnan(p) or math.isinf(p)) else 'NaN (SciPy not installed)'}",
        "",
        "Simple Linear Regression (Y = intercept + slope * X)",
        f"Intercept:              {fmt(intercept)}",
        f"Slope:                  {fmt(slope)}   (SE = {fmt(slope_se)})",
        f"R-squared:              {fmt(r2)}",
        "",
        "Notes:",
        "- p-value is computed via SciPy if available; otherwise it's reported as NaN.",
        "- Pearson assumes an approximately linear relationship and sensitivity to outliers.",
    ]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="in_path", default="q2_hit_summary.csv",
                    help="Input CSV path (default: q1_equiv_hits_summary.csv)")
    ap.add_argument("--x", default="classes_hit", help="X column (default: classes_hit)")
    ap.add_argument("--y", default="failedAttempts", help="Y column (default: failedAttempts)")
    ap.add_argument("--out-data", default="pearson_input.csv", help="Cleaned input CSV output")
    ap.add_argument("--out-res", default="pearson_results.csv", help="Results CSV output")
    ap.add_argument("--out-fig", default="hit_vs_failed.png", help="Scatter plot PNG output")
    ap.add_argument("--out-txt", default="pearson_results.txt", help="Human-readable TXT output")
    args = ap.parse_args()

    # Read and coerce numeric
    try:
        df = pd.read_csv(args.in_path)
    except FileNotFoundError:
        print(f"ERROR: couldn't find input file: {args.in_path}", file=sys.stderr)
        sys.exit(1)

    if args.x not in df.columns or args.y not in df.columns:
        print(f"ERROR: expected columns '{args.x}' and '{args.y}' in {args.in_path}", file=sys.stderr)
        print(f"Found columns: {list(df.columns)}", file=sys.stderr)
        sys.exit(1)

    x = pd.to_numeric(df[args.x], errors="coerce")
    y = pd.to_numeric(df[args.y], errors="coerce")
    clean = pd.DataFrame({args.x: x, args.y: y}).dropna()

    if len(clean) < 3:
        print("ERROR: Need at least 3 numeric rows for Pearson correlation.", file=sys.stderr)
        sys.exit(1)

    # Save cleaned input used
    clean.to_csv(args.out_data, index=False)

    x_np = clean[args.x].to_numpy(dtype=float)
    y_np = clean[args.y].to_numpy(dtype=float)
    n = len(clean)

    # Pearson r
    r = float(np.corrcoef(x_np, y_np)[0, 1])

    # p-value and 95% CI
    p = p_value_from_r(r, n)
    ci_lo, ci_hi = fisher_ci(r, n, alpha=0.05)

    # Linear regression (Y = a + bX)
    b, a = np.polyfit(x_np, y_np, 1)
    y_pred = a + b * x_np

    # R^2
    ss_res = float(np.sum((y_np - y_pred) ** 2))
    ss_tot = float(np.sum((y_np - np.mean(y_np)) ** 2))
    r2 = 1.0 - ss_res / ss_tot if ss_tot > 0 else float("nan")

    # Slope SE
    dof = max(1, n - 2)
    s_err = math.sqrt(ss_res / dof) / math.sqrt(float(np.sum((x_np - np.mean(x_np)) ** 2)))

    # Results CSV
    res = pd.DataFrame([{
        "n": n,
        "x_col": args.x,
        "y_col": args.y,
        "pearson_r": r,
        "p_value_two_sided": p,        # NaN if SciPy not installed
        "ci95_lo": ci_lo,
        "ci95_hi": ci_hi,
        "reg_intercept": a,
        "reg_slope": b,
        "r_squared": r2,
        "slope_stderr": s_err
    }])
    res.to_csv(args.out_res, index=False)

    # Results TXT (readable summary)
    write_txt_summary(args.out_txt, n, args.x, args.y, r, p, ci_lo, ci_hi, a, b, r2, s_err)

    # Plot
    plt.figure()
    plt.scatter(x_np, y_np)
    x_line = np.linspace(np.min(x_np), np.max(x_np), 100)
    y_line = a + b * x_line
    plt.plot(x_line, y_line)
    plt.xlabel(args.x)
    plt.ylabel(args.y)
    plt.title(f"Q2 (LargestInRange) {args.y} vs {args.x}")
    plt.tight_layout()
    plt.savefig(args.out_fig, dpi=160)

    print(f"Wrote: {args.out_data}")
    print(f"Wrote: {args.out_res}")
    print(f"Wrote: {args.out_txt}")
    print(f"Wrote: {args.out_fig}")

if __name__ == "__main__":
    main()
