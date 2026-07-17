# new_game — from "an idea" to "game on"

The checklist the GM runs the moment a player states a premise. Goal: be playing within one turn, with the framework already loaded underneath.

## Steps

1. **Take the idea as-is.** Whatever the player says ("dwarves mining who find a stone golem") is the fiction. Don't negotiate the wrapper.
   Then set up **`settings.json`** (copy `storyforge/settings.default.json`, override per `settings.md`): confirm `locale`, keep the **narrator neutral** (style it only if asked), then rating, player count/ages, difficulty, ideal duration, learning intensity. Character voices are *not* set here — they're derived per character from background (step 7 / the `Voz` fields). If the player didn't specify, keep defaults and mention what you assumed; don't stall the game to interrogate them.
2. **Find the real system hiding inside it** and pick **one disruptive concept** (`learning_design.md`). For the golem: geomechanics of a mine. Prefer real science; make it emerge from the setting.
3. **Build the ~3-rung ladder** (intuitive → contradiction → real-concept-applied) and **map it onto the six-act arc** (`structure.md`): rung 1 in Acts I–II, rung 2 across Act III, rung 3 at the Act V finale. Write down the per-act turn budget (scaled to `ideal_turns`).
4. **Plant the premise you'll overturn.** Decide the Act IV **vuelco** (the reveal/betrayal/twist) and the belief you'll set up in Act II so there's something real to break. (Anti-shallow: the answer must not be visible from turn 1.)
5. **Read the players' level** from context / a returning `jugadores.md` / `storyforge/.this/memory.md` (recurring players across partidas), and set scaffolding accordingly. If a returning player already has a concept in `memory.md`, don't repeat it — pick a different one or aim rung 3 higher.
6. **Create the partida node:** `partidas/<slug>/settings.json` (from step 1), `this.md`, `.this/{jugadores,lore,narrativa}.md` (from the templates in `turn_engine.md`), `sessions/`. Seed `lore.md` with the concept + ladder; seed `narrativa.md` with rung 1 active.
7. **Cast the voices.** Give every character (crew + key NPCs) a distinct **`Voz`** derived from their background (role/class/era/region), drawing on the `locale` palette. Record it in `jugadores.md`/`lore.md`. This is what makes the RP sing — do it before the first line of dialogue.
8. **Add the partida** to `storyforge/this.md`'s Partidas table.
9. **Write the premise** with `gm_craft.md` rules: concrete situation, a second layer, no telegraphed answer. Present it, then ask the **first open decision** (a reasoning question, not a menu).
10. **Play.** Run the turn loop (`turn_engine.md`); update the three files and commit each turn.

## Quick sanity check before the first beat

- One concept, not three? ✅
- Six-act budget planned (`structure.md`), Act IV reveal chosen, its premise planted for Act II? ✅
- Is the answer non-obvious at turn 1? ✅
- Does the non-human thing obey real, impersonal rules (no lazy anthropomorphism)? ✅
- Is there a layer for the adult and a rung for the kid? ✅
- `settings.json` created, narrator neutral, each character given a distinct **`Voz`** by background, open decisions? ✅

## Reusing a cast

A returning troupe (e.g. the *Estrella Errante* crew: Clara/Guille/Maida/José) can headline a new space game — copy their character blocks into the new partida's `jugadores.md`. A different setting (dwarves, deep sea) usually wants a fresh cast; that's fine. Recurring players (the real kids) carry their level notes forward via `storyforge/.this/memory.md`.
