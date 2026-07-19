"""Presentation helpers shared by the CLI and MCP interfaces. Pure formatting, no I/O."""


def format_thought_line(row):
    tags = f" [{row['tags'].replace(';', ', ')}]" if row["tags"] else ""
    return f"#{row['id']:>4}  {row['status']:<11} {row['type']:<9} {row['title']}{tags}"


def format_thought_detail(thought, steps):
    lines = [
        f"#{thought['id']} — {thought['title']}",
        f"type: {thought['type']}    status: {thought['status']}",
        f"created: {thought['created_at']}    updated: {thought['updated_at']}",
    ]
    if thought["tags"]:
        lines.append(f"tags: {thought['tags'].replace(';', ', ')}")
    lines.append("")
    lines.append(thought["content"])
    if steps:
        lines.append("")
        lines.append("reasoning steps:")
        for s in steps:
            lines.append(f"  {s['seq']}. {s['content']}")
    if thought["conclusion"]:
        lines.append("")
        lines.append(f"conclusion: {thought['conclusion']}")
    return "\n".join(lines)


def format_list(rows):
    if not rows:
        return "(no thoughts)"
    return "\n".join(format_thought_line(r) for r in rows)
