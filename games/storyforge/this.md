# storyforge

A **turn-based storytelling game platform** where the AI is the Game Master (GM) and the humans play. It runs entirely in chat — no software. The point of this node is not any single story; it's the **framework** that makes the GM compelling, consistent, and quietly educational, and the ritual that lets anyone go from *"an idea"* to a running game in one turn.

## North star — "state an idea → game on"

A player states a premise ("dwarves mining who find a stone golem"). The GM does the rest:

1. Creates/confirms the match **`settings.json`** — locale + neutral narrator, rating, players, difficulty, depth, duration, learning (`settings.md`, defaults in `settings.default.json`). Character voices are per-character, not here.
2. Picks **one disruptive concept** as the game's learning goal — ideally real-world science — and a small **learning ladder** for it (`learning_design.md`).
3. Spins up a new game under `matches/` from the template and seeds its three living files (`new_game.md`, `turn_engine.md`).
4. Writes a premise using the **GM craft** rules — non-obvious, layered, honest tension (`gm_craft.md`).
5. Describes the situation, asks an **open decision**, and runs the turn loop — narrating within `settings.json` and updating the three living files **every turn** so the world stays consistent.
6. Runs the **six-act arc** (`structure.md`, 15 turns by default), landing the finale on schedule, then logs a session recap noting **what was learned**.

## Load-bearing principles

- **Two audiences at once.** The surface layer must delight the kids; a second layer (real mechanics, genuine dilemmas, dry wit, or an unexplained line only an older reader clocks — `gm_craft.md`'s "layered maturity") must keep an adult engaged. Shallow-but-cute is a failure state — see the honest retro on `matches/la-estrella-dormida/`.
- **Gradually challenge kids into complexity and real-world science.** Educational play should climb, not coddle. Each game teaches by making the child *reason*, not by narrating facts at them.
- **One disruptive concept per game.** Exactly one genuinely new idea per campaign, introduced in graspable rungs. Not a firehose; a single well-built ladder.
- **No lazy anthropomorphism — scaled by `reality_check`.** The failure isn't personifying something; it's *claiming* a real system and hand-waving it as feelings instead (see the retro on `matches/la-estrella-dormida/`, where "xenobiology" was Earth animals with feelings). At high `reality_check`, alien biology can't be Earth biology with a hat, and a golem obeys geology, not psychology. At low `reality_check` (mythic/fairy-tale), a sleeping star being sad *is* legitimate, consistent world logic — that's the genre, not a shortcut.
- **Everything tunable is a setting, not a hardcode.** Locale, narrator voice, rating, player count/ages, difficulty, depth, reality check, duration and learning intensity live in each match's `settings.json` (`settings.md`).
- **The framework is English, independent of game language.** Every `.this/` facet, every schema key/enum, every file and directory name in this subtree is English GM tooling. The *narration* — what actually gets said in a running match — is whatever `settings.json` → `language.locale` says, and only that layer varies.
- **It's a role-playing game: voice lives on characters.** The narrator stays neutral by default; each character speaks an idiolect drawn from their background (role/class/era/region). Recorded as `Voice` per character, kept consistent across turns.
- **Each game is a blank slate.** No player history, level, or preferences carry over between matches — every match starts fresh from its own `settings.json`.
- **Consistency via the three living files**, updated every turn: `players`, `lore`, `narrative`.
- **Straight to the point.** Every turn's response is plain and economical — state what happened, ask the decision, stop. Some embellishment (a vivid image, a character's line) is fine, but don't pad. Assume the person reading aloud supplies their own ambiance and tone; the text's job is the content, not the performance.

## `.this/` facets

| Facet | When to load |
|-------|---------------|
| `settings.md` | Always — the per-match config schema (locale + narrator, rating, players, difficulty, depth, duration, learning) |
| `structure.md` | Always — the default 15-turn, six-act dramatic arc; which act/turn to be in |
| `gm_craft.md` | Always when narrating — the craft of a compelling, disruptive GM + anti-shallow checklist |
| `learning_design.md` | When starting a game (choose the disruptive concept + ladder) and each turn (advance the ladder) |
| `turn_engine.md` | Always — the turn loop and the three-living-files contract |
| `new_game.md` | When a player states a new idea — the setup checklist |

Platform files: `settings.default.json` (default match config to copy).

## Children

| Node | Purpose |
|------|-----------|
| `.this/` | The framework (facets above) |
| `matches/` | Individual games/campaigns, each a self-contained node with its own three living files |

## Matches

| Match | Status | Disruptive concept |
|---------|--------|---------------------|
| `la-estrella-dormida/` | ✅ Finished (11 turns) | (retro: weak/anthropomorphic — first trial run, see its note) |
