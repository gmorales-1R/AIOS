# structure — the six-act dramatic recipe (default arc)

Every game is planned as a **15-turn arc** by default, shaped by the classic theatre/film structure below. This is the GM's beat sheet: always know **which act and which turn** you're in, and steer each beat toward that act's job. Turns are soft budgets — a beat may spill by one — but the arc lands near `settings.duration.ideal_turns` and no act is skipped.

## The acts (default 15 turns)

| Acto | Turnos | Job | Undertone |
|------|:-----:|-----|-----------|
| **I — Mundo conocido** | 2 | Establish the comfortable, known world; introduce the party, their voices, the ordinary. | Staleness/routine + a faint **hint that change is coming** (an omen, a small wrongness). |
| **II — La irrupción** | 3 | A shift **disrupts everything**. The call to adventure lands and it *aches* — the party is pulled in as the hero(es). Stakes appear; the naive/obvious theory forms. | "Nothing will be the same." |
| **III — Prueba y aprendizaje** | 5 | A **great proof of unpreparedness** (a real setback that shows they're not ready), then a **build-up of skill and knowledge**. The longest act — the heart of the game. | Struggle → competence. |
| **IV — El vuelco** | 3 | **Big reveal:** a major premise was wrong / a betrayal / a plot twist that **recontextualizes** Acts I–III. Raises the stakes for the finale. | "It was never what we thought." |
| **V — La batalla final** | 1 | The climax. The party **applies everything** (concept + skills earned in Act III, reframed by Act IV) in one decisive beat. | All-or-nothing. |
| **VI — La vuelta a casa** | 1 | Victory lap / return / jubilee / reward. Resolve threads; land the dopamine. | Earned peace + growth. |

Ratio: `[2, 3, 5, 3, 1, 1]`.

## How the concept & learning ladder map onto the acts

The disruptive concept (`learning_design.md`) rides the same skeleton — dramaturgy and pedagogy are the same curve:

- **Acts I–II** → the **intuitive/wrong model** forms (ladder rung 1). Seed the concept quietly.
- **Act III** → the setback proves the wrong model fails; the **build-up teaches the real mechanics** rung by rung (ladder rung 2). The "training montage" *is* the learning.
- **Act IV** → the reveal is often the concept's true mechanism clicking into place — the twist and the "aha" are the same moment.
- **Act V** → the party **applies the real concept correctly** to win (ladder rung 3).
- **Act VI** → reflect; this is where "qué aprendimos" is earned, not narrated.

## The "turn of the screw" lives in Act IV

The anti-shallow rule (answer not visible from turn 1; `gm_craft.md`) is structurally guaranteed here: Act IV must overturn a premise the players held since Act II. Plant that premise deliberately in Act II so you have something real to break.

## Scaling to a different length

If `settings.duration.ideal_turns` ≠ 15, keep the **shape** and scale the middle. Multiply each act by `ideal_turns / 15` and round, but:
- Acts **V and VI stay 1 turn each** (a climax and a reward are single beats).
- Act **III keeps the largest share** (it's the heart); give it the rounding slack.
- Never drop an act to 0 — flooring short acts at 1 can overshoot `ideal_turns` after rounding. If it does, trim the surplus from Act III first (it has the slack to give); only pare II/IV next. Never trim I, V, or VI below 1.
- Example: a 6-turn game scales to `[0.8, 1.2, 2, 1.2, 0.4, 0.4]` → rounds to `[1, 1, 2, 1, 1, 1]` (7, one over). Trim the extra turn from Act III → `[1, 1, 1, 1, 1, 1]`.

Log the planned per-act budget in `narrativa.md` at game start so pacing stays honest.

## Tracking

`narrativa.md` → *situación actual* names the **current acto and turno** (e.g. "Acto III · turno 7/15"). Each turn, check: am I doing this act's job? Is the act about to end — do I need to hit its turning point now? This is what keeps a 15-turn game from sagging in the middle or rushing the reveal.
