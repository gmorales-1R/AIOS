import { TREE_DENSITY, APPLE_GROW_TICKS, APPLE_MAX } from './config.js';

export function initWorld(tiles) {
  for (const t of tiles) {
    t.tree         = Math.random() < TREE_DENSITY;
    t.apples       = 0;
    t.ticksToApple = t.tree
      ? Math.ceil(Math.random() * APPLE_GROW_TICKS)
      : 0;
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
  tile.apples        = 0;
  tile.ticksToApple  = APPLE_GROW_TICKS;
}

// Only serialize tiles that carry non-default state (tree tiles).
export function serializeTiles(tiles) {
  return tiles
    .filter(t => t.tree)
    .map(t => ({
      col: t.col, row: t.row,
      apples: t.apples, ticksToApple: t.ticksToApple,
    }));
}

export function deserializeTiles(tiles, data) {
  // Reset all, then apply saved state.
  for (const t of tiles) { t.tree = false; t.apples = 0; t.ticksToApple = 0; }
  const tileMap = new Map(tiles.map(t => [t.col + ',' + t.row, t]));
  for (const d of data) {
    const t = tileMap.get(d.col + ',' + d.row);
    if (t) {
      t.tree = true; t.apples = d.apples; t.ticksToApple = d.ticksToApple;
    }
  }
}
