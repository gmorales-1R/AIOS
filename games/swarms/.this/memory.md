# swarms — memory

Persistent state and accumulated knowledge across sessions.

## Session history

| Date | Branch | Summary |
|------|--------|---------|
| 2026-06-21 (1st) | `claude/game-project-setup-lav5im` | Full game foundation through creatures, combat, grass texture, and performance fixes. See `sessions/2026-06-21T00:31:26Z_session.log`. |
| 2026-06-21 (2nd) | `claude/game-project-setup-lav5im` | Hog enemy, pathfinding creatures, shield mechanic, dead zones, spawn fix, death screen, slot timer arc, Firefox flash investigation. See `sessions/2026-06-21T09:00:00Z_session.log`. |
| 2026-06-22 | `claude/swarms-onboarding-nhtsrx` | Seamless water texture fix, removed tile borders, tree sprites (grass base + foliage/trunk), long-press bow with growing aim line, auto-pickup + auto-consume, day/night cycle (120s/60s), radial lantern overlay, dark foliage, sprite overhaul (Robin Hood hero, detailed hog, detailed chicken), fixed arrow-tree collision (foliage circle). See `sessions/2026-06-22T00:00:00Z_session.log`. |

## Resolved bugs

- **Double-tap text selection**: `user-select: none` in global CSS.
- **Multiple apple stacks**: `appleSlotIdx` finds existing stack first; returns -1 if full.
- **Grass texture 404**: `new URL('../assets/tiles/grass.png', import.meta.url).href` — `new Image().src` in ES modules resolves to document, not module file.
- **Grass texture lag**: `ctx.save()/clip()/restore()` per tile per frame is O(expensive). Fixed with `ctx.createPattern()` once + `setTransform()` per tile. **Do not revert.**
- **Spawn on water**: `initWorld(tiles)` must run before spawn selection; spawn was hardcoded to `(COLS/2, row=0)`. Now picks random passable tile.
- **Dead zone spans full screen height/width**: Changed from half-planes to two independent rectangles (290×70 inventory bar, 70×230 action column).
- **Out-of-board tap triggers movement**: Added `dist > SIDE` guard in `onTap`.
- **Flash fix attempts reverted**: integer rounding (Math.round on worldToScreen) made no difference — reverted to keep rendering clean.
- **Water texture offset between tiles**: Noise octave frequencies must divide SIZE=128 for torus-wrap periodicity. Non-integer multipliers (e.g. ×2.3) break `f(x+SIZE)=f(x)`. Fixed: three octaves at periods 32/16/64 (all divide 128) with different seeds.
- **Water texture "grid with horizontal offset"**: Single low-frequency octave (period=SIZE) creates one dominant feature per tile, making repetitions visible. Fixed: use smaller periods (SIZE/4, SIZE/8, SIZE/2) → 4-8 repeats per tile, no feature aligns with tile edges.
- **Arrow–tree trunk collision (frame-skip)**: Trunk AABB 0.22u tall; arrows at 20u/s travel ~0.32u/frame and skip the box entirely. Fixed: use foliage circle `Math.hypot(a.x-t.x, a.y-(t.y-0.08)) <= 0.28`. Circle diameter 0.56u is impossible to skip at normal speeds.

## Firefox canvas flashing — open

Confirmed Chrome: no flashes. Firefox on Android: persistent row-shaped green/red flashes.
Investigation file: `sessions/firefox-flash.md`. GitHub issue opened for async handoff.

Attempted (all failed, reverted):
1. Remove `will-change: transform` from `#game` canvas
2. Remove CSS `background` from `#game` canvas
3. `Math.round()` on all `worldToScreen` coordinates

Remaining candidates (in priority order):
4. `save()/setTransform(identity)/clearRect/restore()` pattern — replace with direct `clearRect` using logical coords
5. `CanvasPattern.setTransform(DOMMatrix)` called every frame — use ctx translate/scale instead
6. `position: fixed` stacking context interaction with other fixed elements

## Architecture reminders

- Source of truth: `code/src/js/`, `code/src/css/`, `code/src/game.html`.
- Run `python games/swarms/code/generate_game.py` after every change.
- **Never hand-edit `files/`** (except `files/assets/tiles/` for PNGs — those are not generated).
- Asset paths in ES modules: always use `new URL('../assets/...', import.meta.url).href`.
- Grass pattern must be created lazily inside `render()`. Reset on canvas resize via `resetPatterns()`.
- `initWorld(tiles)` must run before any tile-dependent logic in `startNew()`.
- Combat: `accFactor = 1 + (Math.random() * 2 - 1) * acc` — uniform in [-acc, +acc].
- Shield timer arc: `dashoffset = 113.1 * (1 - remaining/total)`. Full = 0, empty = 113.1.
- Seamless textures: ALL noise octave periods must divide SIZE exactly. Never use non-integer frequency multipliers. Use different seeds per octave for variation.
- World-space pattern: `grassPattern.setTransform(new DOMMatrix([sc,0,0,sc, wo.x, wo.y]))` where `wo = camera.worldToScreen(0,0)` and `sc = tileScale / img.naturalWidth`. All tile variants use same origin anchor.
- Day/night overlay: radial gradient from player position (oa×0.15 inner → oa outer at 2*ppu). Drawn after scene, before HUD. `dayTime` persisted in save state.
- Long-press bow: 180ms holdTimer in input.js, cleared if pointer moves >10px. `onHold` in game.js gates on bowEquipped + character not moving.
- Arrow collision: use foliage circle (center t.x, t.y-0.08; radius 0.28) not trunk AABB. Run AFTER creature collision check in arrow physics loop.
- Deploy: merge feature branch → main; game is served from main.

## Known gaps

- Player has no directional facing — attack is omnidirectional within range radius.
- Chicken/hog death: no loot drop, no death animation beyond hit ring fade.
- No player progression / levelling.
- Map fixed at 20×12; no world loading.
- Inventory full: currently auto-picks up everything; no "drop to make room" mechanic yet.
- Firefox canvas flashing still unresolved (tracked in `sessions/firefox-flash.md`). Candidates 3–5 still untried.
