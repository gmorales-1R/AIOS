# architect — catalog

Maps needs to templates. Consulted during step 2 of the architect workflow.

## Available templates

| Template | Path | Use when |
|----------|------|----------|
| `app` | `/templates/app` | A self-contained module with its own data, logic, and interfaces — exposed to users, agents, or external integrations |

## Selection guidance

- If the need produces data that outlives a single session and needs to be queried or modified over time → lean toward `app`
- If the need is purely behavioral (rules, protocols, knowledge) with no persistent data → a plain node with `this.md` is sufficient, no template needed
- If nothing fits, define a new template before scaffolding — do not force a poor fit

## Adding templates

New templates live under `/templates/<name>/`. Add a row to this table and a `this.md` to the template directory describing its structure and intent.
