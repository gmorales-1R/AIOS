const ITEM_IMGS = {};
for (const type of ['apple', 'sword', 'bow', 'shield']) {
  ITEM_IMGS[type] = new URL(`../assets/items/${type}.png`, import.meta.url).href;
}

export class UI {
  constructor() {
    this._start   = document.getElementById('start-screen');
    this._pause   = document.getElementById('pause-screen');
    this._confirm = document.getElementById('confirm-screen');
    this._dead    = document.getElementById('dead-screen');
    this._toggle  = document.getElementById('btn-menu-toggle');
    this._toast   = document.getElementById('save-toast');
    this._toastId = null;
  }

  bind({ onNewGame, onContinue, onResume, onSave, onBackMenu, onToggle, onAttack, onDefend, onInteract,
         onRange, onReloadSave, onDeadNewGame, onDeadMenu }) {
    document.getElementById('btn-new-game').onclick  = onNewGame;
    document.getElementById('btn-continue').onclick  = onContinue;
    document.getElementById('btn-resume').onclick    = onResume;
    document.getElementById('btn-save').onclick      = onSave;
    document.getElementById('btn-back-menu').onclick = onBackMenu;
    this._toggle.onclick = onToggle;
    if (onAttack)      document.getElementById('act-melee').onclick        = onAttack;
    if (onDefend)      document.getElementById('act-defend').onclick       = onDefend;
    if (onInteract)    document.getElementById('act-interact').onclick     = onInteract;
    if (onRange)       document.getElementById('act-range').onclick        = onRange;
    if (onReloadSave)  document.getElementById('btn-reload-save').onclick  = onReloadSave;
    if (onDeadNewGame) document.getElementById('btn-dead-new-game').onclick = onDeadNewGame;
    if (onDeadMenu)    document.getElementById('btn-dead-menu').onclick    = onDeadMenu;
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') onToggle();
    });
  }

  // Wire click handlers for inventory slots.
  bindInventory(onSlotClick) {
    document.querySelectorAll('.inv-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        onSlotClick(parseInt(slot.dataset.slot, 10));
      });
    });
  }

  showDead(hasSave) {
    document.getElementById('btn-reload-save').disabled = !hasSave;
    this._hide(this._pause);
    this._show(this._dead);
  }

  hideDead() { this._hide(this._dead); }

  showStart(hasSave) {
    document.getElementById('btn-continue').disabled = !hasSave;
    this._show(this._start);
    this._hide(this._pause);
    this._hide(this._confirm);
    this._hide(this._toggle);
  }

  hideStart() {
    this._hide(this._start);
    this._show(this._toggle);
  }

  showPause() {
    this._show(this._pause);
    this._hide(this._confirm);
  }

  hidePause() {
    this._hide(this._pause);
    this._hide(this._confirm);
  }

  showConfirm(onYes) {
    this._show(this._confirm);
    document.getElementById('btn-confirm-yes').onclick = () => {
      this._hide(this._confirm);
      onYes();
    };
    document.getElementById('btn-confirm-no').onclick = () => {
      this._hide(this._confirm);
    };
  }

  isConfirmVisible() {
    return !this._confirm.classList.contains('hidden');
  }

  hideConfirm() { this._hide(this._confirm); }

  showActionBar() {
    this._show(document.getElementById('action-bar'));
    this._show(document.getElementById('action-column'));
  }
  hideActionBar() {
    this._hide(document.getElementById('action-bar'));
    this._hide(document.getElementById('action-column'));
  }

  setActionEnabled(id, enabled) {
    const btn = document.getElementById('act-' + id);
    if (btn) btn.disabled = !enabled;
  }

  // Render an inventory slot.
  setSlot(index, item) {
    const slot = document.querySelector(`.inv-slot[data-slot="${index}"]`);
    if (!slot) return;

    slot.querySelector('.slot-icon')?.remove();
    slot.querySelector('.slot-count')?.remove();
    slot.classList.remove('filled', 'equipped');

    if (!item) return;

    slot.classList.add('filled');
    const icon = document.createElement('div');
    icon.className = 'slot-icon';

    const img = document.createElement('img');
    img.src = ITEM_IMGS[item.type] || '';
    img.alt = item.type;
    icon.appendChild(img);

    if (item.type === 'apple') {
      const cnt = document.createElement('span');
      cnt.className = 'slot-count';
      cnt.textContent = item.count;
      slot.appendChild(cnt);
    } else if (item.equipped) {
      slot.classList.add('equipped');
    }

    slot.appendChild(icon);
  }

  // Generic timed overlay: yellow arc for active state, blue for cooldown.
  // state: { active: {remaining, total} | null, cooldown: {remaining, total} | null }
  updateSlotTimer(index, state) {
    const slot = document.querySelector(`.inv-slot[data-slot="${index}"]`);
    if (!slot) return;
    const C = 113.1; // 2π*18

    let svg = slot.querySelector('.slot-timer');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'slot-timer');
      svg.setAttribute('viewBox', '0 0 44 44');

      const mk = (cls, color) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('class', cls);
        c.setAttribute('cx', '22'); c.setAttribute('cy', '22'); c.setAttribute('r', '18');
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', color);
        c.setAttribute('stroke-width', '3');
        c.setAttribute('stroke-dasharray', String(C));
        c.setAttribute('stroke-dashoffset', String(C));
        c.setAttribute('transform', 'rotate(-90 22 22)');
        c.style.display = 'none';
        return c;
      };
      svg.appendChild(mk('timer-active',   '#ffe600'));
      svg.appendChild(mk('timer-cooldown', '#4488ff'));
      slot.appendChild(svg);
    }

    const ac = svg.querySelector('.timer-active');
    const cd = svg.querySelector('.timer-cooldown');

    if (state?.active) {
      const f = Math.max(0, Math.min(1, state.active.remaining / state.active.total));
      ac.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(1));
      ac.style.display = '';
    } else {
      ac.style.display = 'none';
    }

    if (state?.cooldown) {
      const f = Math.max(0, Math.min(1, state.cooldown.remaining / state.cooldown.total));
      cd.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(1));
      cd.style.display = '';
    } else {
      cd.style.display = 'none';
    }
  }

  toast(msg) {
    clearTimeout(this._toastId);
    this._toast.textContent = msg;
    this._toast.classList.remove('hidden', 'fading');
    this._toastId = setTimeout(() => {
      this._toast.classList.add('fading');
      setTimeout(() => this._toast.classList.add('hidden'), 500);
    }, 1800);
  }

  _show(el) { el.classList.remove('hidden'); }
  _hide(el) { el.classList.add('hidden'); }
}
