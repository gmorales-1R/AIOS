export class UI {
  constructor() {
    this._start   = document.getElementById('start-screen');
    this._pause   = document.getElementById('pause-screen');
    this._confirm = document.getElementById('confirm-screen');
    this._toggle  = document.getElementById('btn-menu-toggle');
    this._toast   = document.getElementById('save-toast');
    this._toastId = null;
  }

  bind({ onNewGame, onContinue, onResume, onSave, onBackMenu, onToggle, onAttack, onInteract }) {
    document.getElementById('btn-new-game').onclick  = onNewGame;
    document.getElementById('btn-continue').onclick  = onContinue;
    document.getElementById('btn-resume').onclick    = onResume;
    document.getElementById('btn-save').onclick      = onSave;
    document.getElementById('btn-back-menu').onclick = onBackMenu;
    this._toggle.onclick = onToggle;
    if (onAttack)   document.getElementById('act-melee').onclick    = onAttack;
    if (onInteract) document.getElementById('act-interact').onclick = onInteract;
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

  // Render an inventory slot. item: null | { type:'apple', count } | { type:'sword', equipped }
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

    if (item.type === 'apple') {
      icon.innerHTML =
        '<svg viewBox="-1 -1 2 2" class="slot-svg" xmlns="http://www.w3.org/2000/svg">' +
        '<circle r="0.82" fill="#e83a2a" stroke="#7a1a10" stroke-width="0.14"/>' +
        '</svg>';
      const cnt = document.createElement('span');
      cnt.className = 'slot-count';
      cnt.textContent = item.count;
      slot.appendChild(cnt);
    } else if (item.type === 'sword') {
      icon.innerHTML =
        '<svg viewBox="-1 -1 2 2" class="slot-svg" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="-0.13" y="-0.9" width="0.26" height="1.8" fill="#c8c8e8" stroke="#fff" stroke-width="0.04"/>' +
        '<rect x="-0.65" y="-0.14" width="1.3" height="0.28" fill="#c8c8e8" stroke="#fff" stroke-width="0.04"/>' +
        '</svg>';
      if (item.equipped) slot.classList.add('equipped');
    }

    slot.appendChild(icon);
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
