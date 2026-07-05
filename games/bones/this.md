# bones

A browser game built with Phaser 3. Developed inside the AIOS framework as a second game project, applying lessons from swarms.

## Identity

A necromancer/witch summoning game — "a necro spammer's paradise." The player controls a witch on an isometric grid who summons pets with **no cap**. The whole design constraint flows from that: pets must stay cheap enough (visually and computationally) that summoning hundreds of them never becomes the bottleneck. Concept decided 2026-07-05.

## Design principles

- **Pets are basic and scalable, on purpose.** One shared sprite, tinted per-instance for visual variety instead of drawing unique art per pet — cost stays flat as summon count grows. No per-pet update logic beyond a shared idle tween.
- **Unrestricted summoning is the core fantasy**, not a balance lever — no pet cap should be added later without revisiting this identity first.

## North star

- `files/` is source **and** output — no Python assembler, no build step.
- Phaser 3 loaded via local bundle (`files/js/phaser.min.js`) so the game runs fully offline and from `file://`.
- Mobile-first touch; keyboard/mouse is a bonus.
- Keep scenes modular: one file per Phaser Scene.

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Phaser 3 | Local bundle, no CDN dependency |
| Modules | ES modules | One file per scene + shared config |
| Assets | PNG (RGBA) | Stored in `files/assets/` |
| Storage | localStorage | Save slots mirroring swarms pattern |

## Children

| Node | Purpose |
|------|---------|
| `files/` | Game source: `game.html`, `js/`, `assets/` |
| `code/` | `prepare_assets.py` — generates placeholder sprites into `files/assets/`; run before relying on those files |
| `sessions/` | Append-only session logs |
| `.this/` | Facets: `memory.md` |

## Build / run

```bash
# No build step — serve files/ with a local HTTP server
python3 -m http.server 8080 --directory games/bones/files
# then open http://localhost:8080/game.html
```

## `.this/` facets

| Facet | Load |
|-------|------|
| `memory.md` | Required — session history, resolved bugs, known gaps |
