#!/usr/bin/env python3
"""
Welch two-sample t-test comparing mean scores between two tally CSVs.

Reads (by default):
  - 2024_tally_counts.csv
  - 2025_tally_counts.csv

Each file format:
  score,count,percent
  0/5,138,14.94
  1/5,174,18.83
  ...

Outputs:
  - ttest_results.csv : detailed numeric results for each year and the t-test
  - ttest_results.txt : human-readable summary
  - tally_hist.png    : side-by-side bar chart of distributions

Stats reported per year:
  n, mean, std (unbiased), min, max, skewness (Fisher), kurtosis_excess

Test reported:
  Welch t, df (Welch–Satterthwaite), two-sided p, 95% CI of mean difference,
  Cohen's d and Hedges' g (direction = mean_2025 - mean_2024).

Usage:
  python3 t_test_from_tally.py
  python3 t_test_from_tally.py --csv2024 path/to/2024.csv --csv2025 path/to/2025.csv
"""

import argparse
import csv
import math
import re
import sys
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# ---- Optional SciPy for exact p and CI with t distribution ----
def _try_import_scipy():
    try:
        from scipy import stats as _stats  # type: ignore
        return _stats
    except Exception:
        return None

SCIPY = _try_import_scipy()


def parse_score_str(s: str) -> float:
    """
    Convert a 'k/5' string to numeric k (float).
    Accepts '0/5', '1/5', ... '5/5'. Also accepts plain numbers like '3'.
    """
    s = str(s).strip()
    m = re.match(r"^\s*(\d+)\s*/\s*(\d+)\s*$", s)
    if m:
        return float(int(m.group(1)))
    # fallback: plain number
    try:
        return float(s)
    except Exception:
        raise ValueError(f"Unrecognized score format: {s!r}")


def read_tally_csv(path: str) -> pd.DataFrame:
    """
    Read tally CSV and return DataFrame with columns:
      score_num (float), count (int)
    Ignores 'percent' (recomputed if needed).
    """
    try:
        df = pd.read_csv(path)
    except FileNotFoundError:
        print(f"ERROR: couldn't find input file: {path}", file=sys.stderr)
        sys.exit(1)

    if "score" not in df.columns or "count" not in df.columns:
        print(f"ERROR: expected columns 'score' and 'count' in {path}", file=sys.stderr)
        print(f"Found columns: {list(df.columns)}", file=sys.stderr)
        sys.exit(1)

    # Parse score to numeric
    df["score_num"] = df["score"].apply(parse_score_str)
    # Coerce count to int
    df["count"] = pd.to_numeric(df["count"], errors="coerce").astype("Int64")
    df = df.dropna(subset=["score_num", "count"]).copy()
    df["count"] = df["count"].astype(int)
    return df[["score_num", "count"]].sort_values("score_num").reset_index(drop=True)


def weighted_descriptives(x: np.ndarray, w: np.ndarray) -> Dict[str, float]:
    """
    Compute weighted descriptive stats for grouped/duplicated values.
    Uses 'frequency weights' interpretation (each x_i repeated w_i times).
    Returns: n, mean, std (unbiased), min, max, skewness (Fisher), kurtosis_excess.
    """
    n = int(w.sum())
    if n <= 1:
        return dict(n=n, mean=np.nan, std=np.nan, min=np.min(x), max=np.max(x),
                    skewness=np.nan, kurtosis_excess=np.nan)

    mean = float((w * x).sum() / n)
    # Central moments (frequency-weighted)
    diff = x - mean
    m2 = float((w * diff**2).sum() / n)
    m3 = float((w * diff**3).sum() / n)
    m4 = float((w * diff**4).sum() / n)

    # Unbiased sample std (ddof=1) from frequencies
    # Compute sum of squared deviations as if expanded:
    SSw = float((w * diff**2).sum())
    std = math.sqrt(SSw / (n - 1)) if n > 1 else float("nan")

    # Fisher-Pearson skewness (population definition g1 = m3/m2^(3/2))
    skew = m3 / (m2 ** 1.5) if m2 > 0 else float("nan")
    # Excess kurtosis g2 = m4/m2^2 - 3
    kurt_ex = (m4 / (m2 ** 2) - 3.0) if m2 > 0 else float("nan")

    return dict(
        n=n,
        mean=mean,
        std=std,
        min=float(np.min(x)),
        max=float(np.max(x)),
        skewness=skew,
        kurtosis_excess=kurt_ex,
    )


