"""Generates the Swarms hex-game into games/swarms/files/.

Emits a modular front-end:
  files/game.html
  files/css/style.css
  files/js/{config,hex,camera,character,input,render,game}.js

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
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a0a0f;
}

#game {
  display: block;
  touch-action: none;   /* we handle all pan/zoom gestures ourselves */
}
"""

# --------------------------------------------------------------------------- #
# JS: config.js  — tunable constants, single source of truth
# --------------------------------------------------------------------------- #
CONFIG_JS = """\
// Board dimensions (in tiles).
export const COLS = 20;
export const ROWS = 12;

// Hex geometry. Side length is the base world unit.
export const SIDE = 1;
export const SQRT3 = Math.sqrt(3);
export const HEX_W = SQRT3 * SIDE;      // flat-to-flat width (vertical edges)
export const HEX_H = 2 * SIDE;          // point-to-point height
export const COL_SPACING = SQRT3 * SIDE;
export const ROW_SPACING = 1.5 * SIDE;

// Character.
export const CHAR_RADIUS = 0.42 * SIDE;
export const MOVE_SPEED = 5.5;          // world units per second

// Camera.
export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 5;
export const FIT_HEXES = 6;             // at z=1, ~6 hex widths fit the min screen dim
export const FOLLOW_LERP = 0.12;        // camera focus smoothing per frame

export const COLORS = {
  page: '#0a0a0f',
  tileFill: '#000000',
  tileBorder: '#33ff6a',
  character: '#2f6bff',
  characterEdge: '#bcd4ff',
};
"""

# --------------------------------------------------------------------------- #
# JS: hex.js  — pointy-top geometry + grid helpers (world space, y-down)
# --------------------------------------------------------------------------- #
HEX_JS = """\
import { SIDE, COL_SPACING, ROW_SPACING, COLS, ROWS } from './config.js';

// Pointy-top hexagon: vertical edges on the left & right, points top & bottom.
// y-down world space, circumradius == SIDE.
export const CORNERS = [];
for (let i = 0; i < 6; i++) {
  const a = (-90 + 60 * i) * Math.PI / 180;
  CORNERS.push([SIDE * Math.cos(a), SIDE * Math.sin(a)]);
}

// One entry per edge: midpoint offset (from center), outward unit normal,
// and the offset to the neighbouring tile's center across that edge.
export const SIDES = CORNERS.map((c, i) => {
  const n = CORNERS[(i + 1) % 6];
  const mid = [(c[0] + n[0]) / 2, (c[1] + n[1]) / 2];
  const len = Math.hypot(mid[0], mid[1]) || 1;
  return {
    mid,
    normal: [mid[0] / len, mid[1] / len],
    neighbor: [mid[0] * 2, mid[1] * 2],
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
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const c = tileCenter(col, row);
      tiles.push({ col, row, x: c.x, y: c.y });
    }
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
# JS: camera.js  — reusable focus / pan / zoom system
# --------------------------------------------------------------------------- #
CAMERA_JS = """\
import { HEX_W, FIT_HEXES, ZOOM_MIN, ZOOM_MAX, FOLLOW_LERP } from './config.js';

// Camera holds a world-space center (x, y) and a zoom factor (z).
// Reusable focus: focusOn({x, y, z}) animates toward any point of interest;
// update() lerps each frame. User pan/zoom cancels an active focus.
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

  get ppu() { return this.baseScale * this.z; }   // pixels per world unit

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

  // Zoom while keeping the world point under (sx, sy) fixed on screen.
  zoomAt(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.z * factor));
    this.x = before.x - (sx - this.viewW / 2) / this.ppu;
    this.y = before.y - (sy - this.viewH / 2) / this.ppu;
    this.stopFollow();
  }

  // Smoothly move the camera toward a point of interest. Omit z to keep zoom.
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
}
"""

# --------------------------------------------------------------------------- #
# JS: character.js  — state + "side then center" pathing
# --------------------------------------------------------------------------- #
CHARACTER_JS = """\
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
"""

# --------------------------------------------------------------------------- #
# JS: input.js  — pointer tap, drag-pan, wheel-zoom, two-finger pinch
# --------------------------------------------------------------------------- #
INPUT_JS = """\
// Unified pointer handling. Single pointer drags pan; a click/tap that barely
// moves is treated as a tile selection; two pointers pinch-zoom; wheel zooms.
export function setupInput(canvas, camera, { onTap }) {
  const pointers = new Map();
  let mode = 'none';          // 'none' | 'drag' | 'pinch'
  let last = null;
  let downPos = null;
  let moved = 0;
  let pinchPrev = 0;

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
      mode = 'pinch';
      pinchPrev = pinchDistance();
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
      const d = pinchDistance();
      const c = pinchCenter();
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
      // a finger lingers after a pinch: keep dragging, never treat as a tap
      mode = 'drag';
      last = [...pointers.values()][0];
      moved = 999;
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = rel(e);
    camera.zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });

  function pinchDistance() {
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
# JS: render.js  — canvas drawing
# --------------------------------------------------------------------------- #
RENDER_JS = """\
import { CORNERS } from './hex.js';
import { COLORS, CHAR_RADIUS } from './config.js';

export function render(ctx, camera, tiles, character) {
  const { viewW, viewH } = camera;
  const ppu = camera.ppu;

  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.lineWidth = Math.max(1, 0.04 * ppu);
  ctx.strokeStyle = COLORS.tileBorder;
  ctx.fillStyle = COLORS.tileFill;

  const margin = ppu * 2;
  for (const t of tiles) {
    const c = camera.worldToScreen(t.x, t.y);
    if (c.x < -margin || c.x > viewW + margin ||
        c.y < -margin || c.y > viewH + margin) continue;   // cull offscreen

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const px = c.x + CORNERS[i][0] * ppu;
      const py = c.y + CORNERS[i][1] * ppu;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // character
  const cc = camera.worldToScreen(character.x, character.y);
  ctx.beginPath();
  ctx.arc(cc.x, cc.y, CHAR_RADIUS * ppu, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.character;
  ctx.fill();
  ctx.lineWidth = Math.max(1, 0.05 * ppu);
  ctx.strokeStyle = COLORS.characterEdge;
  ctx.stroke();
}
"""

# --------------------------------------------------------------------------- #
# JS: game.js  — wiring + main loop
# --------------------------------------------------------------------------- #
GAME_JS = """\
import { generateGrid, nearestTile, tileCenter, boardCenter } from './hex.js';
import { Camera } from './camera.js';
import { Character } from './character.js';
import { setupInput } from './input.js';
import { render } from './render.js';
import { COLS, ROWS } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const camera = new Camera();
const tiles = generateGrid();

const start = tileCenter((COLS / 2) | 0, (ROWS / 2) | 0);
const character = new Character(start.x, start.y);

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  camera.setViewport(w, h);
}
window.addEventListener('resize', resize);
resize();

// Start centered on the board at default zoom.
const bc = boardCenter();
camera.x = bc.x; camera.y = bc.y; camera.z = 1;
camera.stopFollow();

setupInput(canvas, camera, {
  onTap(wx, wy) {
    const { tile } = nearestTile(tiles, wx, wy);
    if (tile) character.setDestination(tiles, tile);
  },
});

let prev = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;

  character.update(dt);
  if (character.moving) camera.focusOn({ x: character.x, y: character.y });
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
    "config.js": CONFIG_JS,
    "hex.js": HEX_JS,
    "camera.js": CAMERA_JS,
    "character.js": CHARACTER_JS,
    "input.js": INPUT_JS,
    "render.js": RENDER_JS,
    "game.js": GAME_JS,
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
