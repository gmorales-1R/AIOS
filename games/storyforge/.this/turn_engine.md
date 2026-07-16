# turn_engine — the turn loop & the three living files

How a game runs, mechanically. Generalized from `la-estrella-dormida`.

## The turn loop

Each turn:
0. **Read `settings.json`** (match config): language + register, rating, players, difficulty, duration, learning. Everything below obeys it.
1. **Reload state.** Read the active game's `narrativa.md` (situación actual + open threads + ladder rung), `jugadores.md` (crew/players state), `lore.md` (established facts + the disruptive concept). Nothing you narrate may contradict these.
2. **Narrate one short beat** in the configured language/register and within the configured `rating`. Run the `gm_craft.md` anti-shallow checklist (calibrated to `difficulty`). Advance the pacing/ladder when the beat calls for it, aiming the arc at `duration.ideal_turns`.
3. **Ask an open decision** when pertinent — a question that makes the players *reason*, not just pick from a menu. Offer 2–4 example moves plus an always-open free option (phrased in the configured language). Address the right character by role when useful.
4. **Update the three living files** to reflect what happened and leave a clean state for next turn.
5. **Commit & push** (progress survives the ephemeral container). One commit per turn: `"<partida> · turno N: <resumen corto>"`.

## Config vs. state (per partida)

- **`settings.json`** — match config (language/register, rating, players, difficulty, duration, learning). Set at game start; changes rarely. Read every turn, but not part of the story state.
- **The three living files** below — the story *state*, rewritten every turn.

## The three living files (per partida)

### `jugadores.md` — crew & players
- Who's who: each character (role/lens) + which real player is driving them, if known.
- Per character: ánimo, objetos, ubicación, last action.
- **Player level note** (for `learning_design.md` scaling): how much scaffolding this table of players needs.
- Common: current location, turn number, active mission.

### `lore.md` — the world & the concept
- The world, places, non-player characters, rules of the universe.
- **Concepto disruptivo** section: the real mechanism, its kid-facing framing, the vocabulary being introduced, and the learning ladder (rungs).
- Established facts — anything the fiction has committed to. Append as discovered; never silently contradict.

### `narrativa.md` — the story & the state
- **Situación actual:** turn, where we are, what just happened, decisión pendiente.
- **Escalera de aprendizaje:** which rung is active; what's been delivered so far.
- **Hilos abiertos (open threads):** tracked consequences and setups that should pay off or bite later. This is what makes choices matter — revisit them.
- **Bitácora:** one row per turn (qué pasó | decisión de los jugadores).

## Starting a game
Follow `new_game.md`. In short: create `partidas/<slug>/` with `settings.json` (copied from `storyforge/settings.default.json` and overridden) + `this.md` + `.this/{jugadores,lore,narrativa}.md` + `sessions/`, seed them from the templates below, then narrate the premise and the first open decision.

## Resuming a game
Read the active partida's `narrativa.md` → *situación actual* and continue from the pending decision. The three files are the save state; trust them over memory.

## Ending a game
When the arc lands, mark the partida ✅ in its files and this node's `this.md`, and write a recap to `partidas/<slug>/sessions/<date>_<slug>.md` including a short **"qué aprendimos"** (which concept, which rungs the kids actually climbed). Update `storyforge/this.md`'s Partidas table.

## File templates (copy for a new partida)

**settings.json** — copy `storyforge/settings.default.json` and override (see `settings.md` for the schema). At minimum set `title`, `language`, `players`, and `theme`.


**jugadores.md**
```
# jugadores — <partida>
## Común
- Dónde: … | Turno: 0 | Misión: …
- Nivel de los jugadores (scaffolding): …
## <Personaje> (<rol/lente>)  ·  jugador: <nombre si se sabe>
- Ánimo: … | Objetos: … | Notas: …
```

**lore.md**
```
# lore — <partida>
## Mundo / lugares / personajes
…
## Concepto disruptivo (meta de aprendizaje)
- Concepto: … (mecanismo real)
- Framing para peques: …
- Vocabulario a introducir: …
- Escalera: rung1 … / rung2 … / rung3 …
## Hechos establecidos
- …
```

**narrativa.md**
```
# narrativa — <partida>
## Situación actual
- Turno: 0 | Dónde: … | Qué pasó: … | Decisión pendiente: …
## Escalera de aprendizaje
- Rung activo: 1 | Entregado: —
## Hilos abiertos
- …
## Bitácora
| Turno | Qué pasó | Decisión |
| 0 | premisa planteada | (pendiente) |
```
