#!/usr/bin/env python3
"""
Reads 'probeable-problems.problemAttempts.csv' and writes two separate JSON files:

  1) 'clientExecuteTestEquivalenceMap.json' -> {
         "<id>": {"1": int, "2": int, "3": int, "4": int, "5": int}, ...
     }

  2) 'clientEquivalenceMap.json' -> {
         "<id>": {"1": int, "2": int, "3": int, "4": int, "5": int}, ...
     }

Rules:
- ID column can be '_id' or 'anon_user'.
- Only columns beginning with 'clientExecuteTestEquivalenceMap.' or 'clientEquivalenceMap.'
  and ending with '.1'..'.5' are counted.
- For each non-empty cell:
    * If it parses as an integer (e.g., '3'), add that many.
    * Otherwise, add 1.
- All five constraint keys ("1".."5") are always present per ID (default 0).
"""

import csv
import json
from collections import defaultdict
from pathlib import Path

INPUT_CSV = "probeable-problems.problemAttempts.csv"
OUTPUT_EXEC_JSON = "clientExecuteTestEquivalenceMap.json"
OUTPUT_EQ_JSON   = "clientEquivalenceMap.json"

CONSTRAINT_KEYS = ("1", "2", "3", "4", "5")

def zero_map():
    return {k: 0 for k in CONSTRAINT_KEYS}

def parse_int_or_none(s: str):
    s = s.strip()
    if not s:
        return None
    try:
        return int(s)
    except ValueError:
        return None

def main():
    exec_map = defaultdict(zero_map)  # id -> {"1":..}
    eq_map   = defaultdict(zero_map)  # id -> {"1":..}

    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = [fn.strip() for fn in (reader.fieldnames or [])]
        if "_id" in fields:
            id_col = "_id"
        elif "anon_user" in fields:
            id_col = "anon_user"
        else:
            raise ValueError("CSV must include an '_id' or 'anon_user' column")

        for row in reader:
            rid = (row.get(id_col) or "").strip()
            if not rid:
                continue  # skip rows without an ID

            # Ensure presence
            _ = exec_map[rid]
            _ = eq_map[rid]

            for col, raw in row.items():
                if col == id_col or not col:
                    continue

                # Identify prefix and constraint index
                if col.startswith("clientExecuteTestEquivalenceMap."):
                    prefix = "exec"
                    tail = col[len("clientExecuteTestEquivalenceMap."):]
                elif col.startswith("clientEquivalenceMap."):
                    prefix = "eq"
                    tail = col[len("clientEquivalenceMap."):]
                else:
                    continue

                # Only accept single-segment tails that are 1..5
                tail = tail.strip()
                if tail not in CONSTRAINT_KEYS:
                    continue

                val = (raw or "").strip()
                if not val:
                    continue

                inc = parse_int_or_none(val)
                inc = inc if inc is not None else 1

                if prefix == "exec":
                    exec_map[rid][tail] += inc
                else:
                    eq_map[rid][tail] += inc

    # Convert to plain dicts with sorted keys for stability
    out_exec = {str(k): {kk: vv for kk, vv in sorted(v.items(), key=lambda x: int(x[0]))}
                for k, v in exec_map.items()}
    out_eq   = {str(k): {kk: vv for kk, vv in sorted(v.items(), key=lambda x: int(x[0]))}
                for k, v in eq_map.items()}

    Path(OUTPUT_EXEC_JSON).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_EXEC_JSON, "w", encoding="utf-8") as f:
        json.dump(out_exec, f, ensure_ascii=False, indent=2, sort_keys=True)

    with open(OUTPUT_EQ_JSON, "w", encoding="utf-8") as f:
        json.dump(out_eq, f, ensure_ascii=False, indent=2, sort_keys=True)

if __name__ == "__main__":
    main()
