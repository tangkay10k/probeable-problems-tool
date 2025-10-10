#!/usr/bin/env python3
"""
Reads 'constraint_mismatch_summary.csv' (headers: anon_user,constraints_found,out_of)
and writes:
  - 'tally_results.txt'  : pretty table of how many got X/5
  - 'tally_counts.csv'   : machine-readable counts (score,count,percent)
"""

import csv
from collections import Counter

INPUT_CSV = "constraint_mismatch_summary.csv"
OUTPUT_TABLE = "tally_results.txt"
OUTPUT_COUNTS = "tally_counts.csv"

def main():
    counts = Counter()
    total = 0
    denom_seen = set()

    # Read and tally
    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                found = int(row["constraints_found"])
                out_of = int(row["out_of"])
            except (KeyError, ValueError, TypeError):
                continue
            total += 1
            denom_seen.add(out_of)
            key = f"{found}/{out_of}"
            counts[key] += 1

    # Prepare outputs
    if total == 0:
        table_text = "No valid rows found.\n"
        with open(OUTPUT_TABLE, "w", encoding="utf-8") as f:
            f.write(table_text)
        with open(OUTPUT_COUNTS, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["score", "count", "percent"])
        return

    denoms = sorted(denom_seen)
    denom_label = denoms[0] if len(denoms) == 1 else f"mixed{tuple(denoms)}"

    # Sort by denominator then numerator ascending
    def sort_key(item):
        key_str, _cnt = item
        try:
            num_str, den_str = key_str.split("/")
            num = int(num_str)
            den = int(den_str)
        except Exception:
            num, den = (0, 1)
        return (den, num)

    rows = sorted(counts.items(), key=sort_key)

    # Write pretty table
    header = [
        f"Tally by score (X/{denom_label}) from {INPUT_CSV}",
        f"Total rows: {total}",
        "",
        f"{'Score':>8}  {'Count':>7}  {'Percent':>8}",
        "-" * 28,
    ]
    lines = []
    for key_str, cnt in rows:
        pct = 100.0 * cnt / total
        lines.append(f"{key_str:>8}  {cnt:7d}  {pct:7.2f}%")

    with open(OUTPUT_TABLE, "w", encoding="utf-8") as f:
        f.write("\n".join(header + lines) + "\n")

    # Write counts CSV
    with open(OUTPUT_COUNTS, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["score", "count", "percent"])
        for key_str, cnt in rows:
            pct = 100.0 * cnt / total
            w.writerow([key_str, cnt, f"{pct:.2f}"])

if __name__ == "__main__":
    main()
