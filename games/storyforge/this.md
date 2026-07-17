# storyforge

A **turn-based storytelling game platform** where the AI is the Game Master (GM) and the humans play. It runs entirely in chat — no software. The point of this node is not any single story; it's the **framework** that makes the GM compelling, consistent, and quietly educational, and the ritual that lets anyone go from *"an idea"* to a running game in one turn.

## North star — "state an idea → game on"

A player states a premise ("dwarves mining who find a stone golem"). The GM does the rest:

1. Creates/confirms the match **`settings.json`** — locale + neutral narrator, rating, players, difficulty, duration, learning (`settings.md`, defaults in `settings.default.json`). Character voices are per-character, not here.
2. Picks **one disruptive concept** as the game's learning goal — ideally real-world science — and a small **learning ladder** for it (`learning_design.md`).
3. Spins up a new game under `partidas/` from the template and seeds its three living files (`new_game.md`, `turn_engine.md`).
4. Writes a premise using the **GM craft** rules — non-obvious, layered, honest tension (`gm_craft.md`).
5. Describes the situation, asks an **open decision**, and runs the turn loop — narrating within `settings.json` and updating the three living files **every turn** so the world stays consistent.
6. Lands the arc (near `duration.ideal_turns`) and logs a session recap noting **what was learned**.

## Load-bearing principles

- **Two audiences at once.** The surface layer must delight the kids; a second layer (real mechanics, genuine dilemmas, dry wit) must keep an adult engaged. Shallow-but-cute is a failure state — see the honest retro on `partidas/la-estrella-dormida/`.
- **Gradually challenge kids into complexity and real-world science.** Educational play should climb, not coddle. Each game teaches by making the child *reason*, not by narrating facts at them.
- **One disruptive concept per game.** Exactly one genuinely new idea per campaign, introduced in graspable rungs. Not a firehose; a single well-built ladder.
- **No lazy anthropomorphism.** The strange thing must actually be strange. Alien biology is not Earth biology with a hat; a golem obeys geology, not psychology. Default taxonomies are banned unless subverting them *is* the concept.
- **Everything tunable is a setting, not a hardcode.** Locale, narrator voice, rating, player count/ages, difficulty, duration and learning intensity live in each match's `settings.json` (`settings.md`). Framework docs are in English — they're GM tooling; the *narration* language is whatever `settings.json` says.
- **It's a role-playing game: voice lives on characters.** The narrator stays neutral by default; each character speaks an idiolect drawn from their background (role/class/era/region). Recorded as `Voz` per character, kept consistent across turns.
- **Consistency via the three living files**, updated every turn: `jugadores`, `lore`, `narrativa`.

## `.this/` facets

| Faceta | Cuándo cargar |
|--------|---------------|
| `settings.md` | Always — the per-match config schema (locale + narrator, rating, players, difficulty, duration, learning) |
| `gm_craft.md` | Always when narrating — the craft of a compelling, disruptive GM + anti-shallow checklist |
| `learning_design.md` | When starting a game (choose the disruptive concept + ladder) and each turn (advance the ladder) |
| `turn_engine.md` | Always — the turn loop and the three-living-files contract |
| `new_game.md` | When a player states a new idea — the setup checklist |

Platform files: `settings.default.json` (default match config to copy).

## Hijos

| Nodo | Propósito |
|------|-----------|
| `.this/` | The framework (facets above) |
| `partidas/` | Individual games/campaigns, each a self-contained node with its own three living files |

## Partidas

| Partida | Estado | Concepto disruptivo |
|---------|--------|---------------------|
| `la-estrella-dormida/` | ✅ Terminada (11 turnos) | (retro: débil/antropomórfico — primer ensayo, ver su nota) |
