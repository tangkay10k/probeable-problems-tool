#!/usr/bin/env python3
# Make a CSV of USER chat message counts only:
# Input:  q1_attempts_user_messages_only.json
# Output: q1_chat_message_counts.csv  (columns: id,total_count)

import json
import csv
from pathlib import Path
from collections import defaultdict

INPUT = Path("q1_attempts_user_messages_only.json")
OUTPUT = Path("q1_chat_message_counts.csv")

if not INPUT.exists():
    raise FileNotFoundError(f"Could not find {INPUT}. Please place it in this folder.")

with INPUT.open("r", encoding="utf-8") as f:
    data = json.load(f)

# Normalize to iterable of records
records = data if isinstance(data, list) else [data]

chat_counts = defaultdict(int)

def get_user_id(obj):
    _id = obj.get("_id")
    if isinstance(_id, dict) and "$oid" in _id:
        return str(_id["$oid"])
    return str(_id) if _id is not None else "UNKNOWN_USER"

for obj in records:
    uid = get_user_id(obj)

    # Count USER chat messages (input already filtered to user-only messages)
    total_msgs = 0
    chat_list = obj.get("chatMessages", [])
    if isinstance(chat_list, list):
        for cm in chat_list:
            msgs = cm.get("messages") if isinstance(cm, dict) else None
            if isinstance(msgs, list):
                total_msgs += len(msgs)
    chat_counts[uid] += total_msgs

# Write CSV in the exact format: id,total_count
with OUTPUT.open("w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["id", "total_count"])
    # Sort by numeric id when possible, otherwise lexicographically
    def sort_key(k):
        try:
            return (0, int(k))
        except (ValueError, TypeError):
            return (1, str(k))
    for uid in sorted(chat_counts.keys(), key=sort_key):
        w.writerow([uid, chat_counts[uid]])

print(f"Wrote {OUTPUT} with {len(chat_counts)} ids.")
