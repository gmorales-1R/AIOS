"""CSV-backed storage primitives for tinkerbell. The only module that touches db/ directly."""

import csv
import os
from datetime import datetime, timezone

DB_DIR = os.environ.get("TINKERBELL_DB_DIR") or os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "db"
)

THOUGHTS_CSV = os.path.join(DB_DIR, "tinkerbell.csv")
STEPS_CSV = os.path.join(DB_DIR, "steps.csv")
LOG_CSV = os.path.join(DB_DIR, "log.csv")
COUNTER = os.path.join(DB_DIR, "counter.txt")
STEPS_COUNTER = os.path.join(DB_DIR, "steps_counter.txt")

THOUGHT_FIELDS = ["id", "created_at", "updated_at", "type", "title", "content", "tags", "status", "conclusion"]
STEP_FIELDS = ["id", "thought_id", "seq", "created_at", "content"]
LOG_FIELDS = ["timestamp", "table", "operation", "record_id", "changed_by", "detail"]


def now():
    return datetime.now(timezone.utc).isoformat()


def _next_id(counter_path):
    with open(counter_path, "r") as f:
        current = int(f.read().strip() or "0")
    nxt = current + 1
    with open(counter_path, "w") as f:
        f.write(str(nxt) + "\n")
    return nxt


def next_thought_id():
    return _next_id(COUNTER)


def next_step_id():
    return _next_id(STEPS_COUNTER)


def _read_all(path, fields, int_fields=()):
    if not os.path.exists(path):
        return []
    with open(path, "r", newline="") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            for field in int_fields:
                row[field] = int(row[field])
            rows.append(row)
        return rows


def _write_all(path, fields, rows):
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def read_thoughts():
    return _read_all(THOUGHTS_CSV, THOUGHT_FIELDS, int_fields=("id",))


def write_thoughts(rows):
    _write_all(THOUGHTS_CSV, THOUGHT_FIELDS, rows)


def read_steps():
    return _read_all(STEPS_CSV, STEP_FIELDS, int_fields=("id", "thought_id", "seq"))


def write_steps(rows):
    _write_all(STEPS_CSV, STEP_FIELDS, rows)


def append_log(table, operation, record_id, detail, changed_by="owner"):
    exists = os.path.exists(LOG_CSV)
    with open(LOG_CSV, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=LOG_FIELDS)
        if not exists:
            writer.writeheader()
        writer.writerow({
            "timestamp": now(),
            "table": table,
            "operation": operation,
            "record_id": record_id,
            "changed_by": changed_by,
            "detail": detail,
        })
