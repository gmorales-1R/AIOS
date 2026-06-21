"""Generates the Swarms hex-game into games/swarms/files/.

Emits a modular front-end:
  files/game.html
  files/css/style.css
  files/js/{config,hex,camera,pathfind,inventory,world,character,save,ui,input,render,game}.js

Run from anywhere:  python games/swarms/code/generate_game.py
"""

from pathlib import Path

FILES = Path(__file__).parent.parent / "files"

# --------------------------------------------------------------------------- #
# HTML
# --------------------------------------------------------------------------- #
HTML = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Swarms</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <canvas id="game"></canvas>

  <!-- Start screen -->
  <div id="start-screen" class="screen">
    <h1 class="game-title">SWARMS</h1>
    <div class="menu">
      <button class="menu-btn" id="btn-new-game">New Game</button>
      <button class="menu-btn" id="btn-continue" disabled>Continue</button>
      <button class="menu-btn" disabled>Options</button>
      <button class="menu-btn" disabled>Tutorial</button>
    </div>
  </div>

  <!-- Pause screen -->
  <div id="pause-screen" class="screen hidden">
    <div class="menu">
      <p class="screen-label">PAUSED</p>
      <button class="menu-btn" id="btn-resume">Resume</button>
      <button class="menu-btn" id="btn-save">Save Game</button>
      <button class="menu-btn" id="btn-back-menu">Back to Menu</button>
    </div>
  </div>

  <!-- Confirm dialog -->
  <div id="confirm-screen" class="screen hidden">
    <div class="dialog">
      <p class="dialog-msg">Unsaved progress will be lost.<br>Return to main menu?</p>
      <div class="dialog-btns">
        <button class="menu-btn warn" id="btn-confirm-yes">Leave</button>
        <button class="menu-btn"      id="btn-confirm-no">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Save toast -->
  <div id="save-toast" class="toast hidden"></div>

  <!-- In-game hamburger toggle (hidden on start screen) -->
  <button id="btn-menu-toggle" class="hud-btn hidden">&#9776;</button>

  <!-- Inventory bar (hidden until game starts) -->
  <div id="action-bar" class="hidden">
    <div id="inv-slots">
      <div class="inv-slot" data-slot="0"><span class="slot-num">1</span></div>
      <div class="inv-slot" data-slot="1"><span class="slot-num">2</span></div>
      <div class="inv-slot" data-slot="2"><span class="slot-num">3</span></div>
      <div class="inv-slot" data-slot="3"><span class="slot-num">4</span></div>
      <div class="inv-slot" data-slot="4"><span class="slot-num">5</span></div>
    </div>
  </div>

  <!-- Action column — right side vertical strip (hidden until game starts) -->
  <div id="action-column" class="hidden">
    <button class="action-btn" id="act-melee"    disabled>M</button>
    <button class="action-btn" id="act-defend"   disabled>D</button>
    <button class="action-btn" id="act-range"    disabled>R</button>
    <button class="action-btn" id="act-interact" disabled>U</button>
  </div>

  <script type="module" src="js/game.js"></script>
</body>
</html>
"""

# --------------------------------------------------------------------------- #
# CSS
# --------------------------------------------------------------------------- #
CSS = """\
* { margin: 0; padding: 0; box-sizing: border-box; user-select: none; -webkit-user-select: none; }

html, body {
  width: 100%; height: 100%;
  overflow: hidden;
  background: #0a0a0f;
}

#game {
  display: block;
  touch-action: none;
}

/* ---- screens ---- */
.screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.90);
  z-index: 20;
}
.screen.hidden { display: none; }

.game-title {
  font-family: monospace;
  font-size: clamp(2.2rem, 8vw, 4rem);
  color: #33ff6a;
  letter-spacing: 0.25em;
  margin-bottom: 2.4rem;
  text-shadow: 0 0 28px #33ff6a55;
}

.screen-label {
  font-family: monospace;
  font-size: 1.1rem;
  color: #33ff6a66;
  letter-spacing: 0.35em;
  margin-bottom: 1.4rem;
}

/* ---- menus ---- */
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.menu-btn {
  font-family: monospace;
  font-size: 1rem;
  background: transparent;
  border: 1px solid #33ff6a;
  color: #33ff6a;
  padding: 0.55em 0;
  min-width: 220px;
  cursor: pointer;
  letter-spacing: 0.08em;
  transition: background 0.12s, color 0.12s;
}
.menu-btn:hover:not(:disabled) {
  background: #33ff6a1a;
  color: #7fffaa;
}
.menu-btn:disabled {
  border-color: #33ff6a2a;
  color: #33ff6a2a;
  cursor: default;
}
.menu-btn.warn {
  border-color: #ff5555;
  color: #ff5555;
}
.menu-btn.warn:hover:not(:disabled) {
  background: #ff55551a;
  color: #ff8888;
}

/* ---- confirm dialog ---- */
.dialog {
  border: 1px solid #33ff6a33;
  padding: 2rem 2.5rem;
  background: rgba(0,0,0,0.6);
  text-align: center;
  max-width: 340px;
}
.dialog-msg {
  font-family: monospace;
  font-size: 0.95rem;
  color: #aaffcc;
  line-height: 1.7;
  margin-bottom: 1.4rem;
}
.dialog-btns {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.dialog-btns .menu-btn { min-width: 110px; }

/* ---- in-game HUD button ---- */
.hud-btn {
  position: fixed;
  top: 12px; right: 14px;
  font-size: 1.1rem;
  background: rgba(0,0,0,0.55);
  border: 1px solid #33ff6a55;
  color: #33ff6a;
  padding: 0.25em 0.55em;
  cursor: pointer;
  z-index: 15;
  font-family: monospace;
  transition: background 0.12s;
}
.hud-btn:hover { background: rgba(51,255,106,0.1); }
.hud-btn.hidden { display: none; }

/* ---- inventory bar (bottom, slots only) ---- */
#action-bar {
  position: fixed;
  bottom: 0; left: 0;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.82);
  border-top: 1px solid #33ff6a22;
  border-right: 1px solid #33ff6a22;
  z-index: 10;
}
#action-bar.hidden { display: none; }

