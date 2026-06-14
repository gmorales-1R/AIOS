# node_structure

Defines the contract for `this.md` and the standard facets available in `.this/`. Open-ended — any node may define facets beyond these — but agents should know and expect these primitives.

## What `this.md` must do

Every `this.md` is the entry point for its node. It should cover what is relevant from the following, omitting sections that don't apply:

- **Identity** — one short paragraph: what this node is and why it exists
- **Purpose / north star** — for namespaces: the goals or principles active in this subtree
- **Domain concepts** — for modules: the entities managed here, their fields, enums, status values
- **Children table** — a `| Node | Purpose |` table of direct child nodes with meaningful constraints; omit children that are self-explanatory from their name
- **Conventions / behavioral rules** — anything agents operating here must know that isn't obvious from the identity
- **`.this/` references** — list which facets are loaded and whether they are `required` (load always) or `optional` (load when the task needs them)

Keep `this.md` concise. If a section grows beyond ~40 lines, promote the content to the appropriate `.this/` facet and replace it with a one-line reference.

## What `.this/` is

A directory of named facets that expand a node beyond its entry point. Facets are loaded on demand — `this.md` declares which ones exist and when to load them. Having a `.this/` directory is never required; use it only when the node needs more than `this.md` can hold cleanly.

## Standard facets

| Facet | Purpose | Load |
|-------|---------|------|
| `skills.md` | Callable procedures available at this level | When the task requires invoking a procedure defined here |
| `memory.md` | Persistent state, accumulated knowledge, prior decisions | When continuity across sessions matters for this node |
| `tools.md` | External tools, APIs, or integrations accessible here | When the task requires a tool specific to this node |
| `docs.md` | Deeper reference documentation, specs, background | When more detail is needed than `this.md` provides |
| `definitions.md` | Vocabulary, terms, and concepts specific to this subtree | When terminology needs disambiguation |

## Root-level facets (/.this/)

These exist only at the root and are managed by the sprout's internal agents:

| Facet | Owner | Purpose |
|-------|-------|---------|
| `agents/` | sprout | Prefab framework agents (curator, steward, archivist) |
| `etiquette.md` | archivist | Learned behavioral patterns — loaded on every activation |
| `customer_interactions.log` | steward hook | Raw append-only interaction log |
| `customer_experience.md` | archivist | Structured conflicts, resolutions, compromises |

## Caching principle

Upper-level `this.md` files form the stable prefix for every activation that passes through them. Keep root and namespace-level nodes concise and stable — edits to them invalidate cached context for every node in their subtree.
