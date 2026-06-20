export class UI {
  constructor() {
    this._start   = document.getElementById('start-screen');
    this._pause   = document.getElementById('pause-screen');
    this._confirm = document.getElementById('confirm-screen');
    this._toggle  = document.getElementById('btn-menu-toggle');
    this._toast   = document.getElementById('save-toast');
    this._toastId = null;
  }

  // Wire all button callbacks in one call.
  bind({ onNewGame, onContinue, onResume, onSave, onBackMenu, onToggle }) {
    document.getElementById('btn-new-game').onclick  = onNewGame;
    document.getElementById('btn-continue').onclick  = onContinue;
    document.getElementById('btn-resume').onclick    = onResume;
    document.getElementById('btn-save').onclick      = onSave;
    document.getElementById('btn-back-menu').onclick = onBackMenu;
    this._toggle.onclick = onToggle;
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') onToggle();
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

  // Show the confirmation dialog. onYes fires if the user confirms.
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

  showActionBar() { this._show(document.getElementById('action-bar')); }
  hideActionBar() { this._hide(document.getElementById('action-bar')); }

  // Enable or disable an action button by short id ('melee'|'defend'|'range'|'interact').
  setActionEnabled(id, enabled) {
    const btn = document.getElementById('act-' + id);
    if (btn) btn.disabled = !enabled;
  }

  // Set an inventory slot contents. item = null to clear, or { label } to fill.
  setSlot(index, item) {
    const slot = document.querySelector(`.inv-slot[data-slot="${index}"]`);
    if (!slot) return;
    slot.classList.toggle('filled', !!item);
    let icon = slot.querySelector('.inv-icon');
    if (item) {
      if (!icon) { icon = document.createElement('span'); icon.className = 'inv-icon'; slot.appendChild(icon); }
      icon.textContent = item.label ?? '';
    } else if (icon) {
      icon.remove();
    }
  }

  // Show a toast message that fades after 1.8 s.
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
