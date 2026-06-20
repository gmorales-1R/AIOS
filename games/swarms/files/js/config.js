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
