# swarms

A hex-tile survival game built inside the AIOS framework. All frontend code lives in **source files** under `code/src/` and is assembled into `files/` by a Python build script — never hand-edit output files.

## Identity

Swarms is a browser-based hex-tile survival game: Robin Hood hero character, inventory system, two creature types (chicken, hog), melee + ranged combat (bow with long-press aim), shield/defend mechanic, day/night cycle, and a procedurally generated world. The name points toward the long-term goal of emergent swarm AI. In active incremental development.

## North star

- `code/src/` is the single source of truth. `generate_game.py` assembles it — run it after every change.
- Build features incrementally, always keeping the game playable.
- Prefer canvas 2D simplicity over library dependencies.
- Mobile-first touch; keyboard/mouse is a bonus.

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | HTML5 Canvas 2D | No framework, no bundler |
| Modules | ES modules (`type="module"`) | 15 JS source files in `code/src/js/` |
| Generator | Python 3 | `generate_game.py` reads `code/src/`, writes `files/` |
| Assets | PNG (RGBA, 256×256) | grass, grass2, water — tile textures with alpha |
| Storage | localStorage → sessionStorage → cookie | 3 FIFO save slots, 5-min autosave |

## Children

| Node | Purpose |
|------|---------|
| `code/` | Source: `generate_game.py` + `src/` (JS/CSS/HTML + assets) |
| `files/` | Generated output: `game.html`, `css/`, `js/`, `assets/` |
| `sessions/` | Append-only session logs |
| `.this/` | Facets: `memory.md`, `docs/` (uploaded source assets) |

## Build process

```bash
python games/swarms/code/generate_game.py
# then open games/swarms/files/game.html in any browser
```

All 15 output JS/CSS/HTML files overwritten on every run. Asset PNGs are not touched by the generator — place them directly in `files/assets/tiles/`.

## Module map

| File | Responsibility |
|------|---------------|
| `config.js` | All numeric constants and color palette |
| `hex.js` | Pointy-top hex geometry, CORNERS, axial↔world, `hasWall` stub |
| `camera.js` | World↔screen projection, pan, zoom, focus lerp |
| `pathfind.js` | DFS with backtracking, MAX_TRIES=3, `isBlocked` + `hasWall` checks |
| `world.js` | Tile grid, water blobs, trees, sword/shield spawn |
| `character.js` | Player state, movement, `takeDamage`, shield timers, animations |
| `inventory.js` | 5 slots, apple stack (max 10), sword/shield equip toggle |
| `creatures.js` | `Chicken` + `Hog` classes, shared `advancePath`, spawn/deserialize |
| `render.js` | Canvas draw loop: tiles, creatures, character, HUD, timer arcs |
| `input.js` | Touch/mouse routing, dead-zone guards, board-bounds check |
| `ui.js` | DOM HUD: inventory bar, action column, menus, `updateSlotTimer` |
| `save.js` | Serialize/deserialize full game state, storage fallback chain |
| `game.js` | Main loop, tick accumulator, state machine, death detection |

## Hex geometry

Pointy-top hexagons. World unit = 1 SIDE.

```
SIDE=1  HEX_W=√3  HEX_H=2  COL_SPACING=√3  ROW_SPACING=1.5
CORNERS[i] = (sin(i×60°), -cos(i×60°))  i=0..5
x = col × COL_SPACING
y = row × ROW_SPACING + (col%2===1 ? 0.5 : 0)
```

## Rendering

