#!/usr/bin/env python3
# For each ID, sum the raw frequencies across keys "1".."5" (UNWEIGHTED).
# Example: {"1":1,"2":1,"3":1,"4":1,"5":1} -> total = 1+1+1+1+1 = 5

import json
from pathlib import Path
import csv

INPUT = "2024_constraint_mismatch_summary.json"
OUTPUT = "per_id_total_counts.csv"

def get(d, k):
    # accept "1" or 1, default 0
    return int(d.get(str(k), d.get(k, 0)) or 0)

def main():
    data = json.loads(Path(INPUT).read_text(encoding="utf-8"))

    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "total_count"])  # total_count = f1+f2+f3+f4+f5
        for _id, counts in data.items():
            total_count = sum(get(counts, k) for k in range(1, 6))
            w.writerow([_id, total_count])

    print(f"Wrote {OUTPUT}")

if __name__ == "__main__":
    main()
