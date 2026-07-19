# tinkerbell/code

Core logic — the only layer that reads/writes `db/`. Stdlib-only Python (no dependencies).

- `main.py` — CLI entry point (`python3 main.py <command>`), also the `interfaces/cli` target
- `src/store.py` — CSV/counter/log primitives; the only module touching `db/` files directly
- `src/thoughts.py` — domain operations (`capture`, `reason`, `add_step`, `resolve`, `archive`, `get`, `list_thoughts`, `search`); interfaces call into this, never `store.py` directly
- `lib/render.py` — pure formatting helpers shared by the CLI and MCP interfaces
