#!/usr/bin/env python3
"""
Reads two CSVs (2024_tally_counts.csv and 2025_tally_counts.csv) that contain
columns: score,count,percent  where score looks like '3/5', and then:

1) Builds discrete samples from the counts.
2) Plots observed distributions with a fitted Normal overlay.
3) Plots Q–Q plots against a Normal.
4) Runs normality checks:
   - Shapiro–Wilk (n <= 5000) else D’Agostino’s K^2.
   - Chi-square goodness-of-fit on binned 0..5 categories (with μ, σ fitted).

Saves figures next to the script:
- 2024_dist.png, 2024_qq.png
- 2025_dist.png, 2025_qq.png
"""

import re
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
from scipy import stats


# ---------- Helpers ----------
def parse_score_to_int(s: str) -> int:
    """
    Convert '3/5' -> 3 (left side of slash). Robust to whitespace.
    """
    m = re.match(r"\s*(-?\d+)\s*/\s*\d+\s*", str(s))
    if not m:
        raise ValueError(f"Bad score format: {s!r}")
    return int(m.group(1))


def load_counts_csv(path: Path):
    """
    Returns:
      scores (np.array of ints 0..5),
      counts (np.array of ints length 6 aligned to 0..5),
      sample (np.array expanded sample using counts)
    """
    df = pd.read_csv(path)
    if "score" not in df or "count" not in df:
        raise ValueError(f"{path} must have columns: score,count,(percent)")

    # Parse score as integer 0..5
    df = df.copy()
    df["score_int"] = df["score"].map(parse_score_to_int)

    # Aggregate in case there are duplicates
    grouped = df.groupby("score_int", as_index=False)["count"].sum()

    # Ensure full support 0..5 (fill missing with 0)
    full = pd.DataFrame({"score_int": range(0, 6)})
    full = full.merge(grouped, on="score_int", how="left").fillna({"count": 0})
    full["count"] = full["count"].astype(int)

    scores = full["score_int"].to_numpy()
    counts = full["count"].to_numpy()

    # Build expanded sample (discrete data 0..5 with repetition = counts)
    sample = np.repeat(scores, counts)

    return scores, counts, sample


def weighted_mean_std(values: np.ndarray, weights: np.ndarray):
    """
    Weighted mean and population std (denominator = N).
    """
    w = weights.astype(float)
    total = w.sum()
    if total == 0:
        return np.nan, np.nan
    mu = np.sum(values * w) / total
    var = np.sum(w * (values - mu) ** 2) / total
    return mu, np.sqrt(var)


def expected_counts_normal_binned(scores_0_to_5, counts, mu, sigma):
    """
    Given discrete categories x in {0,1,2,3,4,5}, produce expected counts under a Normal(μ,σ)
    by integrating over half-integer bins:
      P(x) = Φ((x+0.5-μ)/σ) - Φ((x-0.5-μ)/σ),
    with edges at (-inf, -0.5] for x=0 and [5.5, +inf) for x=5.
    """
    total = counts.sum()
    if total == 0 or not np.isfinite(mu) or not np.isfinite(sigma) or sigma <= 0:
        return np.zeros_like(counts, dtype=float)

    # Bin edges
    edges = [-np.inf, -0.5, 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, np.inf]
    # For x in 0..5, use edges[i]..edges[i+1]
    exp = np.zeros_like(counts, dtype=float)
    for x in range(6):
        a = (edges[x + 0] - mu) / sigma
        b = (edges[x + 1] - mu) / sigma
        p = stats.norm.cdf(b) - stats.norm.cdf(a)
        exp[x] = total * p
    return exp


def chi_square_gof(observed, expected, n_params_fitted=2):
    """
    Chi-square GOF with optional parameter fitting correction.
    Exclude bins with expected < 5 to keep the approximation reasonable.
    Returns (chi2, dof, p_value, used_bins)
    """
    mask = expected >= 5
    obs = observed[mask]
    exp = expected[mask]

    if exp.size == 0:
        return np.nan, 0, np.nan, 0

    chi2 = np.sum((obs - exp) ** 2 / (exp + 1e-12))
    dof = max(1, exp.size - 1 - n_params_fitted)
    p = stats.chi2.sf(chi2, dof)
    return chi2, dof, p, int(exp.size)


def normality_tests(sample: np.ndarray):
    """
    Returns dict with Shapiro (if applicable) or normaltest, plus Anderson–Darling.
    """
    out = {}
    n = sample.size

    # Shapiro–Wilk recommended up to 5000
    if 3 <= n <= 5000:
        W, p = stats.shapiro(sample)
        out["Shapiro_W"] = float(W)
        out["Shapiro_p"] = float(p)
    elif n >= 8:
        # D’Agostino’s K^2 (requires n>=8)
        k2, p = stats.normaltest(sample)
        out["Dagostino_K2"] = float(k2)
        out["Dagostino_p"] = float(p)

    # Anderson–Darling (gives critical values, no p)
    ad = stats.anderson(sample, dist="norm")
    out["Anderson_A2"] = float(ad.statistic)
    out["Anderson_crit"] = [float(x) for x in ad.critical_values]
    out["Anderson_sigs"] = [float(x) for x in ad.significance_level]
    return out


