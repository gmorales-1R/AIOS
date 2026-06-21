export const BUILD_TIME = 'v69 21/06/2026 17:12';

export const COLS = 20;
export const ROWS = 12;

export const SIDE        = 1;
export const SQRT3       = Math.sqrt(3);
export const HEX_W       = SQRT3 * SIDE;
export const HEX_H       = 2 * SIDE;
export const COL_SPACING = SQRT3 * SIDE;
export const ROW_SPACING = 1.5 * SIDE;

export const CHAR_RADIUS      = 0.28 * SIDE;
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

export const ATK_DMG_BASE       = 2;
export const ATK_DMG_SWORD      = 5;
export const ATK_ANIM_SECS      = 0.38;
export const ATK_ANIM_SECS_SWORD = 0.25;
export const ATK_RANGE_FIST     = 1.5;
export const ATK_RANGE_SWORD = 2.0;
export const ATK_ACC_FIST    = 0;
export const ATK_ACC_SWORD   = 0.10;
export const HIT_ANIM_SECS   = 0.45;

export const CHICKEN_HP          = 8;
export const CHICKEN_EVADE       = 0.20;
export const CHICKEN_SPAWN_COUNT = 5;
export const CHICKEN_MOVE_CHANCE = 0.30;
export const CHICKEN_EAT_CHANCE  = 0.50;
export const CHICKEN_SPEED       = 2.5;
export const CHICKEN_FLEE_SPEED  = 4.0;
export const CHICKEN_FLEE_TILES  = 4;

export const HOG_HP             = 100;
export const HOG_SPAWN_COUNT    = 2;
export const HOG_MOVE_CHANCE    = 0.20;
export const HOG_EAT_CHANCE     = 0.80;
export const HOG_DETECT_DIST    = 2.0;
export const HOG_AGGRO_CHANCE   = 0.50;
export const HOG_ATK_RANGE      = 1.2;
export const HOG_ATK_DMG        = 5;
export const HOG_ATK_VAR        = 1;
export const HOG_ATK_INTERVAL   = 0.5;
export const HOG_DISENGAGE_DIST = 6.0;
export const HOG_SPEED_NATURAL  = 2.0;
export const HOG_SPEED_AGGRO    = 3.5;

export const CREATURE_DRIFT_RADIUS = 0.75;
export const CREATURE_DRIFT_CHANCE = 0.40;

export const SHIELD_BLOCK_BASE = 0.70;
export const SHIELD_BLOCK_VAR  = 0.20;
export const SHIELD_DURATION   = 10;
export const SHIELD_COOLDOWN   = 20;

export const BOW_DMG_MIN     = 2;
export const BOW_DMG_MAX     = 10;
export const BOW_RANGE_MIN   = 2;
export const BOW_RANGE_MAX   = 12;
export const BOW_CHARGE_SECS = 1.0;
export const BOW_COOLDOWN    = 0.5;
export const ARROW_SPEED     = 20;

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
  atkRingAlt:    '#00cfff',
  hitRing:       '#ff4040',
  shieldRing:    '#4488ff',
  chicken:       '#f0f0f0',
  chickenEdge:   '#888888',
  hog:           '#f07090',
  hogEdge:       '#a03050',
  hogAggro:      '#ff2020',
  bow:           '#c8a060',
  bowEdge:       '#5a3a10',
  arrow:         '#c8a060',
  arrowTip:      '#ffe600',
  aimLine:       '#ffe600',
  chargeArc:     '#ffe600',
};
