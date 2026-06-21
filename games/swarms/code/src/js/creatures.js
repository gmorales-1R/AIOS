import { SIDES, nearestTile } from './hex.js';
import { findPath } from './pathfind.js';
import {
  CHICKEN_HP, CHICKEN_EVADE, CHICKEN_MOVE_CHANCE, CHICKEN_EAT_CHANCE,
  CHICKEN_SPAWN_COUNT, CHICKEN_SPEED, CHICKEN_FLEE_SPEED, CHICKEN_FLEE_TILES,
  HOG_HP, HOG_SPAWN_COUNT, HOG_MOVE_CHANCE, HOG_EAT_CHANCE,
  HOG_DETECT_DIST, HOG_AGGRO_CHANCE, HOG_ATK_RANGE, HOG_ATK_DMG, HOG_ATK_VAR,
  HOG_ATK_INTERVAL, HOG_DISENGAGE_DIST, HOG_SPEED_NATURAL, HOG_SPEED_AGGRO,
  HIT_ANIM_SECS, APPLE_GROW_TICKS,
  CREATURE_DRIFT_RADIUS, CREATURE_DRIFT_CHANCE,
} from './config.js';

// Returns [ox, oy] — a random point within a circle of the given radius.
function randSubTile(r) {
  const angle = Math.random() * Math.PI * 2;
  const dist  = Math.random() * r;
  return [Math.cos(angle) * dist, Math.sin(angle) * dist];
}

function getNeighborTiles(tiles, tile, isBlocked) {
  const neighbors = [];
  for (const s of SIDES) {
    const { tile: nb, dist } = nearestTile(
      tiles, tile.x + s.neighbor[0], tile.y + s.neighbor[1]
    );
    if (nb && dist < 0.1 && !isBlocked(nb)) neighbors.push(nb);
  }
  return neighbors;
}

function advancePath(creature, dt) {
  let budget = creature.speed * dt;
  while (budget > 0 && creature.path.length > 0) {
    const wp = creature.path[0];
    const dx = wp.x - creature.x, dy = wp.y - creature.y;
    const d  = Math.hypot(dx, dy);
    if (d <= budget || d === 0) {
      creature.x = wp.x; creature.y = wp.y;
      budget -= d;
      creature.path.shift();
      if (wp.tile) creature.tile = wp.tile;
    } else {
      creature.x += (dx / d) * budget;
      creature.y += (dy / d) * budget;
      budget = 0;
    }
  }
}

export class Chicken {
  constructor(tile) {
    this.kind    = 'chicken';
    this.tile    = tile;
    const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
    this.x       = tile.x + ox;
    this.y       = tile.y + oy;
    this.health  = CHICKEN_HP;
    this.state   = 'natural';
    this.speed   = CHICKEN_SPEED;
    this.path    = [];
    this.evade   = CHICKEN_EVADE;
    this.hitAnim = null;
  }

  get alive() { return this.health > 0; }

  tick(tiles, isBlocked, _character) {
    if (this.path.length > 0) return;
    if (this.state === 'flee') {
      this.state = 'natural';
      this.speed = CHICKEN_SPEED;
    }

    let moved = false;
    if (Math.random() < CHICKEN_MOVE_CHANCE) {
      const neighbors = getNeighborTiles(tiles, this.tile, isBlocked);
      if (neighbors.length) {
        const target = neighbors[Math.floor(Math.random() * neighbors.length)];
        const wp = findPath(tiles, this.tile, target, isBlocked);
        if (wp) {
          const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
          wp.push({ x: target.x + ox, y: target.y + oy });
          this.path = wp;
          moved = true;
        }
      }
    }

    if (!moved && Math.random() < CREATURE_DRIFT_CHANCE) {
      const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
      this.path = [{ x: this.tile.x + ox, y: this.tile.y + oy }];
    }

    if (this.tile.apples > 0 && Math.random() < CHICKEN_EAT_CHANCE) {
      this.tile.apples--;
      if (this.tile.apples === 0) this.tile.ticksToApple = APPLE_GROW_TICKS;
    }
  }

  takeDamage(dmg, refDmg) {
    this.health = Math.max(0, this.health - dmg);
    this.hitAnim = { t: 0, opacity: Math.min(1, dmg / refDmg) };
  }

  onHit(tiles, isBlocked, _character) {
    if (!this.alive) return;
    this.state = 'flee';
    this.speed = CHICKEN_FLEE_SPEED;
    this.path  = [];

    let t = this.tile;
    for (let i = 0; i < CHICKEN_FLEE_TILES; i++) {
      const nb = getNeighborTiles(tiles, t, isBlocked);
      if (!nb.length) break;
      t = nb[Math.floor(Math.random() * nb.length)];
    }
    if (t !== this.tile) {
      const wp = findPath(tiles, this.tile, t, isBlocked);
      if (wp) {
        const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
        wp.push({ x: t.x + ox, y: t.y + oy });
        this.path = wp;
      }
    }
  }

  update(dt, _character) {
    if (this.hitAnim) {
      this.hitAnim.t += dt;
      if (this.hitAnim.t >= HIT_ANIM_SECS) this.hitAnim = null;
    }
    advancePath(this, dt);
  }

