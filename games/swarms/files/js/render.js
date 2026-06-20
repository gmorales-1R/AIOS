import { CORNERS } from './hex.js';
import { COLORS, CHAR_RADIUS } from './config.js';

// Apple positions (world units, relative to tile center) indexed by count.
const APPLE_POS = [
  [[0, 0]],
  [[-0.22, 0], [0.22, 0]],
  [[0, -0.28], [-0.22, 0.13], [0.22, 0.13]],
];
const APPLE_R = CHAR_RADIUS / 3;

export function render(ctx, camera, tiles, character) {
  const { viewW, viewH } = camera;
  const ppu    = camera.ppu;
  const margin = ppu * 2;

  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, viewW, viewH);

  for (const t of tiles) {
    const c = camera.worldToScreen(t.x, t.y);
    if (c.x < -margin || c.x > viewW + margin ||
        c.y < -margin || c.y > viewH + margin) continue;

    const isTarget = t === character.targetTile;
    let borderColor = COLORS.tileBorder;
    let lineWidth   = Math.max(1, 0.04 * ppu);
    if (isTarget) {
      borderColor = character.targetState === 'unreachable'
        ? COLORS.targetBad : COLORS.targetActive;
      lineWidth = Math.max(1.5, 0.08 * ppu);
    }

    // Hex fill
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const px = c.x + CORNERS[i][0] * ppu;
      const py = c.y + CORNERS[i][1] * ppu;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle   = t.tree ? COLORS.treeFill : COLORS.tileFill;
    ctx.fill();
    ctx.lineWidth   = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Apples
    if (t.apples > 0) {
      const positions = APPLE_POS[t.apples - 1];
      for (const [ox, oy] of positions) {
        ctx.beginPath();
        ctx.arc(c.x + ox * ppu, c.y + oy * ppu, APPLE_R * ppu, 0, Math.PI * 2);
        ctx.fillStyle   = COLORS.apple;
        ctx.fill();
        ctx.lineWidth   = Math.max(0.5, 0.025 * ppu);
        ctx.strokeStyle = COLORS.appleEdge;
        ctx.stroke();
      }
    }
  }

  // Character
  const cc = camera.worldToScreen(character.x, character.y);
  ctx.beginPath();
  ctx.arc(cc.x, cc.y, CHAR_RADIUS * ppu, 0, Math.PI * 2);
  ctx.fillStyle   = COLORS.character;
  ctx.fill();
  ctx.lineWidth   = Math.max(1, 0.05 * ppu);
  ctx.strokeStyle = COLORS.characterEdge;
  ctx.stroke();

  renderHUD(ctx, character);
}

function renderHUD(ctx, char) {
  const M  = 14;   // margin (px)
  const BW = 100;  // bar width
  const BH = 10;   // bar height
  const G  =  7;   // gap between bars

  ctx.font         = 'bold 11px monospace';
  ctx.textBaseline = 'middle';

  // Health bar
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(M + 18, M, BW, BH);
  ctx.fillStyle = COLORS.hudHealth;
  ctx.fillRect(M + 18, M, BW * char.health / 100, BH);
  ctx.fillStyle = '#ff9090';
  ctx.fillText('\u2665', M + 2, M + BH / 2);

  // Hunger bar
  const hy = M + BH + G;
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(M + 18, hy, BW, BH);
  ctx.fillStyle = COLORS.hudHunger;
  ctx.fillRect(M + 18, hy, BW * char.hunger / 100, BH);
  ctx.fillStyle = '#ffd090';
  ctx.fillText('\u25C9', M + 2, hy + BH / 2);
}
