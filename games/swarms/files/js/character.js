import { nearestTile } from './hex.js';
import { findPath } from './pathfind.js';
import {
  MOVE_SPEED, TILE_HUNGER_COST,
  HEALTH_MAX, HUNGER_MAX,
  TICK_HUNGER, STARVE_DMG, HEAL_RATE, HEAL_THRESH,
  ATK_ANIM_SECS, ATK_ANIM_SECS_SWORD, HIT_ANIM_SECS,
  SHIELD_BLOCK_BASE, SHIELD_BLOCK_VAR, SHIELD_DURATION, SHIELD_COOLDOWN,
} from './config.js';

export class Character {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.path        = [];
    this.targetTile  = null;
    this.targetState = null;
    this.health      = HEALTH_MAX;
    this.hunger      = HUNGER_MAX;
    this.onTileEnter         = null;
    this.atkAnim             = null;   // { t, armed } while animating
    this.hitAnim             = null;   // { t, opacity } while damage flash plays
    this.shieldActive        = false;
    this.shieldTimer         = 0;
    this.shieldCooldown      = 0;
    this.shieldEffectiveness = 0;
    this.bowCooldown         = 0;
  }

  get moving() { return this.path.length > 0; }

  reset(x, y) {
    this.x = x; this.y = y;
    this.path = []; this.targetTile = null; this.targetState = null;
    this.health = HEALTH_MAX; this.hunger = HUNGER_MAX;
    this.atkAnim = null; this.hitAnim = null;
    this.shieldActive = false; this.shieldTimer = 0;
    this.shieldCooldown = 0; this.shieldEffectiveness = 0;
    this.bowCooldown = 0;
  }

  startAttack(armed = false, range = 1.5) {
    const duration = armed ? ATK_ANIM_SECS_SWORD : ATK_ANIM_SECS;
    this.atkAnim = { t: 0, armed, range, duration };
  }

  // Returns false if shield is already active or on cooldown.
  startDefend(effectiveness = 0) {
    if (this.shieldActive || this.shieldCooldown > 0) return false;
    this.shieldActive        = true;
    this.shieldTimer         = SHIELD_DURATION;
    this.shieldEffectiveness = effectiveness;
    return true;
  }

  // dmg: final calculated damage; refDmg: baseDmg*1.5 scale reference for opacity.
  takeDamage(dmg, refDmg) {
    let effective = dmg;
    if (this.shieldActive) {
      const reduction = Math.min(1,
        SHIELD_BLOCK_BASE + this.shieldEffectiveness +
        (Math.random() * 2 - 1) * SHIELD_BLOCK_VAR
      );
      effective = Math.max(0, Math.round(dmg * (1 - reduction)));
    }
    this.health  = Math.max(0, this.health - effective);
    this.hitAnim = { t: 0, opacity: Math.min(1, effective / refDmg) };
  }

  serialize() {
    return {
      x: this.x, y: this.y, health: this.health, hunger: this.hunger,
      shieldCooldown: this.shieldCooldown, bowCooldown: this.bowCooldown,
    };
  }

  deserialize(d) {
    this.x = d.x; this.y = d.y;
    this.health = d.health; this.hunger = d.hunger;
    this.path = []; this.targetTile = null; this.targetState = null;
    this.atkAnim = null; this.hitAnim = null;
    this.shieldActive = false; this.shieldTimer = 0;
    this.shieldCooldown = d.shieldCooldown || 0; this.shieldEffectiveness = 0;
    this.bowCooldown = d.bowCooldown || 0;
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
    // Shield timers.
    if (this.shieldActive) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
        this.shieldCooldown = SHIELD_COOLDOWN;
      }
    }
    if (this.shieldCooldown > 0) {
      this.shieldCooldown = Math.max(0, this.shieldCooldown - dt);
    }
    if (this.bowCooldown > 0) {
      this.bowCooldown = Math.max(0, this.bowCooldown - dt);
    }

    // Advance attack and hit animations.
    if (this.atkAnim) {
      this.atkAnim.t += dt;
      if (this.atkAnim.t >= this.atkAnim.duration) this.atkAnim = null;
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