def plot_distribution(scores, counts, mu, sigma, title, outpath):
    """
    Bar plot of observed proportions with a continuous Normal PDF overlay (scaled to proportions).
    """
    total = counts.sum()
    props = counts / total if total > 0 else counts.astype(float)

    # x for smooth curve
    xs = np.linspace(-0.5, 5.5, 500)
    if np.isfinite(mu) and np.isfinite(sigma) and sigma > 0:
        pdf = stats.norm.pdf(xs, mu, sigma)
        # scale PDF to sum to 1 over the discrete bins (approx by integral over [-0.5,5.5])
        area = stats.norm.cdf(5.5, mu, sigma) - stats.norm.cdf(-0.5, mu, sigma)
        curve = (pdf / (area + 1e-12)) * (1.0)  # proportion domain (0..1)
    else:
        curve = np.zeros_like(xs)

    plt.figure(figsize=(7.5, 4.5))
    # Bars at integer positions
    plt.bar(scores, props, width=0.8, align="center", edgecolor="black", alpha=0.8, label="Observed proportion")
    # Overlay curve
    plt.plot(xs, curve, linewidth=2.0, label="Fitted Normal (scaled)")
    plt.xticks(range(0, 6), [f"{i}/5" for i in range(6)])
    plt.xlabel("Constraints Hit")
    plt.ylabel("Proportion")
    plt.title(title)
    plt.legend()
    plt.tight_layout()
    plt.savefig(outpath, dpi=200)
    plt.close()


def plot_qq(sample, mu, sigma, title, outpath):
    """
    Q–Q plot against fitted Normal(μ,σ). If μ/σ invalid, fall back to standard normal.
    """
    plt.figure(figsize=(5.5, 5.5))
    if not (np.isfinite(mu) and np.isfinite(sigma) and sigma > 0):
        mu, sigma = 0.0, 1.0

    # Standardize sample with fitted params so we compare to N(0,1)
    z = (sample - mu) / sigma if sigma > 0 else (sample - np.mean(sample))
    (osm, osr), (slope, intercept, r) = stats.probplot(z, dist="norm", sparams=())
    plt.scatter(osm, osr, s=18, alpha=0.8, label="Data")
    # Reference line
    xline = np.linspace(np.min(osm), np.max(osm), 100)
    yline = slope * xline + intercept
    plt.plot(xline, yline, linewidth=2.0, label="Reference line")

    plt.xlabel("Theoretical quantiles (Normal)")
    plt.ylabel("Ordered standardized values")
    plt.title(title)
    plt.legend()
    plt.tight_layout()
    plt.savefig(outpath, dpi=200)
    plt.close()


def analyze_file(csv_path: Path, tag: str):
    """
    End-to-end for a single file: load, fit, tests, plots, print summary.
    """
    scores, counts, sample = load_counts_csv(csv_path)
    mu, sigma = weighted_mean_std(scores, counts)

    # Expected counts under fitted normal across 0..5
    exp = expected_counts_normal_binned(scores, counts, mu, sigma)
    chi2, dof, p, used_bins = chi_square_gof(counts, exp, n_params_fitted=2)

    tests = normality_tests(sample)

    # Print a concise textual summary to console
    total = counts.sum()
    print(f"\n=== {tag} ===")
    print(f"File: {csv_path}")
    print(f"n = {total}, mean = {mu:.3f}, std = {sigma:.3f}")
    if np.isfinite(chi2):
        print(f"Chi-square GOF (bins with expected >=5): chi2={chi2:.3f}, dof={dof}, p={p:.4g}, bins_used={used_bins}")
    else:
        print("Chi-square GOF: not computed (insufficient expected counts).")

    if "Shapiro_W" in tests:
        print(f"Shapiro–Wilk: W={tests['Shapiro_W']:.3f}, p={tests['Shapiro_p']:.4g}")
    if "Dagostino_K2" in tests:
        print(f"D’Agostino K^2: K2={tests['Dagostino_K2']:.3f}, p={tests['Dagostino_p']:.4g}")
    print(f"Anderson–Darling A^2={tests['Anderson_A2']:.3f} (crit@{tests['Anderson_sigs']} = {tests['Anderson_crit']})")

    # Plots
    plot_distribution(
        scores,
        counts,
        mu,
        sigma,
        title=f"{tag}: Observed vs Fitted Normal",
        outpath=Path(f"{tag.lower()}_dist.png"),
    )
    if sample.size >= 3:
        plot_qq(sample, mu, sigma, title=f"{tag}: Normal Q–Q", outpath=Path(f"{tag.lower()}_qq.png"))
    else:
        print("Q–Q plot skipped (too few samples).")


# ---------- Main ----------
if __name__ == "__main__":
    # Make sure these CSV files exist in the same folder as this script.
    file_2024 = Path("2024_tally_counts.csv")
    file_2025 = Path("2025_tally_counts.csv")

    # Example contents you provided (save these into the files before running):
    # 2024_tally_counts.csv
    # score,count,percent
    # 1/5,100,10.36
    # 2/5,41,4.25
    # 3/5,173,17.93
    # 4/5,613,63.52
    # 5/5,38,3.94
    #
    # 2025_tally_counts.csv
    # score,count,percent
    # 0/5,138,14.92
    # 1/5,174,18.81
    # 2/5,250,27.03
    # 3/5,237,25.62
    # 4/5,97,10.49
    # 5/5,29,3.14

    if not file_2024.exists():
        print("ERROR: 2024_tally_counts.csv not found in current directory.")
    else:
        analyze_file(file_2024, tag="2024")

    if not file_2025.exists():
        print("ERROR: 2025_tally_counts.csv not found in current directory.")
    else:
        analyze_file(file_2025, tag="2025")

    print("\nDone. Saved plots: 2024_dist.png, 2024_qq.png, 2025_dist.png, 2025_qq.png")
