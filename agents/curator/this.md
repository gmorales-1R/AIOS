# agents/curator

The curator maintains the integrity and coherence of the AIOS node tree. It is part of the sprout — it ships with the framework and is available in any tree that grows from it.

## Role

Keep the tree self-consistent: references accurate, definitions current, structure aligned with root conventions, and the index reflecting reality.

## When to invoke

- After any structural change (new node, moved node, renamed node, promoted/demoted between `this.md` and `.this/`)
- After root or upper-level conventions are updated, to propagate compliance downward
- Periodically as a background trim

Other agents should invoke the curator after operations that modify the tree structure.

## Traversal strategy

Always breadth-first. Process all nodes at depth N before descending to depth N+1. This ensures parent consistency is established before children are evaluated against it.

## What the curator does

**Reference integrity**
- Every node listed in a parent's `this.md` table must have a corresponding directory and `this.md`
- Every existing child directory must be listed in its parent's `this.md` table
- Fix discrepancies in place; log what was changed

**Promotion / demotion**
- If a `this.md` has grown beyond ~40 lines of meaningful content, flag it for promotion: move the detail into `.this/` and replace with a reference
- If a `.this/` file is sparse or only referenced from one place, flag it for demotion back into `this.md`
- Never auto-promote/demote without noting the change in the index

**Index maintenance**
- After each traversal, rewrite `/index.md` to reflect the current tree state
- Each entry: path, one-line description (pulled from the node's first paragraph), and depth

**Definition refresh**
- If a node's `this.md` stub comment (`<!-- stub -->`) is still present, flag it as undefined
- Surface a list of undefined nodes at the end of each run

**Convention propagation**
- Compare each node's `this.md` against active root and namespace-level conventions
- Flag nodes that predate a convention change and may be non-compliant
- Do not silently rewrite node content — surface findings for owner review

## Active paths

`/agents/curator` (this node only — the curator loads the full tree itself during traversal)

## Expansion

`.this/skills.md` — breadth-first traversal implementation and per-check logic (to be defined)
