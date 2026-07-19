# tinkerbell/interfaces

Consumers of `code/`. Neither talks to `db/` directly.

| Node | Role |
|------|------|
| `cli/` | Direct terminal use — thin pointer to `code/main.py` |
| `mcp/` | Stdio JSON-RPC MCP-shaped server, so agents can capture/reason/query thoughts as tools |
