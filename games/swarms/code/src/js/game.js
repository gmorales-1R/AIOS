import { generateGrid, nearestTile, boardCenter } from './hex.js';
import { Camera } from './camera.js';
import { Character } from './character.js';
import { setupInput } from './input.js';
import { render, resetPatterns } from './render.js';
import {
  initWorld, tickWorld, pickApple,
  serializeTiles, deserializeTiles,
} from './world.js';
import {
  createInventory, addApple, canPickupApple, consumeApple,
  addSword, hasSword, addShield, hasShield, getShieldEffectiveness, toggleEquip,
  getMeleeStats, serializeInventory, deserializeInventory,
} from './inventory.js';
import {
  spawnCreatures, deserializeCreatures,
} from './creatures.js';
import { saveGame, loadLatestSave, hasSaves } from './save.js';
import { UI } from './ui.js';
import {
  COLS, AUTO_SAVE_SECS, SIDE, SHIELD_DURATION, SHIELD_COOLDOWN,
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
  const playing = gameState === 'playing';
  ui.setActionEnabled('melee', playing);
  const shieldOn = inventory.slots.some(s => s && s.type === 'shield' && s.equipped);
  ui.setActionEnabled('defend', playing && shieldOn && !character.shieldActive && character.shieldCooldown <= 0);
  ui.setActionEnabled('range',  false);

  const canUse = playing && !!currentTile && (
    (currentTile.hasSword  && !hasSword(inventory))  ||
    (currentTile.hasShield && !hasShield(inventory)) ||
    (currentTile.apples > 0 && canPickupApple(inventory))
  );
  ui.setActionEnabled('interact', !!canUse);
}

// ---- actions ----
function doAttack() {
  if (gameState !== 'playing') return;
  const stats  = getMeleeStats(inventory);
  const armed  = stats.acc > 0;
  character.startAttack(armed, stats.range);

  const refDmg = stats.dmg * 1.5;   // opacity reference: 1.0 at this value
  for (const cr of creatures) {
    if (!cr.alive) continue;
    const dist = Math.hypot(cr.x - character.x, cr.y - character.y);
    if (dist > stats.range) continue;
    // accuracy factor: uniform in [1-acc, 1+acc]; 0 variance for fists
    const accFactor = stats.acc > 0
      ? 1 + (Math.random() * 2 - 1) * stats.acc
      : 1;
    const finalDmg = Math.max(0, Math.floor(stats.dmg * accFactor * (1 - cr.evade)));
    cr.takeDamage(finalDmg, refDmg);
    if (cr.alive) cr.onHit(tiles, isBlocked, character);
  }
}

function doDefend() {
  if (gameState !== 'playing') return;
  if (!inventory.slots.some(s => s && s.type === 'shield' && s.equipped)) return;
  if (character.startDefend(getShieldEffectiveness(inventory))) updateActionBar();
}

function doUse() {
  if (gameState !== 'playing' || !currentTile) return;
  if (currentTile.hasSword && !hasSword(inventory)) {
    currentTile.hasSword = false;
    addSword(inventory);
    const i = inventory.slots.findIndex(s => s && s.type === 'sword');
    if (i !== -1) toggleEquip(inventory, i);   // auto-equip: was empty-handed
    updateInventoryUI();
    updateActionBar();
  } else if (currentTile.hasShield && !hasShield(inventory)) {
    currentTile.hasShield = false;
    addShield(inventory);
    const i = inventory.slots.findIndex(s => s && s.type === 'shield');
    if (i !== -1) toggleEquip(inventory, i);   // auto-equip: had no shield
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
    creatures: creatures.filter(c => c.alive).map(c => c.serialize()),
    tickAccum,
  });
  lastSaveTime = savedAt;
  ui.toast(label);
}

