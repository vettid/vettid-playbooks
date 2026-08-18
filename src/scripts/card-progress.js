// Per-device progress on playbook cards, read from the same localStorage keys
// the playbook pages write. Local only, by design.
//
// Each playbook appears exactly once:
//   - in progress → only in the "Pick up where you left off" strip (its grid
//     card is hidden; data-in-progress tells the device filter to keep it so)
//   - completed → only in the grid, wearing the gold "All N plays done ✓"
//     state (done is useful information when browsing the catalog)
//   - untouched → only in the grid, plain

const started = [];

for (const card of document.querySelectorAll('[data-progress-slug]')) {
  try {
    const total = Number(card.dataset.plays);
    const done = JSON.parse(localStorage.getItem(`vettid-playbook:${card.dataset.progressSlug}`) ?? '[]');
    if (done.length === 0 || !total) continue;

    const complete = done.length >= total;

    if (!complete) {
      card.dataset.inProgress = '1';
      card.hidden = true;
      started.push({
        href: card.getAttribute('href'),
        title: card.querySelector('h3')?.textContent ?? 'Untitled playbook',
        done: done.length,
        total,
      });
      continue;
    }

    const p = card.querySelector('.progress');
    const label = document.createElement('span');
    label.className = 'progress-label is-complete';
    label.textContent = `All ${total} plays done ✓`;
    const bar = document.createElement('span');
    bar.className = 'progress-bar';
    const fill = document.createElement('span');
    fill.className = 'progress-fill is-complete';
    fill.style.width = '100%';
    bar.appendChild(fill);
    p.replaceChildren(label, bar);
    p.hidden = false;
  } catch { /* unreadable state is the same as no state */ }
}

const strip = document.getElementById('resume');
if (strip && started.length > 0) {
  const list = strip.querySelector('.resume-list');
  for (const r of started) {
    const a = document.createElement('a');
    a.className = 'resume-item';
    a.href = r.href;
    const t = document.createElement('span');
    t.textContent = r.title;
    const n = document.createElement('span');
    n.className = 'resume-count';
    n.textContent = `${r.done} of ${r.total} done · continue →`;
    a.append(t, n);
    list.appendChild(a);
  }
  strip.hidden = false;
}

// Styling for JS-created elements lives here with them: Astro's scoped CSS
// can't reach nodes it never rendered.
const style = document.createElement('style');
style.textContent = `
  .pb-card .progress { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
  .progress-label { font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; letter-spacing: 0.06em; color: #aaaaaa; }
  .progress-label.is-complete { color: #ffc125; }
  .progress-bar { display: block; height: 4px; border-radius: 2px; background: #26263e; overflow: hidden; }
  .progress-fill { display: block; height: 100%; border-radius: 2px; background: #454399; }
  .progress-fill.is-complete { background: #ffc125; }
  .resume { max-width: 640px; margin: 0 auto 30px; }
  .resume h3 {
    font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; font-weight: 400;
    letter-spacing: 0.14em; text-transform: uppercase; color: #ffc125;
    text-align: center; margin-bottom: 12px;
  }
  .resume-item {
    display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
    background: #14142a; border: 1px solid #26263e; border-radius: 10px;
    padding: 12px 18px; margin-bottom: 8px; color: #f7f7fa;
  }
  .resume-item:hover { border-color: #454399; background: #1b1b3a; text-decoration: none; }
  .resume-count { font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; color: #aaaaaa; white-space: nowrap; }
  .resume-item:hover .resume-count { color: #ffc125; }`;
document.head.appendChild(style);