#inv-slots {
  display: flex;
  gap: 5px;
}

.inv-slot {
  position: relative;
  width:  clamp(36px, 10vw, 48px);
  height: clamp(36px, 10vw, 48px);
  border: 1px solid #33ff6a33;
  background: rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  cursor: default;
}
.inv-slot.filled   { border-color: #33ff6a88; cursor: pointer; }
.inv-slot.equipped { border-color: #ffe600; box-shadow: 0 0 7px #ffe60055; cursor: pointer; }

.slot-num {
  position: absolute;
  top: 2px; left: 4px;
  font-family: monospace;
  font-size: 0.6rem;
  color: #33ff6a33;
  line-height: 1;
  pointer-events: none;
  z-index: 1;
}

/* item icon wrapper inside each slot */
.slot-icon {
  position: absolute;
  inset: 5px;
  pointer-events: none;
}
.slot-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* apple stack count badge */
.slot-count {
  position: absolute;
  bottom: 2px; right: 3px;
  font-family: monospace;
  font-size: clamp(0.55rem, 2vw, 0.7rem);
  color: #fff;
  line-height: 1;
  pointer-events: none;
  text-shadow: 0 1px 3px #000;
  z-index: 2;
}

/* ---- action column (right side, vertical) ---- */
#action-column {
  position: fixed;
  right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.82);
  border-top: 1px solid #33ff6a22;
  border-left: 1px solid #33ff6a22;
  z-index: 11;
}
#action-column.hidden { display: none; }

.action-btn {
  width:  clamp(36px, 10vw, 48px);
  height: clamp(36px, 10vw, 48px);
  font-family: monospace;
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  font-weight: bold;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #33ff6a;
  color: #33ff6a;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  flex-shrink: 0;
}
.action-btn:hover:not(:disabled) {
  background: rgba(51, 255, 106, 0.12);
  color: #7fffaa;
}
.action-btn:disabled {
  border-color: #33ff6a22;
  color: #33ff6a22;
  cursor: default;
}

/* ---- save toast (top-center, clear of all UI) ---- */
.toast {
  position: fixed;
  top: 52px; left: 50%;
  transform: translateX(-50%);
  font-family: monospace;
  font-size: 0.8rem;
  color: #33ff6a;
  background: rgba(0,0,0,0.72);
  border: 1px solid #33ff6a33;
  padding: 0.35em 1em;
  z-index: 30;
  transition: opacity 0.5s;
  white-space: nowrap;
}
.toast.hidden  { display: none; }
.toast.fading  { opacity: 0; }
"""

# --------------------------------------------------------------------------- #
# JS: config.js
# --------------------------------------------------------------------------- #
CONFIG_JS = """\
export const COLS = 20;
export const ROWS = 12;

export const SIDE        = 1;
export const SQRT3       = Math.sqrt(3);
export const HEX_W       = SQRT3 * SIDE;
export const HEX_H       = 2 * SIDE;
export const COL_SPACING = SQRT3 * SIDE;
export const ROW_SPACING = 1.5 * SIDE;

export const CHAR_RADIUS      = 0.42 * SIDE;
export const MOVE_SPEED       = 5.5;
export const TILE_HUNGER_COST = 1;

export const HEALTH_MAX  = 100;
export const HUNGER_MAX  = 100;
export const TICK_HUNGER = 1;
export const STARVE_DMG  = 5;
export const HEAL_RATE   = 1;
export const HEAL_THRESH = 60;

export const TREE_DENSITY      = 0.18;
export const APPLE_GROW_TICKS  = 15;
export const APPLE_MAX         = 3;
export const APPLE_HUNGER_GAIN = 15;
export const APPLE_HEALTH_GAIN = 5;
export const APPLE_STACK_MAX   = 10;

export const ATK_DMG_BASE    = 2;
export const ATK_DMG_SWORD   = 5;
export const ATK_ANIM_SECS   = 0.38;
export const ATK_RANGE_FIST  = 1.5;
export const ATK_RANGE_SWORD = 2.0;
export const ATK_ACC_FIST    = 0;
export const ATK_ACC_SWORD   = 0.10;
export const HIT_ANIM_SECS   = 0.45;

export const CHICKEN_HP          = 8;
export const CHICKEN_EVADE       = 0.20;
export const CHICKEN_SPAWN_COUNT = 5;
export const CHICKEN_MOVE_CHANCE = 0.30;
export const CHICKEN_EAT_CHANCE  = 0.50;

export const ZOOM_MIN       = 0.3;
export const ZOOM_MAX       = 5;
export const FIT_HEXES      = 6;
export const FOLLOW_LERP    = 0.12;
export const AUTO_SAVE_SECS = 300;

export const COLORS = {
  page:          '#0a0a0f',
  tileFill:      '#000000',
  tileBorder:    '#33ff6a',
  treeFill:      '#152a1e',
  targetActive:  '#ffe600',
  targetBad:     '#ff3333',
  apple:         '#e83a2a',
  appleEdge:     '#7a1a10',
  character:     '#2f6bff',
  characterEdge: '#bcd4ff',
  hudHealth:     '#e84040',
  hudHunger:     '#e8a040',
  hudBg:         '#1a1a22',
  waterFill:     '#0d1f2d',
  waterBorder:   '#1a4060',
  sword:         '#c8c8e8',
  swordEdge:     '#ffffff',
  atkRing:       '#ffe600',
  atkRingAlt:    '#33ff6a',
  hitRing:       '#ff4040',
  chicken:       '#f0f0f0',
  chickenEdge:   '#888888',
};
"""

# --------------------------------------------------------------------------- #
# JS: hex.js
# --------------------------------------------------------------------------- #
HEX_JS = """\
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
"""

# --------------------------------------------------------------------------- #
# JS: camera.js
# --------------------------------------------------------------------------- #
CAMERA_JS = """\
import { HEX_W, FIT_HEXES, ZOOM_MIN, ZOOM_MAX, FOLLOW_LERP } from './config.js';

