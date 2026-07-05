# zhephone — technical architecture

Reference spec. `memory.md` is the decision log (why); this is the how. Nothing here is built yet except `poc-threejs/`.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Sim server | Node.js + TypeScript | Real engineering lift is the authoritative tick server, not the renderer (see memory.md). TS keeps one language across server+client for a small team; escape hatch below if it can't hold 10k concurrent. |
| Networking | WebSocket (`ws` or `uWebSockets.js` if `ws` can't hold the connection count) for live tick deltas; plain HTTP/REST for non-realtime (auth, camera purchase, sponsor dashboard) | Tick deltas need low-latency push; marketplace/admin actions don't. |
| Client (player + spectator) | three.js, vanilla ES modules, no framework | Validated by `poc-threejs/`. Matches the repo's existing no-framework convention (`swarms`, `bones`). A "spectator camera" is not a special mode — it's the same renderer subscribed to a different camera position/state-feed instead of local input. |
| Live state | In-memory in the sim server (authoritative, tick-resolved) | Season is a ~week-long burst (see population math) — doesn't need a always-on DB-backed world, needs speed. |
| Durable ledger | Postgres | Financial/audit trail: payouts, sponsor transactions, claim-ritual results. This has to survive server restarts even if live world-state doesn't; money records are non-negotiable regardless of the gambling-law stance already decided. |
| Fan-out (spectator distribution) | Redis pub/sub (add when needed, not at PoC stage) | Decouples the tick loop from however many thousands of viewer connections are subscribed to camera feeds — the sim shouldn't slow down because 50,000 people are watching. |
| Payments | Stripe Connect (or equivalent payout rail) | Practical requirement independent of the legal-classification debate: actually wiring real money to winners worldwide needs a real payout processor, and processors run their own KYC on large payouts regardless of how the game itself is classified. |

**Escape hatch:** if the Node tick server can't hold 10k concurrent entities at the target tick rate, the fallback is rewriting only the hot simulation loop in Go or Rust behind the same WebSocket boundary — not a full rewrite. Don't pre-optimize for this; measure first.

## Mechanics logic

### Tick engine (the Tibia-style core)
- Fixed-interval authoritative loop. Every connected client submits *intents* (move, attack, use item, trigger claim ritual); the server never trusts client-computed outcomes.
- Each tick: collect all intents received since the last tick → resolve in a fixed, documented order (e.g. queued-by-arrival-timestamp, ties broken by a stable per-entity id) → broadcast the resulting state delta.
- **Tick rate: 0.1s (10 ticks/sec), decided.** Networking implication that comes with it: at 10k concurrent entities, a naive full-state broadcast 10x/sec is far too much bandwidth — this makes the line-of-sight/scouting visibility scoping (already decided for the information-asymmetry pillar) load-bearing for performance too, not just design: each client only needs deltas for entities in its visibility set, not the whole world. Delta payloads, not full snapshots, per tick.
- This loop is the literal implementation of pillar 1 (determinism for everything non-social): given the same intents in the same order, the outcome is 100% reproducible — good for both fairness disputes and for letting players actually calculate odds.

### Combat resolution (decided 2026-07-05)

No dice anywhere — no hit chance, no crit chance, no `swarms`-style `1 + uniform(-acc, +acc)` multiplier. Every input to damage is either a fixed known value or a player-controlled timing/positioning choice, so any player can compute the exact outcome of an engagement in advance. This matters doubly: it's the actual mechanism behind "skill-predominant" (design pillar 1 + the legal stance), and in a permadeath game, dice deciding who lives removes the one thing the whole game is supposed to be testing.

```
damage = baseWeaponDamage × skillMultiplier(attacker) × positionModifier − blockReduction(defender)
```

- **`skillMultiplier`** — deterministic and visible, derived from tracked usage (e.g. hits landed with a weapon type), not a hidden RNG skill-up roll like classic Tibia. A player can look up their own exact multiplier at any time.
- **`positionModifier`** — fixed, known bonuses for tactical positioning: e.g. a flat +50% for attacking into a target's rear facing arc. Rewards the tile-based movement/positioning game rather than a stat roll. Exact facing-arc math not yet defined.
- **`blockReduction(defender)`** — this is where defense becomes a timing skill instead of an evasion-chance stat: a defender who queues a block/parry *intent* in a tick before the attack resolves gets a fixed, known damage reduction. Miss the timing window, take full damage. Reading an opponent's tick-cadence and preempting it is the actual skill test — not a dice roll behind the scenes.
- **Resource pacing**: attacks cost stamina, regenerating per tick; attacking faster than stamina regenerates reduces output via the deterministic formula above (e.g. a stamina-starved `skillMultiplier` penalty), not a random miss. Discourages mindless spam without introducing luck.
- HP depletion to 0 triggers permadeath — irreversible, per the core loop. Because every term above is calculable, a player facing lethal damage always could have known it was lethal in advance; the drama is in the tactical choice, not a hidden roll.

Not yet defined: exact facing-arc geometry, specific skill-multiplier growth curve, stamina costs/regen rates, PvE creature stat baselines. This is a first pass on the *shape* of the system (deterministic, timing/position-driven), not final numbers — needs a load-test/playtest pass once the tick server exists to tune the actual constants.

### Alliance / clan system
- Formation, membership, and a declared-rivalry flag are the only channel through which PvP is legal (per the PvE-base + clan-gated-PvP core loop).
- Private alliance comms exist but are leaky by design (memory.md: a defector can sell/reveal them to a rival) — this is a data-visibility rule enforced server-side (who can read which comm channel), not a client feature.
- **Membership (decided 2026-07-05):** any player can freely join or leave any clan at any time, opt-in by default — no approval gate, no cooldown, no leader sign-off required to join or quit. Matches the free-will pillar (no forced social state).
- **Leadership (decided):** a clan's founder — the first player to create it — is its leader by default.
- **Diplomacy authority (decided):** only the clan leader can declare an alliance or an enemy/rivalry status with another clan. Individual members cannot unilaterally change their clan's external relationships — this is a governance choke point, not a technicality: it means a leader can commit their whole clan to a war or pact the membership didn't sign up for, which is exactly the kind of betrayal-surface the information-asymmetry pillar wants.
- **Open, not yet decided:** leadership succession. Permadeath means a leader can die mid-season — does diplomacy authority transfer (to a designated second, oldest remaining member, an election), or does the clan lose the ability to declare new alliances/rivalries until something resolves it, or does the clan dissolve? Flagging rather than guessing.

### Information asymmetry
- Headcount/position visibility is scoped to line-of-sight/scouting — never a global map. This means the tick server must track per-player visibility sets, not just broadcast full world-state to everyone (also helps the fan-out cost problem above).
- Public leaderboard exposes only the calculable public stats (live population, pool size, an alliance's %) — never intentions or private comms.

### Claim ritual / payout
- Any present allied group can trigger it at any moment; payout = pool / (players present & registered at trigger instant). No cap, no forced convergence (memory.md — this replaced the earlier rejected forced-Vault design).
- This is a server-authoritative transaction: it has to atomically snapshot "who is present," lock the payout calculation, and write to the durable Postgres ledger before disbursing via the payment rail — this is the one subsystem that cannot be "in-memory only, rebuild from replay," because real money moves here.

### Divine intervention
- Rare world-tier events, statistically known to occur (players know the category) but individually unpredictable in timing/target. Candidate implementation: Poisson-process scheduling (known average rate, unknown instant) so it's predictable-in-aggregate without being gameable tick-to-tick. Event catalog not yet designed.

### Camera / observer system
- A camera is a subscription to world-state deltas plus a virtual position/angle — not a video stream (memory.md's key technical insight). Access control (who paid for which feed) gates the *subscription*, not a video pipeline.
- Implication for the client: the same three.js renderer serves players and paying spectators; the only difference is whether input intents are accepted from that connection.

### Sponsor drops
- A drop is a scheduled spawn event (item/resource, branded) at given coordinates/time, queued through a moderation step (brand-safety) before the tick server actually spawns it. Needs an admin-facing scheduling surface — not yet designed.
- **Sponsor content (branding/overlay assets, not gameplay drops) syncs on its own slow cadence, decided: every 60s, hash-gated.** Client computes/receives a local hash of current sponsor content; if unchanged since the last check, skip the fetch entirely. Decouples branded-overlay delivery from the 10-tick/sec gameplay loop on purpose — sponsor assets don't need tick precision, and polling a cheap hash instead of pushing full payloads every cycle keeps this off the hot path.

### Immersion & spectator-facing UX
- **Fullscreen is a requirement, not a nice-to-have** — immersion matters enough (design owner's call) that the client must expose a working Fullscreen API toggle (button + likely a keyboard shortcut) on both the player and spectator/camera views.
- **Spectators are stakeholders, not an afterthought** — they're the revenue stream (memory.md's business-model section), so UI has to be intuitive, visually clear, and give real interaction feedback, evaluated for someone watching a stream who never touched the controls, not just for players. Concrete implications: hover/selection states need visible feedback (not just click-response — the PoC's click-to-highlight is a start, hover feedback is the next increment), HUD elements (implied-share ticker, population countdown, alliance banners) need to be legible at streaming resolution/compression, not just on a dev monitor, and state changes (a kill, a claim-ritual trigger, a sponsor drop landing) need a clear visual/audio beat so a viewer catches it without reading combat logs.

## File structure (proposed)

Extends the existing `games/zhephone/` node. Nothing under `server/`, `client/`, or `assets/` exists yet — `poc-threejs/` is the only code so far and will likely fold into `client/` once the real client scaffold exists.

```
games/zhephone/
  this.md
  .this/
    memory.md              # decision log (existing)
    docs.md                # this file
  poc-threejs/             # existing tech spike — camera/tile-render viability
  server/
    package.json
    src/
      tick/                # fixed-interval loop, intent queue, resolution order
      combat/               # damage/skill resolution
      world/                # tile/map state, population tracking, decay math
      alliances/            # membership, rivalry flags, comms visibility rules
      camera/               # observer subscription + access control
      sponsors/             # drop scheduling + moderation queue
      payouts/              # claim-ritual transaction + Postgres ledger + payment rail integration
      net/                  # websocket + http handlers
  client/
    index.html
    src/
      render/               # three.js scene, camera rig (player + spectator share this)
      net/                  # websocket client, state-delta sync
      ui/                   # HUD, alliance panel, camera marketplace
      input/                # intent submission (not local physics/combat resolution — server is authoritative)
    vendor/                 # three.module.js, OrbitControls.js (already vendored in poc-threejs/vendor/)
  assets/
    tiles/
    tokens/                 # player/creature representations
    ui/
    audio/                  # synthesized/sampled SFX — no real player voice capture, per memory.md's audio/consent note
    sponsor-intake/         # staging area for brand-supplied assets pending moderation, kept separate from core assets
```

## Dependencies

- **Client:** three.js (vendored locally, no CDN — matches repo convention and sidesteps this sandbox's CDN restriction; irrelevant for real end users either way).
- **Server:** Node.js + TypeScript, `ws` (or `uWebSockets.js`), a Postgres client (`pg` or an ORM once schema exists).
- **Infra (later, not PoC-stage):** Redis for spectator fan-out, Stripe Connect (or equivalent) for payouts.
- Deliberately not adopting: Unity, Unreal, Godot (ruled out in memory.md), any heavy client framework (React/Vue) — HUD/UI needs are modest enough to stay plain DOM+CSS per the `swarms`/`bones` pattern.

## Open questions

- Combat resolution *shape* is decided (deterministic, timing/position-driven — see above); exact numbers (facing-arc geometry, skill-multiplier curve, stamina costs, PvE baselines) still need a playtest pass.
- Divine-intervention event catalog not designed.
- Sponsor drop moderation workflow (who approves, what's the SLA) not designed.
- Payout rail specifics (which processor, international coverage, minimum payout thresholds) not researched.
- Tick rate (0.1s) is decided as a target but not load-tested yet — needs validation once the server skeleton exists, at 10k concurrent, before treating it as final.
