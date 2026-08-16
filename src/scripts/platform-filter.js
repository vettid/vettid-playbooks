// Device filter for the playbook shelf. The choice persists in localStorage
// (`vettid-device`) — local only, like all state on this site — and the coach
// reads the same key to rank results for your device first.
//
// Universal playbooks are relevant to everyone, so they show under every
// filter; a platform choice hides only the *other* platforms' cards.

const bar = document.getElementById('platform-filter');
if (bar) {
  const KEY = 'vettid-device';
  const buttons = [...bar.querySelectorAll('button[data-filter]')];
  const cards = [...document.querySelectorAll('.pb-card[data-platform]')];
  const valid = new Set(buttons.map((b) => b.dataset.filter));

  const apply = (choice) => {
    for (const b of buttons) {
      const on = b.dataset.filter === choice;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    }
    for (const card of cards) {
      const p = card.dataset.platform;
      card.hidden = !(choice === 'all' || p === 'universal' || p === choice);
    }
  };

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* private mode etc. */ }
  apply(valid.has(saved) ? saved : 'all');

  bar.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-filter]');
    if (!b) return;
    apply(b.dataset.filter);
    try { localStorage.setItem(KEY, b.dataset.filter); } catch { /* fine */ }
  });
}
