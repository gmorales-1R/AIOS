const PREFIX    = 'sw_save_';
const IDX_KEY   = 'sw_idx';
const MAX_SAVES = 3;
const SAVE_VER  = 1;

function store(key, val) {
  try { localStorage.setItem(key, val); return; } catch {}
  try { sessionStorage.setItem(key, val); return; } catch {}
  document.cookie =
    encodeURIComponent(key) + '=' + encodeURIComponent(val) +
    ';max-age=' + (365 * 86400) + ';path=/';
}

function retrieve(key) {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch {}
  try {
    const v = sessionStorage.getItem(key);
    if (v !== null) return v;
  } catch {}
  const enc  = encodeURIComponent(key) + '=';
  const part = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(enc));
  return part ? decodeURIComponent(part.slice(enc.length)) : null;
}

function erase(key) {
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
  document.cookie = encodeURIComponent(key) + '=;max-age=0;path=/';
}

function loadIndex() {
  const raw = retrieve(IDX_KEY);
  return raw ? JSON.parse(raw) : [];
}
function storeIndex(idx) { store(IDX_KEY, JSON.stringify(idx)); }

export function saveGame(state) {
  let idx = loadIndex();
  let key;

  if (idx.length < MAX_SAVES) {
    key = PREFIX + Date.now();
  } else {
    idx.sort((a, b) => a.savedAt - b.savedAt);
    key = idx[0].key;
    erase(key);
    idx.shift();
  }

  const savedAt = Date.now();
  store(key, JSON.stringify({ ...state, savedAt, version: SAVE_VER }));
  idx.push({ key, savedAt });
  storeIndex(idx);
  return savedAt;
}

export function loadLatestSave() {
  const idx = loadIndex();
  if (!idx.length) return null;
  idx.sort((a, b) => b.savedAt - a.savedAt);
  const raw = retrieve(idx[0].key);
  return raw ? JSON.parse(raw) : null;
}

export function hasSaves() { return loadIndex().length > 0; }
