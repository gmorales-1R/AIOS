# swarms

A hex-tile survival game built entirely inside the AIOS framework. All frontend is **generated** by a single Python script — no hand-editing of output files.

## Identity

Swarms is a browser-based hex-tile game with a player character, inventory, creatures (chickens), melee combat, and a procedurally generated world. The name points toward the long-term goal of emergent swarm AI. Currently in active incremental development.

## North star

- Keep the Python generator (`code/generate_game.py`) as the single source of truth for all frontend code.
- Build features incrementally, one mechanic at a time, always keeping the game playable.
- Prefer canvas 2D simplicity over library dependencies.
- Mobile-first touch interaction; keyboard/mouse is a bonus.

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | HTML5 Canvas 2D | No framework, no bundler |
| Modules | ES modules (`type="module"`) | 13 JS files, imported via `<script type="module">` |
| Generator | Python 3 | `generate_game.py` writes all files; run from repo root |
| Assets | PNG (RGBA) | Grass tile 256×256, transparent corners for hex clip |
| Storage | localStorage → sessionStorage → cookie | FIFO 3 save slots, 5-min autosave |

## Children

| Node | Purpose |
|------|---------|
| `code/` | `generate_game.py` — sole source of truth for all frontend |
| `files/` | Generated output: `game.html`, `css/`, `js/`, `assets/` |
| `sessions/` | Append-only session logs from each development conversation |
| `.this/` | Facet expansion (memory, design notes) |

## Build process

```bash
# from repo root
python games/swarms/code/generate_game.py
# opens games/swarms/files/game.html in any browser
```

All 15 output files are overwritten on every run. Never hand-edit files under `files/` — changes will be lost.

## Module map

| File | Responsibility |
|------|---------------|
| `config.js` | All numeric constants and color palette |
| `hex.js` | Pointy-top hex geometry, CORNERS, axial↔world conversion |
| `camera.js` | World↔screen projection, pan, zoom, focus lerp |
| `pathfind.js` | DFS with backtracking, MAX_TRIES=3, `isBlocked` callback |
| `world.js` | Tile grid generation, water blobs, tree placement, sword spawn |
| `character.js` | Player state, movement, `takeDamage`, `atkAnim`, `hitAnim` |
| `inventory.js` | 5 slots, apple stack (max 10), sword equip toggle, `getMeleeStats` |
| `creatures.js` | `Chicken` class, `spawnChickens`, `deserializeChickens` |
| `render.js` | Canvas draw loop: tiles, creatures, character, HUD |
| `input.js` | Touch/mouse event routing to game actions |
| `ui.js` | DOM HUD: inventory bar, action column, menus |
| `save.js` | Serialize/deserialize full game state, storage fallback chain |
| `game.js` | Main loop: `requestAnimationFrame`, tick accumulator, `doAttack` |

## Hex geometry (critical)

Pointy-top hexagons. World unit = 1 SIDE.

```
SIDE = 1
HEX_W = √3   (width of hex in world units)
HEX_H = 2    (height of hex in world units)
COL_SPACING = √3
ROW_SPACING = 1.5
CORNERS[i] = (sin(i×60°), -cos(i×60°))   i=0..5
```

Grid layout: even columns unshifted, odd columns shifted down by 0.5. Axial→world:
```
x = col × COL_SPACING
y = row × ROW_SPACING + (col % 2 === 1 ? 0.5 : 0)
```

## Rendering notes

- Camera `ppu` (pixels-per-unit) = `baseScale × zoom`. All world coords multiplied by `ppu` before drawing.
- Grass texture: `ctx.createPattern(grassImg, 'repeat')` created once on first render frame (lazy, requires canvas context). `setTransform(new DOMMatrix([sc,0,0,sc, cx-s/2, cy-s/2]))` per tile. No `clip()` needed — the hex path constrains `fill()` automatically. **Do not revert to save/clip/restore; it causes severe per-frame lag.**
- Tile draw order: fill → stroke border → apples/sword overlays.
- Creature/character draw order: creatures first (player renders on top).
- Hit ring (red expanding arc): `opacity = dmg / (baseDmg × 1.5)`, fades over `HIT_ANIM_SECS`.
- Attack ring (yellow/green expanding arc): fades over `ATK_ANIM_SECS`, color depends on `armed` flag.

## Combat system

```
finalDmg = floor(baseDmg × accFactor × (1 - evade))
accFactor = 1 + uniform(-acc, +acc)
```

| Weapon | dmg | range | acc |
|--------|-----|-------|-----|
| Fist | 2 | 1.5u | 0 |
| Sword | 5 | 2.0u | ±10% |

Chicken stats: HP=8, evade=20%. Range check: Euclidean distance in world units.

## Game loop

- `requestAnimationFrame` drives render at display framerate.
- Tick accumulator: game logic fires every 1 second (movement, creature AI, hunger drain).
- Dead creatures stay in array until their `hitAnim` expires, then are spliced out (ensures death flash plays fully).

## Inventory rules

- 5 slots. Apple occupies exactly one slot as a stack (max 10). A second apple stack is never opened — if the stack is full, pickup is blocked.
- Sword occupies one slot. Equip toggles with tap/click; equipped slot gets yellow border. Only one melee weapon equipped at a time.
- `USE` button (U) picks up one apple or the sword from the player's current tile.

## Save system

- 3 FIFO slots in localStorage (key reused, not deleted, to prevent index growth).
- Autosave every 5 minutes.
- Fallback chain: localStorage → sessionStorage → cookie.
- Creatures serialized as `{ col, row, health }` arrays; dead ones excluded.

## Design decisions & assumptions

| Decision | Rationale |
|----------|-----------|
| Python generator as sole source of truth | Keeps all logic in one reviewable file; avoids drift between source and output |
| No noise library for water blobs | Sine-based jitter gives organic enough shapes without a dependency |
| Pointy-top hex (not flat-top) | Verified from CORNERS x-values (±0.866); matches visual expectation |
| DFS pathfinding with backtracking | Simple enough for small maps; MAX_TRIES=3 limits worst case |
| Canvas pattern instead of clip for texture | `save/clip/restore` per tile per frame is prohibitively slow; pattern fill is O(1) setup |
| `import.meta.url` for asset paths | `new Image().src` in ES modules resolves to document base, not module location |
| Single apple stack | UX clarity; prevents inventory spam; mirrors classic survival game constraint |
| Dead creatures deferred splice | Ensures hit animation plays fully even after HP reaches 0 |
| `user-select: none` globally | Prevents browser text-selection popup on double-tap of inventory slots |

## `.this/` facets

| Facet | Load |
|-------|------|
| `memory.md` | Required — prior session context, open issues, next steps |

## Open issues / next steps (as of last session)

- Grass texture rendering: **fixed** (import.meta.url path + pattern instead of clip).
- Performance lag from clip: **fixed** (canvas pattern).
- No directional facing for player yet — affects attack arc design.
- Chicken death has no visual beyond the hit ring fading.
- No ranged attack implemented (R button is placeholder).
- No defense mechanic (D button is placeholder).
- Long-term: more creature types, swarm behavior, player progression.
