import { generateGrid, nearestTile, tileCenter, boardCenter } from './hex.js';
import { Camera } from './camera.js';
import { Character } from './character.js';
import { setupInput } from './input.js';
import { render } from './render.js';
import { initWorld, tickWorld, collectApples } from './world.js';
import { COLS, APPLE_HUNGER_GAIN, APPLE_HEALTH_GAIN, HEALTH_MAX, HUNGER_MAX } from './config.js';

const canvas    = document.getElementById('game');
const ctx       = canvas.getContext('2d');
const camera    = new Camera();
const tiles     = generateGrid();
initWorld(tiles);

const start     = tileCenter((COLS / 2) | 0, 0);
const character = new Character(start.x, start.y);

// Collect apples when the character steps onto a tile that has them.
character.onTileEnter = (tile) => {
  if (!tile.apples) return;
  const n = tile.apples;
  collectApples(tile);
  character.hunger = Math.min(HUNGER_MAX, character.hunger + n * APPLE_HUNGER_GAIN);
  character.health = Math.min(HEALTH_MAX, character.health + n * APPLE_HEALTH_GAIN);
};

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w   = window.innerWidth, h = window.innerHeight;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  camera.setViewport(w, h);
}
window.addEventListener('resize', resize);
resize();

const bc = boardCenter();
camera.x = bc.x; camera.y = bc.y; camera.z = 1;
camera.stopFollow();

setupInput(canvas, camera, {
  onTap(wx, wy) {
    const { tile } = nearestTile(tiles, wx, wy);
    if (tile) character.setDestination(tiles, tile);
  },
});

let prev      = performance.now();
let tickAccum = 0;

function onTick() {
  character.onTick();
  tickWorld(tiles);
}

function loop(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;

  tickAccum += dt;
  while (tickAccum >= 1.0) {
    tickAccum -= 1.0;
    onTick();
  }

  character.update(dt);
  if (character.moving) camera.focusOn({ x: character.x, y: character.y });
  camera.update();

  render(ctx, camera, tiles, character);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
