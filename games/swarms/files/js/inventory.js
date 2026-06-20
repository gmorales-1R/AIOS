import {
  APPLE_STACK_MAX, APPLE_HUNGER_GAIN, APPLE_HEALTH_GAIN,
  HEALTH_MAX, HUNGER_MAX, ATK_DMG_BASE, ATK_DMG_SWORD,
} from './config.js';

export function createInventory() {
  return { slots: Array(5).fill(null) };
}

// First slot index that can accept an apple, or -1 if full.
function appleSlotIdx(inv) {
  for (let i = 0; i < inv.slots.length; i++) {
    const s = inv.slots[i];
    if (s && s.type === 'apple' && s.count < APPLE_STACK_MAX) return i;
  }
  for (let i = 0; i < inv.slots.length; i++) {
    if (!inv.slots[i]) return i;
  }
  return -1;
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
