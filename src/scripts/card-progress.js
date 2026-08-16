// Per-device progress on playbook cards, read from the same localStorage keys
// the playbook pages write. Local only, by design.
//
// Three payoffs for the stored state:
//   - a progress bar + count on any card you've started
//   - a gold "All N plays done ✓" state on cards you've finished
//   - a "Pick up where you left off" strip (hidden unless something is
//     actually in progress) so a return visit resumes instead of restarts

const started = [];

for (const card of document.querySelectorAll('[data-progress-slug]')) {
  try {
    const total = Number(card.dataset.plays);
    const done = JSON.parse(localStorage.getItem(`vettid-playbook:${card.dataset.progressSlug}`) ?? '[]');
    if (done.length === 0 || !total) continue;

    const complete = done.length >= total;
    const p = card.querySelector('.progress');

    const label = document.createElement('span');
    label.className = 'progress-label' + (complete ? ' is-complete' : '');
    label.textContent = complete ? `All ${total} plays done ✓` : `${done.length} of ${total} plays done`;

    const bar = document.createElement('span');
    bar.className = 'progress-bar';
    const fill = document.createElement('span');
    fill.className = 'progress-fill' + (complete ? ' is-complete' : '');
    fill.style.width = `${Math.round((done.length / total) * 100)}%`;
    bar.appendChild(fill);

    p.replaceChildren(label, bar);
    p.hidden = false;

    if (!complete) {
      started.push({
        href: card.getAttribute('href'),
        title: card.querySelector('h3')?.textContent ?? 'Untitled playbook',
        done: done.length,
        total,
      });
    }
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
