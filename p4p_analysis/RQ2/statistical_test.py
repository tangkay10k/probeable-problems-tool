import json
from pathlib import Path
from math import comb, sqrt
from statistics import mean, median
from collections import defaultdict
import csv
import matplotlib.pyplot as plt

# ---------------- Config ----------------
# Optional cap to reduce outlier influence on magnitude-sensitive stats.
# Set to an integer (e.g., 200) to cap per-user chat/oracle counts; or None for no cap.
CAP_PER_USER = None

IN_FILES = [Path("q2_attempts_counts.json"), Path("q2_attemtps_counts.json")]
OUT_CSV = Path("q2_usage_overall.csv")
OUT_TXT = Path("q2_usage_overall.txt")
OUT_BAR = Path("q2_overall_bar.png")
OUT_HIST = Path("q2_per_user_proportion_hist.png")

# -------------- Helpers (stats) --------------
def binom_cdf(k, n, p=0.5):
    return sum(comb(n, i) * (p**i) * ((1-p)**(n-i)) for i in range(k+1))

def binom_sf(k, n, p=0.5):
    if k <= 0:
        return 1.0
    return 1 - binom_cdf(k-1, n, p)

def binom_test_two_sided(k, n, p=0.5):
    if n == 0:
        return None
    left = binom_cdf(k, n, p)
    right = binom_sf(k, n, p)
    return min(1.0, 2*min(left, right))

def wilson_ci(phat, n, z=1.96):
    if n == 0:
        return (None, None)
    denom = 1 + (z*z)/n
    center = phat + (z*z)/(2*n)
    margin = z * sqrt((phat*(1-phat) + (z*z)/(4*n)) / n)
    return ((center - margin)/denom, (center + margin)/denom)

def ranks(values):
    # average ranks for ties, 1-based
    idx = sorted(range(len(values)), key=lambda i: values[i])
    r = [0.0]*len(values)
    i = 0
    next_rank = 1
    while i < len(values):
        j = i
        while j+1 < len(values) and values[idx[j+1]] == values[idx[i]]:
            j += 1
        avg_rank = (next_rank + j + 1)/2.0
        for k in range(i, j+1):
            r[idx[k]] = avg_rank
        next_rank = j + 2
        i = j + 1
    return r

def normal_cdf(z):
    import math
    return 0.5 * (1 + math.erf(z / (2**0.5)))

def wilcoxon_signed_rank(diffs):
    # diffs: list of per-user differences
    nz = [d for d in diffs if d != 0]
    if len(nz) == 0:
        return None, None, 0
    abs_nz = [abs(d) for d in nz]
    rks = ranks(abs_nz)
    W_plus = sum(r for r, d in zip(rks, nz) if d > 0)
    W_minus = sum(r for r, d in zip(rks, nz) if d < 0)
    W = min(W_plus, W_minus)
    n = len(nz)
    mu = n*(n+1)/4.0
    sigma2 = n*(n+1)*(2*n+1)/24.0
    sigma = sqrt(sigma2)
    z = (W - mu + 0.5)/sigma  # continuity correction
    p = 2*min(normal_cdf(z), 1 - normal_cdf(z))
    return z, p, n

# -------------- Load & aggregate per user --------------
inp = next((p for p in IN_FILES if p.exists()), None)
if inp is None:
    raise FileNotFoundError("Place the data file as 'q2_attempts_counts.json' (or 'q2_attemtps_counts.json').")

data = json.loads(Path(inp).read_text(encoding="utf-8"))
records = data if isinstance(data, list) else [data]

agg = defaultdict(lambda: {"chat": 0, "oracle": 0})
for r in records:
    uid = str(r.get("user_id", "UNKNOWN_USER"))
    agg[uid]["chat"] += int(r.get("chatMessages_count", 0))
    agg[uid]["oracle"] += int(r.get("oracleExecutionHistory_count", 0))

pairs = []
for uid, v in agg.items():
    chat = v["chat"]
    oracle = v["oracle"]
    if CAP_PER_USER is not None:
        chat = min(chat, CAP_PER_USER)
        oracle = min(oracle, CAP_PER_USER)
    pairs.append({"user_id": uid, "chat": chat, "oracle": oracle})

