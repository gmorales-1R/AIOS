// Board dimensions (in tiles).
export const COLS = 20;
export const ROWS = 12;

// Hex geometry. Side length is the base world unit.
export const SIDE = 1;
export const SQRT3 = Math.sqrt(3);
export const HEX_W = SQRT3 * SIDE;      // flat-to-flat width (vertical edges)
export const HEX_H = 2 * SIDE;          // point-to-point height
export const COL_SPACING = SQRT3 * SIDE;
export const ROW_SPACING = 1.5 * SIDE;

// Character.
export const CHAR_RADIUS = 0.42 * SIDE;
export const MOVE_SPEED = 5.5;          // world units per second

// Camera.
export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 5;
export const FIT_HEXES = 6;             // at z=1, ~6 hex widths fit the min screen dim
export const FOLLOW_LERP = 0.12;        // camera focus smoothing per frame

export const COLORS = {
  page: '#0a0a0f',
  tileFill: '#000000',
  tileBorder: '#33ff6a',
  targetActive: '#ffe600',
  targetBad: '#ff3333',
  character: '#2f6bff',
  characterEdge: '#bcd4ff',
};
