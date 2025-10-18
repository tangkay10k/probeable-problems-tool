#!/usr/bin/env python3
import argparse, csv
from collections import OrderedDict
from pathlib import Path

def main():
    p = argparse.ArgumentParser(description="Aggregate attempt counts by ID.")
    p.add_argument("input", nargs="?", default="2024_raw.csv",
                   help="Input file (default: 2024_raw.csv)")
    p.add_argument("output", nargs="?", default="2024_total_counts.csv",
                   help="Output CSV (default: 2024_total_counts.csv)")
    args = p.parse_args()

    inp = Path(args.input)
    if not inp.exists():
        raise SystemExit(f"Input not found: {inp}")

    counts = OrderedDict()

    with inp.open(newline="", encoding="utf-8") as f:
        # Try CSV first; also works for single-column text
        reader = csv.reader(f)
        rows = list(reader)

    # Detect header/column
    col_idx = 0
    start_row = 0
    if rows:
        header = [c.strip() for c in rows[0]]
        # If first row is a header mentioning ANON_USER (or similar), skip it
        if any(h.upper() == "ANON_USER" for h in header):
            col_idx = header.index(next(h for h in header if h.upper() == "ANON_USER"))
            start_row = 1
        elif len(header) == 1 and header[0].upper() == "ANON_USER":
            start_row = 1

    # Count IDs, preserving first-seen order
    for r in rows[start_row:]:
        if not r:
            continue
        # If the line was plain text, r will be like ["944"]; if CSV, take the chosen column
        id_str = (r[col_idx] if col_idx < len(r) else r[0]).strip()
        if not id_str:
            continue
        if id_str not in counts:
            counts[id_str] = 0
        counts[id_str] += 1

    # Write output
    with open(args.output, "w", newline="", encoding="utf-8") as out:
        w = csv.writer(out)
        w.writerow(["id", "total_count"])
        for _id, c in counts.items():
            w.writerow([_id, c])

    print(f"Wrote {len(counts)} IDs to {args.output}")

if __name__ == "__main__":
    main()
