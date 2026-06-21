export function setupInput(canvas, camera, { onTap, isBowMode, onBowDown, onBowMove, onBowUp, onHold }) {
  const pointers = new Map();
  let mode = 'none';
  let last = null, downPos = null, moved = 0, pinchPrev = 0;
  let holdTimer = null;

  const rel = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clearHold = () => {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  };

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = rel(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 1) {
      if (isBowMode && isBowMode()) {
        mode = 'bow';
        if (onBowDown) onBowDown(p.x, p.y);
      } else {
        mode = 'drag'; moved = 0;
        last = p; downPos = p;
        // Long-press activates bow mode after 180 ms if pointer hasn't moved much.
        if (onHold) {
          holdTimer = setTimeout(() => {
            holdTimer = null;
            if (mode !== 'drag') return;
            onHold(downPos.x, downPos.y);
            if (isBowMode && isBowMode()) mode = 'bow';
          }, 180);
        }
      }
    } else if (pointers.size === 2) {
      clearHold();
      mode = 'pinch'; pinchPrev = pinchDist();
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, rel(e));
    if (mode === 'bow' && pointers.size === 1) {
      const p = rel(e);
      if (onBowMove) onBowMove(p.x, p.y);
    } else if (mode === 'drag' && pointers.size === 1) {
      const p = rel(e);
      const dx = p.x - last.x, dy = p.y - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 10) clearHold();  // moved too far — cancel hold
      camera.panByPixels(dx, dy);
      last = p;
    } else if (mode === 'pinch' && pointers.size === 2) {
      const d = pinchDist(), c = pinchCenter();
      if (pinchPrev > 0) camera.zoomAt(c.x, c.y, d / pinchPrev);
      pinchPrev = d;
    }
  });

  const end = (e) => {
    clearHold();
    const p = rel(e);
    pointers.delete(e.pointerId);
    if (mode === 'bow') {
      if (onBowUp) onBowUp(p.x, p.y);
      if (pointers.size === 0) mode = 'none';
      else if (pointers.size === 1) { mode = 'drag'; last = [...pointers.values()][0]; moved = 999; }
    } else if (mode === 'drag' && moved < 8 && downPos) {
      const w = camera.screenToWorld(downPos.x, downPos.y);
      onTap(w.x, w.y, downPos.x, downPos.y);
    }
    if (mode !== 'bow' && pointers.size === 0) {
      mode = 'none';
    } else if (mode !== 'bow' && pointers.size === 1) {
      mode = 'drag'; last = [...pointers.values()][0]; moved = 999;
    }
  };
  canvas.addEventListener('pointerup',     end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.zoomAt(
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
      Math.exp(-e.deltaY * 0.0015)
    );
  }, { passive: false });

  function pinchDist() {
    const v = [...pointers.values()];
    return Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
  }
  function pinchCenter() {
    const v = [...pointers.values()];
    return { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 };
  }
}
