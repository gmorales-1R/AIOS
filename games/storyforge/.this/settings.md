# settings — per-match configuration

Every game (match) is configured by a **`settings.json`** at its root. It is the single source of truth for language, rating, players, difficulty, depth, duration, and learning intensity. The GM **reads it first, every turn**, and narrates within it. Nothing in the framework should hardcode these — they used to be baked in ("Chilean Spanish, PG"); now they're config. The framework itself (this doc, every `.this/` facet, every schema key and enum value) is always in **English**, independent of what `language.locale` the match is narrated in.

Defaults live in `storyforge/settings.default.json`; a new match copies and overrides.

## Schema

```jsonc
{
  "title": "string",                 // display name of the match
  "language": {
    "locale": "en-US",               // BCP-47-ish: en-US, es-CL, es-419, ...
    "narrator": "neutral",           // narrator VOICE only — neutral by default; style it only if the player asks
    "notes": "free text: locale palette — what accents/sociolects exist here, what to lean into / avoid"
  },
  "rating": "PG",                    // G | PG | PG-13 (see safety below)
  "players": {
    "count": 2,
    "ages": [6, 9],                  // used to scale complexity
    "names": [],                     // optional real names
    "level": "beginner"              // beginner | intermediate | advanced (scaffolding)
  },
  "difficulty": "gentle",            // gentle | moderate | challenging — how hard puzzles/hypotheses push back
  "depth": "layered",                // light | layered | existential — how twisted, real, and existential the plot gets
  "duration": {
    "ideal_turns": 15,               // target arc length; land the story near this
    "target_time": "one sitting (~30-45 min)",
    "pacing": "normal"               // relaxed | normal | brisk
  },
  "learning": {
    "enabled": true,
    "intensity": "medium",           // low | medium | high — how hard to push the concept
    "concept": null                  // set at game start; full mechanics live in lore.md
  },
  "theme": null                      // the player's stated idea/setting, if any
}
```

## Language: narrator neutral, characters dynamic

This is a role-playing game, so **voice lives on the characters, not on the match.** There is no single global "register." Two layers:

**1. Narrator voice — `language.narrator` (default `neutral`).**
The narrator (scene description, prompts to the players, the GM's own asides) speaks in **clear, neutral** language for the `locale`. It does *not* adopt a class/regional accent. Style it only when the player explicitly asks ("narrate like a bard", "noir hard-boiled narrator"); otherwise keep it clean and legible so the *characters* carry the color. The framework's first game's mistake was a narrator that leaned into the locale's own street slang — that's exactly what neutral prevents.

**2. Character voice — dynamic, per character (NOT a setting).**
Every character (crew and NPCs) speaks in an idiolect derived from their **background**: role, social class, era, region, education, temperament. `locale` sets the *palette* to draw from. Distinct, consistent voices are a core craft goal — see "Voice by background" in `gm_craft.md`. Each character's voice is recorded as a **`Voice`** field in `players.md` (crew) / `lore.md` (NPCs) and kept consistent across turns.

Example — `locale: "en-UK"`:
- A coal shoveler → broad Cockney: dropped h's and g's, "guv", glottal stops, rhyming slang.
- A top-hat gentleman → pompous Received Pronunciation: latinate vocabulary, subordinate clauses, faint disdain.
- The **narrator between them** → neutral standard English, so both voices pop.

**`language.notes`** captures locale palette guidance: which accents/sociolects populate this world, and anything to lean into or avoid.

**Rating still applies to every voice.** Accent and class color are fine; slurs, cruelty, and content above `rating` are not — a "rough" character is rough in cadence and attitude, not in obscenity (unless a mature `rating` + explicit ask allow it).

## Difficulty — what it turns up

| difficulty | Puzzles | Hypothesis refutation | Weight of consequences |
|------------|---------|------------------------|--------------------------|
| `gentle` | clear clues, one step | soft, guided | light, reversible |
| `moderate` | 2-3 steps, some traps | the world genuinely corrects you | real but manageable |
| `challenging` | real inference, little help | hypotheses can fail hard (never cruelly) | forks with lasting cost |

Difficulty is orthogonal to `rating`: a `challenging` game can still be `G`. Danger always resolves kindly (see `gm_craft.md`); difficulty is about *thinking*, not *threat*.

## Depth — how twisted, real, and existential the plot gets

A second, independent axis from `difficulty`. Difficulty is about how hard the *puzzles* push back; depth is about how far the *plot and themes* reach — orthogonal to `rating` too (depth can go existential while staying strictly within the content limits `rating` sets).

| depth | Twist (Act IV) | Accuracy | Existential reach |
|-------|-----------------|----------|---------------------|
| `light` | a clean surprise; low stakes to the world | mechanics simplified, still true in spirit | none — comfort and fun stand on their own |
| `layered` (default) | recontextualizes Acts I-III for real; someone's motive or a "safe" fact was wrong | mechanics real and specific, not hand-waved | one honest question surfaces (loss, fear, fairness, change) and is sat with, not resolved away instantly |
| `existential` | the twist reframes what the whole premise *meant*, not just what happened | mechanics rigorous — the real system, taught precisely | the story looks directly at a big question (mortality, identity, what's owed to others, the cost of a choice) and lets the party feel its weight before resolving kindly |

Depth never licenses cruelty or content above `rating` — an `existential` `G`-rated game earns its weight through honesty and stakes, not through darkness for its own sake. It compounds with `gm_craft.md`'s anti-shallow checklist: `light` still runs the checklist (no telegraphed answers), `existential` just asks more of it.

## Rating / safety

| rating | What it allows |
|--------|------------------|
| `G` | no real danger; everything gentle |
| `PG` (default) | cartoon-level danger, mild scares that resolve with care; nothing dark, sexual, or violent |
| `PG-13` | bigger tension and stakes, still no gore/sexual explicitness |

`language.notes` and any extra content limits live here too. When in doubt, go safer.

## Duration

Default `ideal_turns` is **15**, shaped by the six-act structure in `structure.md` (`[2,3,5,3,1,1]`). Land the arc near `ideal_turns`; if `ideal_turns` differs from 15, scale the acts per `structure.md` (keep the shape, Acts V/VI stay 1 turn). If players want to keep going past a natural ending, treat it as a **new arc** (new concept, new ladder) rather than padding. `pacing` tunes how much happens per beat.

## How the framework uses settings

- `turn_engine.md`: read `settings.json` at the top of every turn; narrate with a `narrator`-neutral voice, voice each character per their `Voice`, keep beats within `duration.pacing`, aim the arc at `ideal_turns`.
- `gm_craft.md`: give each character a distinct voice by background; calibrate refutation harshness and consequence weight to `difficulty`; calibrate twist magnitude and thematic reach to `depth`.
- `learning_design.md`: scale the ladder to `players.ages`/`level` and `learning.intensity`; skip the concept if `learning.enabled` is false (pure-fun mode).
- `new_game.md`: create/confirm `settings.json` as step 1.
