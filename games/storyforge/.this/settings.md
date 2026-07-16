# settings — per-match configuration

Every game (`partida`) is configured by a **`settings.json`** at its root. It is the single source of truth for language, rating, players, difficulty, duration, and learning intensity. The GM **reads it first, every turn**, and narrates within it. Nothing in the framework should hardcode these — they used to be baked in ("Chilean Spanish, PG"); now they're config.

Defaults live in `storyforge/settings.default.json`; a new match copies and overrides.

## Schema

```jsonc
{
  "title": "string",                 // display name of the match
  "language": {
    "locale": "es-CL",               // BCP-47-ish: es-CL, es-419, en-US, ...
    "register": "culto",             // see register scale below
    "formality": "tú/ustedes",       // address form; no "vosotros" for es-CL
    "slang_level": "bajo",           // none | bajo | medio | alto
    "notes": "free text: what to lean into / avoid"
  },
  "rating": "PG",                    // G | PG | PG-13 (see safety below)
  "players": {
    "count": 2,
    "ages": [6, 9],                  // used to scale complexity
    "names": [],                     // optional real names
    "level": "principiante"          // principiante | intermedio | avanzado (scaffolding)
  },
  "difficulty": "suave",             // suave | media | desafiante
  "duration": {
    "ideal_turns": 12,               // target arc length; land the story near this
    "target_time": "una sentada (~20–30 min)",
    "pacing": "normal"               // relajado | normal | ágil
  },
  "learning": {
    "enabled": true,
    "intensity": "media",            // baja | media | alta — how hard to push the concept
    "concept": null                  // set at game start; full mechanics live in lore.md
  },
  "theme": null                      // the player's stated idea/setting, if any
}
```

## Language register scale (the "flaite → culto" axis)

`register` controls socioeconomic/education tone independently of locale. For `es-CL`:

| register | Qué suena | Ejemplo de tono |
|----------|-----------|-----------------|
| `flaite` | jerga marginal, coa, "po" cerrado | ❌ evitar por defecto (fue el error de la 1ª partida) |
| `coloquial` | chileno relajado, chilenismos frecuentes | "ya po, al tiro, bacán" a cada rato |
| `culto` (**default es-CL**) | **chileno educado, clase media-alta, gramática cuidada** | cálido y natural, chilenismos transversales y suaves (harto, al tiro) con moderación; sin "po", sin garabatos, sin coa |
| `neutro` | español neutro internacional | sin marcas regionales |

**Regla de oro del registro:** el marcador regional se logra con léxico y musicalidad **cultos** de Chile, no con jerga. Si dudas entre un chilenismo y una palabra neutra, elige la que diría una familia educada chilena en la mesa. "Flaite" solo si el `register` lo pide explícitamente.

## Difficulty — what it turns up

| difficulty | Puzzles | Refutación de hipótesis | Peso de las consecuencias |
|------------|---------|--------------------------|----------------------------|
| `suave` | pistas claras, un paso | suave, guiada | leves, reversibles |
| `media` | 2–3 pasos, alguna trampa | el mundo corrige de verdad | reales pero manejables |
| `desafiante` | inferencia real, poca ayuda | hipótesis pueden fallar duro (sin castigo cruel) | forks con costo persistente |

Difficulty is orthogonal to `rating`: a `desafiante` game can still be `G`. Danger always resolves kindly (see `gm_craft.md`); difficulty is about *thinking*, not *threat*.

## Rating / safety

| rating | Qué permite |
|--------|-------------|
| `G` | sin peligro real; todo tierno |
| `PG` (default) | peligro de dibujos animados, sustos leves que se resuelven con cariño; nada oscuro, sexual ni violento |
| `PG-13` | tensión y stakes mayores, aún sin gore/sexual explícito |

`language.notes` and any extra content limits live here too. When in doubt, go safer.

## Duration

Land the arc near `duration.ideal_turns`. If players want to keep going past a natural ending, treat it as a new arc (new concept, new ladder) rather than padding. `pacing` tunes how much happens per beat.

## How the framework uses settings

- `turn_engine.md`: read `settings.json` at the top of every turn; narrate in `language`, keep beats within `duration.pacing`, aim the arc at `ideal_turns`.
- `gm_craft.md`: calibrate refutation harshness and consequence weight to `difficulty`.
- `learning_design.md`: scale the ladder to `players.ages`/`level` and `learning.intensity`; skip the concept if `learning.enabled` is false (pure-fun mode).
- `new_game.md`: create/confirm `settings.json` as step 1.
