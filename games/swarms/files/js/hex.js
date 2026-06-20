import { SIDE, COL_SPACING, ROW_SPACING, COLS, ROWS } from './config.js';

export const CORNERS = [];
for (let i = 0; i < 6; i++) {
  const a = (-90 + 60 * i) * Math.PI / 180;
  CORNERS.push([SIDE * Math.cos(a), SIDE * Math.sin(a)]);
}

export const SIDES = CORNERS.map((c, i) => {
  const n   = CORNERS[(i + 1) % 6];
  const mid = [(c[0] + n[0]) / 2, (c[1] + n[1]) / 2];
  const len = Math.hypot(mid[0], mid[1]) || 1;
  return {
    mid,
    normal:   [mid[0] / len, mid[1] / len],
    neighbor: [mid[0] * 2,   mid[1] * 2],
  };
});

export function tileCenter(col, row) {
  return {
    x: col * COL_SPACING + (row & 1) * (COL_SPACING / 2),
    y: row * ROW_SPACING,
  };
}

export function generateGrid() {
  const tiles = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++) {
      const c = tileCenter(col, row);
      tiles.push({ col, row, x: c.x, y: c.y });
    }
  return tiles;
}

export function nearestTile(tiles, x, y) {
  let best = null, bestD = Infinity;
  for (const t of tiles) {
    const d = (t.x - x) ** 2 + (t.y - y) ** 2;
    if (d < bestD) { bestD = d; best = t; }
  }
  return { tile: best, dist: Math.sqrt(bestD) };
}

export function boardCenter() {
  const maxX = (COLS - 1) * COL_SPACING + (COL_SPACING / 2);
  const maxY = (ROWS - 1) * ROW_SPACING;
  return { x: maxX / 2, y: maxY / 2 };
}