export class Camera {
  constructor() {
    this.x = 0; this.y = 0; this.z = 1;
    this.viewW = 1; this.viewH = 1;
    this.baseScale = 1;
    this.tx = 0; this.ty = 0; this.tz = 1;
    this.animating = false;
  }

  setViewport(w, h) {
    this.viewW = w; this.viewH = h;
    this.baseScale = Math.min(w, h) / (FIT_HEXES * HEX_W);
  }

  get ppu() { return this.baseScale * this.z; }

  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.ppu + this.viewW / 2,
      y: (wy - this.y) * this.ppu + this.viewH / 2,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewW / 2) / this.ppu + this.x,
      y: (sy - this.viewH / 2) / this.ppu + this.y,
    };
  }

  panByPixels(dx, dy) {
    this.x -= dx / this.ppu;
    this.y -= dy / this.ppu;
    this.stopFollow();
  }

  zoomAt(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.z * factor));
    this.x = before.x - (sx - this.viewW / 2) / this.ppu;
    this.y = before.y - (sy - this.viewH / 2) / this.ppu;
    this.stopFollow();
  }

  focusOn({ x, y, z } = {}) {
    if (x !== undefined) this.tx = x;
    if (y !== undefined) this.ty = y;
    this.tz = (z !== undefined) ? z : this.z;
    this.animating = true;
  }

  stopFollow() {
    this.animating = false;
    this.tx = this.x; this.ty = this.y; this.tz = this.z;
  }

  update() {
    if (!this.animating) return;
    this.x += (this.tx - this.x) * FOLLOW_LERP;
    this.y += (this.ty - this.y) * FOLLOW_LERP;
    this.z += (this.tz - this.z) * FOLLOW_LERP;
    if (Math.abs(this.tx - this.x) < 1e-3 &&
        Math.abs(this.ty - this.y) < 1e-3 &&
        Math.abs(this.tz - this.z) < 1e-4) {
      this.x = this.tx; this.y = this.ty; this.z = this.tz;
      this.animating = false;
    }
  }

  serialize() {
    return { x: this.x, y: this.y, z: this.z };
  }

  deserialize(d) {
    this.x = this.tx = d.x;
    this.y = this.ty = d.y;
    this.z = this.tz = d.z;
    this.animating = false;
  }
}
"""

# --------------------------------------------------------------------------- #
# JS: pathfind.js
# --------------------------------------------------------------------------- #
PATHFIND_JS = """\
import { SIDES, nearestTile } from './hex.js';

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

    const dir    = { x: target.x - cur.x, y: target.y - cur.y };
    const ranked = SIDES
      .map((s, i) => ({ i, dot: s.normal[0] * dir.x + s.normal[1] * dir.y }))
      .sort((a, b) => b.dot - a.dot);

    let advanced = false;
    for (const { i } of ranked) {
      if (t.has(i))            continue;
      if (t.size >= MAX_TRIES) break;
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
    wps.push({ x: b.x, y: b.y, tile: b });
  }
  return wps;
}
"""

# --------------------------------------------------------------------------- #
# JS: inventory.js
# --------------------------------------------------------------------------- #
INVENTORY_JS = """\
import {
  APPLE_STACK_MAX, APPLE_HUNGER_GAIN, APPLE_HEALTH_GAIN,
  HEALTH_MAX, HUNGER_MAX,
  ATK_DMG_BASE, ATK_DMG_SWORD,
  ATK_RANGE_FIST, ATK_RANGE_SWORD,
  ATK_ACC_FIST, ATK_ACC_SWORD,
} from './config.js';

export function createInventory() {
  return { slots: Array(5).fill(null) };
}

// Returns the index of the single apple stack, or the first empty slot for a new one.
// Returns -1 if the existing stack is full (no second stack is ever created).
function appleSlotIdx(inv) {
  const existing = inv.slots.findIndex(s => s && s.type === 'apple');
  if (existing !== -1) {
    return inv.slots[existing].count < APPLE_STACK_MAX ? existing : -1;
  }
  return inv.slots.findIndex(s => !s);
}

export function canPickupApple(inv) { return appleSlotIdx(inv) !== -1; }

export function addApple(inv) {
  const i = appleSlotIdx(inv);
  if (i === -1) return false;
  if (!inv.slots[i]) inv.slots[i] = { type: 'apple', count: 0 };
  inv.slots[i].count++;
  return true;
}

// Consume one apple from slot i; apply effects to character. Returns true on success.
export function consumeApple(inv, i, char) {
  const s = inv.slots[i];
  if (!s || s.type !== 'apple' || s.count <= 0) return false;
  char.hunger = Math.min(HUNGER_MAX, char.hunger + APPLE_HUNGER_GAIN);
  char.health = Math.min(HEALTH_MAX, char.health + APPLE_HEALTH_GAIN);
  s.count--;
  if (s.count === 0) inv.slots[i] = null;
  return true;
}

export function hasSword(inv) {
  return inv.slots.some(s => s && s.type === 'sword');
}

export function addSword(inv) {
  const i = inv.slots.findIndex(s => !s);
  if (i === -1) return false;
  inv.slots[i] = { type: 'sword', equipped: false };
  return true;
}