// ---- state transitions ----
function startNew() {
  inventory = createInventory();
  initWorld(tiles);  // must run first so water tiles are known before picking spawn
  const passable   = tiles.filter(t => !isBlocked(t));
  const spawnTile  = passable[Math.floor(Math.random() * passable.length)];
  character.reset(spawnTile.x, spawnTile.y);
  creatures = spawnCreatures(tiles, isBlocked);
  camera.deserialize({ ...boardCenter(), z: 1 });
  tickAccum = 0; autoSaveAccum = 0; lastSaveTime = 0;
  currentTile = spawnTile;
  gameState = 'playing';
  ui.hideStart();
  ui.hideDead();
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
  creatures     = save.creatures ? deserializeCreatures(save.creatures, tiles)
                                 : spawnCreatures(tiles, isBlocked);
  tickAccum     = save.tickAccum || 0;
  lastSaveTime  = save.savedAt;
  autoSaveAccum = 0;
  const { tile: startTile } = nearestTile(tiles, character.x, character.y);
  currentTile = startTile;
  gameState = 'playing';
  ui.hideStart();
  ui.hideDead();
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

function goToMenu() {
  gameState   = 'menu';
  currentTile = null;
  ui.hidePause();
  ui.hideDead();
  ui.hideActionBar();
  ui.showStart(hasSaves());
}

function backToMenu() {
  const stale = lastSaveTime === 0 || (Date.now() - lastSaveTime) > 30_000;
  if (stale) {
    ui.showConfirm(goToMenu);
  } else {
    goToMenu();
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
  resetPatterns(); // canvas.width resets context state; patterns must be recreated
}
window.addEventListener('resize', resize);
resize();

camera.deserialize({ ...boardCenter(), z: 1 });

const isBlocked = (tile) => !!tile.water;

// Dead zones match the actual footprint of each UI bar.
// Inventory bar: bottom-left (5 slots × 48px + gaps + padding ≈ 290×70px)
// Action column: bottom-right (4 buttons × 48px + gaps + padding ≈ 70×230px)
const DEAD_BAR_H = 70;
const DEAD_BAR_W = 290;
const DEAD_COL_W = 70;
const DEAD_COL_H = 230;

setupInput(canvas, camera, {
  onTap(wx, wy, sx, sy) {
    if (gameState !== 'playing') return;
    if (sy > camera.viewH - DEAD_BAR_H && sx < DEAD_BAR_W) return;
    if (sx > camera.viewW - DEAD_COL_W && sy > camera.viewH - DEAD_COL_H) return;
    const { tile, dist } = nearestTile(tiles, wx, wy);
    if (!tile || dist > SIDE) return;
    character.setDestination(tiles, tile, isBlocked);
  },
});

ui.bind({
  onNewGame:    startNew,
  onContinue:   doContinue,
  onResume:     togglePause,
  onSave:       () => doSave(),
  onBackMenu:   backToMenu,
  onToggle:     togglePause,
  onAttack:     doAttack,
  onDefend:     doDefend,
  onInteract:   doUse,
  onReloadSave: doContinue,
  onDeadNewGame: startNew,
  onDeadMenu:   goToMenu,
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
      for (const c of creatures) c.tick(tiles, isBlocked, character);
      updateActionBar();   // apples may have grown on currentTile
    }

    if (autoSaveAccum >= AUTO_SAVE_SECS) {
      autoSaveAccum -= AUTO_SAVE_SECS;
      doSave('\u25CF AUTO-SAVED');
    }

    const wasShielded = character.shieldActive;
    character.update(dt);
    if (wasShielded && !character.shieldActive) updateActionBar();
    for (const c of creatures) c.update(dt, character);
    // Remove dead creatures once their hit flash finishes.
    for (let i = creatures.length - 1; i >= 0; i--) {
      if (!creatures[i].alive && !creatures[i].hitAnim) creatures.splice(i, 1);
    }
    if (character.moving) camera.focusOn({ x: character.x, y: character.y });

    if (character.health <= 0) {
      gameState = 'dead';
      character.path = [];
      ui.hideActionBar();
      ui.showDead(hasSaves());
    }
  }

  // Slot timer arcs (always run so paused state stays accurate).
  const shieldIdx = inventory.slots.findIndex(s => s && s.type === 'shield');
  if (shieldIdx !== -1) {
    ui.updateSlotTimer(shieldIdx, {
      active:   character.shieldActive
        ? { remaining: character.shieldTimer,   total: SHIELD_DURATION } : null,
      cooldown: !character.shieldActive && character.shieldCooldown > 0
        ? { remaining: character.shieldCooldown, total: SHIELD_COOLDOWN } : null,
    });
  }

  camera.update();
  render(ctx, camera, tiles, character, creatures);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
