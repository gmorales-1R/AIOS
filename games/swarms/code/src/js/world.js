import { TREE_DENSITY, APPLE_GROW_TICKS, APPLE_MAX, COLS, ROWS } from './config.js';

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

function spawnSword(tiles) {
  const cands = tiles.filter(t => !t.water && !t.tree);
  if (!cands.length) return;
  cands[Math.floor(Math.random() * cands.length)].hasSword = true;
}

function spawnShield(tiles) {
  const cands = tiles.filter(t => !t.water && !t.tree && !t.hasSword);
  if (!cands.length) return;
  cands[Math.floor(Math.random() * cands.length)].hasShield = true;
}

export function initWorld(tiles) {
  for (const t of tiles) {
    t.water = false; t.tree = false;
    t.apples = 0; t.ticksToApple = 0;
    t.hasSword = false; t.hasShield = false;
    t.grassVar = Math.random() < 0.3;
  }
  generateWater(tiles);
  for (const t of tiles) {
    if (t.water) continue;
    t.tree         = Math.random() < TREE_DENSITY;
    t.ticksToApple = t.tree ? Math.ceil(Math.random() * APPLE_GROW_TICKS) : 0;
  }
  spawnSword(tiles);
  spawnShield(tiles);
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

// Remove one apple from the tile; reset grow timer when emptied.
export function pickApple(tile) {
  if (tile.apples <= 0) return false;
  tile.apples--;
  if (tile.apples === 0) tile.ticksToApple = APPLE_GROW_TICKS;
  return true;
}

export function serializeTiles(tiles) {
  return tiles
    .filter(t => t.water || t.tree || t.hasSword || t.hasShield)
    .map(t => ({
      col: t.col, row: t.row,
      water: !!t.water, tree: !!t.tree,
      apples: t.apples || 0, ticksToApple: t.ticksToApple || 0,
      hasSword: !!t.hasSword, hasShield: !!t.hasShield,
    }));
}

export function deserializeTiles(tiles, data) {
  for (const t of tiles) {
    t.water = false; t.tree = false;
    t.apples = 0; t.ticksToApple = 0;
    t.hasSword = false; t.hasShield = false;
  }
  const tileMap = new Map(tiles.map(t => [t.col + ',' + t.row, t]));
  for (const d of data) {
    const t = tileMap.get(d.col + ',' + d.row);
    if (!t) continue;
    t.water = !!d.water; t.tree = !!d.tree;
    t.apples = d.apples || 0; t.ticksToApple = d.ticksToApple || 0;
    t.hasSword = !!d.hasSword; t.hasShield = !!d.hasShield;
  }
}
