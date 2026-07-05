# zhephone — memory

Persistent state and accumulated knowledge across sessions. Written because the user has repeatedly lost interaction history to frozen/dropped sessions — this file is the durable record of the idea, not the chat log.

## Session history

| Date | Branch | Summary |
|------|--------|---------|
| 2026-07-05 | `claude/availability-check-ub31n3` | Initial concept pass: core loop, prize/legal structure, population decay math, cash-out incentive design. No code written yet. |

## Core concept

- Permadeath MMO, "Tibia but death is permanent and has real economic stakes."
- Base game is PvE. PvP is gated behind clan/alliance rivalry — no free-for-all PvP. This is the "royale" layer on top of a PvE base.
- Structured as a once-a-year live event: one concentrated season per year, not a persistent always-on world.

## Prize structure — decisions and rejected ideas

**Goal:** real money prize to drive genuine social behavior (trust, betrayal, alliance-forming), without the game being legally classified as gambling.

**Rejected idea:** disguise the cash prize as a 3D-printed "statue" that grows a layer per player death and imprints the ruling clan's banner, with a sponsor "buying" the statue for $1M as an opacity layer over the real payout.
- **Why rejected:** gambling/prize law applies a substance-over-form test (consideration + chance + prize of value). Dressing the prize as an art object a sponsor happens to buy doesn't remove the "prize of value" element — it just adds a layer of structuring that looks worse under scrutiny, not better (echoes classic art-market money-laundering patterns; a sponsor wiring $1M for a "statue" tied to a game outcome reads as a structured transaction to AML compliance, not as art commerce).
- Reality TV / esports don't hide the prize — they remove the *consideration* prong (no pay-to-enter) and lean on *skill-predominance* over chance. That's the actual legal lever, not obfuscation.

**Adopted structure:**
1. **No player entry fee.** Free to play, free to compete — kills "consideration."
2. **Sponsor-funded prize pool**, disclosed transparently as a tournament purse (same model as esports prize pools), not hidden behind intermediary purchases.
3. **Skill-predominant permadeath.** Minimize RNG in combat/death resolution — the more death is a function of player skill/decisions rather than chance, the safer the classification and the better the game.
4. Jurisdiction matters a lot (US state law is a patchwork; some states regulate chance-based prizes even with free entry). Real gaming-law counsel required before shipping real-money mechanics — nothing here is legal advice.

## Population / season structure math

Game launches once a year with an expected starting population of **10,000 players**, decaying via permadeath with a **0.5-day (12h) half-life**: `N(t) = 10000 · 0.5^(t / 0.5 days)`.

| Time elapsed | Players remaining |
|---|---|
| 12h | 5,000 |
| 1 day | 2,500 |
| 2 days | 625 |
| 3 days | 156 |
| 4 days | 39 |
| 5 days | ~10 |
| ~6.6 days | 1 (last survivor) |

**Implication:** the "annual" event is actually a ~1-week concentrated burst, not a long-running MMO season. Design and spectator/streaming mechanics should be built around that week, not around sustained year-round engagement.

## Cash-out / incentive design

Core lever: give each player a **live, visible, individually-owned stake**, plus a real choice to lock it in. Mechanisms:

1. **Implied share ticker** — each survivor sees a live notional payout (prize_pool / players_remaining, weighted). Rises as the field shrinks — strong loss-aversion-driven engagement with no additional content needed.
2. **Cash-out option, at a discount** — a player can lock their current implied share and exit safely, but only for a fraction of it (e.g. ~70%), or with a cooldown/exposure window. Makes it a real bank-vs-push-your-luck decision (Golden Balls / Deal-or-No-Deal psychology), not a free win.
3. **Bounty transfer on kill** — killing a rival transfers a slice of their implied share to the killer, rather than letting it evaporate into the shared pool. Directly rewards PvP/betrayal behavior instead of rewarding hiding/turtling.
4. **Milestone cash-out windows** — scheduled global cash-out events synced to the natural population-halving rhythm (~every 12h), turning the decay curve into a designed dramatic beat and a spectator/streaming hook ("the cut").
5. **Clan-pooled cash-out** — alliances can split a joint cash-out, reinforcing the clan layer and creating a betrayal vector (cash out solo and cut the clan out, or split and trust them not to strike first).
6. **Convex payout curve** — implied share scales ~1/N, so late survival pays disproportionately more than early survival. Concentrates dramatic tension in the final ~24–48h when population is under ~150 — exactly where spectator attention should peak.

## Open questions / next steps

- Combat system not yet designed (needs to be skill-predominant per the legal constraint above).
- Clan/alliance mechanics (formation, betrayal, rivalry triggers) not yet detailed.
- Tech stack not chosen — no code exists yet.
- Exact jurisdictional scope for launch not decided; changes prize-structure requirements materially.
- Weighting formula for "implied share" (equal split vs. contribution-weighted) not decided.
- Cash-out discount rate (~70% used as an illustrative placeholder) not tuned.

## Known gaps

- No prototype, no combat resolution model, no UI concepts.
- Legal structure is a design hypothesis, not reviewed by counsel.
