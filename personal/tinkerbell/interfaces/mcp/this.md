# tinkerbell/interfaces/mcp

Stdlib-only stdio JSON-RPC server (`server.py`) speaking the subset of MCP an agent needs: `initialize`, `tools/list`, `tools/call`. No `mcp` package dependency.

## Tools exposed

| Tool | Maps to |
|------|---------|
| `tinkerbell_capture` | `thoughts.capture` |
| `tinkerbell_reason` | `thoughts.reason` |
| `tinkerbell_step` | `thoughts.add_step` |
| `tinkerbell_resolve` | `thoughts.resolve` |
| `tinkerbell_archive` | `thoughts.archive` |
| `tinkerbell_show` | `thoughts.get` (+ `render.format_thought_detail`) |
| `tinkerbell_list` | `thoughts.list_thoughts` |
| `tinkerbell_search` | `thoughts.search` |

Run: `python3 interfaces/mcp/server.py` (stdio transport, one JSON-RPC message per line).