// Toggle equip on the sword at slot i. Unequips all other weapons first.
export function toggleEquip(inv, i) {
  const s = inv.slots[i];
  if (!s || s.type !== 'sword') return;
  const equipping = !s.equipped;
  for (const slot of inv.slots) {
    if (slot && slot.type === 'sword') slot.equipped = false;
  }
  s.equipped = equipping;
}

export function getMeleeDmg(inv) {
  return inv.slots.some(s => s && s.type === 'sword' && s.equipped)
    ? ATK_DMG_SWORD : ATK_DMG_BASE;
}

export function serializeInventory(inv) {
  return inv.slots.map(s => (s ? { ...s } : null));
}

export function deserializeInventory(data) {
  const inv = createInventory();
  for (let i = 0; i < data.length && i < inv.slots.length; i++) {
    inv.slots[i] = data[i] ? { ...data[i] } : null;
  }
  return inv;
}

// Returns { dmg, range, acc } for the currently equipped melee weapon.
export function getMeleeStats(inv) {
  const armed = inv.slots.some(s => s && s.type === 'sword' && s.equipped);
  return armed
    ? { dmg: ATK_DMG_SWORD, range: ATK_RANGE_SWORD, acc: ATK_ACC_SWORD }
    : { dmg: ATK_DMG_BASE,  range: ATK_RANGE_FIST,  acc: ATK_ACC_FIST  };
}
"""

# --------------------------------------------------------------------------- #
# JS: creatures.js
# --------------------------------------------------------------------------- #
CREATURES_JS = """\
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
"""

# --------------------------------------------------------------------------- #
# JS: world.js
# --------------------------------------------------------------------------- #
WORLD_JS = """\
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

export function initWorld(tiles) {
  for (const t of tiles) {
    t.water = false; t.tree = false;
    t.apples = 0; t.ticksToApple = 0;
    t.hasSword = false;
  }
  generateWater(tiles);
  for (const t of tiles) {
    if (t.water) continue;
    t.tree         = Math.random() < TREE_DENSITY;
    t.ticksToApple = t.tree ? Math.ceil(Math.random() * APPLE_GROW_TICKS) : 0;
  }
  spawnSword(tiles);
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
    .filter(t => t.water || t.tree || t.hasSword)
    .map(t => ({
      col: t.col, row: t.row,
      water: !!t.water, tree: !!t.tree,
      apples: t.apples || 0, ticksToApple: t.ticksToApple || 0,
      hasSword: !!t.hasSword,
    }));
}

export function deserializeTiles(tiles, data) {
  for (const t of tiles) {
    t.water = false; t.tree = false;
    t.apples = 0; t.ticksToApple = 0;
    t.hasSword = false;
  }
  const tileMap = new Map(tiles.map(t => [t.col + ',' + t.row, t]));
  for (const d of data) {
    const t = tileMap.get(d.col + ',' + d.row);
    if (!t) continue;
    t.water = !!d.water; t.tree = !!d.tree;
    t.apples = d.apples || 0; t.ticksToApple = d.ticksToApple || 0;
    t.hasSword = !!d.hasSword;
  }
}
"""

# --------------------------------------------------------------------------- #
# JS: character.js
# --------------------------------------------------------------------------- #
CHARACTER_JS = """\
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
"""

# --------------------------------------------------------------------------- #
# JS: save.js
# --------------------------------------------------------------------------- #
SAVE_JS = """\
const PREFIX    = 'sw_save_';
const IDX_KEY   = 'sw_idx';
const MAX_SAVES = 3;
const SAVE_VER  = 1;

function store(key, val) {
  try { localStorage.setItem(key, val); return; } catch {}
  try { sessionStorage.setItem(key, val); return; } catch {}
  document.cookie =
    encodeURIComponent(key) + '=' + encodeURIComponent(val) +
    ';max-age=' + (365 * 86400) + ';path=/';
}

function retrieve(key) {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch {}
  try {
    const v = sessionStorage.getItem(key);
    if (v !== null) return v;
  } catch {}
  const enc  = encodeURIComponent(key) + '=';
  const part = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(enc));
  return part ? decodeURIComponent(part.slice(enc.length)) : null;
}

function erase(key) {
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
  document.cookie = encodeURIComponent(key) + '=;max-age=0;path=/';
}

function loadIndex() {
  const raw = retrieve(IDX_KEY);
  return raw ? JSON.parse(raw) : [];
}
function storeIndex(idx) { store(IDX_KEY, JSON.stringify(idx)); }

export function saveGame(state) {
  let idx = loadIndex();
  let key;

  if (idx.length < MAX_SAVES) {
    key = PREFIX + Date.now();
  } else {
    idx.sort((a, b) => a.savedAt - b.savedAt);
    key = idx[0].key;
    erase(key);
    idx.shift();
  }

  const savedAt = Date.now();
  store(key, JSON.stringify({ ...state, savedAt, version: SAVE_VER }));
  idx.push({ key, savedAt });
  storeIndex(idx);
  return savedAt;
}

export function loadLatestSave() {
  const idx = loadIndex();
  if (!idx.length) return null;
  idx.sort((a, b) => b.savedAt - a.savedAt);
  const raw = retrieve(idx[0].key);
  return raw ? JSON.parse(raw) : null;
}

export function hasSaves() { return loadIndex().length > 0; }
"""

# --------------------------------------------------------------------------- #
# JS: ui.js
# --------------------------------------------------------------------------- #
UI_JS = """\
export class UI {
  constructor() {
    this._start   = document.getElementById('start-screen');
    this._pause   = document.getElementById('pause-screen');
    this._confirm = document.getElementById('confirm-screen');
    this._toggle  = document.getElementById('btn-menu-toggle');
    this._toast   = document.getElementById('save-toast');
    this._toastId = null;
  }

