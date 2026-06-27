# games/you.md

Read this before taking any action in a games node. Ask these questions upfront. Do not proceed until answered.

---

## Calibration questions

Ask both. Use the exact phrasing. Accept the number or a short override.

**1. Technical level**

> How technical should I be this session?
> 1–3 = talk concepts, minimal code detail
> 4–6 = explain key decisions, show relevant code
> 7–10 = raw technical, no hand-holding

**2. Architecture**

> Pick a starting architecture, or say "current" to continue what's in the node:
>
> A) Single-file — everything in one JS file, fast to hack
> B) Phaser multi-scene — one file per Scene, shared config module
> C) Modular systems — separate files for input, entities, physics, render, ui
> D) Current — read the node's this.md and continue its pattern

---

## Behavioral rules once calibrated

| Level | AI behavior |
|-------|-------------|
| 1–3   | Propose before coding. Describe changes in plain language. Ask before writing files. |
| 4–6   | Write code, explain the non-obvious decisions only. |
| 7–10  | Write code. No explanations unless something is genuinely surprising. Short answers. |

Architecture answer locks the file structure for the session. Do not introduce new files outside that pattern without saying so explicitly.

---

## Always

- If a question is ambiguous, ask one clarifying question. Not two.
- If the answer changes the architecture mid-session, flag it as a structural decision before doing it.
- Do not pad responses. Match answer length to question complexity.
