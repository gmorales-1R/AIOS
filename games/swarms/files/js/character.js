import { nearestTile } from './hex.js';
import { findPath } from './pathfind.js';
import { MOVE_SPEED } from './config.js';

export class Character {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.path = [];
    this.targetTile  = null;
    this.targetState = null;   // 'active' | 'unreachable' | null
  }

  get moving() { return this.path.length > 0; }

  setDestination(tiles, targetTile) {
    const { tile: start } = nearestTile(tiles, this.x, this.y);
    if (start === targetTile) return;   // already there

    const waypoints = findPath(tiles, start, targetTile);
    this.targetTile  = targetTile;
    if (waypoints === null) {
      this.path        = [];
      this.targetState = 'unreachable';
    } else {
      this.path        = waypoints;
      this.targetState = 'active';
    }
  }

  update(dt) {
    const wasMoving = this.moving;
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
    // Clear target highlight on natural arrival.
    if (wasMoving && !this.moving) {
      this.targetTile  = null;
      this.targetState = null;
    }
  }
}
