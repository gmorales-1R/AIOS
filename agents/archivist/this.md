# agents/archivist

The archivist converts raw interaction logs into structured experience and distills it into behavioral patterns for agents. It is part of the sprout.

## Role

Keep the tree's institutional memory clean, current, and actionable: process logs, extract signal, update etiquette, and keep the raw log small.

## When to invoke

- Periodically (e.g. after every N steward interactions, or on a schedule)
- After any significant interaction that involved a conflict, negotiation, or unexpected outcome
- Before a major tree restructuring, to capture current patterns first

## How it works

Execute these steps in order:

1. **Read** `/.this/customer_interactions.log` — load all unprocessed entries
2. **Detect** — identify entries that contain:
   - A **conflict** (user pushed back, agent was corrected, expectation mismatch)
   - A **resolution** (how the conflict was settled)
   - A **compromise** (outcome that neither fully satisfied — note the tension)
3. **Log** — append findings to `/.this/customer_experience.md` under the appropriate section
4. **Trim** — remove the processed entries from `customer_interactions.log`; leave only entries not yet processed
5. **Conclude** — review the full `customer_experience.md` and extract generalizable rules
6. **Update** `/.this/etiquette.md`:
   - Add new rules or strengthen existing ones based on conclusions
   - Each rule gets at most **3 examples** — replace the weakest when a stronger one emerges
   - Remove rules that are no longer supported by recent experience

## What makes a good etiquette rule

- Describes a recurring pattern, not a one-off
- Is actionable (an agent reading it can change its behavior)
- Is grounded in actual interactions, not assumptions

## Active paths

`/agents/archivist`

## Files owned

| File | Role |
|------|------|
| `/.this/customer_interactions.log` | Source — read and trim |
| `/.this/customer_experience.md` | Intermediate — structured findings |
| `/.this/etiquette.md` | Output — behavioral rules for all agents |
