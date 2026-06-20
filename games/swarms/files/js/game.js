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
function doSave(label = '\u25CF SAVED') {
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
// Check current game state and enable/disable action buttons accordingly.
// All stub-disabled for now; wire up when combat/interaction systems land.
function updateActionBar() {
  ui.setActionEnabled('melee',    false);
  ui.setActionEnabled('defend',   false);
  ui.setActionEnabled('range',    false);
  ui.setActionEnabled('interact', false);
}

function startNew() {
  const s = tileCenter((COLS / 2) | 0, 0);
  character.reset(s.x, s.y);
  initWorld(tiles);
  camera.deserialize({ ...boardCenter(), z: 1 });
  tickAccum = 0; autoSaveAccum = 0; lastSaveTime = 0;
  gameState = 'playing';
  ui.hideStart();
  ui.showActionBar();
  updateActionBar();
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
  ui.showActionBar();
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
    gameState = 'menu';
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

// Centre the background camera on the start screen.
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
      doSave('\u25CF AUTO-SAVED');
    }

    character.update(dt);
    if (character.moving) camera.focusOn({ x: character.x, y: character.y });
  }

  camera.update();
  render(ctx, camera, tiles, character);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
