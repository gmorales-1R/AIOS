import { CORNERS } from './hex.js';
import { COLORS, CHAR_RADIUS } from './config.js';

export function render(ctx, camera, tiles, character) {
  const { viewW, viewH } = camera;
  const ppu = camera.ppu;

  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, viewW, viewH);

  const margin = ppu * 2;
  for (const t of tiles) {
    const c = camera.worldToScreen(t.x, t.y);
    if (c.x < -margin || c.x > viewW + margin ||
        c.y < -margin || c.y > viewH + margin) continue;

    const isTarget = t === character.targetTile;
    let borderColor = COLORS.tileBorder;
    let lineWidth   = Math.max(1, 0.04 * ppu);
    if (isTarget) {
      borderColor = character.targetState === 'unreachable'
        ? COLORS.targetBad
        : COLORS.targetActive;
      lineWidth = Math.max(1.5, 0.08 * ppu);
    }

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const px = c.x + CORNERS[i][0] * ppu;
      const py = c.y + CORNERS[i][1] * ppu;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = COLORS.tileFill;
    ctx.fill();
    ctx.lineWidth   = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
  }

  // character
  const cc = camera.worldToScreen(character.x, character.y);
  ctx.beginPath();
  ctx.arc(cc.x, cc.y, CHAR_RADIUS * ppu, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.character;
  ctx.fill();
  ctx.lineWidth   = Math.max(1, 0.05 * ppu);
  ctx.strokeStyle = COLORS.characterEdge;
  ctx.stroke();
}
