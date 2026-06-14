# template: app

A self-contained module with persistent data, core logic, and one or more interfaces. Use for tools that manage a domain of information and expose it to users, agents, or external integrations.

**Examples in this tree**: `personal/calendar`, `personal/ToDo`

## Structure

```
<name>/
  this.md                  ← module identity, domain concepts, modularity principle, agent rules
  db/
    this.md                ← storage layer description
    schema.md              ← field definitions, types, enums
    <name>.csv             ← primary data (headers only at creation)
    log.csv                ← change log (headers only at creation)
    counter.txt            ← last assigned integer ID, starts at 0
  code/
    this.md                ← entry points, architecture notes
    main.py                ← executable entry point
    requirements.txt       ← dependencies
    src/
      __init__.py
    lib/
      __init__.py
  interfaces/
    this.md                ← which interfaces exist and their role
    web/
      this.md
    api/
      this.md
    mcp/
      this.md
  integrations/            ← optional; add only when an integration exists or is planned
    this.md
    <target>/
      this.md
  tests/
    .gitkeep
```

## Required this.md sections for the root node

- **Domain concepts** — the entities this module manages, their fields and status enums
- **Modularity principle** — which layers are independently replaceable and the rule about interfaces never touching db directly
- **Structure table** — one row per child directory with its role
- **What agents should know** — behavioral rules specific to this module (e.g. proposed vs confirmed, respect for day types)

## Key conventions

- `db/` is only accessed by `code/` — interfaces go through code, never directly to db
- IDs are integers managed via `counter.txt` — never derive next ID from the CSV
- `integrations/` is omitted until an integration is real or actively planned
- Each layer is replaceable (e.g. CSV → Postgres) without touching other layers
