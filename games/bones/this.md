# bones

A browser game built with Phaser 3. Developed inside the AIOS framework as a second game project, applying lessons from swarms.

## Identity

TBD — game concept to be defined in session 1.

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
