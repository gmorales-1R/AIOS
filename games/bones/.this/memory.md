# bones — memory

Persistent state and accumulated knowledge across sessions.

## Session history

| Date | Summary |
|------|---------|
| 2026-06-24 | Directory scaffold created. Phaser 3 chosen as framework. Game concept TBD. |
| 2026-06-24 | Asset survey complete. Isometric grid confirmed. First level rendered. |

## Architecture reminders

- Source of truth: `files/` — edit directly, no build step.
- Phaser bundle: CDN for now (`phaser@3.88.2`); swap to `files/js/phaser.min.js` for offline.
- Asset paths: relative to `game.html` (e.g. `raw_assets/.../foo.png`).
- Serve with: `python3 -m http.server 8081 --directory games/bones/files`

## Isometric grid system

Confirmed from Kenney's own Tiled sample (`kenney_isometric-miniature-dungeon/Samples/Tiled Sample.zip`):

| Parameter | Value |
|-----------|-------|
| Tile canvas | 256 × 512 px |
| Grid cell | 256 × 128 px (tilewidth × tileheight in Tiled) |
| stepX | 128 px (half canvas width) |
| stepY | 64 px (half cell height) |
| Phaser anchor | `(0.5, 1.0)` — bottom-center of canvas |
| Depth sort | `col + row` ascending (painter's algorithm) |

Placement formula:
```
screen_x = originX + (col - row) * 128
screen_y = originY + (col + row) * 64
```

## Tile conventions

- **Floor tiles**: use `_S` face from `kenney_isometric-miniature-dungeon/Isometric/`
  - `dirt_S.png` — plain dirt floor (border/outer)
  - `dirtTiles_S.png` — tiled dirt floor (interior)
  - `stone_S.png` — stone floor (accent)
  - `stoneInset_S.png` — inset stone (center/focal)
- **Bases pack** (`kenney_isometric-miniature-bases`): NOT for floors — use for pedestals, underground entrances, elevated platforms
- **Props**: use `_N` face for objects placed on tiles (barrel, chest, crate, etc.)

## Asset inventory (raw_assets/)

| Pack | Files | Format | Role |
|------|-------|--------|------|
| kenney_isometric-miniature-dungeon | 288 tiles + 168 char frames | 256×512 | Core dungeon tiles + 7-costume characters (Idle/Run/Pickup) |
| kenney_isometric-miniature-bases | 160 | 256×512 | Pedestals, platforms, underground entrances |
| kenney_isometric-miniature-farm | 228 | 256×512 | Extra props (fences, planks, barrels) |
| kenney_isometric-miniature-library | 144 | 256×512 | Indoor props (bookshelves, desks) |
| kenney_fantasy-ui-borders | 32×4 variants | 48×48 | 9-slice UI panels |
| kenney_ui-pack-adventure | 128 | 48×64 | Buttons, banners, hexagons (brown/grey/red) |
| kenney_board-game-icons | 200+ | 64×64 | Dice (d4–d20), resources, icons |
| kenney_generic-items | 163 | 104×176 | RPG inventory items |
| kenney_splat-pack | 36 | 256×256 | Hit/splat effects |
| kenney_particle-pack | 80 | 512×512 | Muzzle flashes, particles |
| kenney_light-masks-1.0 | 40+ | PNG | Torch/lantern glow masks |
| kenney_rune-pack | 36 | 50×56 | Rune symbols (magic system) |
| kenney_toon-characters | 698 | 96×128 poses | 2D side-view — menus only (mismatched with isometric) |

## Character sprites (dungeon pack)

Path: `kenney_isometric-miniature-dungeon/Characters/Male/`
- Naming: `Male_{variant}_{animation}{frame}.png`
- Variants: 0–6 (7 costume types)
- Animations: Idle (1 frame), Run (10 frames: 0–9), Pickup (10 frames: 0–9)
- Canvas: 256×512 — same as tiles, same anchor `(0.5, 1.0)` — zero alignment work

## Known gaps

- Game concept not yet defined.
- Phaser bundle not yet downloaded (using CDN).
- No walls, characters, or UI in the level yet.

## Planned next: asset agent

Next session will define an AIOS agent node specialized in:
- Archiving and cataloguing raw assets
- Transforming assets (resize, atlas pack, 9-slice metadata)
- Applying processed assets to the game (output to `files/assets/`)

This will be a Python-based agent node living under `games/bones/` or a shared `assets/` node.
