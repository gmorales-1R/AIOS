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
  getMeleeStats, hasBow, addBow, getBowEquipped,
  serializeInventory, deserializeInventory,
} from './inventory.js';
import {
  spawnCreatures, deserializeCreatures,
} from './creatures.js';
import { saveGame, loadLatestSave, hasSaves } from './save.js';
import { UI } from './ui.js';
import {
  COLS, AUTO_SAVE_SECS, SIDE, SHIELD_DURATION, SHIELD_COOLDOWN,
  BOW_DMG_MIN, BOW_DMG_MAX, BOW_RANGE_MIN, BOW_RANGE_MAX,
  BOW_CHARGE_SECS, BOW_COOLDOWN, ARROW_SPEED, CHAR_RADIUS,
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

// ---- bow state ----
let bowMode = false;
let bowAim  = { down: false, charge: 0, wx: 0, wy: 0, history: [] };
let arrows  = [];

// ---- day/night cycle ----
let dayTime = 0;   // real seconds, 0-180 (120 day + 60 night)

// Track which tile the character is standing on.
character.onTileEnter = (tile) => {
  currentTile = tile;
  autoPickup(tile);
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
  const bowOn = getBowEquipped(inventory);
  ui.setActionEnabled('range', playing && bowOn && !character.moving && character.bowCooldown <= 0);

  const canUse = playing && !!currentTile && (
    (currentTile.hasSword  && !hasSword(inventory))  ||
    (currentTile.hasShield && !hasShield(inventory)) ||
    (currentTile.hasBow    && !hasBow(inventory))    ||
    (currentTile.apples > 0 && canPickupApple(inventory))
  );
  ui.setActionEnabled('interact', !!canUse);
}

// ---- auto pickup ----
function autoPickup(tile) {
  if (gameState !== 'playing' || !tile) return;
  let changed = false;
  if (tile.hasSword && !hasSword(inventory)) {
    tile.hasSword = false;
    addSword(inventory);
    const i = inventory.slots.findIndex(s => s && s.type === 'sword');
    if (i !== -1) toggleEquip(inventory, i);
    changed = true;
  }
  if (tile.hasShield && !hasShield(inventory)) {
    tile.hasShield = false;
    addShield(inventory);
    const i = inventory.slots.findIndex(s => s && s.type === 'shield');
    if (i !== -1) toggleEquip(inventory, i);
    changed = true;
  }
  if (tile.hasBow && !hasBow(inventory)) {
    tile.hasBow = false;
    addBow(inventory);
    const i = inventory.slots.findIndex(s => s && s.type === 'bow');
    if (i !== -1) toggleEquip(inventory, i);
    changed = true;
  }
  while (tile.apples > 0 && canPickupApple(inventory)) {
    pickApple(tile);
    addApple(inventory);
    changed = true;
  }
  if (changed) { updateInventoryUI(); updateActionBar(); }
}

// ---- actions ----
function doAttack() {
  if (gameState !== 'playing') return;
  if (character.atkAnim && character.atkAnim.armed) return;
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

function doRange() {
  if (gameState !== 'playing') return;
  if (!getBowEquipped(inventory)) return;
  if (!bowMode && (character.moving || character.bowCooldown > 0)) return;
  bowMode = !bowMode;
  if (!bowMode) { bowAim.down = false; bowAim.charge = 0; }
  updateActionBar();
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
  } else if (currentTile.hasBow && !hasBow(inventory)) {
    currentTile.hasBow = false;
    addBow(inventory);
    const i = inventory.slots.findIndex(s => s && s.type === 'bow');
    if (i !== -1) toggleEquip(inventory, i);   // auto-equip
    updateInventoryUI();
    updateActionBar();
  } else if (currentTile.apples > 0 && canPickupApple(inventory)) {
    pickApple(currentTile);
    addApple(inventory);
    updateInventoryUI();
    updateActionBar();
  }
}

// ---- bow aim handlers (called from input.js) ----
function onBowDown(sx, sy) {
  if (gameState !== 'playing' || !bowMode) return;
  const w = camera.screenToWorld(sx, sy);
  bowAim.down    = true;
  bowAim.charge  = 0;
  bowAim.wx      = w.x;
  bowAim.wy      = w.y;
  bowAim.history = [{ wx: w.x, wy: w.y, t: performance.now() }];
}

function onBowMove(sx, sy) {
  if (!bowAim.down) return;
  const w = camera.screenToWorld(sx, sy);
  bowAim.wx = w.x;
  bowAim.wy = w.y;
  const now = performance.now();
  bowAim.history.push({ wx: w.x, wy: w.y, t: now });
  const cutoff = now - 300;
  while (bowAim.history.length > 1 && bowAim.history[0].t < cutoff) bowAim.history.shift();
}

function onBowUp(sx, sy) {
  if (!bowAim.down) return;
  bowAim.down = false;

  // Sample aim direction from 100ms before release to avoid accidental slip.
  const now    = performance.now();
  const target = now - 100;
  let best = bowAim.history[0] || { wx: bowAim.wx, wy: bowAim.wy };
  for (const h of bowAim.history) {
    if (h.t <= target) best = h;
    else break;
  }

  const dx  = best.wx - character.x;
  const dy  = best.wy - character.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.1) { bowMode = false; updateActionBar(); return; }

  const charge  = bowAim.charge;
  const dmg     = Math.round(BOW_DMG_MIN + (BOW_DMG_MAX - BOW_DMG_MIN) * charge);
  const maxDist = BOW_RANGE_MIN + (BOW_RANGE_MAX - BOW_RANGE_MIN) * charge;
  const vx      = (dx / len) * ARROW_SPEED;
  const vy      = (dy / len) * ARROW_SPEED;

  arrows.push({ x: character.x, y: character.y, vx, vy, traveled: 0, maxDist, dmg });

  character.bowCooldown = BOW_COOLDOWN;
  bowMode = false;
  bowAim.charge = 0;
  updateActionBar();
}

