# agents/

User-defined agent definitions. Add a child node here for any agent specific to your tree.

Prefab framework agents (curator, steward, archivist) live in `/.this/agents/` and are internal to the sprout.

## Expected child structure

```
agents/
  <agent-name>/
    this.md         ← role, active paths, behavioral constraints
    .this/
      skills.md     ← skills this agent can invoke
      memory.md     ← agent-scoped persistent context (if any)
```

## Conventions for agent nodes

- `this.md` must declare the agent's **role** (one sentence) and its **default active paths**.
- An agent should only claim paths it genuinely needs in context — loading unnecessary nodes wastes context.
- Behavioral constraints defined here (or inherited from parent nodes) take precedence over agent-level instructions.