  bind({ onNewGame, onContinue, onResume, onSave, onBackMenu, onToggle, onAttack, onInteract }) {
    document.getElementById('btn-new-game').onclick  = onNewGame;
    document.getElementById('btn-continue').onclick  = onContinue;
    document.getElementById('btn-resume').onclick    = onResume;
    document.getElementById('btn-save').onclick      = onSave;
    document.getElementById('btn-back-menu').onclick = onBackMenu;
    this._toggle.onclick = onToggle;
    if (onAttack)   document.getElementById('act-melee').onclick    = onAttack;
    if (onInteract) document.getElementById('act-interact').onclick = onInteract;
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') onToggle();
    });
  }

  // Wire click handlers for inventory slots.
  bindInventory(onSlotClick) {
    document.querySelectorAll('.inv-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        onSlotClick(parseInt(slot.dataset.slot, 10));
      });
    });
  }

  showStart(hasSave) {
    document.getElementById('btn-continue').disabled = !hasSave;
    this._show(this._start);
    this._hide(this._pause);
    this._hide(this._confirm);
    this._hide(this._toggle);
  }

  hideStart() {
    this._hide(this._start);
    this._show(this._toggle);
  }

  showPause() {
    this._show(this._pause);
    this._hide(this._confirm);
  }

  hidePause() {
    this._hide(this._pause);
    this._hide(this._confirm);
  }

  showConfirm(onYes) {
    this._show(this._confirm);
    document.getElementById('btn-confirm-yes').onclick = () => {
      this._hide(this._confirm);
      onYes();
    };
    document.getElementById('btn-confirm-no').onclick = () => {
      this._hide(this._confirm);
    };
  }

  isConfirmVisible() {
    return !this._confirm.classList.contains('hidden');
  }

  hideConfirm() { this._hide(this._confirm); }

  showActionBar() {
    this._show(document.getElementById('action-bar'));
    this._show(document.getElementById('action-column'));
  }
  hideActionBar() {
    this._hide(document.getElementById('action-bar'));
    this._hide(document.getElementById('action-column'));
  }

  setActionEnabled(id, enabled) {
    const btn = document.getElementById('act-' + id);
    if (btn) btn.disabled = !enabled;
  }

  // Render an inventory slot. item: null | { type:'apple', count } | { type:'sword', equipped }
  setSlot(index, item) {
    const slot = document.querySelector(`.inv-slot[data-slot="${index}"]`);
    if (!slot) return;

    slot.querySelector('.slot-icon')?.remove();
    slot.querySelector('.slot-count')?.remove();
    slot.classList.remove('filled', 'equipped');

    if (!item) return;

    slot.classList.add('filled');
    const icon = document.createElement('div');
    icon.className = 'slot-icon';

    if (item.type === 'apple') {
      icon.innerHTML =
        '<svg viewBox="-1 -1 2 2" class="slot-svg" xmlns="http://www.w3.org/2000/svg">' +
        '<circle r="0.82" fill="#e83a2a" stroke="#7a1a10" stroke-width="0.14"/>' +
        '</svg>';
      const cnt = document.createElement('span');
      cnt.className = 'slot-count';
      cnt.textContent = item.count;
      slot.appendChild(cnt);
    } else if (item.type === 'sword') {
      icon.innerHTML =
        '<svg viewBox="-1 -1 2 2" class="slot-svg" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="-0.13" y="-0.9" width="0.26" height="1.8" fill="#c8c8e8" stroke="#fff" stroke-width="0.04"/>' +
        '<rect x="-0.65" y="-0.14" width="1.3" height="0.28" fill="#c8c8e8" stroke="#fff" stroke-width="0.04"/>' +
        '</svg>';
      if (item.equipped) slot.classList.add('equipped');
    }

    slot.appendChild(icon);
  }

  toast(msg) {
    clearTimeout(this._toastId);
    this._toast.textContent = msg;
    this._toast.classList.remove('hidden', 'fading');
    this._toastId = setTimeout(() => {
      this._toast.classList.add('fading');
      setTimeout(() => this._toast.classList.add('hidden'), 500);
    }, 1800);
  }

  _show(el) { el.classList.remove('hidden'); }
  _hide(el) { el.classList.add('hidden'); }
}
"""

# --------------------------------------------------------------------------- #
# JS: input.js
# --------------------------------------------------------------------------- #
INPUT_JS = """\
export function setupInput(canvas, camera, { onTap }) {
  const pointers = new Map();
  let mode = 'none';
  let last = null, downPos = null, moved = 0, pinchPrev = 0;

  const rel = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, rel(e));
    if (pointers.size === 1) {
      mode = 'drag'; moved = 0;
      last = rel(e); downPos = rel(e);
    } else if (pointers.size === 2) {
      mode = 'pinch'; pinchPrev = pinchDist();
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, rel(e));
    if (mode === 'drag' && pointers.size === 1) {
      const p = rel(e);
      const dx = p.x - last.x, dy = p.y - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      camera.panByPixels(dx, dy);
      last = p;
    } else if (mode === 'pinch' && pointers.size === 2) {
      const d = pinchDist(), c = pinchCenter();
      if (pinchPrev > 0) camera.zoomAt(c.x, c.y, d / pinchPrev);
      pinchPrev = d;
    }
  });

  const end = (e) => {
    pointers.delete(e.pointerId);
    if (mode === 'drag' && moved < 8 && downPos) {
      const w = camera.screenToWorld(downPos.x, downPos.y);
      onTap(w.x, w.y);
    }
    if (pointers.size === 0) {
      mode = 'none';
    } else if (pointers.size === 1) {
      mode = 'drag'; last = [...pointers.values()][0]; moved = 999;
    }
  };
  canvas.addEventListener('pointerup',     end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.zoomAt(
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
      Math.exp(-e.deltaY * 0.0015)
    );
  }, { passive: false });

  function pinchDist() {
    const v = [...pointers.values()];
    return Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
  }
  function pinchCenter() {
    const v = [...pointers.values()];
    return { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 };
  }
}
"""

# --------------------------------------------------------------------------- #
# JS: render.js
# --------------------------------------------------------------------------- #
RENDER_JS = """\
import { CORNERS } from './hex.js';
import { COLORS, CHAR_RADIUS, SIDE, HEX_H, ATK_ANIM_SECS, HIT_ANIM_SECS } from './config.js';

