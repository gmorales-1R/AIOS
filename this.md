# AIOS — Root

AIOS is an AI Operating System: a hierarchical framework for defining, composing, and activating agents and modules through a structured tree of context nodes.

## Node model

Every directory may contain a `this.md` (node entry point) and a `.this/` directory (optional facet expansion). See `/.this/node_structure.md` for the full contract: what `this.md` must cover, standard `.this/` facets, and the caching principle.

## Root extras

| File | When to load |
|------|-------------|
| `/.this/etiquette.md` | Always — behavioral patterns learned from past interactions |
| `/.this/node_structure.md` | When creating or modifying any node |

## Activation skill: `load-context`

Execute before any other action when active paths are provided:

1. This file is already loaded (root is always first).
2. Load required root extras from the table above.
3. For each active path, walk root → leaf loading `this.md` at each level in order.
4. At each node, load any `.this/` facets declared as `required`; defer `optional` ones unless the task needs them.
5. Context is assembled. Proceed.

If no active paths are provided, operate from root context only.

## Conventions

- Always update the parent's children table when adding or removing a node.
- Keep upper-level nodes stable and concise — they are shared prefix for all nodes below them.
- Prefer depth over breadth: a well-defined narrow node is better than a vague broad one.

## Top-level nodes

| Path | Purpose |
|------|---------|
| `agents/` | User-defined agent definitions |
| `games/` | Interactive game projects |
| `templates/` | Node type templates used by the steward |
| `personal/` | Personal tools and knowledge namespace |

Sprout-internal agents live in `/.this/agents/`. `/index.md` is the curator-maintained tree map.
