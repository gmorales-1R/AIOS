# learning_design — the educational spine

The principle (load-bearing, from the project owner): **interactions with kids, especially educational ones, should gradually challenge them into complexity and real-world science.** Play should climb, not coddle.

## The rule: one disruptive concept per game

Each game (match) has **exactly one** disruptive concept — a single genuinely-new idea that is the game's learning goal and the source of its non-obvious problems. Not a curriculum dump; one idea, well built.

"Disruptive" means it should **break an intuitive assumption** the child (or the crew) starts with. The stone golem isn't a monster with feelings — it's a lesson in how rock, pressure, gas, and ore actually behave. The disruption *is* the education.

### Choosing the concept (at game start)

Given the player's idea, pick one concept that:
- is **real** where possible (physics, geology, biology, chemistry, math, engineering, ecology) — fiction is the wrapper, the mechanism is real; how literally "real" is set by `reality_check` (`settings.md`) — low end, teach it through a consistent fantasy metaphor; high end, teach the literal mechanism, precisely;
- **fits the setting** so it emerges naturally from the fiction, not bolted on;
- is **age-appropriate but slightly above** the child's current intuition — the productive stretch;
- can be **discovered by reasoning**, not just told.

Record it in the game's `lore.md` (a "Disruptive concept" section) — its real mechanics, kid-facing framing, and the vocabulary you'll seed.

## The learning ladder

Break the concept into **~3 rungs**, intuitive → real, mapped onto the six-act arc (`structure.md`):

1. **Rung 1 — Intuition & the wrong model** (Acts I–II). The child meets the phenomenon through a familiar (often anthropomorphic) lens. Let that model form; it's the thing we'll upgrade.
2. **Rung 2 — The world contradicts the model** (Act III). The Act III setback proves the intuitive model fails; the build-up then teaches the real mechanics + real vocabulary, one at a time. The "training montage" *is* rung 2.
3. **Rung 3 — The real concept, applied** (Act V). The child uses the actual mechanism to win the final battle. They leave with a working (if simple) mental model.

The **Act IV reveal** is usually the concept's true mechanism clicking into place — the plot twist and the "aha" are the same beat.

Track ladder progress in `narrative.md` (a "Learning ladder" line: which rung is active, what's been delivered).

## The anti-anthropomorphism rule (scoped to what the concept claims to be)

Our first game's actual failure wasn't that its creatures had feelings — it's that they were pitched as **xenobiology** (a claim of real, alien science) and then resolved as Earth animals with feelings and nothing behind it. That's a broken promise, not a ban on personification. Whether personification is a cop-out or the correct genre logic depends on `reality_check` (`settings.md`):

- **At low `reality_check` (mythic/fairy-tale, 1-2):** a sleeping star being sad, a tree that whispers — that's the world's real, internally-consistent logic, not laziness. Animism can *be* the concept, as long as it stays consistent (the star is sad for a stated, stable reason, not sad differently every scene).
- **At mid-to-high `reality_check`:** once a concept is framed as a real system (biology, geology, physics), it must run on that system's actual rules, not on human feelings standing in for them. A golem = geomechanics. An alien ecosystem = its own chemistry/energy source. A cave = fluid dynamics + structural load. Ask "what does this *actually* run on?" before giving it a personality.
- **The tell, at any level:** did you reach for "it's sad/scared/lonely" *instead of* building the mechanism you promised, or *as* the mechanism you always intended? The first is the failure mode; the second is just world-building appropriate to the match's `reality_check`.
- **Personality is always allowed as a hook**, even in a hard-science match — a friendly narrator-creature can ease kids in — as long as the mystery's actual mechanism, once revealed, matches the rigor `reality_check` promises.

## Scaling to the child

Read `settings.json` → `players.ages`/`level` and `learning.intensity` (and the players' answers). Younger/newer → more concrete, one word at a time, more scaffolding. Older/returning → thinner scaffolding, more inference, a harder rung 3. Never below their level (boring) or so far above that reasoning stalls (frustrating). Aim just above. If `learning.enabled` is false, run pure-fun mode: keep the craft, drop the ladder.

`learning.intensity` and `depth` (`settings.md`) are independent dials: intensity is how much the *concept* drives the plot; depth is how far the *plot and themes* reach. A `high`-intensity, `light`-depth game teaches hard but stays a clean adventure; a `low`-intensity, `existential`-depth game barely leans on the concept but sits with a real question. Most games want both turned up together.

## Starter library (concept ↔ setting)

Seed ideas — pick or adapt one when a game starts. Always prefer the player's own idea and fit a concept to it.

| Setting idea | Disruptive concept (learning goal) | Kid-facing hook | Real mechanics to teach |
|---|---|---|---|
| Dwarves mining, find a stone golem | **Geomechanics of a mine** | The "golem" isn't alive the way we are | Structural integrity & load, ore grade/concentration, gas hazards (firedamp/CO₂/O₂), ventilation, water table |
| Deep-sea / ice-moon expedition | **Pressure & chemosynthesis** | Life that never sees the sun | Pressure vs depth, buoyancy, life running on chemicals not light |
| Desert caravan chasing water | **The water cycle & scarcity** | Where does water hide in a desert | Evaporation/condensation, aquifers, heat & shade, salt |
| Sky city / balloon | **Buoyancy, gases & density** | Why things float | Hot vs cold air, gas density, lift vs weight, pressure with altitude |
| Broken clockwork town | **Simple machines & feedback** | Why did everything stop | Gears/ratios, levers, energy transfer, cause→effect chains |
| Beekeeper's garden in trouble | **Ecosystems & pollination** | A garden is a team, not solo plants | Interdependence, food webs, cause and downstream effect |
| Star-charting a comet | **Orbits & gravity** | Why the comet keeps coming back | Gravity, orbits/periodicity, prediction from patterns |

The concept is the spine; the fiction is negotiable. If the child's idea doesn't obviously carry a concept, find the real system hiding inside it and build the ladder there.
