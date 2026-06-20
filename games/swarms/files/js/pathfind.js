import { SIDES, nearestTile } from './hex.js';

// Greedy DFS with limited backtracking.
//
// At each tile, sides are ranked by dot-product alignment with the
// current-tile → target direction. We try up to MAX_TRIES sides before
// backtracking. When the direction lands near-equally between two edges
// (vertex case), both forward edges are covered in the first two tries.
//
// Returns an array of {x,y} waypoints (side-midpoint then tile-center,
// alternating) or null if the target is unreachable within GUARD steps.
const MAX_TRIES = 3;
const GUARD    = 600;

export function findPath(tiles, start, target, isBlocked = () => false) {
  if (start === target) return [];

  const tilePath = [start];
  const inPath   = new Set([start]);
  const triedAt  = new Map();

  const tried = (tile) => {
    if (!triedAt.has(tile)) triedAt.set(tile, new Set());
    return triedAt.get(tile);
  };

  for (let g = 0; g < GUARD; g++) {
    const cur = tilePath[tilePath.length - 1];
    const t   = tried(cur);

    const dir = { x: target.x - cur.x, y: target.y - cur.y };
    const ranked = SIDES
      .map((s, i) => ({ i, dot: s.normal[0] * dir.x + s.normal[1] * dir.y }))
      .sort((a, b) => b.dot - a.dot);

    let advanced = false;
    for (const { i } of ranked) {
      if (t.has(i))        continue;
      if (t.size >= MAX_TRIES) break;   // budget exhausted for this tile
      t.add(i);

      const s = SIDES[i];
      const { tile: nb, dist } = nearestTile(
        tiles, cur.x + s.neighbor[0], cur.y + s.neighbor[1]
      );
      if (!nb || dist > 0.1 || isBlocked(nb) || inPath.has(nb)) continue;

      tilePath.push(nb);
      inPath.add(nb);
      advanced = true;
      break;
    }

    if (tilePath[tilePath.length - 1] === target) break;

    if (!advanced) {
      inPath.delete(tilePath.pop());
      if (tilePath.length === 0) return null;
    }
  }

  if (tilePath[tilePath.length - 1] !== target) return null;
  return tilesToWaypoints(tilePath);
}

function tilesToWaypoints(tilePath) {
  const wps = [];
  for (let i = 0; i < tilePath.length - 1; i++) {
    const a = tilePath[i], b = tilePath[i + 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    let best = SIDES[0], bestDot = -Infinity;
    for (const s of SIDES) {
      const dot = s.normal[0] * dx + s.normal[1] * dy;
      if (dot > bestDot) { bestDot = dot; best = s; }
    }
    wps.push({ x: a.x + best.mid[0], y: a.y + best.mid[1] });
    wps.push({ x: b.x, y: b.y });
  }
  return wps;
}
