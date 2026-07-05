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
- Tick rate is a tuning knob, not a design decision yet — needs to trade off responsiveness vs. server load at 10k concurrent. Open question, see below.
- This loop is the literal implementation of pillar 1 (determinism for everything non-social): given the same intents in the same order, the outcome is 100% reproducible — good for both fairness disputes and for letting players actually calculate odds.

### Combat resolution
- Must be skill-predominant per the design/legal decision already made — avoid a `swarms`-style `accFactor = 1 + uniform(-acc, +acc)` dice roll as the primary damage determinant. Lean on position, timing, and equipment as the deciding factors instead of a random multiplier. Not yet designed in detail — flagged as the next open mechanics thread.

### Alliance / clan system
- Formation, membership, and a declared-rivalry flag are the only channel through which PvP is legal (per the PvE-base + clan-gated-PvP core loop).
- Private alliance comms exist but are leaky by design (memory.md: a defector can sell/reveal them to a rival) — this is a data-visibility rule enforced server-side (who can read which comm channel), not a client feature.

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

- Tick rate not chosen — needs a real load-test once the server skeleton exists, not a guess.
- Combat resolution formulas not designed — this is the next concrete mechanics thread.
- Divine-intervention event catalog not designed.
- Sponsor drop moderation workflow (who approves, what's the SLA) not designed.
- Payout rail specifics (which processor, international coverage, minimum payout thresholds) not researched.
