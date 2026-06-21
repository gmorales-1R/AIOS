import { nearestTile } from './hex.js';
import { findPath } from './pathfind.js';
import {
  MOVE_SPEED, TILE_HUNGER_COST,
  HEALTH_MAX, HUNGER_MAX,
  TICK_HUNGER, STARVE_DMG, HEAL_RATE, HEAL_THRESH,
  ATK_ANIM_SECS, HIT_ANIM_SECS,
} from './config.js';

export class Character {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.path        = [];
    this.targetTile  = null;
    this.targetState = null;
    this.health      = HEALTH_MAX;
    this.hunger      = HUNGER_MAX;
    this.onTileEnter = null;
    this.atkAnim     = null;   // { t, armed } while animating
    this.hitAnim     = null;   // { t, opacity } while damage flash plays
  }

  get moving() { return this.path.length > 0; }

  reset(x, y) {
    this.x = x; this.y = y;
    this.path = []; this.targetTile = null; this.targetState = null;
    this.health = HEALTH_MAX; this.hunger = HUNGER_MAX;
    this.atkAnim = null; this.hitAnim = null;
  }

  startAttack(armed = false) {
    this.atkAnim = { t: 0, armed };
  }

  // dmg: final calculated damage; refDmg: baseDmg*1.5 scale reference for opacity.
  takeDamage(dmg, refDmg) {
    this.health = Math.max(0, this.health - dmg);
    this.hitAnim = { t: 0, opacity: Math.min(1, dmg / refDmg) };
  }

  serialize() {
    return { x: this.x, y: this.y, health: this.health, hunger: this.hunger };
  }

  deserialize(d) {
    this.x = d.x; this.y = d.y;
    this.health = d.health; this.hunger = d.hunger;
    this.path = []; this.targetTile = null; this.targetState = null;
    this.atkAnim = null; this.hitAnim = null;
  }

  onTick() {
    this.hunger = Math.max(0, this.hunger - TICK_HUNGER);
    if (this.hunger === 0) {
      this.health = Math.max(0, this.health - STARVE_DMG);
    } else if (this.hunger > HEAL_THRESH) {
      this.health = Math.min(HEALTH_MAX, this.health + HEAL_RATE);
    }
  }

  setDestination(tiles, targetTile, isBlocked = () => false) {
    const { tile: start } = nearestTile(tiles, this.x, this.y);
    if (start === targetTile) return;
    const waypoints  = findPath(tiles, start, targetTile, isBlocked);
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
    // Advance attack and hit animations.
    if (this.atkAnim) {
      this.atkAnim.t += dt;
      if (this.atkAnim.t >= ATK_ANIM_SECS) this.atkAnim = null;
    }
    if (this.hitAnim) {
      this.hitAnim.t += dt;
      if (this.hitAnim.t >= HIT_ANIM_SECS) this.hitAnim = null;
    }

    const wasMoving = this.moving;
    let budget = MOVE_SPEED * dt;
    while (budget > 0 && this.path.length > 0) {
      const wp = this.path[0];
      const dx = wp.x - this.x, dy = wp.y - this.y;
      const d  = Math.hypot(dx, dy);
      if (d <= budget || d === 0) {
        this.x = wp.x; this.y = wp.y;
        budget -= d;
        this.path.shift();
        if (wp.tile) {
          this.hunger = Math.max(0, this.hunger - TILE_HUNGER_COST);
          if (this.onTileEnter) this.onTileEnter(wp.tile);
        }
      } else {
        this.x += (dx / d) * budget;
        this.y += (dy / d) * budget;
        budget = 0;
      }
    }
    if (wasMoving && !this.moving) {
      this.targetTile  = null;
      this.targetState = null;
    }
  }
}