const grassImg = new Image();
grassImg.src = '../assets/tiles/grass.png';

const APPLE_POS = [
  [[0, 0]],
  [[-0.22, 0], [0.22, 0]],
  [[0, -0.28], [-0.22, 0.13], [0.22, 0.13]],
];
const APPLE_R = CHAR_RADIUS / 3;

// Shared expanding-ring hit flash (red). opacity is the peak alpha.
function drawHitRing(ctx, x, y, anim, ppu) {
  const progress = anim.t / HIT_ANIM_SECS;
  ctx.save();
  ctx.globalAlpha = anim.opacity * (1 - progress);
  ctx.beginPath();
  ctx.arc(x, y, (CHAR_RADIUS * 1.15 + SIDE * 1.3 * progress) * ppu, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.hitRing;
  ctx.lineWidth   = Math.max(1.5, (0.18 - 0.10 * progress) * ppu);
  ctx.stroke();
  ctx.restore();
}

export function render(ctx, camera, tiles, character, creatures) {
  const { viewW, viewH } = camera;
  const ppu    = camera.ppu;
  const margin = ppu * 2;

  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, viewW, viewH);

  for (const t of tiles) {
    const c = camera.worldToScreen(t.x, t.y);
    if (c.x < -margin || c.x > viewW + margin ||
        c.y < -margin || c.y > viewH + margin) continue;

    const isTarget = t === character.targetTile;
    let borderColor = t.water ? COLORS.waterBorder : COLORS.tileBorder;
    let lineWidth   = Math.max(1, 0.04 * ppu);
    if (isTarget) {
      borderColor = character.targetState === 'unreachable'
        ? COLORS.targetBad : COLORS.targetActive;
      lineWidth = Math.max(1.5, 0.08 * ppu);
    }

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const px = c.x + CORNERS[i][0] * ppu;
      const py = c.y + CORNERS[i][1] * ppu;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle   = t.water ? COLORS.waterFill
                    : t.tree  ? COLORS.treeFill
                    : COLORS.tileFill;
    ctx.fill();

    // Grass texture on plain tiles — clip to hex, draw image, restore clip.
    if (!t.water && !t.tree && grassImg.complete && grassImg.naturalWidth) {
      ctx.save();
      ctx.clip();
      const s = HEX_H * ppu;
      ctx.drawImage(grassImg, c.x - s / 2, c.y - s / 2, s, s);
      ctx.restore();
    }

    ctx.lineWidth   = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Apples on tree tiles
    if (t.apples > 0 && !t.water) {
      const positions = APPLE_POS[t.apples - 1];
      for (const [ox, oy] of positions) {
        ctx.beginPath();
        ctx.arc(c.x + ox * ppu, c.y + oy * ppu, APPLE_R * ppu, 0, Math.PI * 2);
        ctx.fillStyle   = COLORS.apple;
        ctx.fill();
        ctx.lineWidth   = Math.max(0.5, 0.025 * ppu);
        ctx.strokeStyle = COLORS.appleEdge;
        ctx.stroke();
      }
    }

    // Sword on ground (two rectangles forming a cross)
    if (t.hasSword) {
      const hw = 0.09 * ppu;   // half arm width
      const hl = 0.42 * ppu;   // half blade length
      const gl = 0.30 * ppu;   // half guard length
      ctx.fillStyle   = COLORS.sword;
      ctx.strokeStyle = COLORS.swordEdge;
      ctx.lineWidth   = Math.max(0.5, 0.018 * ppu);
      // blade (vertical)
      ctx.fillRect(c.x - hw, c.y - hl, hw * 2, hl * 2);
      ctx.strokeRect(c.x - hw, c.y - hl, hw * 2, hl * 2);
      // guard (horizontal, offset slightly upward)
      ctx.fillRect(c.x - gl, c.y - hw * 1.2, gl * 2, hw * 2.4);
      ctx.strokeRect(c.x - gl, c.y - hw * 1.2, gl * 2, hw * 2.4);
    }
  }

  // Creatures — draw before character so player is always on top.
  if (creatures) {
    for (const c of creatures) {
      const cc = camera.worldToScreen(c.x, c.y);
      if (cc.x < -margin || cc.x > viewW + margin ||
          cc.y < -margin || cc.y > viewH + margin) continue;
      if (c.alive) {
        const hs = CHAR_RADIUS * 0.85 * ppu;
        ctx.fillStyle   = COLORS.chicken;
        ctx.fillRect(cc.x - hs, cc.y - hs, hs * 2, hs * 2);
        ctx.strokeStyle = COLORS.chickenEdge;
        ctx.lineWidth   = Math.max(0.5, 0.04 * ppu);
        ctx.strokeRect(cc.x - hs, cc.y - hs, hs * 2, hs * 2);
      }
      if (c.hitAnim) drawHitRing(ctx, cc.x, cc.y, c.hitAnim, ppu);
    }
  }

  // Attack animation ring (drawn behind character)
  const cc = camera.worldToScreen(character.x, character.y);
  if (character.atkAnim) {
    const prog  = character.atkAnim.t / ATK_ANIM_SECS;
    const r     = (CHAR_RADIUS * 1.15 + SIDE * 1.3 * prog) * ppu;
    const lw    = Math.max(1.5, (0.18 - 0.10 * prog) * ppu);
    const alpha = (1 - prog) * 0.80;
    const color = character.atkAnim.armed ? COLORS.atkRing : COLORS.atkRingAlt;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(cc.x, cc.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.stroke();
    ctx.restore();
  }

  // Character
  ctx.beginPath();
  ctx.arc(cc.x, cc.y, CHAR_RADIUS * ppu, 0, Math.PI * 2);
  ctx.fillStyle   = COLORS.character;
  ctx.fill();
  ctx.lineWidth   = Math.max(1, 0.05 * ppu);
  ctx.strokeStyle = COLORS.characterEdge;
  ctx.stroke();

  // Character damage flash (drawn on top of circle)
  if (character.hitAnim) drawHitRing(ctx, cc.x, cc.y, character.hitAnim, ppu);

  renderHUD(ctx, character);
}

function renderHUD(ctx, char) {
  const M = 14, BW = 100, BH = 10, G = 7;
  ctx.font = 'bold 11px monospace';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(M + 18, M, BW, BH);
  ctx.fillStyle = COLORS.hudHealth;
  ctx.fillRect(M + 18, M, BW * char.health / 100, BH);
  ctx.fillStyle = '#ff9090';
  ctx.fillText('\\u2665', M + 2, M + BH / 2);

  const hy = M + BH + G;
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(M + 18, hy, BW, BH);
  ctx.fillStyle = COLORS.hudHunger;
  ctx.fillRect(M + 18, hy, BW * char.hunger / 100, BH);
  ctx.fillStyle = '#ffd090';
  ctx.fillText('\\u25C9', M + 2, hy + BH / 2);
}
"""

# --------------------------------------------------------------------------- #
# JS: game.js
# --------------------------------------------------------------------------- #
GAME_JS = """\
import { generateGrid, nearestTile, tileCenter, boardCenter } from './hex.js';
import { Camera } from './camera.js';
import { Character } from './character.js';
import { setupInput } from './input.js';
import { render } from './render.js';
import {
  initWorld, tickWorld, pickApple,
  serializeTiles, deserializeTiles,
} from './world.js';
import {
  createInventory, addApple, canPickupApple, consumeApple,
  addSword, hasSword, toggleEquip,
  getMeleeStats, serializeInventory, deserializeInventory,
} from './inventory.js';
import {
  spawnChickens, deserializeChickens,
} from './creatures.js';
import { saveGame, loadLatestSave, hasSaves } from './save.js';
import { UI } from './ui.js';
import {
  COLS, AUTO_SAVE_SECS, CHICKEN_EVADE, CHICKEN_SPAWN_COUNT,
} from './config.js';

const canvas    = document.getElementById('game');
const ctx       = canvas.getContext('2d');
const camera    = new Camera();
const tiles     = generateGrid();
const character = new Character(0, 0);
const ui        = new UI();

// Pre-populate tiles so there's a pretty background on the start screen.
initWorld(tiles);

let gameState     = 'menu';
let tickAccum     = 0;
let autoSaveAccum = 0;
let lastSaveTime  = 0;
let currentTile   = null;
let inventory     = createInventory();
let creatures     = [];

// Track which tile the character is standing on.
character.onTileEnter = (tile) => {
  currentTile = tile;
  updateActionBar();
};

// ---- inventory UI sync ----
function updateInventoryUI() {
  for (let i = 0; i < inventory.slots.length; i++) {
    ui.setSlot(i, inventory.slots[i]);
  }
}

// ---- action bar state ----
function updateActionBar() {
  ui.setActionEnabled('melee', gameState === 'playing');
  ui.setActionEnabled('defend', false);
  ui.setActionEnabled('range',  false);

  const canUse = gameState === 'playing' && !!currentTile && (
    (currentTile.hasSword && !hasSword(inventory)) ||
    (currentTile.apples > 0 && canPickupApple(inventory))
  );
  ui.setActionEnabled('interact', !!canUse);
}

// ---- actions ----
function doAttack() {
  if (gameState !== 'playing') return;
  const stats  = getMeleeStats(inventory);
  const armed  = stats.acc > 0;
  character.startAttack(armed);

  const refDmg = stats.dmg * 1.5;   // opacity reference: 1.0 at this value
  for (const cr of creatures) {
    if (!cr.alive) continue;
    const dist = Math.hypot(cr.x - character.x, cr.y - character.y);
    if (dist > stats.range) continue;
    // accuracy factor: uniform in [1-acc, 1+acc]; 0 variance for fists
    const accFactor = stats.acc > 0
      ? 1 + (Math.random() * 2 - 1) * stats.acc
      : 1;
    const finalDmg = Math.max(0, Math.floor(stats.dmg * accFactor * (1 - CHICKEN_EVADE)));
    cr.takeDamage(finalDmg, refDmg);
  }
}

function doUse() {
  if (gameState !== 'playing' || !currentTile) return;
  if (currentTile.hasSword && !hasSword(inventory)) {
    currentTile.hasSword = false;
    addSword(inventory);
    updateInventoryUI();
    updateActionBar();
  } else if (currentTile.apples > 0 && canPickupApple(inventory)) {
    pickApple(currentTile);
    addApple(inventory);
    updateInventoryUI();
    updateActionBar();
  }
}

// ---- save/load helpers ----
function doSave(label = '\\u25CF SAVED') {
  const savedAt = saveGame({
    character: character.serialize(),
    camera:    camera.serialize(),
    tiles:     serializeTiles(tiles),
    inventory: serializeInventory(inventory),
    creatures: creatures.filter(c => c.alive).map(c => c.serialize()),
    tickAccum,
  });
  lastSaveTime = savedAt;
  ui.toast(label);
}

// ---- state transitions ----
function startNew() {
  inventory = createInventory();
  const s = tileCenter((COLS / 2) | 0, 0);
  character.reset(s.x, s.y);
  initWorld(tiles);
  creatures = spawnChickens(tiles, isBlocked, CHICKEN_SPAWN_COUNT);
  camera.deserialize({ ...boardCenter(), z: 1 });
  tickAccum = 0; autoSaveAccum = 0; lastSaveTime = 0;
  const { tile: startTile } = nearestTile(tiles, s.x, s.y);
  currentTile = startTile;
  gameState = 'playing';
  ui.hideStart();
  ui.showActionBar();
  updateInventoryUI();
  updateActionBar();
}

function doContinue() {
  const save = loadLatestSave();
  if (!save) return;
  character.deserialize(save.character);
  camera.deserialize(save.camera);
  deserializeTiles(tiles, save.tiles);
  inventory     = save.inventory ? deserializeInventory(save.inventory) : createInventory();
  creatures     = save.creatures ? deserializeChickens(save.creatures, tiles)
                                 : spawnChickens(tiles, isBlocked, CHICKEN_SPAWN_COUNT);
  tickAccum     = save.tickAccum || 0;
  lastSaveTime  = save.savedAt;
  autoSaveAccum = 0;
  const { tile: startTile } = nearestTile(tiles, character.x, character.y);
  currentTile = startTile;
  gameState = 'playing';
  ui.hideStart();
  ui.showActionBar();
  updateInventoryUI();
  updateActionBar();
}

function togglePause() {
  if (gameState === 'menu') return;
  if (ui.isConfirmVisible()) { ui.hideConfirm(); return; }
  if (gameState === 'playing') {
    gameState = 'paused';
    ui.showPause();
  } else {
    gameState = 'playing';
    ui.hidePause();
  }
}

function backToMenu() {
  const stale = lastSaveTime === 0 || (Date.now() - lastSaveTime) > 30_000;
  const toMenu = () => {
    gameState   = 'menu';
    currentTile = null;
    ui.hidePause();
    ui.hideActionBar();
    ui.showStart(hasSaves());
  };
  if (stale) {
    ui.showConfirm(toMenu);
  } else {
    toMenu();
  }
}

// ---- setup ----
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  canvas.width  = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  camera.setViewport(w, h);
}
window.addEventListener('resize', resize);
resize();

