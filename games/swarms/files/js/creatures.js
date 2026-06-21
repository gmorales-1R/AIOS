import { SIDES, nearestTile } from './hex.js';
import {
  CHICKEN_HP, CHICKEN_EVADE, CHICKEN_MOVE_CHANCE, CHICKEN_EAT_CHANCE,
  CHICKEN_SPAWN_COUNT, HIT_ANIM_SECS, APPLE_GROW_TICKS,
} from './config.js';

export class Chicken {
  constructor(tile) {
    this.tile = tile;
    this.x = tile.x; this.y = tile.y;
    this.health = CHICKEN_HP;
    this.hitAnim = null;  // { t, opacity } while flash plays
  }

  get alive() { return this.health > 0; }

  tick(tiles, isBlocked) {
    // Random move to a neighbouring non-blocked tile.
    if (Math.random() < CHICKEN_MOVE_CHANCE) {
      const neighbors = [];
      for (const s of SIDES) {
        const { tile: nb, dist } = nearestTile(
          tiles, this.tile.x + s.neighbor[0], this.tile.y + s.neighbor[1]
        );
        if (nb && dist < 0.1 && !isBlocked(nb)) neighbors.push(nb);
      }
      if (neighbors.length) {
        this.tile = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.x = this.tile.x; this.y = this.tile.y;
      }
    }
    // Eat one apple with 50% chance.
    if (this.tile.apples > 0 && Math.random() < CHICKEN_EAT_CHANCE) {
      this.tile.apples--;
      if (this.tile.apples === 0) this.tile.ticksToApple = APPLE_GROW_TICKS;
    }
  }

  // dmg: final calculated damage; refDmg: baseDmg*1.5 scale reference for opacity.
  takeDamage(dmg, refDmg) {
    this.health = Math.max(0, this.health - dmg);
    this.hitAnim = { t: 0, opacity: Math.min(1, dmg / refDmg) };
  }

  update(dt) {
    if (this.hitAnim) {
      this.hitAnim.t += dt;
      if (this.hitAnim.t >= HIT_ANIM_SECS) this.hitAnim = null;
    }
  }

  serialize() {
    return { col: this.tile.col, row: this.tile.row, health: this.health };
  }
}

export function spawnChickens(tiles, isBlocked, count = CHICKEN_SPAWN_COUNT) {
  const cands = tiles.filter(t => !isBlocked(t));
  const used  = new Set();
  const out   = [];
  for (let i = 0; i < count; i++) {
    const avail = cands.filter(t => !used.has(t));
    if (!avail.length) break;
    const tile = avail[Math.floor(Math.random() * avail.length)];
    used.add(tile);
    out.push(new Chicken(tile));
  }
  return out;
}

export function deserializeChickens(data, tiles) {
  const map = new Map(tiles.map(t => [t.col + ',' + t.row, t]));
  return data.map(d => {
    const tile = map.get(d.col + ',' + d.row);
    if (!tile) return null;
    const c = new Chicken(tile);
    c.health = d.health;
    return c;
  }).filter(Boolean);
}
