#!/usr/bin/env bash
# copy_or_replace_mongo_collection.sh
# Copy/append or fully replace a collection from local MongoDB to another MongoDB.
# Preserves types by using mongodump|mongorestore via --archive piping.

set -Eeuo pipefail

# ---- Utilities ----
die() { echo "Error: $*" >&2; exit 1; }

need_tools=(mongodump mongorestore)
for t in "${need_tools[@]}"; do
  command -v "$t" >/dev/null 2>&1 || die "$t not found. Install MongoDB Database Tools and ensure it's on PATH."
done

read_default() { # read_default "Prompt" "default" -> echoes value
  local prompt="$1" def="$2" ans
  read -r -p "$prompt [$def]: " ans || true
  if [[ -z "${ans:-}" ]]; then echo "$def"; else echo "$ans"; fi
}

confirm() {
  local msg="$1" resp resp_lc
  read -r -p "$msg [y/N]: " resp || true
  # Bash 3.2 on macOS doesn't support ${var,,}; use tr instead
  resp_lc="$(printf '%s' "${resp:-}" | tr '[:upper:]' '[:lower:]')"
  [[ "$resp_lc" == "y" || "$resp_lc" == "yes" ]]
}

echo "=== Source (local) MongoDB collection ==="
SRC_URI=$(read_default "Source MongoDB URI" "mongodb://localhost:27017")
read -r -p "Source database name: " SRC_DB
read -r -p "Source collection name: " SRC_COLL
[[ -n "${SRC_DB:-}" && -n "${SRC_COLL:-}" ]] || die "Source DB and collection are required."

echo
echo "=== Target MongoDB collection (destination) ==="
DST_URI=$(read_default "Target MongoDB URI" "mongodb://localhost:27017")
read -r -p "Target database name: " DST_DB
read -r -p "Target collection name: " DST_COLL
[[ -n "${DST_DB:-}" && -n "${DST_COLL:-}" ]] || die "Target DB and collection are required."

if [[ "$SRC_URI" == "$DST_URI" && "$SRC_DB" == "$DST_DB" && "$SRC_COLL" == "$DST_COLL" ]]; then
  die "Source and target namespaces are identical. Aborting to prevent self-copy."
fi

# Optional extra args (set via env if you need TLS, auth db, etc.)
#   export EXTRA_DUMP_ARGS="--readPreference=primary"
#   export EXTRA_RESTORE_ARGS="--writeConcern=majority"
EXTRA_DUMP_ARGS="${EXTRA_DUMP_ARGS:-}"
EXTRA_RESTORE_ARGS="${EXTRA_RESTORE_ARGS:-}"

echo
echo "=== Choose an action ==="
echo "1) Copy/append (upsert by _id) local -> target"
echo "2) Replace target with local (drop + restore)"
read -r -p "Enter 1 or 2: " CHOICE

case "${CHOICE}" in
  1)
    echo
    echo "Action: APPEND/UPSERT from ${SRC_DB}.${SRC_COLL} -> ${DST_DB}.${DST_COLL}"
    echo "Note: --upsert means matching _id documents will be updated; new docs inserted."
    if ! confirm "Proceed?"; then echo "Cancelled."; exit 0; fi

    set -o pipefail
    mongodump \
      --uri="$SRC_URI" \
      --db="$SRC_DB" \
      --collection="$SRC_COLL" \
      --archive \
      $EXTRA_DUMP_ARGS \
    | mongorestore \
        --uri="$DST_URI" \
        --archive \
        --nsFrom="${SRC_DB}.${SRC_COLL}" \
        --nsTo="${DST_DB}.${DST_COLL}" \
        --upsert \
        $EXTRA_RESTORE_ARGS

    echo "Done: appended/upserted documents to ${DST_DB}.${DST_COLL}."
    ;;

  2)
    echo
    echo "Action: REPLACE (DROP + RESTORE) ${DST_DB}.${DST_COLL} with ${SRC_DB}.${SRC_COLL}"
    echo "Warning: this will DROP the target collection before restoring."
    if ! confirm "Are you absolutely sure?"; then echo "Cancelled."; exit 0; fi

    set -o pipefail
    mongodump \
      --uri="$SRC_URI" \
      --db="$SRC_DB" \
      --collection="$SRC_COLL" \
      --archive \
      $EXTRA_DUMP_ARGS \
    | mongorestore \
        --uri="$DST_URI" \
        --archive \
        --nsFrom="${SRC_DB}.${SRC_COLL}" \
        --nsTo="${DST_DB}.${DST_COLL}" \
        --drop \
        $EXTRA_RESTORE_ARGS

    echo "Done: replaced ${DST_DB}.${DST_COLL} with data from ${SRC_DB}.${SRC_COLL}."
    ;;

  *)
    die "Invalid choice. Enter 1 or 2."
    ;;
esac
