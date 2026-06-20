import { TREE_DENSITY, APPLE_GROW_TICKS, APPLE_MAX, COLS, ROWS } from './config.js';

// Generate irregular water blobs using sine-noise jitter.
// Seeds are kept away from the board edges and from row 0 (character start).
function generateWater(tiles) {
  const BLOBS = 3;
  const inner = tiles.filter(t =>
    t.col >= 2 && t.col <= COLS - 3 && t.row >= 2 && t.row <= ROWS - 2
  );
  for (let b = 0; b < BLOBS; b++) {
    const seed = inner[Math.floor(Math.random() * inner.length)];
    if (!seed) continue;
    const r = 1.5 + Math.random() * 1.8;
    for (const t of tiles) {
      const dx    = t.col - seed.col;
      const dy    = (t.row - seed.row) * 0.87;
      const noise = Math.sin(t.col * 7.1 + t.row * 13.3 + seed.col * 5.7 + b) * 0.65;
      if (Math.hypot(dx, dy) < r + noise) t.water = true;
    }
  }
}

export function initWorld(tiles) {
  // Water first; trees never grow on water.
  for (const t of tiles) { t.water = false; t.tree = false; t.apples = 0; t.ticksToApple = 0; }
  generateWater(tiles);
  for (const t of tiles) {
    if (t.water) continue;
    t.tree         = Math.random() < TREE_DENSITY;
    t.ticksToApple = t.tree ? Math.ceil(Math.random() * APPLE_GROW_TICKS) : 0;
  }
}

export function tickWorld(tiles) {
  for (const t of tiles) {
    if (!t.tree || t.apples >= APPLE_MAX) continue;
    t.ticksToApple--;
    if (t.ticksToApple <= 0) {
      t.apples++;
      t.ticksToApple = APPLE_GROW_TICKS;
    }
  }
}

export function collectApples(tile) {
  tile.apples       = 0;
  tile.ticksToApple = APPLE_GROW_TICKS;
}

// Serialize tiles with non-default state (water or tree tiles).
export function serializeTiles(tiles) {
  return tiles
    .filter(t => t.water || t.tree)
    .map(t => ({
      col: t.col, row: t.row,
      water: !!t.water, tree: !!t.tree,
      apples: t.apples || 0, ticksToApple: t.ticksToApple || 0,
    }));
}

export function deserializeTiles(tiles, data) {
  for (const t of tiles) { t.water = false; t.tree = false; t.apples = 0; t.ticksToApple = 0; }
  const tileMap = new Map(tiles.map(t => [t.col + ',' + t.row, t]));
  for (const d of data) {
    const t = tileMap.get(d.col + ',' + d.row);
    if (!t) continue;
    t.water = !!d.water; t.tree = !!d.tree;
    t.apples = d.apples || 0; t.ticksToApple = d.ticksToApple || 0;
  }
}