# -------------- Totals & per-user stats --------------
total_chat = sum(p["chat"] for p in pairs)
total_oracle = sum(p["oracle"] for p in pairs)
diffs = [p["chat"] - p["oracle"] for p in pairs]

wins_chat = sum(1 for p in pairs if p["chat"] > p["oracle"])
wins_oracle = sum(1 for p in pairs if p["oracle"] > p["chat"])
ties = len(pairs) - wins_chat - wins_oracle
non_ties = wins_chat + wins_oracle
mean_diff = mean(diffs) if diffs else 0.0
median_diff = median(diffs) if diffs else 0.0

# A) Paired tests on differences
p_sign_diff = binom_test_two_sided(wins_chat, non_ties, 0.5) if non_ties > 0 else None
prop_chat_wins_diff = (wins_chat / non_ties) if non_ties > 0 else None
wilson_lo_diff, wilson_hi_diff = (wilson_ci(prop_chat_wins_diff, non_ties) if non_ties > 0 else (None, None))
z_w_diff, p_wilcox_diff, n_w_diff = wilcoxon_signed_rank(diffs)

# B) Per-user proportions p_i = chat / (chat + oracle)
props = []
for p in pairs:
    tot = p["chat"] + p["oracle"]
    if tot > 0:
        props.append(p["chat"]/tot)

# Sign test on props vs 0.5: count >0.5 vs <0.5, ignore =0.5
wins_prop = sum(1 for x in props if x > 0.5)
loss_prop = sum(1 for x in props if x < 0.5)
ties_prop = len(props) - wins_prop - loss_prop
non_ties_prop = wins_prop + loss_prop
p_sign_prop = binom_test_two_sided(wins_prop, non_ties_prop, 0.5) if non_ties_prop > 0 else None
prop_gt_half = (wins_prop / non_ties_prop) if non_ties_prop > 0 else None
wilson_lo_prop, wilson_hi_prop = (wilson_ci(prop_gt_half, non_ties_prop) if non_ties_prop > 0 else (None, None))

# Wilcoxon on (props - 0.5)
prop_centered = [x - 0.5 for x in props]
z_w_prop, p_wilcox_prop, n_w_prop = wilcoxon_signed_rank(prop_centered)

# -------------- Write CSV --------------
with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["metric", "value"])
    w.writerow(["n_users", len(pairs)])
    w.writerow(["total_chat_messages", total_chat])
    w.writerow(["total_oracle_executions", total_oracle])
    w.writerow(["difference_chat_minus_oracle_totals", total_chat - total_oracle])
    w.writerow(["users_chat_greater", wins_chat])
    w.writerow(["users_oracle_greater", wins_oracle])
    w.writerow(["users_tied", ties])
    w.writerow(["non_ties", non_ties])
    w.writerow(["mean_diff_per_user", f"{mean_diff:.6f}"])
    w.writerow(["median_diff_per_user", f"{median_diff:.6f}"])
    w.writerow(["sign_test_diff_two_sided_p", "" if p_sign_diff is None else f"{p_sign_diff:.10f}"])
    w.writerow(["prop_chat_wins_among_non_ties_diff", "" if prop_chat_wins_diff is None else f"{prop_chat_wins_diff:.6f}"])
    w.writerow(["prop_chat_wins_wilson95_diff_lo", "" if wilson_lo_diff is None else f"{wilson_lo_diff:.6f}"])
    w.writerow(["prop_chat_wins_wilson95_diff_hi", "" if wilson_hi_diff is None else f"{wilson_hi_diff:.6f}"])
    w.writerow(["wilcoxon_diff_z", "" if z_w_diff is None else f"{z_w_diff:.6f}"])
    w.writerow(["wilcoxon_diff_two_sided_p", "" if p_wilcox_diff is None else f"{p_wilcox_diff:.10f}"])
    w.writerow(["n_users_with_any_msgs_for_prop", len(props)])
    w.writerow(["sign_test_prop_two_sided_p", "" if p_sign_prop is None else f"{p_sign_prop:.10f}"])
    w.writerow(["prop_gt_half_among_non_ties_prop", "" if prop_gt_half is None else f"{prop_gt_half:.6f}"])
    w.writerow(["prop_gt_half_wilson95_prop_lo", "" if wilson_lo_prop is None else f"{wilson_lo_prop:.6f}"])
    w.writerow(["prop_gt_half_wilson95_prop_hi", "" if wilson_hi_prop is None else f"{wilson_hi_prop:.6f}"])
    w.writerow(["wilcoxon_prop_z", "" if z_w_prop is None else f"{z_w_prop:.6f}"])
    w.writerow(["wilcoxon_prop_two_sided_p", "" if p_wilcox_prop is None else f"{p_wilcox_prop:.10f}"])
    w.writerow(["cap_per_user_applied", "" if CAP_PER_USER is None else CAP_PER_USER])