  serialize() {
    return { kind: 'chicken', col: this.tile.col, row: this.tile.row, health: this.health };
  }
}

export class Hog {
  constructor(tile) {
    this.kind     = 'hog';
    this.tile     = tile;
    const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
    this.x        = tile.x + ox;
    this.y        = tile.y + oy;
    this.health   = HOG_HP;
    this.state    = 'natural';
    this.speed    = HOG_SPEED_NATURAL;
    this.path     = [];
    this.evade    = 0;
    this.hitAnim  = null;
    this.atkTimer = 0;
  }

  get alive() { return this.health > 0; }

  tick(tiles, isBlocked, character) {
    const dist = Math.hypot(character.x - this.x, character.y - this.y);

    if (this.state === 'aggro') {
      if (dist > HOG_DISENGAGE_DIST) {
        this.state = 'natural';
        this.speed = HOG_SPEED_NATURAL;
        this.path  = [];
      } else if (this.path.length === 0) {
        const { tile: charTile } = nearestTile(tiles, character.x, character.y);
        if (charTile && charTile !== this.tile) {
          const wp = findPath(tiles, this.tile, charTile, isBlocked);
          if (wp) {
            const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
            wp.push({ x: charTile.x + ox, y: charTile.y + oy });
            this.path = wp;
          }
        } else if (Math.random() < CREATURE_DRIFT_CHANCE) {
          const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
          this.path = [{ x: this.tile.x + ox, y: this.tile.y + oy }];
        }
      }
    } else {
      if (dist <= HOG_DETECT_DIST && Math.random() < HOG_AGGRO_CHANCE) {
        this.state = 'aggro';
        this.speed = HOG_SPEED_AGGRO;
        this.path  = [];
        return;
      }

      if (this.path.length === 0 && Math.random() < HOG_MOVE_CHANCE) {
        const neighbors = getNeighborTiles(tiles, this.tile, isBlocked);
        if (neighbors.length) {
          const weighted = [];
          for (const nb of neighbors) {
            weighted.push(nb);
            if (nb.apples > 0) weighted.push(nb);
          }
          const target = weighted[Math.floor(Math.random() * weighted.length)];
          const wp = findPath(tiles, this.tile, target, isBlocked);
          if (wp) {
            const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
            wp.push({ x: target.x + ox, y: target.y + oy });
            this.path = wp;
          }
        }
      }

      if (this.path.length === 0 && Math.random() < CREATURE_DRIFT_CHANCE) {
        const [ox, oy] = randSubTile(CREATURE_DRIFT_RADIUS);
        this.path = [{ x: this.tile.x + ox, y: this.tile.y + oy }];
      }

      if (this.tile.apples > 0 && Math.random() < HOG_EAT_CHANCE) {
        this.tile.apples--;
        if (this.tile.apples === 0) this.tile.ticksToApple = APPLE_GROW_TICKS;
      }
    }
  }

  takeDamage(dmg, refDmg) {
    this.health = Math.max(0, this.health - dmg);
    this.hitAnim = { t: 0, opacity: Math.min(1, dmg / refDmg) };
  }

  onHit(_tiles, _isBlocked, _character) {}

  update(dt, character) {
    if (this.hitAnim) {
      this.hitAnim.t += dt;
      if (this.hitAnim.t >= HIT_ANIM_SECS) this.hitAnim = null;
    }

    advancePath(this, dt);

    if (this.state === 'aggro' && this.alive) {
      this.atkTimer -= dt;
      if (this.atkTimer <= 0) {
        this.atkTimer = HOG_ATK_INTERVAL;
        const d = Math.hypot(character.x - this.x, character.y - this.y);
        if (d <= HOG_ATK_RANGE) {
          const variance = (Math.random() * 2 - 1) * HOG_ATK_VAR;
          const dmg = Math.max(0, Math.round(HOG_ATK_DMG + variance));
          character.takeDamage(dmg, HOG_ATK_DMG * 1.5);
        }
      }
    }
  }

  serialize() {
    return { kind: 'hog', col: this.tile.col, row: this.tile.row, health: this.health };
  }
}

export function spawnCreatures(tiles, isBlocked) {
  const cands = tiles.filter(t => !isBlocked(t));
  const used  = new Set();
  const out   = [];

  const pick = () => {
    const avail = cands.filter(t => !used.has(t));
    if (!avail.length) return null;
    const tile = avail[Math.floor(Math.random() * avail.length)];
    used.add(tile);
    return tile;
  };

  for (let i = 0; i < CHICKEN_SPAWN_COUNT; i++) {
    const tile = pick();
    if (tile) out.push(new Chicken(tile));
  }
  for (let i = 0; i < HOG_SPAWN_COUNT; i++) {
    const tile = pick();
    if (tile) out.push(new Hog(tile));
  }

  return out;
}

export function deserializeCreatures(data, tiles) {
  const map = new Map(tiles.map(t => [t.col + ',' + t.row, t]));
  return data.map(d => {
    const tile = map.get(d.col + ',' + d.row);
    if (!tile) return null;
    if (d.kind === 'hog') {
      const h = new Hog(tile);
      h.health = d.health;
      return h;
    }
    const c = new Chicken(tile);
    c.health = d.health;
    return c;
  }).filter(Boolean);
}
