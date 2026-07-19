"""Domain operations for tinkerbell: capture, reason, step, resolve, archive, list, search.

This is the only layer interfaces should call into — never db/ (store.py) directly.
"""

from . import store

STATUSES = ("open", "in_progress", "resolved", "archived")
TYPES = ("capture", "reasoning")


class NotFound(Exception):
    pass


def _split_tags(tags):
    return [t for t in tags.split(";") if t]


def _join_tags(tags):
    return ";".join(tags)


def _find(rows, id_):
    for row in rows:
        if int(row["id"]) == int(id_):
            return row
    return None


def capture(content, title="", tags=None, changed_by="owner"):
    """Log a raw thought. Starts as type=capture, status=open."""
    rows = store.read_thoughts()
    tid = store.next_thought_id()
    ts = store.now()
    row = {
        "id": tid,
        "created_at": ts,
        "updated_at": ts,
        "type": "capture",
        "title": title or content[:60],
        "content": content,
        "tags": _join_tags(tags or []),
        "status": "open",
        "conclusion": "",
    }
    rows.append(row)
    store.write_thoughts(rows)
    store.append_log("thought", "create", tid, f"capture: {row['title']}", changed_by)
    return row


def reason(problem, title="", tags=None, changed_by="owner"):
    """Open a reasoning chain on a question/problem. type=reasoning, status=in_progress."""
    rows = store.read_thoughts()
    tid = store.next_thought_id()
    ts = store.now()
    row = {
        "id": tid,
        "created_at": ts,
        "updated_at": ts,
        "type": "reasoning",
        "title": title or problem[:60],
        "content": problem,
        "tags": _join_tags(tags or []),
        "status": "in_progress",
        "conclusion": "",
    }
    rows.append(row)
    store.write_thoughts(rows)
    store.append_log("thought", "create", tid, f"reason: {row['title']}", changed_by)
    return row


def add_step(thought_id, content, changed_by="owner"):
    """Append a reasoning step. Auto-upgrades a capture to reasoning and bumps status to in_progress."""
    thoughts = store.read_thoughts()
    thought = _find(thoughts, thought_id)
    if thought is None:
        raise NotFound(f"no thought with id {thought_id}")
    if thought["status"] in ("resolved", "archived"):
        raise ValueError(f"thought {thought_id} is {thought['status']}; reopen semantics not supported, use resolve/archive history instead")

    steps = store.read_steps()
    existing = [s for s in steps if int(s["thought_id"]) == int(thought_id)]
    seq = len(existing) + 1
    sid = store.next_step_id()
    step_row = {
        "id": sid,
        "thought_id": thought_id,
        "seq": seq,
        "created_at": store.now(),
        "content": content,
    }
    steps.append(step_row)
    store.write_steps(steps)

    thought["type"] = "reasoning"
    thought["status"] = "in_progress"
    thought["updated_at"] = store.now()
    store.write_thoughts(thoughts)

    store.append_log("step", "create", sid, f"step {seq} on thought {thought_id}", changed_by)
    return step_row


def resolve(thought_id, conclusion, changed_by="owner"):
    thoughts = store.read_thoughts()
    thought = _find(thoughts, thought_id)
    if thought is None:
        raise NotFound(f"no thought with id {thought_id}")
    thought["status"] = "resolved"
    thought["conclusion"] = conclusion
    thought["updated_at"] = store.now()
    store.write_thoughts(thoughts)
    store.append_log("thought", "update", thought_id, "resolved", changed_by)
    return thought


def archive(thought_id, changed_by="owner"):
    thoughts = store.read_thoughts()
    thought = _find(thoughts, thought_id)
    if thought is None:
        raise NotFound(f"no thought with id {thought_id}")
    thought["status"] = "archived"
    thought["updated_at"] = store.now()
    store.write_thoughts(thoughts)
    store.append_log("thought", "update", thought_id, "archived", changed_by)
    return thought


def get(thought_id):
    thought = _find(store.read_thoughts(), thought_id)
    if thought is None:
        raise NotFound(f"no thought with id {thought_id}")
    steps = sorted(
        (s for s in store.read_steps() if int(s["thought_id"]) == int(thought_id)),
        key=lambda s: int(s["seq"]),
    )
    return thought, steps


def list_thoughts(status=None, type_=None, tag=None):
    rows = store.read_thoughts()
    if status:
        rows = [r for r in rows if r["status"] == status]
    if type_:
        rows = [r for r in rows if r["type"] == type_]
    if tag:
        rows = [r for r in rows if tag in _split_tags(r["tags"])]
    return sorted(rows, key=lambda r: int(r["id"]))


def search(query):
    q = query.lower()
    rows = store.read_thoughts()
    hits = [
        r for r in rows
        if q in r["title"].lower() or q in r["content"].lower() or q in r["conclusion"].lower()
    ]
    steps = store.read_steps()
    step_hits = {int(s["thought_id"]) for s in steps if q in s["content"].lower()}
    hit_ids = {int(r["id"]) for r in hits}
    for r in rows:
        if int(r["id"]) in step_hits and int(r["id"]) not in hit_ids:
            hits.append(r)
    return sorted(hits, key=lambda r: int(r["id"]))
