// Play checkboxes with localStorage persistence (spec §9).
// Key: `vettid-playbook:{slug}` → array of completed play indices.
// No accounts, no sync, no cookies — clearing browser data clears progress.

const root = document.querySelector('[data-playbook]');
if (root) {
  const slug = root.dataset.playbook;
  const key = `vettid-playbook:${slug}`;

  const load = () => {
    try { return new Set(JSON.parse(localStorage.getItem(key) ?? '[]')); }
    catch { return new Set(); }
  };
  const save = (set) => localStorage.setItem(key, JSON.stringify([...set]));

  const done = load();
  const plays = root.querySelectorAll('.plays > li');

  plays.forEach((li, i) => {
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'play-check';
    box.checked = done.has(i);
    box.setAttribute('aria-label', `Mark play ${i + 1} done`);
    box.addEventListener('change', () => {
      box.checked ? done.add(i) : done.delete(i);
      save(done);
    });
    li.appendChild(box);
  });

  // Minimal styling hook for the injected checkboxes
  const style = document.createElement('style');
  style.textContent = `
    .plays > li { padding-right: 56px; }
    .play-check {
      position: absolute; right: 18px; top: 22px;
      width: 22px; height: 22px; accent-color: #ffc125; cursor: pointer;
    }`;
  document.head.appendChild(style);
}
