import { CORNERS } from './hex.js';
import { COLORS, CHAR_RADIUS, SIDE, HEX_H, HIT_ANIM_SECS, BUILD_TIME, ARROW_SPEED, BOW_RANGE_MAX } from './config.js';

const grassImg = new Image();
grassImg.src = new URL('../assets/tiles/grass.png', import.meta.url).href;
let grassPattern = null;

const grassImg2 = new Image();
grassImg2.src = new URL('../assets/tiles/grass2.png', import.meta.url).href;
let grassPattern2 = null;

const waterImg = new Image();
waterImg.src = new URL('../assets/tiles/water.png', import.meta.url).href;
let waterPattern = null;

// Call after canvas.width/height is set (context reset invalidates cached patterns).
export function resetPatterns() {
  grassPattern = null;
  grassPattern2 = null;
  waterPattern = null;
}

const TREE_APPLE_POS = [[-0.13, -0.02], [0.10, -0.15], [0.04, 0.11]];

// Shared expanding-ring hit flash (red). opacity is the peak alpha.
function drawHitRing(ctx, x, y, anim, ppu) {
  const progress = anim.t / HIT_ANIM_SECS;
  ctx.save();
  ctx.globalAlpha = anim.opacity * (1 - progress);
  ctx.beginPath();
  ctx.arc(x, y, (CHAR_RADIUS * 1.15 + SIDE * 1.3 * progress) * ppu, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.hitRing;
  ctx.lineWidth   = Math.max(1.5, (0.18 - 0.10 * progress) * ppu);
  ctx.stroke();
  ctx.restore();
}

// Day/night cycle keyframes: [time(s), r, g, b, alpha]
// 0-120s = day, 120-180s = night; dusk/dawn each 15 s
const DAY_KF = [
  [  0,   0,   0,   0, 0.00],
  [105,   0,   0,   0, 0.00],  // dusk starts
  [110, 255, 120,   0, 0.13],  // orange
  [116,  80,   0, 120, 0.30],  // purple
  [120,   5,   0,  20, 0.40],  // night
  [142,   5,   0,  20, 0.40],
  [165,   5,   0,  20, 0.40],  // dawn starts
  [170,   0,  20, 100, 0.23],  // blue
  [175, 120,  80,   0, 0.13],  // warm yellow
  [180,   0,   0,   0, 0.00],
];

function getDayOverlay(t) {
  t = ((t % 180) + 180) % 180;
  for (let i = 0; i < DAY_KF.length - 1; i++) {
    const [t0, r0, g0, b0, a0] = DAY_KF[i];
    const [t1, r1, g1, b1, a1] = DAY_KF[i + 1];
    if (t >= t0 && t <= t1) {
      const f = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
      return [Math.round(r0+(r1-r0)*f), Math.round(g0+(g1-g0)*f),
              Math.round(b0+(b1-b0)*f), a0+(a1-a0)*f];
    }
  }
  return [0, 0, 0, 0];
}

function drawHero(ctx, x, y, R) {
  ctx.save();
  // Body / tunic
  ctx.fillStyle = '#2e6b22';
  ctx.beginPath();
  ctx.ellipse(x, y + R*0.25, R*0.68, R*0.58, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#1a4015';
  ctx.lineWidth = Math.max(0.5, R*0.06);
  ctx.stroke();
  // Head
  ctx.fillStyle = '#d4956a';
  ctx.beginPath();
  ctx.arc(x, y - R*0.35, R*0.36, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#9a6040';
  ctx.lineWidth = Math.max(0.5, R*0.04);
  ctx.stroke();
  // Hat (pointed, dark green)
  ctx.fillStyle = '#1b4a12';
  ctx.beginPath();
  ctx.moveTo(x - R*0.44, y - R*0.56);
  ctx.lineTo(x + R*0.40, y - R*0.56);
  ctx.lineTo(x + R*0.06, y - R*1.10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0d2a08';
  ctx.lineWidth = Math.max(0.5, R*0.04);
  ctx.stroke();
  // Feather
  ctx.strokeStyle = '#f0e060';
  ctx.lineWidth = Math.max(1, R*0.055);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + R*0.36, y - R*0.60);
  ctx.quadraticCurveTo(x + R*0.62, y - R*0.88, x + R*0.18, y - R*1.08);
  ctx.stroke();
  ctx.lineCap = 'butt';
  // Eyes
  ctx.fillStyle = '#1a1208';
  for (const ex of [-0.12, 0.13]) {
    ctx.beginPath();
    ctx.arc(x + ex*R, y - R*0.38, Math.max(0.8, R*0.07), 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHog(ctx, x, y, R, aggro) {
  ctx.save();
  const base = aggro ? '#f06878' : '#f07090';
  const edge = aggro ? '#cc1828' : '#a03050';
  // Ears (draw first so body overlaps their base)
  ctx.fillStyle = '#d05070';
  for (const ex of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + ex*R*0.52, y - R*0.48);
    ctx.lineTo(x + ex*R*0.84, y - R*0.88);
    ctx.lineTo(x + ex*R*0.26, y - R*0.70);
    ctx.closePath();
    ctx.fill();
  }
  // Body
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(x, y - R*0.05, R*1.05, R*0.68, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1, R*0.07);
  ctx.stroke();
  // Head
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(x, y + R*0.50, R*0.60, R*0.40, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(0.5, R*0.05);
  ctx.stroke();
  // Snout
  ctx.fillStyle = '#f8b0bc';
  ctx.beginPath();
  ctx.ellipse(x, y + R*0.74, R*0.28, R*0.18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(0.5, R*0.04);
  ctx.stroke();
  // Nostrils
  ctx.fillStyle = '#802040';
  for (const nx of [-0.10, 0.10]) {
    ctx.beginPath();
    ctx.arc(x + nx*R, y + R*0.76, Math.max(1, R*0.06), 0, Math.PI*2);
    ctx.fill();
  }
  // Eyes
  ctx.fillStyle = aggro ? '#ff2020' : '#1a0808';
  for (const ex of [-0.28, 0.28]) {
    ctx.beginPath();
    ctx.arc(x + ex*R, y + R*0.28, Math.max(1.5, R*0.09), 0, Math.PI*2);
    ctx.fill();
  }
  // Tusks
  ctx.strokeStyle = '#f4f0e8';
  ctx.lineWidth = Math.max(1, R*0.07);
  ctx.lineCap = 'round';
  for (const ex of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + ex*R*0.16, y + R*0.62);
    ctx.lineTo(x + ex*R*0.32, y + R*0.84);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.restore();
}

function drawChicken(ctx, x, y, R) {
  ctx.save();
  // Body
  ctx.fillStyle = '#f0f0ee';
  ctx.beginPath();
  ctx.ellipse(x, y + R*0.08, R*0.52, R*0.58, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = Math.max(0.5, R*0.05);
  ctx.stroke();
  // Wing hint
  ctx.fillStyle = '#d8d8d4';
  ctx.beginPath();
  ctx.ellipse(x - R*0.10, y + R*0.10, R*0.28, R*0.40, -0.3, 0, Math.PI*2);
  ctx.fill();
  // Head
  ctx.fillStyle = '#f0f0ee';
  ctx.beginPath();
  ctx.arc(x + R*0.06, y - R*0.48, R*0.27, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = Math.max(0.5, R*0.04);
  ctx.stroke();
  // Comb
  ctx.fillStyle = '#cc2020';
  for (let ci = 0; ci < 3; ci++) {
    ctx.beginPath();
    ctx.arc(x + (ci-1)*R*0.10, y - R*0.72, Math.max(1, R*0.08), 0, Math.PI*2);
    ctx.fill();
  }
  // Wattle
  ctx.fillStyle = '#cc2020';
  ctx.beginPath();
  ctx.ellipse(x + R*0.30, y - R*0.40, R*0.06, R*0.10, 0, 0, Math.PI*2);
  ctx.fill();
  // Beak
  ctx.fillStyle = '#dda020';
  ctx.beginPath();
  ctx.moveTo(x + R*0.28, y - R*0.52);
  ctx.lineTo(x + R*0.28, y - R*0.42);
  ctx.lineTo(x + R*0.48, y - R*0.47);
  ctx.closePath();
  ctx.fill();
  // Eye + highlight
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(x + R*0.14, y - R*0.52, Math.max(1, R*0.07), 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + R*0.17, y - R*0.54, Math.max(0.5, R*0.03), 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

export function render(ctx, camera, tiles, character, creatures, arrows = [], bowState = null, dayTime = 0) {
  // Defensive: reset any state that might have leaked from a previous render
  // or from a browser compositing artifact.
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  if (!grassPattern && grassImg.complete && grassImg.naturalWidth) {
    grassPattern = ctx.createPattern(grassImg, 'repeat');
  }
  if (!grassPattern2 && grassImg2.complete && grassImg2.naturalWidth) {
    grassPattern2 = ctx.createPattern(grassImg2, 'repeat');
  }
  if (!waterPattern && waterImg.complete && waterImg.naturalWidth) {
    waterPattern = ctx.createPattern(waterImg, 'repeat');
  }

  const { viewW, viewH } = camera;
  const ppu    = camera.ppu;
  const margin = ppu * 2;

  // Clear using physical pixel coordinates (bypasses DPR transform) to guarantee
  // the entire canvas is wiped, then fill with the background colour.
  const cvs = ctx.canvas;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.restore();
  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, viewW, viewH);

  // Set pattern transforms in world-space so all tiles share one continuous texture (no seams).
  const wo = camera.worldToScreen(0, 0);
  const tileScale = HEX_H * ppu;
  if (grassPattern && grassImg.naturalWidth) {
    const sc = tileScale / grassImg.naturalWidth;
    grassPattern.setTransform(new DOMMatrix([sc, 0, 0, sc, wo.x, wo.y]));
  }
  if (grassPattern2 && grassImg2.naturalWidth) {
    const sc = tileScale / grassImg2.naturalWidth;
    grassPattern2.setTransform(new DOMMatrix([sc, 0, 0, sc, wo.x, wo.y]));
  }
  if (waterPattern && waterImg.naturalWidth) {
    const sc = tileScale / waterImg.naturalWidth;
    waterPattern.setTransform(new DOMMatrix([sc, 0, 0, sc, wo.x, wo.y]));
  }

  for (const t of tiles) {
    const c = camera.worldToScreen(t.x, t.y);
    if (c.x < -margin || c.x > viewW + margin ||
        c.y < -margin || c.y > viewH + margin) continue;

    const isTarget = t === character.targetTile;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const px = c.x + CORNERS[i][0] * ppu;
      const py = c.y + CORNERS[i][1] * ppu;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (t.water) {
      ctx.fillStyle = waterPattern || COLORS.waterFill;
    } else {
      const pat = t.grassVar ? grassPattern2 : grassPattern;
      ctx.fillStyle = pat || COLORS.tileFill;
    }
    ctx.fill();

    // Only draw a border on the target tile.
    if (isTarget) {
      ctx.lineWidth   = Math.max(1.5, 0.08 * ppu);
      ctx.strokeStyle = character.targetState === 'unreachable'
        ? COLORS.targetBad : COLORS.targetActive;
      ctx.stroke();
    }

    // Tree on grass tiles — always visible; apple dots only when apples > 0
    if (t.tree && !t.water) {
      // Foliage (darker than grass for contrast)
      ctx.fillStyle = '#0f2a0b';
      ctx.beginPath();
      ctx.arc(c.x, c.y - 0.08 * ppu, 0.28 * ppu, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillStyle = '#5a3010';
      ctx.fillRect(c.x - 0.035 * ppu, c.y + 0.18 * ppu, 0.07 * ppu, 0.22 * ppu);
      // Small apple dots
      for (let ai = 0; ai < t.apples; ai++) {
        const [ax, ay] = TREE_APPLE_POS[ai];
        ctx.fillStyle = COLORS.apple;
        ctx.beginPath();
        ctx.arc(c.x + ax * ppu, c.y - 0.08 * ppu + ay * ppu, 0.055 * ppu, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Shield on ground
    if (t.hasShield) {
      const sw = 0.30 * ppu;
      const sh = 0.36 * ppu;
      ctx.fillStyle   = COLORS.shieldRing;
      ctx.strokeStyle = '#2255cc';
      ctx.lineWidth   = Math.max(0.5, 0.018 * ppu);
      ctx.beginPath();
      ctx.moveTo(c.x,      c.y - sh);
      ctx.lineTo(c.x + sw, c.y - sh * 0.45);
      ctx.lineTo(c.x + sw, c.y + sh * 0.18);
      ctx.quadraticCurveTo(c.x + sw * 0.7, c.y + sh, c.x, c.y + sh * 1.05);
      ctx.quadraticCurveTo(c.x - sw * 0.7, c.y + sh, c.x - sw, c.y + sh * 0.18);
      ctx.lineTo(c.x - sw, c.y - sh * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Sword on ground — matches inventory icon: tapered blade, crossguard, grip, pommel
    if (t.hasSword) {
      const sc = 0.38 * ppu;
      const ox = c.x, oy = c.y - 0.045 * sc;
      const lw = Math.max(0.5, 0.018 * ppu);
      ctx.lineWidth = lw;
      // Blade (triangle)
      ctx.beginPath();
      ctx.moveTo(ox,             oy - 0.84 * sc);
      ctx.lineTo(ox + 0.10 * sc, oy + 0.06 * sc);
      ctx.lineTo(ox - 0.10 * sc, oy + 0.06 * sc);
      ctx.closePath();
      ctx.fillStyle = '#d4d4f0'; ctx.strokeStyle = '#ffffff';
      ctx.fill(); ctx.stroke();
      // Crossguard
      ctx.fillStyle = '#b8b8d8'; ctx.strokeStyle = '#ffffff';
      ctx.fillRect(ox - 0.64*sc, oy + 0.06*sc, 1.28*sc, 0.18*sc);
      ctx.strokeRect(ox - 0.64*sc, oy + 0.06*sc, 1.28*sc, 0.18*sc);
      // Grip
      ctx.fillStyle = '#8b4513'; ctx.strokeStyle = '#5a2e0a';
      ctx.fillRect(ox - 0.09*sc, oy + 0.24*sc, 0.18*sc, 0.44*sc);
      ctx.strokeRect(ox - 0.09*sc, oy + 0.24*sc, 0.18*sc, 0.44*sc);
      // Pommel
      ctx.beginPath();
      ctx.arc(ox, oy + 0.79*sc, 0.14*sc, 0, Math.PI * 2);
      ctx.fillStyle = '#d4d4f0'; ctx.strokeStyle = '#ffffff';
      ctx.fill(); ctx.stroke();
    }

    // Bow on ground
    if (t.hasBow) {
      const bh  = 0.34 * ppu;
      const bx  = 0.06 * ppu;
      const bcx = 0.24 * ppu;
      ctx.strokeStyle = COLORS.bow;
      ctx.lineWidth   = Math.max(1, 0.055 * ppu);
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(c.x + bx, c.y - bh);
      ctx.quadraticCurveTo(c.x + bx + bcx, c.y, c.x + bx, c.y + bh);
      ctx.stroke();
      ctx.strokeStyle = COLORS.bowEdge;
      ctx.lineWidth   = Math.max(0.5, 0.022 * ppu);
      ctx.beginPath();
      ctx.moveTo(c.x + bx, c.y - bh);
      ctx.lineTo(c.x + bx, c.y + bh);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
  }

  // Creatures — draw before character so player is always on top.
  if (creatures) {
    const now = performance.now() / 1000;
    for (const c of creatures) {
      const cc = camera.worldToScreen(c.x, c.y);
      if (cc.x < -margin || cc.x > viewW + margin ||
          cc.y < -margin || cc.y > viewH + margin) continue;

      // Render-only visual offsets: flee jitter (chicken) and aggro sideways bob (hog).
      let dx = cc.x, dy = cc.y;
      if (c.kind === 'chicken' && c.state === 'flee') {
        dx += Math.sin(now * 45) * 0.10 * ppu;
        dy += Math.sin(now * 51 + 2.1) * 0.08 * ppu;
      } else if (c.kind === 'hog' && c.state === 'aggro') {
        dx += Math.sin(now * 8) * 0.15 * ppu;
      }

      if (c.alive) {
        const R = CHAR_RADIUS * ppu;
        if (c.kind === 'hog') drawHog(ctx, dx, dy, R, c.state === 'aggro');
        else                  drawChicken(ctx, dx, dy, R);
      }
      if (c.hitAnim) drawHitRing(ctx, dx, dy, c.hitAnim, ppu);
    }
  }

  // Attack animation (drawn behind character)
  const cc = camera.worldToScreen(character.x, character.y);
  if (character.atkAnim) {
    const anim = character.atkAnim;
    const prog = anim.t / anim.duration;

    if (anim.armed) {
      // Sword: sonar sweep clockwise from 12:00, fading trail
      const range        = anim.range * ppu;
      const startAngle   = -Math.PI / 2;
      const sweepSoFar   = prog * Math.PI * 2;
      const currentAngle = startAngle + sweepSoFar;

      ctx.save();

      // Fading trail: 20 wedge slices ramping from transparent at 12:00 to opaque at sweep line
      const N = 20;
      for (let i = 0; i < N; i++) {
        const a0 = startAngle + (i / N) * sweepSoFar;
        const a1 = startAngle + ((i + 1) / N) * sweepSoFar;
        ctx.globalAlpha = ((i + 1) / N) * 0.45;
        ctx.beginPath();
        ctx.moveTo(cc.x, cc.y);
        ctx.arc(cc.x, cc.y, range, a0, a1);
        ctx.closePath();
        ctx.fillStyle = COLORS.atkRing;
        ctx.fill();
      }

      // Faint range boundary circle
      ctx.globalAlpha = 0.20;
      ctx.beginPath();
      ctx.arc(cc.x, cc.y, range, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.atkRing;
      ctx.lineWidth = Math.max(1, 0.025 * ppu);
      ctx.stroke();

      // Bright sweep line
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(cc.x, cc.y);
      ctx.lineTo(cc.x + Math.cos(currentAngle) * range, cc.y + Math.sin(currentAngle) * range);
      ctx.strokeStyle = COLORS.atkRing;
      ctx.lineWidth = Math.max(2, 0.055 * ppu);
      ctx.stroke();

      ctx.restore();

    } else {
      // Fists: expanding ring fade-out
      const r     = (CHAR_RADIUS * 0.4 + anim.range * prog) * ppu;
      const lw    = Math.max(1.5, (0.18 - 0.10 * prog) * ppu);
      const alpha = (1 - prog) * 0.80;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(cc.x, cc.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.atkRingAlt;
      ctx.lineWidth   = lw;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Character — bob up/down while moving.
  const charY = cc.y + (character.moving
    ? Math.sin(performance.now() / 1000 * 12) * 0.08 * ppu
    : 0);
  drawHero(ctx, cc.x, charY, CHAR_RADIUS * ppu);

  // Shield ring (drawn on top of character circle)
  if (character.shieldActive) {
    ctx.save();
    ctx.strokeStyle = COLORS.shieldRing;
    ctx.lineWidth   = Math.max(1.5, 0.07 * ppu);
    ctx.beginPath();
    ctx.arc(cc.x, charY, (CHAR_RADIUS + 0.1) * ppu, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Bow aim overlay (drawn on top of character)
  if (bowState && bowState.active) {
    const arcR = (CHAR_RADIUS + 0.18) * ppu;
    ctx.save();

    // Subtle dashed circle indicates bow mode is active.
    ctx.strokeStyle = COLORS.chargeArc;
    ctx.lineWidth   = Math.max(1, 0.03 * ppu);
    ctx.globalAlpha = 0.25;
    ctx.setLineDash([Math.max(2, 0.04 * ppu), Math.max(4, 0.08 * ppu)]);
    ctx.beginPath();
    ctx.arc(cc.x, charY, arcR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (bowState.aim.down) {
      const charge = bowState.aim.charge;
      const dx = bowState.aim.wx - character.x;
      const dy = bowState.aim.wy - character.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.05) {
        const nx = dx / dist, ny = dy / dist;
        const lineLen = charge * BOW_RANGE_MAX * ppu;

        // Solid growing aim line — length = charge * maxRange
        ctx.globalAlpha = 0.55 + charge * 0.40;
        ctx.strokeStyle = COLORS.aimLine;
        ctx.lineWidth   = Math.max(1.5, 0.035 * ppu);
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(cc.x, charY);
        ctx.lineTo(cc.x + nx * lineLen, charY + ny * lineLen);
        ctx.stroke();
        ctx.lineCap = 'butt';
      }

      // Charge arc fills clockwise from 12:00
      if (charge > 0) {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = COLORS.chargeArc;
        ctx.lineWidth   = Math.max(2, 0.06 * ppu);
        ctx.beginPath();
        ctx.arc(cc.x, charY, arcR, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Arrows in flight
  for (const a of arrows) {
    const ac  = camera.worldToScreen(a.x, a.y);
    const len = 0.32 * ppu;
    const nx  = a.vx / ARROW_SPEED;
    const ny  = a.vy / ARROW_SPEED;
    ctx.lineCap     = 'round';
    ctx.strokeStyle = COLORS.arrow;
    ctx.lineWidth   = Math.max(1.5, 0.055 * ppu);
    ctx.beginPath();
    ctx.moveTo(ac.x - nx * len, ac.y - ny * len);
    ctx.lineTo(ac.x + nx * len * 0.25, ac.y + ny * len * 0.25);
    ctx.stroke();
    ctx.fillStyle = COLORS.arrowTip;
    ctx.beginPath();
    ctx.arc(ac.x + nx * len * 0.3, ac.y + ny * len * 0.3, Math.max(1.5, 0.045 * ppu), 0, Math.PI * 2);
    ctx.fill();
    ctx.lineCap = 'butt';
  }

  // Character damage flash (drawn on top of circle)
  if (character.hitAnim) drawHitRing(ctx, cc.x, charY, character.hitAnim, ppu);

  // Day/night colour overlay — radial gradient dims less near the player.
  // The inner zone (2 world-unit radius) is ~15 % opacity; full opacity at edge.
  const [or, og, ob, oa] = getDayOverlay(dayTime);
  if (oa > 0.005) {
    const pc  = camera.worldToScreen(character.x, character.y);
    const r   = 2 * ppu;
    const col = (a) => `rgba(${or},${og},${ob},${a.toFixed(3)})`;
    const grad = ctx.createRadialGradient(pc.x, pc.y, 0, pc.x, pc.y, r);
    grad.addColorStop(0, col(oa * 0.15));
    grad.addColorStop(1, col(oa));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, viewW, viewH);
  }

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
  ctx.fillText('♥', M + 2, M + BH / 2);

  const hy = M + BH + G;
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(M + 18, hy, BW, BH);
  ctx.fillStyle = COLORS.hudHunger;
  ctx.fillRect(M + 18, hy, BW * char.hunger / 100, BH);
  ctx.fillStyle = '#ffd090';
  ctx.fillText('◉', M + 2, hy + BH / 2);

  ctx.font = '9px monospace';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText(BUILD_TIME, M, hy + BH + G + 4);
}
