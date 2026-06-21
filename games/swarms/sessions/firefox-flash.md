# Firefox Canvas Flash — Investigation Log

Confirmed Chrome: no flashes. Firefox: persistent row-shaped green/red flashes.
Each fix is applied to `code/src/css/style.css` and/or `code/src/js/render.js`, regenerated and tested.

---

## Candidates (prioritised)

### 1. `will-change: transform` on `#game` canvas
**Hypothesis:** Firefox promotes the canvas to a dedicated compositor layer. When other fixed
elements (action bar, HUD buttons, screens) trigger re-compositing, Firefox may expose the
canvas layer momentarily in an undrawn or previous state, producing a flash.
**Fix:** Remove `will-change: transform` (or replace with `will-change: contents`).
**Result:** [x] no change — reverted

---

### 2. CSS `background` on the canvas element
**Hypothesis:** Firefox may paint the CSS `background: #0a0a0f` of `#game` between frames
when the canvas draw hasn't completed yet, briefly revealing the background through
incompletely-drawn pixels (especially during resize or compositing events).
**Fix:** Remove `background` from `#game` — the JS `fillRect` on every frame already covers it.
**Result:** [x] no change — reverted (applied alongside #1, both reverted together)

---

### 3. `save()/setTransform(identity)/clearRect/restore()` pattern
**Hypothesis:** Firefox may flush or snapshot the canvas between `save()` and `restore()`
when the transform is changed, briefly exposing intermediate render state.
**Fix:** Replace the save/identity/clearRect/restore block with a direct
`ctx.clearRect(0, 0, viewW, viewH)` using logical (CSS) coordinates, relying on the
persistent DPR transform set at resize time.
**Result:** [ ] worked / [ ] no change / [ ] made worse

---

### 4. `CanvasPattern.setTransform(DOMMatrix)` called every frame
**Hypothesis:** Firefox's implementation of `CanvasPattern.setTransform()` may invalidate
or defer the pattern, causing a one-frame gap where the fill falls back to a solid colour
(which could appear as a flash of `COLORS.tileFill`/`waterFill`).
**Fix:** Context-transform approach — translate/scale the ctx before filling with the
pattern (which has no per-tile transform), then restore. Avoids per-tile DOMMatrix allocation.
**Result:** [ ] worked / [ ] no change / [ ] made worse

---

### 5. `position: fixed` stacking context interaction
**Hypothesis:** `position: fixed` creates a stacking context. Firefox may composite
`#game` relative to other fixed elements (`.screen`, `.hud-btn`, `#action-bar`) at a
different paint order on certain frames, briefly showing the element behind the canvas.
**Fix:** Change `#game` to `position: absolute` — safe since `html/body` are already
`overflow: hidden` and `width/height: 100%`.
**Result:** [ ] worked / [ ] no change / [ ] made worse

---

## Applied so far

- **#1 + #2** — removed `will-change: transform` and `background` from `#game` → no change, reverted
- **#3 (integer rounding)** — `Math.round()` on all `worldToScreen` results in render.js (pending test)
