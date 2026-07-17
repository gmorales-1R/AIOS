# la-estrella-dormida

`storyforge`'s first match — the trial run that gave rise to the framework. A space adventure narrated in Chilean Spanish, PG, aboard *La Estrella Errante* with crew Clara / Guille / Maida / José. **Finished in 11 turns.** ✅

The general rules (GM craft, learning design, turn engine) now live in the parent node `storyforge/.this/`. This node holds only what's specific to this match. Note: the match's own state files (`lore.md`, `players.md`, `narrative.md`, `docs.md`, `sessions/`) are written in the match's narration language (Chilean Spanish) — only this framework-facing `this.md` is in English, per the repo-wide convention that structural docs are English while narrated game content is whatever the match's `language.locale` is.

## Summary

A mysterious signal from a mint-colored planet leads the crew to a Tree that's losing its light. The culprit — gray "fuzzies" — turn out to be sparks shed by a sleeping star that lost its pieces and went cold. Resolved with warmth, a song, and plenty of marshmallows. Full recap in `sessions/2026-07-16_la-estrella-dormida.md`.

## Honest retro (why the framework exists)

The adult found it **shallow, obvious, and boring**; the kids loved it. Failures, now codified as anti-patterns in `storyforge/.this/gm_craft.md`:

- **Weak/absent disruptive concept.** The "xenobiology" was really just Earth critters with feelings — anthropomorphism, not science. It taught no real system.
- **Telegraphed solution.** "They're not bad, they're just cold" was visible from the very first clue; no hypothesis was ever refuted.
- **Consequence-free decisions.** Every path converged on the same warm beat.
- **Wrong voice.** The **narrator** spoke in colloquial Chilean street slang instead of staying neutral, and characters had no voices distinguished by background. That's what produced the current model: **neutral narrator** (`language.narrator`) + **dynamic per-character voices** (`Voice`, by role/class/era/region).

Serves as the baseline: the next match should pick **one real disruptive concept**, build its learning ladder, keep the narrator neutral, and give each character their own voice by background. It's also the **`reality_check: 1`** calibration anchor in `settings.md` — the mythic/fairy-tale end of that scale (sleeping stars, whispering trees), as opposed to the scientifically-grounded end at `10`.

## Files

| File | Content |
|------|---------|
| `settings.json` | This match's config (includes the retro note in the record) |
| `.this/players.md`, `lore.md`, `narrative.md` | Final state of the match (the three living files) |
| `.this/docs.md` | Premise and narration guide for this match (historical) |
| `sessions/` | Final recap |