def welch_t_test(m1: float, s1: float, n1: int, m2: float, s2: float, n2: int) -> Dict[str, float]:
    """
    Welch's t-test (two-sided) comparing m2 - m1 (2025 - 2024).
    Returns: t, df, p_two_sided, se, ci_lo, ci_hi (95%), d (Cohen), g (Hedges).
    """
    # Standard error
    s1sq, s2sq = s1**2, s2**2
    se = math.sqrt(s1sq / n1 + s2sq / n2)
    if se == 0:
        tstat = float("inf") if (m2 - m1) != 0 else 0.0
        df = float("inf")
    else:
        tstat = (m2 - m1) / se
        # Welch–Satterthwaite df
        num = (s1sq / n1 + s2sq / n2) ** 2
        den = (s1sq**2 / (n1**2 * (n1 - 1))) + (s2sq**2 / (n2**2 * (n2 - 1)))
        df = num / den if den > 0 else float("inf")

    # p-value and CI
    if SCIPY is not None and np.isfinite(df):
        p = 2 * (1 - SCIPY.t.cdf(abs(tstat), df=df))
        tcrit = SCIPY.t.ppf(0.975, df=df)
    else:
        # Normal approximation for large df
        p = 2 * (1 - 0.5 * (1 + math.erf(abs(tstat) / math.sqrt(2))))
        tcrit = 1.959963984540054  # ~ z0.975

    ci_lo = (m2 - m1) - tcrit * se
    ci_hi = (m2 - m1) + tcrit * se

    # Cohen's d (pooled SD with sample-size weighting)
    if n1 + n2 - 2 > 0:
        sp2 = ((n1 - 1) * s1sq + (n2 - 1) * s2sq) / (n1 + n2 - 2)
        sp = math.sqrt(sp2)
        d = (m2 - m1) / sp if sp > 0 else float("nan")
        # Hedges' g small-sample correction
        J = 1 - 3 / (4 * (n1 + n2) - 9) if (n1 + n2) > 3 else 1.0
        g = J * d if np.isfinite(d) else float("nan")
    else:
        d = float("nan")
        g = float("nan")

    return dict(t=tstat, df=df, p_two_sided=p, se=se, ci_lo=ci_lo, ci_hi=ci_hi, cohens_d=d, hedges_g=g)


def write_results_csv(path: str, desc24: Dict[str, float], desc25: Dict[str, float], test: Dict[str, float]) -> None:
    rows = [{
        "year": 2024, **desc24
    }, {
        "year": 2025, **desc25
    }, {
        "comparison": "2025 - 2024",
        "t": test["t"],
        "df": test["df"],
        "p_two_sided": test["p_two_sided"],
        "mean_diff": (desc25["mean"] - desc24["mean"]),
        "se": test["se"],
        "ci95_lo": test["ci_lo"],
        "ci95_hi": test["ci_hi"],
        "cohens_d": test["cohens_d"],
        "hedges_g": test["hedges_g"],
    }]
    pd.DataFrame(rows).to_csv(path, index=False)


