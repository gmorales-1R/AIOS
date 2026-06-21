export function setupInput(canvas, camera, { onTap }) {
  const pointers = new Map();
  let mode = 'none';
  let last = null, downPos = null, moved = 0, pinchPrev = 0;

  const rel = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, rel(e));
    if (pointers.size === 1) {
      mode = 'drag'; moved = 0;
      last = rel(e); downPos = rel(e);
    } else if (pointers.size === 2) {
      mode = 'pinch'; pinchPrev = pinchDist();
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, rel(e));
    if (mode === 'drag' && pointers.size === 1) {
      const p = rel(e);
      const dx = p.x - last.x, dy = p.y - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      camera.panByPixels(dx, dy);
      last = p;
    } else if (mode === 'pinch' && pointers.size === 2) {
      const d = pinchDist(), c = pinchCenter();
      if (pinchPrev > 0) camera.zoomAt(c.x, c.y, d / pinchPrev);
      pinchPrev = d;
    }
  });

  const end = (e) => {
    pointers.delete(e.pointerId);
    if (mode === 'drag' && moved < 8 && downPos) {
      const w = camera.screenToWorld(downPos.x, downPos.y);
      onTap(w.x, w.y, downPos.x, downPos.y);
    }
    if (pointers.size === 0) {
      mode = 'none';
    } else if (pointers.size === 1) {
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
