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

  // Completion banner: appears under the plays the moment the last box is
  // checked (and on return visits), so finishing feels like finishing.
  const banner = document.createElement('p');
  banner.className = 'playbook-complete';
  banner.hidden = true;
  root.querySelector('.plays')?.after(banner);
  const refresh = () => {
    const complete = plays.length > 0 && done.size >= plays.length;
    if (complete) banner.textContent = `All ${plays.length} plays done ✓ — see what you're now covered against below.`;
    banner.hidden = !complete;
  };

  plays.forEach((li, i) => {
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'play-check';
    box.checked = done.has(i);
    box.setAttribute('aria-label', `Mark play ${i + 1} done`);
    box.addEventListener('change', () => {
      box.checked ? done.add(i) : done.delete(i);
      save(done);
      refresh();
    });
    li.appendChild(box);
  });
  refresh();

  // Minimal styling hook for the injected checkboxes
  const style = document.createElement('style');
  style.textContent = `
    .plays > li { padding-right: 56px; }
    .play-check {
      position: absolute; right: 18px; top: 22px;
      width: 22px; height: 22px; accent-color: #ffc125; cursor: pointer;
    }
    .playbook-complete {
      border: 1px solid rgba(255, 193, 37, 0.45);
      background: rgba(255, 193, 37, 0.08);
      border-radius: 10px;
      color: #ffc125;
      text-align: center;
      padding: 14px 18px;
      margin-top: 18px;
      font-weight: 600;
    }`;
  document.head.appendChild(style);
}
