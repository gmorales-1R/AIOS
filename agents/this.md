# agents/

This node is the namespace for agent definitions within AIOS.

## What belongs here

Each child node defines a specific agent: its role, the paths it operates on, its capabilities, and any constraints on its behavior. Agent nodes are not running processes — they are definitions that get instantiated when activated with a path.

## Expected child structure

```
agents/
  <agent-name>/
    this.md         ← role, active paths, behavioral constraints
    .this/
      skills.md     ← skills this agent can invoke
      memory.md     ← agent-scoped persistent context (if any)
```

## Agents

| Agent | Role |
|-------|------|
| `curator/` | Maintains tree integrity, references, index, and convention compliance |

## Conventions for agent nodes

- `this.md` must declare the agent's **role** (one sentence) and its **default active paths**.
- An agent should only claim paths it genuinely needs in context — loading unnecessary nodes wastes context.
- Behavioral constraints defined here (or inherited from parent nodes) take precedence over agent-level instructions.