// ---- save/load helpers ----
function doSave(label = '● SAVED') {
  const savedAt = saveGame({
    character: character.serialize(),
    camera:    camera.serialize(),
    tiles:     serializeTiles(tiles),
    inventory: serializeInventory(inventory),
    creatures: creatures.filter(c => c.alive).map(c => c.serialize()),
    tickAccum, dayTime,
  });
  lastSaveTime = savedAt;
  ui.toast(label);
}

function resetBowState() {
  bowMode = false;
  bowAim  = { down: false, charge: 0, wx: 0, wy: 0, history: [] };
  arrows  = [];
}

// ---- state transitions ----
function startNew() {
  inventory = createInventory();
  initWorld(tiles);  // must run first so water tiles are known before picking spawn
  const passable   = tiles.filter(t => !isBlocked(t));
  const spawnTile  = passable[Math.floor(Math.random() * passable.length)];
  character.reset(spawnTile.x, spawnTile.y);
  creatures = spawnCreatures(tiles, isBlocked);
  camera.deserialize({ x: spawnTile.x, y: spawnTile.y, z: 1 });
  tickAccum = 0; autoSaveAccum = 0; lastSaveTime = 0; dayTime = 0;
  currentTile = spawnTile;
  resetBowState();
  gameState = 'playing';
  ui.hideStart();
  ui.hideDead();
  ui.showActionBar();
  updateInventoryUI();
  for (let i = 0; i < inventory.slots.length; i++) ui.updateSlotTimer(i, null);
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
  dayTime       = save.dayTime   || 0;
  lastSaveTime  = save.savedAt;
  autoSaveAccum = 0;
  const { tile: startTile } = nearestTile(tiles, character.x, character.y);
  currentTile = startTile;
  resetBowState();
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
  resetBowState();
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
    if (bowMode) return;   // no movement while aiming
    if (sy > camera.viewH - DEAD_BAR_H && sx < DEAD_BAR_W) return;
    if (sx > camera.viewW - DEAD_COL_W && sy > camera.viewH - DEAD_COL_H) return;
    const { tile, dist } = nearestTile(tiles, wx, wy);
    if (!tile || dist > SIDE) return;
    character.setDestination(tiles, tile, isBlocked);
  },
  isBowMode() { return bowMode; },
  onBowDown,
  onBowMove,
  onBowUp,
  onHold(sx, sy) {
    if (gameState !== 'playing') return;
    if (sy > camera.viewH - DEAD_BAR_H && sx < DEAD_BAR_W) return;
    if (sx > camera.viewW - DEAD_COL_W && sy > camera.viewH - DEAD_COL_H) return;
    if (!getBowEquipped(inventory)) return;
    if (character.moving || character.bowCooldown > 0) return;
    bowMode = true;
    onBowDown(sx, sy);
    updateActionBar();
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
  onRange:      doRange,
  onReloadSave: doContinue,
  onDeadNewGame: startNew,
  onDeadMenu:   goToMenu,
});

