# swarms — memory

Persistent state and accumulated knowledge across sessions.

## Session history

| Date | Branch | Summary |
|------|--------|---------|
| 2026-06-21 | `claude/game-project-setup-lav5im` | Full game foundation through creatures, combat, grass texture, and performance fixes. See `sessions/2026-06-21T00:31:26Z_session.log`. |

## Resolved bugs

- **Double-tap text selection on inventory**: `user-select: none` in global CSS `* {}`.
- **Multiple apple stacks**: `appleSlotIdx` now finds existing stack first; returns -1 if full.
- **Grass texture 404**: `new Image().src` in ES module resolves relative to document, not module. Fixed with `new URL('../assets/tiles/grass.png', import.meta.url).href`.
- **Grass texture lag**: `ctx.save()/clip()/restore()` per tile per frame is O(expensive). Fixed with `ctx.createPattern()` once + `setTransform()` per tile.

## Known gaps

- Player has no directional facing — attack is omnidirectional within range radius.
- R (ranged) and D (defend) buttons are wired to UI but have no game logic.
- Chicken death is silent beyond hit ring fade — no death animation or loot drop.
- No player progression / leveling system.
- Map is fixed size; no scrolling world or chunk loading.

## Architecture reminders

- **Never hand-edit `files/`** — always edit `generate_game.py` and regenerate.
- Grass pattern must be created lazily inside `render()` (needs a canvas context). It's cached in `grassPattern` module var.
- `import.meta.url` is required for any asset path in ES modules — document-relative paths will 404.
- Tile draw order matters: fill path → grass pattern fill OR solid fill → stroke border → overlays (apples/sword).
- Combat accFactor: `1 + (Math.random() * 2 - 1) * acc` — uniform in [-acc, +acc] added to 1.