def write_results_txt(path: str, desc24: Dict[str, float], desc25: Dict[str, float], test: Dict[str, float]) -> None:
    def f(x, k=4):
        return "NaN" if (isinstance(x, float) and (math.isnan(x) or math.isinf(x))) else f"{x:.{k}f}"
    lines = [
        "Two-sample Welch t-test: mean score (2025 vs 2024)",
        "==================================================",
        "",
        "Descriptive statistics",
        "----------------------",
        f"2024: n={desc24['n']}, mean={f(desc24['mean'])}, sd={f(desc24['std'])}, "
        f"min={f(desc24['min'])}, max={f(desc24['max'])}, skew={f(desc24['skewness'])}, kurt_excess={f(desc24['kurtosis_excess'])}",
        f"2025: n={desc25['n']}, mean={f(desc25['mean'])}, sd={f(desc25['std'])}, "
        f"min={f(desc25['min'])}, max={f(desc25['max'])}, skew={f(desc25['skewness'])}, kurt_excess={f(desc25['kurtosis_excess'])}",
        "",
        "Welch t-test (two-sided, difference = mean_2025 - mean_2024)",
        "-------------------------------------------------------------",
        f"t({f(test['df'],0)}) = {f(test['t'])},  p = {f(test['p_two_sided'],6)}",
        f"Mean difference = {f(desc25['mean'] - desc24['mean'])} ± {f(1.96*test['se'])} (SE * 1.96)",
        f"95% CI for difference: [{f(test['ci_lo'])}, {f(test['ci_hi'])}]",
        f"Cohen's d = {f(test['cohens_d'])},  Hedges' g = {f(test['hedges_g'])}",
        "",
        "Notes:",
        "- Welch's t-test used (unequal variances).",
        "- If SciPy is installed, p-value and CI use the t distribution; otherwise a normal approximation is used.",
        "- Skewness and kurtosis are reported using moment ratios (Fisher skew; excess kurtosis).",
    ]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def plot_histogram(df24: pd.DataFrame, df25: pd.DataFrame, out_path: str) -> None:
    # Make aligned set of score bins from the union of both years
    scores = sorted(set(df24["score_num"].tolist()) | set(df25["score_num"].tolist()))
    idx24 = {s: i for i, s in enumerate(df24["score_num"])}
    idx25 = {s: i for i, s in enumerate(df25["score_num"])}

    counts24 = [df24.loc[idx24[s], "count"] if s in idx24 else 0 for s in scores]
    counts25 = [df25.loc[idx25[s], "count"] if s in idx25 else 0 for s in scores]

    x = np.arange(len(scores))
    width = 0.38

    plt.figure()
    plt.bar(x - width/2, counts24, width, label="2024")
    plt.bar(x + width/2, counts25, width, label="2025")
    plt.xticks(x, [f"{int(s)}/5" if float(s).is_integer() else f"{s}/5"])
    plt.xlabel("Score")
    plt.ylabel("Count")
    plt.title("Score distribution by year")
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path, dpi=160)
    plt.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv2024", default="2024_tally_counts.csv",
                    help="Path to 2024 tally CSV (default: 2024_tally_counts.csv)")
    ap.add_argument("--csv2025", default="2025_tally_counts.csv",
                    help="Path to 2025 tally CSV (default: 2025_tally_counts.csv)")
    ap.add_argument("--outcsv", default="ttest_results.csv",
                    help="Output CSV with results (default: ttest_results.csv)")
    ap.add_argument("--outtxt", default="ttest_results.txt",
                    help="Output TXT human-readable summary (default: ttest_results.txt)")
    ap.add_argument("--outfig", default="tally_hist.png",
                    help="Output PNG figure (default: tally_hist.png)")
    args = ap.parse_args()

    df24 = read_tally_csv(args.csv2024)
    df25 = read_tally_csv(args.csv2025)

    # Descriptive statistics
    desc24 = weighted_descriptives(df24["score_num"].to_numpy(), df24["count"].to_numpy())
    desc25 = weighted_descriptives(df25["score_num"].to_numpy(), df25["count"].to_numpy())

    # Welch t-test (difference = mean_2025 - mean_2024)
    test = welch_t_test(desc24["mean"], desc24["std"], desc24["n"],
                        desc25["mean"], desc25["std"], desc25["n"])

    # Outputs
    write_results_csv(args.outcsv, desc24, desc25, test)
    write_results_txt(args.outtxt, desc24, desc25, test)
    plot_histogram(df24, df25, args.outfig)

    print(f"Wrote: {args.outcsv}")
    print(f"Wrote: {args.outtxt}")
    print(f"Wrote: {args.outfig}")

if __name__ == "__main__":
    main()
