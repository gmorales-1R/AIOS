# memory — recurring players across partidas

Each partida's `jugadores.md` dies with the game — it has no way to tell a new partida what a returning kid already knows. This file is the cross-partida continuity `new_game.md` and `turn_engine.md` assume but, until now, nothing wrote to.

## When to read

`new_game.md` step 5 (reading players' level): before falling back to defaults, check whether any stated/known player already has a row below. Use their `Nivel` and `Conceptos vistos` to set scaffolding and to avoid re-teaching a concept they've already climbed.

## When to write

`turn_engine.md` → "Ending a game": when a partida's arc lands, upsert a row per real player — bump `Nivel` if they outgrew it, append the concept just covered, fold in anything worth remembering as `Preferencias`.

## Table

| Jugador | Edad aprox | Nivel | Partidas jugadas | Conceptos vistos | Preferencias |
|---------|-----------|-------|-------------------|-------------------|--------------|
| _(ninguno registrado aún)_ | | | | | |

## Notes

- Keyed on the real player (a nickname is fine), not on the character they played — a kid who was Maida in one game may be someone else next time.
- `Conceptos vistos` is what makes `learning_design.md`'s "one disruptive concept per game" compound across a whole play history instead of resetting each time: don't repeat a concept a returning player already has; if revisiting the same domain, aim rung 3 higher than last time.
- If a player is anonymous/one-off (no name given), skip this file entirely — it's for continuity, not required bookkeeping.