- `ppu` (pixels-per-unit) = `baseScale × zoom`. Multiply all world coords by `ppu`.
- Tiles: grass uses `ctx.createPattern()` (lazy init) + `setTransform(DOMMatrix)` anchored to world origin each frame. **No clip().** Two grass variants (`grassVar` bool, 30/70 split). ALL non-water tiles (including tree tiles) use grass pattern.
- Tile draw order: fill (pattern or solid) → target border only → tree overlay (foliage + trunk + apples) → creatures → character → day/night overlay → HUD.
- No border on non-target tiles. Target tile: yellow (reachable) or red (unreachable) border.
- Tree: dark foliage circle (#0f2a0b, r=0.28*ppu, center y-0.08*ppu), brown trunk rect (0.07*ppu wide, 0.22*ppu tall), red apple dots at TREE_APPLE_POS offsets. Always drawn when t.tree (not gated on apple count).
- Character: `drawHero()` — green tunic, skin face, dark pointed hat, yellow feather, eyes.
- Creatures: `drawHog()` — ears, oval body/head, snout, nostrils, eyes (red when aggro), white tusks. `drawChicken()` — oval body, wing, head, red comb, beak, wattle, eye.
- Hit ring: red expanding arc, `opacity = dmg / (baseDmg × 1.5)`, fades over `HIT_ANIM_SECS`.
- Attack ring: yellow (armed) or cyan (unarmed) expanding arc, fades over `ATK_ANIM_SECS`.
- Shield active: blue ring arc on character (`COLORS.shieldRing`, `CHAR_RADIUS + 0.1`).
- Slot timer arc: SVG overlay per inventory slot. Yellow = active, blue = cooldown. `stroke-dashoffset = C*(1-fraction)`, `rotate(-90)` for 12-o'clock start.
- Day/night overlay: radial gradient from player position (oa×0.15 inner → oa outer at 2*ppu). Lantern effect — near-player region is much dimmer than the overlay. Keyframes: day (transparent) → dusk (orange) → night (dark purple, oa≈0.20) → dawn (blue→yellow) → day.
- Bow aim line: solid line from character, length = charge × BOW_RANGE_MAX × ppu, direction toward aim point.

## Combat

```
finalDmg = floor(baseDmg × accFactor × (1 - evade))
accFactor = 1 + uniform(-acc, +acc)
```

| Entity | HP | Evade | Notes |
|--------|-----|-------|-------|
| Player | 100 | — | heals when hunger > 60 |
| Chicken | 8 | 20% | flees 2 tiles on hit |
| Hog | 100 | 0% | aggros when player within 2u |

| Weapon | dmg | range | acc |
|--------|-----|-------|-----|
| Fist | 2 | 1.5u | 0 |
| Sword | 5 | 2.0u | ±10% |
| Bow | — | BOW_RANGE_MAX | charge-based |

Shield block: `reduction = min(1, 0.70 + effectiveness + uniform(-0.20,+0.20))`, active 10s, cooldown 20s. Effectiveness from equipped shield item.

Bow (ranged): long-press (180ms) to enter aim mode. Drag to aim. Yellow line grows from player as charge fills up to BOW_RANGE_MAX. Release to fire. Arrow travels along aim vector, collision with creatures (within CHAR_RADIUS) or tree foliage circle (r=0.28u, center t.y-0.08).

## Game states

`'menu'` → `'playing'` ↔ `'paused'` → `'dead'` → `'menu'`

Death triggers when `character.health <= 0` at end of any playing frame. Shows "u ded" overlay with: **Reload Last Save** (disabled if no save), **New Game**, **Back to Menu**.

## Inventory

- 5 slots. Single apple stack (max 10). Second stack never opens.
- Sword: one slot, equip toggle (yellow border). Auto-equips on first pickup.
- Shield: one slot, equip toggle. Auto-equips on first pickup. Shows timer arc when active/cooling.
- Bow: one slot, equip toggle. Required for ranged attack.
- Auto-pickup: on tile entry, all available items (sword, shield, bow, apples) are picked up automatically. Inventory-full handling (drop to swap) not yet implemented.
- Auto-consume: each tick, if `character.hunger < 60` and apple slot has count > 0, one apple is consumed automatically.

## Creatures

**Chicken** — `kind='chicken'`, HP 8, evade 20%. Tick: 30% chance random move, 50% chance eat apple if on tree tile. `onHit()`: switch to `'flee'`, pathfind 2 random neighbor hops away. Passive otherwise.

**Hog** — `kind='hog'`, HP 100, evade 0%. Natural: 20% random move, 80% eat apple. Aggro triggers when player within `HOG_DETECT_DIST=2.0u` (50% chance/tick). Aggro: pathfind to player, attack within 1.2u every 0.5s (5 dmg ±1). Disengages at `HOG_DISENGAGE_DIST=6.0u`.

## Tap input guards

`input.js` passes screen coords to `onTap`; `game.js` filters:
- `dist > SIDE` from `nearestTile` → ignore (out of board)
- Bottom-left rectangle (290×70px) → ignore (inventory bar dead zone)
- Bottom-right rectangle (70×230px) → ignore (action column dead zone)

## Design decisions

| Decision | Rationale |
|----------|-----------|
| Python assembler, source in `code/src/` | Reviewable source per file; avoids drift; `__BUILD_TIME__` substitution |
| Canvas pattern instead of clip for textures | `save/clip/restore` per tile per frame is prohibitively slow |
| `import.meta.url` for asset paths | ES module `new Image().src` resolves to document, not module location |
| Random spawn from passable tiles | Avoids water spawn; `initWorld` must run before spawn selection |
| Dead creatures deferred splice | Ensures hit animation plays fully after HP=0 |
| `user-select: none` globally | Prevents browser text-selection popup on double-tap |
| `hasWall(tile, side)` stub → `false` | Placeholder for future one-way wall traversal |
| `goToMenu()` extracted from `backToMenu()` | Shared by pause path and death path without duplication |

## `.this/` facets

| Facet | Load |
|-------|------|
| `memory.md` | Required — session history, resolved bugs, known gaps |
| `docs/` | Optional — uploaded source assets (grass.png, grass2.png, water.png) |

## Open issues

- **Firefox canvas flashing** — tracked in `sessions/firefox-flash.md`; 3 attempts failed (will-change, CSS background, integer rounding). Candidates 3–5 untried.
- No directional facing for player — attack is omnidirectional.
- Chicken/hog death has no loot drop or death animation.
- Inventory full: auto-pickup everything now; no "drop to make room" mechanic yet (planned).
- No player progression / levelling system.
- Map is fixed size (20×12); no chunk loading.
