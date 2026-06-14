# calendar

A minimal, modular calendar module. Manages time slots for its owner and exposes them to direct use, agents, and external integrations.

## Domain concepts

- **Entry** — the base unit: a time slot with a title, start, end, and status
- **Status** — `proposed` (not yet committed), `confirmed` (firm), `cancelled`, `done`
- **Recurrence** — entries may repeat on a schedule (daily, weekly, custom RRULE-style)
- **Day types** — days are classified as workday, weekend, or holiday; scheduling logic respects this
- **Priority** — entries carry a priority level to resolve conflicts and guide agent scheduling

## Modularity principle

Each layer is independently replaceable. Swapping the CSV backend for Postgres, or the MCP interface for a REST API, must not require changes to other layers. The `code/` layer is the only one that touches `db/` directly — interfaces go through code.

## Structure

| Node | Role |
|------|------|
| `db/` | Storage layer — currently CSV, replaceable |
| `code/` | Core logic — the only layer that reads/writes db |
| `interfaces/` | Consumers — web UI, REST API, MCP tool |
| `tests/` | Test suite |

## What agents should know

- Read entries via the interfaces, not directly from `db/`
- When proposing a new entry, set status `proposed` — never `confirmed` without owner acknowledgment
- Respect day types: do not schedule over holidays or outside workday bounds unless explicitly asked
- Recurring entries are expanded at query time, not stored as individual rows
