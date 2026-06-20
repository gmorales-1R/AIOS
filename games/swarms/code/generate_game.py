"""Generates the Swarms hex-game into games/swarms/files/.

Emits a modular front-end:
  files/game.html
  files/css/style.css
  files/js/{config,hex,camera,pathfind,world,character,save,ui,input,render,game}.js

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

  <script type="module" src="js/game.js"></script>
</body>
</html>
"""

# --------------------------------------------------------------------------- #
# CSS
# --------------------------------------------------------------------------- #
CSS = """\
* { margin: 0; padding: 0; box-sizing: border-box; }

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

/* ---- save toast ---- */
.toast {
  position: fixed;
  bottom: 20px; right: 18px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #33ff6a;
  background: rgba(0,0,0,0.72);
  border: 1px solid #33ff6a33;
  padding: 0.35em 1em;
  z-index: 30;
  transition: opacity 0.5s;
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

export const ZOOM_MIN         = 0.3;
export const ZOOM_MAX         = 5;
export const FIT_HEXES        = 6;
export const FOLLOW_LERP      = 0.12;
export const AUTO_SAVE_SECS   = 300;   // 5 minutes

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
# JS: world.js
# --------------------------------------------------------------------------- #
WORLD_JS = """\
import { TREE_DENSITY, APPLE_GROW_TICKS, APPLE_MAX } from './config.js';