// ---- inventory slot action (shared by mouse click and keyboard) ----
function activateSlot(idx) {
  if (gameState !== 'playing') return;
  const slot = inventory.slots[idx];
  if (!slot) return;
  if (slot.type === 'apple') {
    if (consumeApple(inventory, idx, character)) updateInventoryUI();
  } else if (slot.type === 'sword') {
    toggleEquip(inventory, idx);
    updateInventoryUI();
  } else if (slot.type === 'shield') {
    toggleEquip(inventory, idx);
    updateInventoryUI();
    updateActionBar();
  } else if (slot.type === 'bow') {
    toggleEquip(inventory, idx);
    updateInventoryUI();
    updateActionBar();
  }
}

ui.bindInventory((idx) => activateSlot(idx));

// ---- keyboard controls ----
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (key === ' ')         { e.preventDefault(); doUse(); }
  else if (key === 'z')   doAttack();
  else if (key === 'x')   doDefend();
  else if (key === 'c')   doRange();
  else if (key >= '1' && key <= '5') activateSlot(parseInt(key, 10) - 1);
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

    dayTime = (dayTime + dt) % 180;

    while (tickAccum >= 1.0) {
      tickAccum -= 1.0;
      character.onTick();
      tickWorld(tiles);
      for (const c of creatures) c.tick(tiles, isBlocked, character);
      // Auto-consume apple when hungry
      if (character.hunger < 60) {
        const ai = inventory.slots.findIndex(s => s && s.type === 'apple' && s.count > 0);
        if (ai !== -1 && consumeApple(inventory, ai, character)) updateInventoryUI();
      }
      updateActionBar();   // apples may have grown on currentTile
    }

    if (autoSaveAccum >= AUTO_SAVE_SECS) {
      autoSaveAccum -= AUTO_SAVE_SECS;
      doSave('● AUTO-SAVED');
    }

    // Bow charge while aiming.
    if (bowAim.down) {
      bowAim.charge = Math.min(1, bowAim.charge + dt / BOW_CHARGE_SECS);
    }

    const wasShielded    = character.shieldActive;
    const wasBowCooldown = character.bowCooldown > 0;
    character.update(dt);
    if (wasShielded && !character.shieldActive) updateActionBar();
    if (wasBowCooldown && character.bowCooldown <= 0) updateActionBar();

    // Cancel bow mode if character started moving (safety guard).
    if (bowMode && character.moving) { bowMode = false; bowAim.down = false; updateActionBar(); }

    for (const c of creatures) c.update(dt, character);
    // Remove dead creatures once their hit flash finishes.
    for (let i = creatures.length - 1; i >= 0; i--) {
      if (!creatures[i].alive && !creatures[i].hitAnim) creatures.splice(i, 1);
    }
    if (character.moving) camera.focusOn({ x: character.x, y: character.y });

    // Advance arrows and check creature hitboxes.
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i];
      const step = ARROW_SPEED * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.traveled += step;
      if (a.traveled >= a.maxDist) { arrows.splice(i, 1); continue; }

      let hit = false;
      for (const cr of creatures) {
        if (!cr.alive) continue;
        const hw = (cr.kind === 'hog' ? CHAR_RADIUS * 1.2 : CHAR_RADIUS * 0.85);
        const hh = (cr.kind === 'hog' ? CHAR_RADIUS * 0.8 : CHAR_RADIUS * 0.85);
        if (Math.abs(a.x - cr.x) <= hw && Math.abs(a.y - cr.y) <= hh) {
          cr.takeDamage(a.dmg, BOW_DMG_MAX * 1.5);
          if (cr.alive) cr.onHit(tiles, isBlocked, character);
          arrows.splice(i, 1);
          hit = true;
          break;
        }
      }
      if (hit) continue;

      // Tree collision: foliage circle (center t.x, t.y-0.08, radius 0.28)
      // Using circle avoids frame-skip; trunk AABB (0.22u tall) was too thin at 20u/s
      for (const t of tiles) {
        if (!t.tree) continue;
        if (Math.hypot(a.x - t.x, a.y - (t.y - 0.08)) <= 0.28) {
          arrows.splice(i, 1);
          hit = true;
          break;
        }
      }
      if (hit) continue;
    }

    if (character.health <= 0) {
      gameState = 'dead';
      character.path = [];
      resetBowState();
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

  const bowIdx = inventory.slots.findIndex(s => s && s.type === 'bow');
  if (bowIdx !== -1) {
    ui.updateSlotTimer(bowIdx, {
      active:   null,
      cooldown: character.bowCooldown > 0
        ? { remaining: character.bowCooldown, total: BOW_COOLDOWN } : null,
    });
  }

  camera.update();
  render(ctx, camera, tiles, character, creatures, arrows, { active: bowMode, aim: bowAim }, dayTime);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