camera.deserialize({ ...boardCenter(), z: 1 });

const isBlocked = (tile) => !!tile.water;

setupInput(canvas, camera, {
  onTap(wx, wy) {
    if (gameState !== 'playing') return;
    const { tile } = nearestTile(tiles, wx, wy);
    if (tile) character.setDestination(tiles, tile, isBlocked);
  },
});

ui.bind({
  onNewGame:  startNew,
  onContinue: doContinue,
  onResume:   togglePause,
  onSave:     () => doSave(),
  onBackMenu: backToMenu,
  onToggle:   togglePause,
  onAttack:   doAttack,
  onInteract: doUse,
});

ui.bindInventory((idx) => {
  if (gameState !== 'playing') return;
  const slot = inventory.slots[idx];
  if (!slot) return;
  if (slot.type === 'apple') {
    if (consumeApple(inventory, idx, character)) updateInventoryUI();
  } else if (slot.type === 'sword') {
    toggleEquip(inventory, idx);
    updateInventoryUI();
  }
});

ui.showStart(hasSaves());

// ---- main loop ----
let prev = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;

  if (gameState === 'playing') {
    tickAccum     += dt;
    autoSaveAccum += dt;

    while (tickAccum >= 1.0) {
      tickAccum -= 1.0;
      character.onTick();
      tickWorld(tiles);
      for (const c of creatures) c.tick(tiles, isBlocked);
      updateActionBar();   // apples may have grown on currentTile
    }

    if (autoSaveAccum >= AUTO_SAVE_SECS) {
      autoSaveAccum -= AUTO_SAVE_SECS;
      doSave('\\u25CF AUTO-SAVED');
    }

    character.update(dt);
    for (const c of creatures) c.update(dt);
    // Remove dead creatures once their hit flash finishes.
    for (let i = creatures.length - 1; i >= 0; i--) {
      if (!creatures[i].alive && !creatures[i].hitAnim) creatures.splice(i, 1);
    }
    if (character.moving) camera.focusOn({ x: character.x, y: character.y });
  }

  camera.update();
  render(ctx, camera, tiles, character, creatures);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
"""

# --------------------------------------------------------------------------- #
# Write everything
# --------------------------------------------------------------------------- #
JS_FILES = {
    "config.js":    CONFIG_JS,
    "hex.js":       HEX_JS,
    "camera.js":    CAMERA_JS,
    "pathfind.js":  PATHFIND_JS,
    "inventory.js": INVENTORY_JS,
    "creatures.js": CREATURES_JS,
    "world.js":     WORLD_JS,
    "character.js": CHARACTER_JS,
    "save.js":      SAVE_JS,
    "ui.js":        UI_JS,
    "input.js":     INPUT_JS,
    "render.js":    RENDER_JS,
    "game.js":      GAME_JS,
}


def main():
    (FILES / "js").mkdir(parents=True, exist_ok=True)
    (FILES / "css").mkdir(parents=True, exist_ok=True)

    written = []
    (FILES / "game.html").write_text(HTML)
    written.append(FILES / "game.html")

    (FILES / "css" / "style.css").write_text(CSS)
    written.append(FILES / "css" / "style.css")

    for name, content in JS_FILES.items():
        path = FILES / "js" / name
        path.write_text(content)
        written.append(path)

    for p in written:
        print(f"Written: {p}")


if __name__ == "__main__":
    main()
