#!/usr/bin/env python3
"""
Reads 'probeable-problems.problemAttempts.csv' and writes:
  1) 'constraint_mismatch_summary.json' -> { "<id>": {"1": int, "2": int, "3": int, "4": int, "5": int }, ... }
  2) 'constraint_mismatch_summary.csv'  -> rows: anon_user,constraints_found,out_of

Rules:
- The ID column can be either '_id' or 'anon_user'. Output CSV will always use 'anon_user' as the header.
- Any column whose name ends with '.1'..'.5' is treated as that constraint index.
- A non-empty cell increments that constraint's count for the row's ID:
    * If the cell value is an integer (e.g., '3'), add that many.
    * Otherwise (e.g., 'x', 'true'), add 1.
- 'constraints_found' is how many of the 5 constraints have a count > 0 for that ID.
- 'out_of' is 5.
"""

import csv
import json
from pathlib import Path
from collections import defaultdict

INPUT_CSV = "probeable-problems.problemAttempts.csv"
OUTPUT_JSON = "constraint_mismatch_summary.json"
OUTPUT_SUMMARY_CSV = "constraint_mismatch_summary.csv"
CONSTRAINT_KEYS = ("1", "2", "3", "4", "5")
OUT_OF = len(CONSTRAINT_KEYS)  # 5

def parse_int_or_none(s: str):
    s = s.strip()
    if s == "":
        return None
    try:
        return int(s)
    except ValueError:
        return None

def main():
    # id -> constraint -> count
    freq = defaultdict(lambda: {k: 0 for k in CONSTRAINT_KEYS})

    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        # Determine which column holds the ID
        fieldnames = [fn.strip() for fn in (reader.fieldnames or [])]
        if "_id" in fieldnames:
            id_col = "_id"
        elif "anon_user" in fieldnames:
            id_col = "anon_user"
        else:
            raise ValueError("CSV must include an '_id' or 'anon_user' column")

        for row in reader:
            rid = (row.get(id_col) or "").strip()
            if not rid:
                continue  # skip rows without an ID
            _ = freq[rid]  # ensure dict exists

            for col, raw in row.items():
                if col == id_col:
                    continue
                tail = col.rsplit(".", 1)[-1] if "." in col else None
                if tail not in CONSTRAINT_KEYS:
                    continue

                val = (raw or "").strip()
                if val == "":
                    continue

                n = parse_int_or_none(val)
                freq[rid][tail] += (n if n is not None else 1)

    # ---- Write JSON ----
    out_json = {str(k): {c: v for c, v in sorted(d.items(), key=lambda kv: int(kv[0]))}
                for k, d in freq.items()}
    Path(OUTPUT_JSON).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(out_json, f, ensure_ascii=False, indent=2, sort_keys=True)

    # ---- Write tally CSV: anon_user,constraints_found,out_of ----
    # Sort IDs numerically when possible, else lexicographically
    def sort_key_id(x):
        try:
            return (0, int(x))
        except ValueError:
            return (1, x)

    rows = []
    for rid, counts in freq.items():
        found = sum(1 for k in CONSTRAINT_KEYS if counts.get(k, 0) > 0)
        rows.append((rid, found, OUT_OF))

    rows.sort(key=lambda r: sort_key_id(r[0]))
    with open(OUTPUT_SUMMARY_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["anon_user", "constraints_found", "out_of"])
        w.writerows(rows)

if __name__ == "__main__":
    main()
