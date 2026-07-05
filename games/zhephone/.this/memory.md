# zhephone — memory

Persistent state and accumulated knowledge across sessions. Written because the user has repeatedly lost interaction history to frozen/dropped sessions — this file is the durable record of the idea, not the chat log.

## Session history

| Date | Branch | Summary |
|------|--------|---------|
| 2026-07-05 | `claude/availability-check-ub31n3` | Initial concept pass: core loop, prize/legal structure, population decay math, cash-out incentive design. No code written yet. |
| 2026-07-05 (later) | `claude/availability-check-ub31n3` | Designed combat resolution (deterministic, no dice) and clan governance (free membership, founder-leader, leader-only diplomacy, succession rule). Then built `poc-core-loop/` — a playable tech spike proving those two systems actually work: fixed 100ms tick loop resolving queued move/attack intents, the exact damage formula from docs.md (flanking verified via a real overkill hit), clan-gated attacks (ally clicks correctly refused), and a telegraphed NPC attack that a timed block genuinely halves (`hits You for 5 (blocked -50%)` vs. the normal 10 in the log). Verified headlessly by reading actual game state (`window.__poc`) after simulated clicks, not just screenshots. No real art available (same constraint as `bones`) — used tinted three.js capsule primitives instead of sprites. Still client-only; no real authoritative server exists yet, this PoC simulates the tick loop locally as a stand-in. |

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

## Endgame design pillars (2026-07-05, second pass)

Initial "hard cap + shrinking zone" endgame proposal was rejected by design owner: **the game must never force a social outcome.** Corrected into four load-bearing pillars:

1. **Determinism for everything non-social** — combat math, decay curves, payout formulas, timers: 100% transparent and calculable by any player. No hidden dice.
2. **Free will for everything social** — no forced alliances, no forced fights, no scripted collapse. A dominant faction staying intact, splitting evenly, or being betrayed by one member are all legitimate outcomes the system must permit, never engineer.
3. **Information asymmetry is the actual game** — math is public; other players' true state (headcount, loyalty, side-deals, intent) is not. This is where all tension must live, since pillar 1 removes it from combat/economy.
4. **Divine intervention** — rare, unpredictable system-level events (world-tier, not player-tier) for spice. Statistically known to occur (players know the category), individually unpredictable in timing/target, never aimed at deciding a winner. Open question: fixed-rate/Poisson-style frequency so it's predictable-in-aggregate but not gameable in the moment.

**Claim-ritual mechanic** (replaces the rejected forced Vault): any present, allied group can voluntarily trigger a claim ritual at any time; payout = pool / (players present & registered at trigger instant) — a fully public, calculable formula. Nothing stops a small trusted circle from triggering early and cutting others out; nothing forces it either. The counter-pressure that naturally keeps groups from shrinking to 1 is real but *uncertain* retaliation risk from whoever gets excluded — that uncertainty (not a hard rule) is what should organically settle group size small-but-nonzero. Group size at claim time is intentionally NOT hard-coded (could be 2, could be 40 loyal holdouts) — the variance across live seasons is the entertainment product, not a bug to eliminate.

Concrete information-asymmetry levers proposed: leaky private alliance comms (a defector can sell/reveal them to a rival for a cut), headcount/position only knowable via scouting/line-of-sight (never a global map), public leaderboard shows calculable stats only (population, pool size, %), never intentions.

## Business model — the real product (2026-07-05)

Design owner reframed the project: this is not "an MMO with monetization," it is closer to **Twitch + reality TV + PUBG-style sponsored drops**, where the simulated world is the stage.

| Role | Who | Function |
|---|---|---|
| Product | Raw social/complex interaction (drama, betrayal, alliances) | The actual thing being sold |
| Service | Paid in-game cameras + audio | Premium observation of the world |
| Workers | Players | Free-to-play participants; generate all content unpaid (also satisfies the earlier "no consideration" gambling-law lever, incidentally) |
| Clients | Content creators | Take camera/audio footage to build their own commentary/theory-crafting content — free syndication/marketing layer, should be made easy, not hard |
| Money | Sponsors | Buy attention (branded camera overlays) and diegetic presence (e.g. a branded care package spawned at specific coordinates) |
| Audience | Anyone | Each channel (viewer, creator, sponsor) monetized differently |

**Key technical insight:** because the world is an authoritative deterministic simulation (Tibia-style tick model — see combat/tech notes), a "camera" does not need to be real video. A viewer's browser can render its own view directly from world-state deltas + a virtual camera position/angle. This is far cheaper than real video transcoding (no per-camera encoding cost), scales to arbitrary simultaneous cameras, and enables replay/rewind and per-creator render skins that real cameras can't do. This became the strongest argument for a web-native (WebGL) client rather than a traditional game engine.

**Audio/consent flag (raised, then explicitly deprioritized by design owner):** if "paid audio" means eavesdropping on real player voice comms, that touches wiretap/recording-consent law in some jurisdictions (e.g. all-party-consent states, EU rules). Design owner's call: not a concern worth designing around ("out-of-US jurisdictions don't matter") — logged here as a decision, not resolved as a non-issue; revisit if EU/UK market entry is ever considered. Technical alternative if ever wanted: synthesize ambient/combat audio from world-state (footsteps, hits) instead of capturing real voice — sidesteps the question entirely and stays consistent with everything else being derived from deterministic state.

**New subsystems this model requires** (rough build-priority order): (1) camera/observer access control on top of world-state, (2) sponsor drop scheduling + brand-safety moderation, (3) creator-facing clip/export tooling with rights terms, (4) per-sponsor attribution/analytics.

## Tech stack

- Server: needs a custom (or heavily customized) authoritative fixed-tick simulation server — this is the real engineering lift, not the renderer. No mainstream engine's built-in networking (Unity Netcode, UE replication, Godot multiplayer API) is built for a persistent 10,000-concurrent shard; all are scoped for dozens-to-low-hundreds per session.
- Client: web-native (WebGL/Canvas), not Unity/UE/Godot — zero-install matters for both players (free workforce, want max signups) and viewers (paying customers, want instant access), and the world's "camera" product is naturally implemented as client-side rendering of authoritative state (see business model section above) rather than real video.
- Unity ruled out: licensing/runtime-fee history is a real risk for a commercial real-money product.
- Unreal ruled out: highest fidelity/overhead, solves a graphics problem this project explicitly doesn't have.
- Godot: viable fallback if more engine muscle is wanted later (free, no royalty, native tile tooling), but weaker spectator/broadcast tooling out of the box than a web stack.
- three.js: first PoC built 2026-07-05 to test viability — see `poc-threejs/` sibling to this memory file. Good fit specifically for the arbitrary-camera/observer requirement (real 3D scene graph, free camera placement) vs. flat 2D canvas.

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
