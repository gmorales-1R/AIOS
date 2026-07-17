# gm_craft — the craft of a compelling, disruptive GM

Load this whenever you narrate. It is the difference between "cute but shallow" and a story that holds a child *and* an adult. Written from the retro on our first game (`matches/la-estrella-dormida/`), which the players' adult found "shallow, obvious, and boring" even though the kids loved it. That is the exact failure this file exists to prevent.

## The failure mode we're fixing

`la-estrella-dormida` diagnosis:
- **Telegraphed.** The solution ("they're not bad, they're just cold") was visible from the first clue. No hypothesis was ever wrong; no reveal ever recontextualized.
- **Anthropomorphic hand-wave.** "Xenobiology" was Earth animals + feelings. The world had no rules of its own, so nothing surprising could emerge from it.
- **Consequence-free.** Every choice led to the same warm beat. Choices were flavor, not forks.
- **One flat layer.** Everything on the surface, nothing underneath for an older mind.

## The anti-shallow checklist (run before every scene)

1. **Is the answer non-obvious right now?** If the players (or you) can already name the solution, the mystery is dead. Add a fact that *breaks* the current theory.
2. **Can the players be productively wrong?** A good GM lets a hypothesis fail *informatively* — the failure teaches, it doesn't punish. No dead ends, but wrong turns must cost or reveal something.
3. **Does this choice actually fork the story?** If both options converge on the same next beat, it's fake agency. Give at least one choice real, tracked consequences (log them in `narrative.md` → open threads).
4. **Is the world obeying its own rules, not mine?** The disruptive concept (see `learning_design.md`) has mechanics. Problems should emerge *from those mechanics*, not from GM convenience.
5. **Is there a second layer?** Something an adult would smirk at or a curious kid would chew on later — a real mechanism, a genuine trade-off, a wry aside, or a line written with "layered maturity" (below).
6. **Did I withhold?** Reveal the world in pieces the players earn. Mystery is pace-controlled information.

## Techniques

- **Hypothesis play.** Frame situations as questions the players must reason about ("what do you think is going on here?"), then let the world confirm or *refute* them. This is the engine of both engagement and learning.
- **The turn of the screw.** Roughly every 3rd beat, introduce a fact that recontextualizes what came before. The "monster" has a mechanism; the helper has a motive; the safe path has a cost.
- **Real trade-offs, still PG.** Tension doesn't require harm. "If you vent the gas you lose the ore vein; if you keep digging the air gets worse" is genuine tension with zero cruelty. Danger resolves kindly, but choices should pinch.
- **Diegetic tools, not narration.** Let players *use* the concept (measure it, test it, exploit it), don't lecture it. A scanner should reveal a number that means something, not a moral.
- **Escalate the ladder.** Start intuitive, end at the real concept. Each act climbs one rung (see `learning_design.md`).
- **Character as function, with texture.** Give each crew member a lens (one decides, one acts, one analyzes, one disrupts/comic-relief). Use the disruptor to voice the naive theory so the world can correct it.
- **Voice by background.** This is a role-playing game: every character speaks in an idiolect that reveals *who they are* — role, class, era, region, education, temperament. In an `en-UK` mine, the coal shoveler is broad Cockney ("cor, that ain't no statue, guv…") and the mine-owner is pompous RP ("I must protest — the structural surveys were quite conclusive"). Dialogue should let a listener guess a character's station before they're told. Keep each voice **consistent** across turns (record it as `Voice` in `players.md`/`lore.md`) and **distinct** from the others. The **narrator stays neutral** (`language.narrator`) so the characters carry the color — a narrator doing an accent muddies the scene. Accent and attitude yes; content still obeys `rating`.
- **Earn the ending.** The finale should require the players to *apply* the concept they learned, not just witness a nice moment.
- **Layered maturity (unexplained texture).** The table often spans ages at once — a parent reading alongside a young child, players of different ages, a kid replaying it years later. Write occasional lines that are complete and warm at face value for the youngest reader, but carry a second, unstated meaning for whoever's old enough to catch it. A character accepts a treat and says, smiling, "this is even better than the emergency ice cream" — a kid just hears a happy dessert line; an older listener clocks that *something* needed fixing once, and no one explains what. Rules for this: never spell out the subtext, never let it darken or complicate the surface scene, never make it required to enjoy or solve the story — it's a spark for whoever notices, not a puzzle they owe an answer to. Use it sparingly (once or twice a session); it works because it's rare, not because every line hides something. This is the same craft Bluey runs on. Scale how often and how heavy with `depth` (`light` → maybe one grounding aside all game; `existential` → the whole arc can carry an unstated adult-legible thread this way) — but the child-facing surface reading must stay intact at every depth setting.

## Pacing shape

The default arc is a **15-turn, six-act structure** — see `structure.md` for the full beat sheet (Known world → Inciting break → Trial and learning → The turn → Final battle → The way home). Always know which act/turn you're in and do that act's job. The concept's learning ladder rides the same curve; the "turn of the screw" is structurally the Act IV reveal.

Keep individual beats short and read-aloud friendly — richness is in the *structure*, not in longer paragraphs.

## Calibrate to `settings.json`

Craft intensity is not fixed — read the match config:
- **`difficulty`** sets how hard hypotheses get refuted and how much choices cost (`gentle` → guided; `challenging` → real inference, persistent forks). Never crosses into cruelty regardless.
- **`depth`** sets how hard the Act IV twist recontextualizes the story and how far the plot reaches into real/existential territory (`light` → a clean surprise; `existential` → the twist reframes what the premise meant, and the story sits with a real question before resolving kindly). See `settings.md`.
- **`reality_check`** (1-10) sets whether the world's phenomena run on invented fairy-tale rules (low end) or real, theoretically-defensible science (high end) — orthogonal to `depth`'s emotional/thematic reach and to the always-on anti-anthropomorphism rule. See `settings.md`.
- **`duration.ideal_turns`** sets arc length — plant the "turn of the screw" and climb the ladder so the finale lands near it, not whenever.
- **`language`** sets the *narrator* voice (default neutral) and the *locale* palette; character voices come from their backgrounds, not from a global register (see "Voice by background").
- **`learning.intensity`** sets how much the concept drives the plot vs. sits in the background.
