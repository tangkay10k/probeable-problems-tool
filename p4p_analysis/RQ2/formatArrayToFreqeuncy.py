import json
from pathlib import Path
from collections import defaultdict

INPUT = Path("q2_attempts_user_messages_only.json")
OUTPUT = Path("q2_attempts_counts.json")

if not INPUT.exists():
    raise FileNotFoundError(f"Could not find {INPUT}. Please place it in this folder.")

with INPUT.open("r", encoding="utf-8") as f:
    data = json.load(f)

# Normalize to a list
records = data if isinstance(data, list) else [data]

# Aggregators per user id
oracle_counts = defaultdict(int)
chat_counts = defaultdict(int)

def get_user_id(obj):
    _id = obj.get("_id")
    if isinstance(_id, dict) and "$oid" in _id:
        return str(_id["$oid"])
    # Fallbacks if shape differs
    return str(_id) if _id is not None else "UNKNOWN_USER"

for obj in records:
    uid = get_user_id(obj)
    # Count oracle executions
    oracle_list = obj.get("oracleExecutionHistory", [])
    oracle_counts[uid] += len(oracle_list) if isinstance(oracle_list, list) else 0

    # Count chat messages (these are already USER-only in your input file)
    chat_list = obj.get("chatMessages", [])
    if isinstance(chat_list, list):
        total_msgs = 0
        for cm in chat_list:
            if isinstance(cm, dict) and isinstance(cm.get("messages"), list):
                total_msgs += len(cm["messages"])
        chat_counts[uid] += total_msgs

# Build output: one row per user
summary = []
all_user_ids = set(oracle_counts.keys()) | set(chat_counts.keys())
for uid in sorted(all_user_ids):
    summary.append({
        "user_id": uid,
        "oracleExecutionHistory_count": oracle_counts.get(uid, 0),
        "chatMessages_count": chat_counts.get(uid, 0)  # counts USER messages across all threads
    })

with OUTPUT.open("w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

print(f"Wrote {OUTPUT} with {len(summary)} users summarized.")
