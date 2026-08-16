// One device choice, everywhere. Both device rows (the picker in "Choose"
// and the chips on the shelf) are synced views of the same stored value
// (`vettid-device`, localStorage — local only, like all state here). Changing
// either updates the other, filters the shelf, and re-ranks coach results
// (coach.js listens for the event this dispatches).
//
// First visit: guess iPhone/Android from the browser's own self-description
// (navigator.userAgent, read locally — no request is made anywhere). The
// guess pre-selects but is never persisted; only an explicit tap is saved.
// GrapheneOS deliberately looks like Android to a browser, so its users tap
// for themselves — the note in the picker says so. Desktops get no guess.

const rows = [...document.querySelectorAll('[data-device-row]')];
if (rows.length) {
  const KEY = 'vettid-device';
  const VALID = new Set(['ios', 'android', 'grapheneos', 'all']);
  const cards = [...document.querySelectorAll('.pb-card[data-platform]')];
  const hint = document.getElementById('device-hint');

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* private mode etc. */ }

  let device;
  let guessed = false;
  if (VALID.has(saved)) {
    device = saved;
  } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    device = 'ios'; guessed = true;
  } else if (/Android/.test(navigator.userAgent)) {
    device = 'android'; guessed = true;
  } else {
    device = 'all';
  }

  const apply = () => {
    for (const row of rows) {
      for (const b of row.querySelectorAll('button[data-device]')) {
        const on = b.dataset.device === device;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      }
    }
    for (const card of cards) {
      const p = card.dataset.platform;
      card.hidden = !(device === 'all' || p === 'universal' || p === device);
    }
    if (hint) hint.textContent = guessed ? 'Looks like (change if not):' : "You're on:";
    window.dispatchEvent(new CustomEvent('vettid-device-change', { detail: device }));
  };

  for (const row of rows) {
    row.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-device]');
      if (!b) return;
      device = b.dataset.device;
      guessed = false;
      try { localStorage.setItem(KEY, device); } catch { /* fine */ }
      apply();
    });
  }

  apply();
}
