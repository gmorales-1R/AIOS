// Board dimensions (in tiles).
export const COLS = 20;
export const ROWS = 12;

// Hex geometry. Side length is the base world unit.
export const SIDE        = 1;
export const SQRT3       = Math.sqrt(3);
export const HEX_W       = SQRT3 * SIDE;
export const HEX_H       = 2 * SIDE;
export const COL_SPACING = SQRT3 * SIDE;
export const ROW_SPACING = 1.5 * SIDE;

// Character.
export const CHAR_RADIUS      = 0.42 * SIDE;
export const MOVE_SPEED       = 5.5;          // world units per second
export const TILE_HUNGER_COST = 1;            // hunger lost per tile crossed

// Stats.
export const HEALTH_MAX  = 100;
export const HUNGER_MAX  = 100;
export const TICK_HUNGER = 1;                 // hunger drained per tick
export const STARVE_DMG  = 5;                 // health lost per tick when hunger = 0
export const HEAL_RATE   = 1;                 // health gained per tick when hunger > 60
export const HEAL_THRESH = 60;

// World / trees.
export const TREE_DENSITY      = 0.18;        // fraction of tiles that grow trees
export const APPLE_GROW_TICKS  = 15;          // ticks between apples
export const APPLE_MAX         = 3;           // max apples per tree
export const APPLE_HUNGER_GAIN = 15;          // per apple collected
export const APPLE_HEALTH_GAIN = 5;           // per apple collected

// Camera.
export const ZOOM_MIN    = 0.3;
export const ZOOM_MAX    = 5;
export const FIT_HEXES   = 6;
export const FOLLOW_LERP = 0.12;

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
