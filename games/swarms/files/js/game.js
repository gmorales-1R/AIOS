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
  addSword, hasSword, toggleEquip, getMeleeDmg,
  serializeInventory, deserializeInventory,
} from './inventory.js';
import { saveGame, loadLatestSave, hasSaves } from './save.js';
import { UI } from './ui.js';
import { COLS, AUTO_SAVE_SECS } from './config.js';

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
  const armed = inventory.slots.some(s => s && s.type === 'sword' && s.equipped);
  character.startAttack(armed);
  // dmg = getMeleeDmg(inventory)  — applied to enemies when combat lands
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
function doSave(label = '\u25CF SAVED') {
  const savedAt = saveGame({
    character: character.serialize(),
    camera:    camera.serialize(),
    tiles:     serializeTiles(tiles),
    inventory: serializeInventory(inventory),
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
      updateActionBar();   // apples may have grown on currentTile
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
