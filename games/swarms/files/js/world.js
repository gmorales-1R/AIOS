import {
  TREE_DENSITY, APPLE_GROW_TICKS, APPLE_MAX,
} from './config.js';

export function initWorld(tiles) {
  for (const t of tiles) {
    t.tree   = Math.random() < TREE_DENSITY;
    t.apples = 0;
    // stagger initial growth so the map populates gradually
    t.ticksToApple = t.tree
      ? Math.ceil(Math.random() * APPLE_GROW_TICKS)
      : 0;
  }
}

// Called once per game tick (1 second). Advances apple growth on all trees.
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

// Reset apple state on a tile after the character collects them.
export function collectApples(tile) {
  tile.apples        = 0;
  tile.ticksToApple  = APPLE_GROW_TICKS;
}
