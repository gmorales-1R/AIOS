# settings — per-match configuration

Every game (`partida`) is configured by a **`settings.json`** at its root. It is the single source of truth for language, rating, players, difficulty, duration, and learning intensity. The GM **reads it first, every turn**, and narrates within it. Nothing in the framework should hardcode these — they used to be baked in ("Chilean Spanish, PG"); now they're config.

Defaults live in `storyforge/settings.default.json`; a new match copies and overrides.

## Schema

```jsonc
{
  "title": "string",                 // display name of the match
  "language": {
    "locale": "es-CL",               // BCP-47-ish: es-CL, es-419, en-US, ...
    "narrator": "neutral",           // narrator VOICE only — neutral by default; style it only if the player asks
    "notes": "free text: locale palette — what accents/sociolects exist here, what to lean into / avoid"
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

## Language: narrator neutral, characters dynamic

This is a role-playing game, so **voice lives on the characters, not on the match.** There is no single global "register." Two layers:

**1. Narrator voice — `language.narrator` (default `neutral`).**
The narrator (scene description, prompts to the players, the GM's own asides) speaks in **clear, neutral** language for the `locale`. It does *not* adopt a class/regional accent. Style it only when the player explicitly asks ("narra como un bardo", "noir hard-boiled narrator"); otherwise keep it clean and legible so the *characters* carry the color. The first game's mistake was a narrator that talked flaite — that's exactly what neutral prevents.

**2. Character voice — dynamic, per character (NOT a setting).**
Every character (crew and NPCs) speaks in an idiolect derived from their **background**: role, social class, era, region, education, temperament. `locale` sets the *palette* to draw from. Distinct, consistent voices are a core craft goal — see "Voice by background" in `gm_craft.md`. Each character's voice is recorded as a **`Voz`** field in `jugadores.md` (crew) / `lore.md` (NPCs) and kept consistent across turns.

Example — `locale: "en-UK"`:
- A coal shoveler → broad Cockney: dropped h's and g's, "guv", glottal stops, rhyming slang.
- A top-hat gentleman → pompous Received Pronunciation: latinate vocabulary, subordinate clauses, faint disdain.
- The **narrator between them** → neutral standard English, so both voices pop.

**`language.notes`** captures locale palette guidance: which accents/sociolects populate this world, and anything to lean into or avoid.

**Rating still applies to every voice.** Accent and class color are fine; slurs, cruelty, and content above `rating` are not — a "rough" character is rough in cadence and attitude, not in obscenity (unless a mature `rating` + explicit ask allow it).

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

- `turn_engine.md`: read `settings.json` at the top of every turn; narrate with a `narrator`-neutral voice, voice each character per their `Voz`, keep beats within `duration.pacing`, aim the arc at `ideal_turns`.
- `gm_craft.md`: give each character a distinct voice by background; calibrate refutation harshness and consequence weight to `difficulty`.
- `learning_design.md`: scale the ladder to `players.ages`/`level` and `learning.intensity`; skip the concept if `learning.enabled` is false (pure-fun mode).
- `new_game.md`: create/confirm `settings.json` as step 1.
