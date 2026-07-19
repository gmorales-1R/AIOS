# tinkerbell

A general thought/reasoning module. Captures raw thoughts on the fly and also runs structured, multi-step reasoning chains toward a conclusion — one module, two speeds. Serves the `personal/` north star of mental unburden: get a thought out of your head and into something you can return to, structure, and resolve later.

## Domain concepts

- **Thought** — the base unit. Fields: `id`, `created_at`, `updated_at`, `type`, `title`, `content`, `tags`, `status`, `conclusion`
- **Type** — `capture` (a quick raw note) or `reasoning` (a deliberation with steps). A `capture` auto-upgrades to `reasoning` the instant a step is added to it — the distinction is about how far a thought has gone, not a wall between two kinds of thing
- **Status** — `open` (just captured) → `in_progress` (reasoning underway) → `resolved` (conclusion reached) or `archived` (put away without resolving)
- **Step** — an ordered deliberation step on a `reasoning` thought. Lives in `steps.csv`, keyed by `thought_id` + `seq`

## Modularity principle

Each layer is independently replaceable. Swapping the CSV backend for something else, or adding a new interface, must not require changes to other layers. `code/src/store.py` is the only module that touches `db/` directly; `code/src/thoughts.py` is the only module interfaces call into. `code/lib/render.py` holds formatting shared by every interface.

## Structure

| Node | Role |
|------|------|
| `db/` | Storage layer — CSV (`tinkerbell.csv` for thoughts, `steps.csv` for steps), replaceable |
| `code/` | Core logic — `main.py` (CLI entry), `src/` (store + domain ops), `lib/` (shared rendering) |
| `interfaces/` | Consumers — `cli/` (points at `code/main.py`), `mcp/` (stdio JSON-RPC server exposing tinkerbell as agent tools) |
| `tests/` | Test suite (`unittest`, runs against an isolated `TINKERBELL_DB_DIR`, never touches real data) |

## What agents should know

- Read/write thoughts via `code/src/thoughts.py`, never `db/` or `store.py` directly
- Adding a step to a `resolved` or `archived` thought is rejected — there's no reopen path yet; if that's needed, extend `thoughts.py` deliberately rather than hacking around the guard
- `tags` are `;`-separated in storage (not `,`) to avoid CSV-quoting churn — always go through `_split_tags`/`_join_tags` rather than splitting on commas
- Thought ids and step ids use separate counters (`counter.txt`, `steps_counter.txt`) since they're independent id spaces — never derive either from scanning the CSV
- No external dependencies (stdlib only, including the MCP interface — it hand-rolls the JSON-RPC surface rather than depending on the `mcp` package)
