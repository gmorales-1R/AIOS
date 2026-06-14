# AIOS — Root

AIOS is an AI Operating System: a hierarchical framework for defining, composing, and activating agents and modules through a structured tree of context nodes.

## Node Model

Every directory in this tree may contain a `this.md`. It defines:
- The identity and purpose of this node
- Protocols and behaviors active within this subtree
- What is expected to exist below

Nodes may expand into a `.this/` directory for additional facets loaded on demand:
- `.this/memory.md` — persistent state or accumulated knowledge
- `.this/skills.md` — callable procedures available at this level
- `.this/tools.md` — tools or integrations accessible here

When a node only needs `this.md`, no `.this/` directory is required.

## Activation Skill: `load-context`

When an agent is invoked, one or more **active paths** are provided (e.g. `/projects/calendar`, `/agents/planner`).

Execute this skill before any other action:

1. This file is already loaded (root context is always first).
2. For each active path, walk from root to leaf and load `this.md` at each level in order.
   - `/projects/calendar` → load `/projects/this.md`, then `/projects/calendar/this.md`
3. At each node, check whether that `this.md` references `.this/` extras. Load only those listed as required; defer optional ones unless the task needs them.
4. Context is now assembled. Proceed with the task.

If no active paths are provided, operate from root context only.

## Conventions

- `this.md` is always the entry point for a node. Keep it concise.
- Deeper detail lives in `.this/`. Reference it from `this.md` when relevant.
- A node does not need to declare every possible child — only those with meaningful constraints or context.
- Prefer depth over breadth: a well-defined narrow node is better than a vague broad one.
- When adding or removing a child node, update the parent's `this.md` table in the same operation.

## Tree index

`/index.md` — flat map of all nodes, maintained by the curator agent. Read it for a quick overview of what exists in the tree.
