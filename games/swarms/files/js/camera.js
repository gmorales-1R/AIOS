import { HEX_W, FIT_HEXES, ZOOM_MIN, ZOOM_MAX, FOLLOW_LERP } from './config.js';

// Camera holds a world-space center (x, y) and a zoom factor (z).
// Reusable focus: focusOn({x, y, z}) animates toward any point of interest;
// update() lerps each frame. User pan/zoom cancels an active focus.
export class Camera {
  constructor() {
    this.x = 0; this.y = 0; this.z = 1;
    this.viewW = 1; this.viewH = 1;
    this.baseScale = 1;
    this.tx = 0; this.ty = 0; this.tz = 1;
    this.animating = false;
  }

  setViewport(w, h) {
    this.viewW = w; this.viewH = h;
    this.baseScale = Math.min(w, h) / (FIT_HEXES * HEX_W);
  }

  get ppu() { return this.baseScale * this.z; }   // pixels per world unit

  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.ppu + this.viewW / 2,
      y: (wy - this.y) * this.ppu + this.viewH / 2,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewW / 2) / this.ppu + this.x,
      y: (sy - this.viewH / 2) / this.ppu + this.y,
    };
  }

  panByPixels(dx, dy) {
    this.x -= dx / this.ppu;
    this.y -= dy / this.ppu;
    this.stopFollow();
  }

  // Zoom while keeping the world point under (sx, sy) fixed on screen.
  zoomAt(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.z * factor));
    this.x = before.x - (sx - this.viewW / 2) / this.ppu;
    this.y = before.y - (sy - this.viewH / 2) / this.ppu;
    this.stopFollow();
  }

  // Smoothly move the camera toward a point of interest. Omit z to keep zoom.
  focusOn({ x, y, z } = {}) {
    if (x !== undefined) this.tx = x;
    if (y !== undefined) this.ty = y;
    this.tz = (z !== undefined) ? z : this.z;
    this.animating = true;
  }

  stopFollow() {
    this.animating = false;
    this.tx = this.x; this.ty = this.y; this.tz = this.z;
  }

  update() {
    if (!this.animating) return;
    this.x += (this.tx - this.x) * FOLLOW_LERP;
    this.y += (this.ty - this.y) * FOLLOW_LERP;
    this.z += (this.tz - this.z) * FOLLOW_LERP;
    if (Math.abs(this.tx - this.x) < 1e-3 &&
        Math.abs(this.ty - this.y) < 1e-3 &&
        Math.abs(this.tz - this.z) < 1e-4) {
      this.x = this.tx; this.y = this.ty; this.z = this.tz;
      this.animating = false;
    }
  }
}
