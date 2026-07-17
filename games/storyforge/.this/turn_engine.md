# turn_engine — the turn loop & the three living files

How a game runs, mechanically. Generalized from `la-estrella-dormida`.

## The turn loop

Each turn:
0. **Read `settings.json`** (match config): locale + narrator voice, rating, players, difficulty, depth, duration, learning. Everything below obeys it.
1. **Reload state.** Read the active game's `narrative.md` (current situation + open threads + ladder rung), `players.md` (crew/players state), `lore.md` (established facts + the disruptive concept). Nothing you narrate may contradict these.
2. **Locate yourself in the arc.** Check `narrative.md` for the current **act/turn** (`structure.md`). Do *this act's job*; if the act is about to end, hit its turning point now (don't let the middle sag or the reveal rush).
3. **Narrate one short beat** with a **neutral narrator** (`language.narrator`) in the `locale`, voicing each character in their own **`Voice`** (dynamic, by background — see `gm_craft.md`), all within the configured `rating`. Run the anti-shallow checklist (calibrated to `difficulty` and `depth`). Advance the ladder/act when the beat calls for it.
4. **Ask an open decision** when pertinent — a question that makes the players *reason*, not just pick from a menu. Offer 2–4 example moves plus an always-open free option (phrased in the configured language). Address the right character by role when useful.
5. **Update the three living files** to reflect what happened (incl. the current act/turn) and leave a clean state for next turn.
6. **Commit & push** (progress survives the ephemeral container). One commit per turn: `"<match> · turn N: <short summary>"`.

## Config vs. state (per match)

- **`settings.json`** — match config (locale + narrator, rating, players, difficulty, depth, duration, learning). Set at game start; changes rarely. Read every turn, but not part of the story state.
- **The three living files** below — the story *state*, rewritten every turn.

## The three living files (per match)

### `players.md` — crew & players
- Who's who: each character (role/lens) + which real player is driving them, if known.
- Per character: **Voice** (idiolect by background — role/class/era/region/temperament), mood, items, location, last action.
- **Player level note** (for `learning_design.md` scaling): how much scaffolding this table of players needs.
- Common: current location, turn number, active mission.

### `lore.md` — the world & the concept
- The world, places, non-player characters (each NPC with a **Voice** — idiolect by background), rules of the universe.
- **Disruptive concept** section: the real mechanism, its kid-facing framing, the vocabulary being introduced, and the learning ladder (rungs).
- Established facts — anything the fiction has committed to. Append as discovered; never silently contradict.

### `narrative.md` — the story & the state
- **Current situation:** **act/turn** (e.g. "Act III · turn 7/15"), where we are, what just happened, pending decision.
- **Act plan:** the per-act turn budget for this match (from `structure.md`, scaled to `ideal_turns`).
- **Learning ladder:** which rung is active; what's been delivered so far.
- **Open threads:** tracked consequences and setups that should pay off or bite later. This is what makes choices matter — revisit them.
- **Log:** one row per turn (what happened | the players' decision).

## Starting a game
Follow `new_game.md`. In short: create `matches/<slug>/` with `settings.json` (copied from `storyforge/settings.default.json` and overridden) + `this.md` + `.this/{players,lore,narrative}.md` + `sessions/`, seed them from the templates below, then narrate the premise and the first open decision.

## Resuming a game
Read the active match's `narrative.md` → *current situation* and continue from the pending decision. The three files are the save state; trust them over memory.

## Ending a game
When the arc lands, mark the match ✅ in its files and this node's `this.md`, and write a recap to `matches/<slug>/sessions/<date>_<slug>.md` including a short **"what we learned"** (which concept, which rungs the kids actually climbed). Update `storyforge/this.md`'s Matches table.

## File templates (copy for a new match)

**settings.json** — copy `storyforge/settings.default.json` and override (see `settings.md` for the schema). At minimum set `title`, `language`, `players`, and `theme`.


**players.md**
```
# players — <match>
## Common
- Where: … | Turn: 0 | Mission: …
- Player level (scaffolding): …
## <Character> (<role/lens>)  ·  player: <name if known>
- Voice: <idiolect by background: role/class/era/region/temperament>
- Mood: … | Items: … | Notes: …
```

**lore.md**
```
# lore — <match>
## World / places / characters
- <NPC> — Voice: <idiolect by background> | …
…
## Disruptive concept (learning goal)
- Concept: … (real mechanism)
- Kid-facing framing: …
- Vocabulary to introduce: …
- Ladder: rung1 … / rung2 … / rung3 …
## Established facts
- …
```

**narrative.md**
```
# narrative — <match>
## Current situation
- Act: I | Turn: 0/15 | Where: … | What happened: … | Pending decision: …
## Act plan (structure.md, ideal_turns=15)
- I Known world: t1-2 | II Inciting break: t3-5 | III Trial and learning: t6-10 | IV The turn: t11-13 | V Final battle: t14 | VI The way home: t15
## Learning ladder
- Active rung: 1 | Delivered: —
## Open threads
- …
## Log
| Turn | What happened | Decision |
| 0 | premise set | (pending) |
```
