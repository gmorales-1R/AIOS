import { SIDES, nearestTile } from './hex.js';
import { MOVE_SPEED } from './config.js';

export class Character {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.path = [];   // queue of {x, y} waypoints
  }

  get moving() { return this.path.length > 0; }

  setDestination(tiles, targetTile) {
    this.path = buildPath(tiles, this, targetTile);
  }

  update(dt) {
    let budget = MOVE_SPEED * dt;
    while (budget > 0 && this.path.length > 0) {
      const wp = this.path[0];
      const dx = wp.x - this.x, dy = wp.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d <= budget || d === 0) {
        this.x = wp.x; this.y = wp.y;
        budget -= d;
        this.path.shift();
      } else {
        this.x += (dx / d) * budget;
        this.y += (dy / d) * budget;
        budget = 0;
      }
    }
  }
}

// Greedy hop toward the target tile. At each tile, pick the edge whose outward
// normal best aligns with the (tile -> target) vector, then enqueue that edge's
// midpoint followed by the neighbour tile's center. Repeat until we arrive.
function buildPath(tiles, char, target) {
  const start = nearestTile(tiles, char.x, char.y).tile;
  if (!start || !target) return [];

  const path = [];
  let cur = start;
  let guard = 0;
  while (cur !== target && guard++ < 1000) {
    const vx = target.x - cur.x, vy = target.y - cur.y;

    let best = -Infinity, side = null;
    for (const s of SIDES) {
      const dot = s.normal[0] * vx + s.normal[1] * vy;
      if (dot > best) { best = dot; side = s; }
    }

    const mid = { x: cur.x + side.mid[0], y: cur.y + side.mid[1] };
    const nx = cur.x + side.neighbor[0];
    const ny = cur.y + side.neighbor[1];
    const near = nearestTile(tiles, nx, ny);
    if (!near.tile || near.dist > 0.1) break;   // would leave the board

    path.push(mid);
    path.push({ x: near.tile.x, y: near.tile.y });
    cur = near.tile;
  }
  return path;
}