export function initWorld(tiles) {
  for (const t of tiles) {
    t.tree         = Math.random() < TREE_DENSITY;
    t.apples       = 0;
    t.ticksToApple = t.tree
      ? Math.ceil(Math.random() * APPLE_GROW_TICKS)
      : 0;
  }
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

export function collectApples(tile) {
  tile.apples        = 0;
  tile.ticksToApple  = APPLE_GROW_TICKS;
}

// Only serialize tiles that carry non-default state (tree tiles).
export function serializeTiles(tiles) {
  return tiles
    .filter(t => t.tree)
    .map(t => ({
      col: t.col, row: t.row,
      apples: t.apples, ticksToApple: t.ticksToApple,
    }));
}

export function deserializeTiles(tiles, data) {
  // Reset all, then apply saved state.
  for (const t of tiles) { t.tree = false; t.apples = 0; t.ticksToApple = 0; }
  const tileMap = new Map(tiles.map(t => [t.col + ',' + t.row, t]));
  for (const d of data) {
    const t = tileMap.get(d.col + ',' + d.row);
    if (t) {
      t.tree = true; t.apples = d.apples; t.ticksToApple = d.ticksToApple;
    }
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
  }

  get moving() { return this.path.length > 0; }

  reset(x, y) {
    this.x = x; this.y = y;
    this.path = []; this.targetTile = null; this.targetState = null;
    this.health = HEALTH_MAX; this.hunger = HUNGER_MAX;
  }

  serialize() {
    return { x: this.x, y: this.y, health: this.health, hunger: this.hunger };
  }

  deserialize(d) {
    this.x = d.x; this.y = d.y;
    this.health = d.health; this.hunger = d.hunger;
    this.path = []; this.targetTile = null; this.targetState = null;
  }

  onTick() {
    this.hunger = Math.max(0, this.hunger - TICK_HUNGER);
    if (this.hunger === 0) {
      this.health = Math.max(0, this.health - STARVE_DMG);
    } else if (this.hunger > HEAL_THRESH) {
      this.health = Math.min(HEALTH_MAX, this.health + HEAL_RATE);
    }
  }

  setDestination(tiles, targetTile) {
    const { tile: start } = nearestTile(tiles, this.x, this.y);
    if (start === targetTile) return;
    const waypoints  = findPath(tiles, start, targetTile);
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
# JS: save.js  — serialization + localStorage/cookie/sessionStorage storage
# --------------------------------------------------------------------------- #
SAVE_JS = """\
const PREFIX    = 'sw_save_';
const IDX_KEY   = 'sw_idx';
const MAX_SAVES = 3;
const SAVE_VER  = 1;

// Storage backend: localStorage → sessionStorage → cookies.
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

// Save game state. Returns the savedAt timestamp.
export function saveGame(state) {
  let idx = loadIndex();
  let key;

  if (idx.length < MAX_SAVES) {
    key = PREFIX + Date.now();
  } else {
    // Drop oldest save to make room.
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

// Load the most-recent save. Returns parsed object or null.
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
# JS: ui.js  — DOM screen / toast controller
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

  // Wire all button callbacks in one call.
  bind({ onNewGame, onContinue, onResume, onSave, onBackMenu, onToggle }) {
    document.getElementById('btn-new-game').onclick  = onNewGame;
    document.getElementById('btn-continue').onclick  = onContinue;
    document.getElementById('btn-resume').onclick    = onResume;
    document.getElementById('btn-save').onclick      = onSave;
    document.getElementById('btn-back-menu').onclick = onBackMenu;
    this._toggle.onclick = onToggle;
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') onToggle();
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

  // Show the confirmation dialog. onYes fires if the user confirms.
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

  // Show a toast message that fades after 1.8 s.
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
import { COLORS, CHAR_RADIUS } from './config.js';

const APPLE_POS = [
  [[0, 0]],
  [[-0.22, 0], [0.22, 0]],
  [[0, -0.28], [-0.22, 0.13], [0.22, 0.13]],
];
const APPLE_R = CHAR_RADIUS / 3;

export function render(ctx, camera, tiles, character) {
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
    let borderColor = COLORS.tileBorder;
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
    ctx.fillStyle   = t.tree ? COLORS.treeFill : COLORS.tileFill;
    ctx.fill();
    ctx.lineWidth   = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    if (t.apples > 0) {
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
  }

  const cc = camera.worldToScreen(character.x, character.y);
  ctx.beginPath();
  ctx.arc(cc.x, cc.y, CHAR_RADIUS * ppu, 0, Math.PI * 2);
  ctx.fillStyle   = COLORS.character;
  ctx.fill();
  ctx.lineWidth   = Math.max(1, 0.05 * ppu);
  ctx.strokeStyle = COLORS.characterEdge;
  ctx.stroke();

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
  initWorld, tickWorld, collectApples,
  serializeTiles, deserializeTiles,
} from './world.js';
import { saveGame, loadLatestSave, hasSaves } from './save.js';
import { UI } from './ui.js';
import {
  COLS, APPLE_HUNGER_GAIN, APPLE_HEALTH_GAIN, HEALTH_MAX, HUNGER_MAX,
  AUTO_SAVE_SECS,
} from './config.js';

// ---- core objects (persist across game sessions) ----
const canvas    = document.getElementById('game');
const ctx       = canvas.getContext('2d');
const camera    = new Camera();
const tiles     = generateGrid();
const character = new Character(0, 0);
const ui        = new UI();

// Pre-populate tiles so there's a pretty background on the start screen.
initWorld(tiles);

// ---- game state ----
let gameState     = 'menu';   // 'menu' | 'playing' | 'paused'
let tickAccum     = 0;
let autoSaveAccum = 0;
let lastSaveTime  = 0;        // ms timestamp of last save (0 = never)

// ---- apple collection (set once, reused across sessions) ----
character.onTileEnter = (tile) => {
  if (!tile.apples) return;
  const n = tile.apples;
  collectApples(tile);
  character.hunger = Math.min(HUNGER_MAX, character.hunger + n * APPLE_HUNGER_GAIN);
  character.health = Math.min(HEALTH_MAX, character.health + n * APPLE_HEALTH_GAIN);
};

// ---- save/load helpers ----
function doSave(label = '\\u25CF SAVED') {
  const savedAt = saveGame({
    character: character.serialize(),
    camera:    camera.serialize(),
    tiles:     serializeTiles(tiles),
    tickAccum,
  });
  lastSaveTime = savedAt;
  ui.toast(label);
}

// ---- state transitions ----
function startNew() {
  const s = tileCenter((COLS / 2) | 0, 0);
  character.reset(s.x, s.y);
  initWorld(tiles);
  camera.deserialize({ ...boardCenter(), z: 1 });
  tickAccum = 0; autoSaveAccum = 0; lastSaveTime = 0;
  gameState = 'playing';
  ui.hideStart();
}

function doContinue() {
  const save = loadLatestSave();
  if (!save) return;
  character.deserialize(save.character);
  camera.deserialize(save.camera);
  deserializeTiles(tiles, save.tiles);
  tickAccum     = save.tickAccum || 0;
  lastSaveTime  = save.savedAt;
  autoSaveAccum = 0;
  gameState = 'playing';
  ui.hideStart();
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
  if (stale) {
    ui.showConfirm(() => {
      gameState = 'menu';
      ui.hidePause();
      ui.showStart(hasSaves());
    });
  } else {
    gameState = 'menu';
    ui.hidePause();
    ui.showStart(hasSaves());
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

// Centre the background camera on the start screen.
camera.deserialize({ ...boardCenter(), z: 1 });

setupInput(canvas, camera, {
  onTap(wx, wy) {
    if (gameState !== 'playing') return;
    const { tile } = nearestTile(tiles, wx, wy);
    if (tile) character.setDestination(tiles, tile);
  },
});

ui.bind({
  onNewGame:  startNew,
  onContinue: doContinue,
  onResume:   togglePause,
  onSave:     () => doSave(),
  onBackMenu: backToMenu,
  onToggle:   togglePause,
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
    }

    if (autoSaveAccum >= AUTO_SAVE_SECS) {
      autoSaveAccum -= AUTO_SAVE_SECS;
      doSave('\\u25CF AUTO-SAVED');
    }

    character.update(dt);
    if (character.moving) camera.focusOn({ x: character.x, y: character.y });
  }

  camera.update();
  render(ctx, camera, tiles, character);
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