# -------------- Write readable TXT --------------
with OUT_TXT.open("w", encoding="utf-8") as f:
    f.write("Chat vs Oracle — Robust, Per-User Analyses\n")
    f.write("==========================================\n\n")
    f.write(f"Users: {len(pairs)}\n")
    f.write(f"Totals: chat={total_chat}, oracle={total_oracle}, diff={total_chat - total_oracle}\n")
    f.write(f"Per-user diff (chat - oracle): mean={mean_diff:.3f}, median={median_diff:.3f}\n")
    if CAP_PER_USER is not None:
        f.write(f"(Per-user counts were capped at {CAP_PER_USER} to reduce outlier influence.)\n")
    f.write("\nA) Direction-only test on differences (robust to spammers):\n")
    f.write(f"  Non-ties: {non_ties} (chat>{wins_chat}, oracle>{wins_oracle}, ties={ties})\n")
    if p_sign_diff is None:
        f.write("  Sign test: not applicable (all users tied)\n")
    else:
        f.write(f"  Sign test (two-sided): p = {p_sign_diff:.6g} | chat-wins proportion = {prop_chat_wins_diff:.3f} ")
        lo, hi = wilson_lo_diff, wilson_hi_diff
        if lo is not None:
            f.write(f"(Wilson 95% CI: {lo:.3f}–{hi:.3f})")
        f.write("\n")
    if p_wilcox_diff is None:
        f.write("  Wilcoxon signed-rank: not applicable (no nonzero differences)\n")
    else:
        f.write(f"  Wilcoxon signed-rank: z = {z_w_diff:.3f}, two-sided p = {p_wilcox_diff:.6g}\n")

    f.write("\nB) Per-user proportion p_i = chat/(chat+oracle):\n")
    f.write(f"  Users with any messages: {len(props)} | ties@0.5: {ties_prop} | non-ties: {non_ties_prop}\n")
    if p_sign_prop is None:
        f.write("  Sign test vs 0.5: not applicable (all exactly 0.5)\n")
    else:
        f.write(f"  Sign test vs 0.5 (two-sided): p = {p_sign_prop:.6g}; P(p_i>0.5) = {prop_gt_half:.3f} ")
        lo, hi = wilson_lo_prop, wilson_hi_prop
        if lo is not None:
            f.write(f"(Wilson 95% CI: {lo:.3f}–{hi:.3f})")
        f.write("\n")
    if p_wilcox_prop is None:
        f.write("  Wilcoxon on (p_i - 0.5): not applicable (no nonzero diffs)\n")
    else:
        f.write(f"  Wilcoxon on (p_i - 0.5): z = {z_w_prop:.3f}, two-sided p = {p_wilcox_prop:.6g}\n")

    f.write("\nWhy not Welch’s t-test?\n")
    f.write("  Welch compares independent groups’ means; here chat and oracle are paired within users.\n")
    f.write("  The sign test and proportion-based tests are immune to single-user spam dominating results.\n")

# -------------- Plots --------------
# (1) Bar of overall totals
plt.figure()
plt.bar(["Chat messages", "Oracle executions"], [total_chat, total_oracle])
plt.title("Overall Usage Totals")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig(OUT_BAR)
plt.close()

# (2) Histogram of per-user proportions
plt.figure()
plt.hist(props, bins=20)
plt.title("Per-user Chat Proportion (chat / (chat + oracle))")
plt.xlabel("Proportion")
plt.ylabel("Users")
plt.tight_layout()
plt.savefig(OUT_HIST)
plt.close()

print("Done. Created:")
print(f"- {OUT_CSV}")
print(f"- {OUT_TXT}")
print(f"- {OUT_BAR}")
print(f"- {OUT_HIST}")
