import json
from pathlib import Path

# Try both possible names; use the one that exists
candidates = [Path("q1_attempts.json")]
inp = next((p for p in candidates if p.exists()), None)
if inp is None:
    raise FileNotFoundError("Put the file in this folder as 'q2.attempts.json' or 'q2_attempts.json'.")

with inp.open("r", encoding="utf-8") as f:
    data = json.load(f)

items = data if isinstance(data, list) else [data]

def filter_messages(obj):
    if "chatMessages" not in obj or obj["chatMessages"] is None:
        return obj
    new_obj = dict(obj)
    filtered_cm = []
    for cm in obj["chatMessages"]:
        if isinstance(cm, dict) and isinstance(cm.get("messages"), list):
            kept = [m for m in cm["messages"] if isinstance(m, dict) and m.get("role") == "USER"]
            new_cm = dict(cm)
            new_cm["messages"] = kept
            filtered_cm.append(new_cm)
        else:
            # Unexpected structure — keep as-is to avoid data loss
            filtered_cm.append(cm)
    new_obj["chatMessages"] = filtered_cm
    return new_obj

out = [filter_messages(o) for o in items]
with open("q1_attempts_user_only.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print("Wrote q1_attempts_user_only.json")
