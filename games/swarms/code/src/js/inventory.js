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

// Toggle equip on the item at slot i. Unequips other items of the same type.
// Swords, shields and bows are equipped independently.
export function toggleEquip(inv, i) {
  const s = inv.slots[i];
  if (!s || !['sword', 'shield', 'bow'].includes(s.type)) return;
  const equipping = !s.equipped;
  for (const slot of inv.slots) {
    if (slot && slot.type === s.type) slot.equipped = false;
  }
  s.equipped = equipping;
}

export function hasShield(inv) {
  return inv.slots.some(s => s && s.type === 'shield');
}

export function addShield(inv, effectiveness = 0) {
  const i = inv.slots.findIndex(s => !s);
  if (i === -1) return false;
  inv.slots[i] = { type: 'shield', equipped: false, effectiveness };
  return true;
}

// Returns the effectiveness bonus of the currently equipped shield, or 0.
export function getShieldEffectiveness(inv) {
  const s = inv.slots.find(s => s && s.type === 'shield' && s.equipped);
  return s ? (s.effectiveness || 0) : 0;
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

export function hasBow(inv) {
  return inv.slots.some(s => s && s.type === 'bow');
}

export function addBow(inv) {
  const i = inv.slots.findIndex(s => !s);
  if (i === -1) return false;
  inv.slots[i] = { type: 'bow', equipped: false };
  return true;
}

export function getBowEquipped(inv) {
  return inv.slots.some(s => s && s.type === 'bow' && s.equipped);
}

// Returns { dmg, range, acc } for the currently equipped melee weapon.
export function getMeleeStats(inv) {
  const armed = inv.slots.some(s => s && s.type === 'sword' && s.equipped);
  return armed
    ? { dmg: ATK_DMG_SWORD, range: ATK_RANGE_SWORD, acc: ATK_ACC_SWORD }
    : { dmg: ATK_DMG_BASE,  range: ATK_RANGE_FIST,  acc: ATK_ACC_FIST  };
}
