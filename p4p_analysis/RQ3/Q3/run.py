#!/usr/bin/env python3
"""
Build hit summary for Q3 by merging three maps:
  - clientEquivalenceMap.*
  - clientExecuteTestEquivalenceMap.*

For each row/user, a class k counts as "hit" if ANY of the three maps has a non-empty cell for the column *.k.
Writes a CSV with columns:
  _id, failedAttempts, classes_hit, total_classes

Usage:
  python3 make_q3_hit_summary.py --in q3_attempts.csv --out q3_hit_summary.csv
"""

import csv
import argparse
import sys
from typing import Dict, List, Set, Tuple

PREFIXES = (
    "clientEquivalenceMap.",
    "clientExecuteTestEquivalenceMap."
)

def parse_header(header: List[str]) -> Tuple[Dict[str, int], Dict[int, Dict[str, int]], Set[int]]:
    """
    Returns:
      col_index: {col_name -> index}
      class_to_cols: {k -> {prefix -> index}} for any column that matches PREFIXES and has suffix k
      all_classes: set of all numeric class indices seen across the three families
    """
    col_index = {name: i for i, name in enumerate(header)}
    class_to_cols: Dict[int, Dict[str, int]] = {}
    all_classes: Set[int] = set()

    for name, i in col_index.items():
        for pref in PREFIXES:
            if name.startswith(pref):
                # Try to parse numeric suffix after the first dot
                try:
                    k = int(name.split(".", 1)[1])
                except Exception:
                    continue
                all_classes.add(k)
                if k not in class_to_cols:
                    class_to_cols[k] = {}
                class_to_cols[k][pref] = i
                break

    return col_index, class_to_cols, all_classes

def cell_nonempty(row: List[str], idx: int) -> bool:
    if idx is None:
        return False
    if idx >= len(row):
        return False
    return row[idx].strip() != ""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="in_path", default="q3_attempts.csv",
                    help="Input CSV path (default: q3_attempts.csv)")
    ap.add_argument("--out", dest="out_path", default="q3_hit_summary.csv",
                    help="Output CSV path (default: q3_hit_summary.csv)")
    args = ap.parse_args()

    # Read input
    try:
        with open(args.in_path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.reader(f)
            rows = list(reader)
    except FileNotFoundError:
        print(f"ERROR: couldn't find input file: {args.in_path}", file=sys.stderr)
        sys.exit(1)

    if not rows:
        print("ERROR: input CSV is empty.", file=sys.stderr)
        sys.exit(1)

    header = rows[0]
    data_rows = rows[1:]

    col_index, class_to_cols, all_classes = parse_header(header)

    # Optional columns
    id_idx = col_index.get("_id", None)
    fa_idx = col_index.get("failedAttempts", None)

    # Total classes = union of all numeric suffixes found across the three families in the HEADER
    total_classes = len(all_classes)

    out_header = ["_id", "failedAttempts", "classes_hit", "total_classes"]

    with open(args.out_path, "w", encoding="utf-8", newline="") as out_f:
        w = csv.writer(out_f)
        w.writerow(out_header)

        for r in data_rows:
            _id = r[id_idx].strip() if id_idx is not None and id_idx < len(r) else ""
            failed_attempts = r[fa_idx].strip() if fa_idx is not None and fa_idx < len(r) else ""

            # Count hits: for each class k, check if ANY of the three family columns (if present) is non-empty
            hits = 0
            for k in all_classes:
                cols_for_k = class_to_cols.get(k, {})
                hit = False
                for pref in PREFIXES:
                    idx = cols_for_k.get(pref, None)
                    if idx is not None and cell_nonempty(r, idx):
                        hit = True
                        break
                if hit:
                    hits += 1

            w.writerow([_id, failed_attempts, hits, total_classes])

    print(f"Done. Wrote: {args.out_path}")

if __name__ == "__main__":
    main()
