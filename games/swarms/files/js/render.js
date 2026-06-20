import { CORNERS } from './hex.js';
import { COLORS, CHAR_RADIUS, SIDE, ATK_ANIM_SECS } from './config.js';

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
    let borderColor = t.water ? COLORS.waterBorder : COLORS.tileBorder;
    let lineWidth   = Math.max(1, 0.04 * ppu);
    if (isTarget) {
      borderColor = character.targetState === 'unreachable'
        ? COLORS.targetBad : COLORS.targetActive;
      lineWidth = Math.max(1.5, 0.08 * ppu);
    }

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const px = c.x + CORNERS[i][0] * ppu;
      const py = c.y + CORNERS[i][1] * ppu;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle   = t.water ? COLORS.waterFill
                    : t.tree  ? COLORS.treeFill
                    : COLORS.tileFill;
    ctx.fill();
    ctx.lineWidth   = lineWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Apples on tree tiles
    if (t.apples > 0 && !t.water) {
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

    // Sword on ground (two rectangles forming a cross)
    if (t.hasSword) {
      const hw = 0.09 * ppu;   // half arm width
      const hl = 0.42 * ppu;   // half blade length
      const gl = 0.30 * ppu;   // half guard length
      ctx.fillStyle   = COLORS.sword;
      ctx.strokeStyle = COLORS.swordEdge;
      ctx.lineWidth   = Math.max(0.5, 0.018 * ppu);
      // blade (vertical)
      ctx.fillRect(c.x - hw, c.y - hl, hw * 2, hl * 2);
      ctx.strokeRect(c.x - hw, c.y - hl, hw * 2, hl * 2);
      // guard (horizontal, offset slightly upward)
      ctx.fillRect(c.x - gl, c.y - hw * 1.2, gl * 2, hw * 2.4);
      ctx.strokeRect(c.x - gl, c.y - hw * 1.2, gl * 2, hw * 2.4);
    }
  }

  // Attack animation ring (drawn behind character)
  const cc = camera.worldToScreen(character.x, character.y);
  if (character.atkAnim) {
    const prog  = character.atkAnim.t / ATK_ANIM_SECS;
    const r     = (CHAR_RADIUS * 1.15 + SIDE * 1.3 * prog) * ppu;
    const lw    = Math.max(1.5, (0.18 - 0.10 * prog) * ppu);
    const alpha = (1 - prog) * 0.80;
    const color = character.atkAnim.armed ? COLORS.atkRing : COLORS.atkRingAlt;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(cc.x, cc.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.stroke();
    ctx.restore();
  }

  // Character
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
  const M = 14, BW = 100, BH = 10, G = 7;
  ctx.font = 'bold 11px monospace';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(M + 18, M, BW, BH);
  ctx.fillStyle = COLORS.hudHealth;
  ctx.fillRect(M + 18, M, BW * char.health / 100, BH);
  ctx.fillStyle = '#ff9090';
  ctx.fillText('\u2665', M + 2, M + BH / 2);

  const hy = M + BH + G;
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(M + 18, hy, BW, BH);
  ctx.fillStyle = COLORS.hudHunger;
  ctx.fillRect(M + 18, hy, BW * char.hunger / 100, BH);
  ctx.fillStyle = '#ffd090';
  ctx.fillText('\u25C9', M + 2, hy + BH / 2);
}
