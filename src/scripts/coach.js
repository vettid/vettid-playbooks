// The Privacy Coach, v1: a deterministic decision tree (spec §8).
// All data is inlined at build time as data-attributes — after page load this
// script makes zero network requests, and that is a product promise.

const el = document.getElementById('coach');
if (el) {
  const tree = JSON.parse(el.dataset.tree);
  const index = JSON.parse(el.dataset.index);

  const DIFF_ORDER = { warmup: 0, fundamentals: 1, advanced: 2 };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function resolve(result) {
    if (result.mode === 'browse') {
      document.querySelector('.shelf')?.scrollIntoView({ behavior: 'smooth' });
      render(tree.root);
      return;
    }
    const matches = index.playbooks
      .filter((p) => p.concerns.some((c) => result.concerns.includes(c)))
      .filter((p) => !result.platform || p.platform === result.platform || p.platform === 'universal')
      .sort((a, b) =>
        (result.platform ? (a.platform === result.platform ? -1 : 1) - (b.platform === result.platform ? -1 : 1) : 0) ||
        DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty] ||
        b.verified_date.localeCompare(a.verified_date));
    const article = index.articles
      .map((a) => ({ a, n: a.concerns.filter((c) => result.concerns.includes(c)).length }))
      .filter((x) => x.n > 0)
      .sort((x, y) => y.n - x.n)[0]?.a;

    // The stalkerware path is serious (spec §8.4): safety framing leads,
    // and nothing about the rendering is playful.
    const safety = result.concerns.includes('stalkerware')
      ? `<p class="coach-safety">If the person who might be monitoring this phone could harm you,
         consider reading from a device they can't access. The playbook below
         starts with safety, not settings.</p>`
      : '';

    el.innerHTML = `
      <div class="coach-results">
        ${safety}
        ${matches.map((p, i) => `
          <a class="pb-card" href="${p.url}">
            ${i === 0 ? '<span class="start-here">Start here</span>' : ''}
            <h3>${esc(p.title)}</h3>
            <div class="meta">
              <span class="chip gold">${p.difficulty === 'warmup' ? 'Warm-up' : esc(p.difficulty)}</span>
              <span class="chip">~${p.time_minutes} min</span>
            </div>
          </a>`).join('')}
        ${article ? `<p class="coach-article">Want the why first? <a href="${article.url}">${esc(article.title)}</a> (${article.reading_minutes} min)</p>` : ''}
        <button type="button" class="coach-restart">Start over</button>
      </div>`;
    el.querySelector('.coach-restart').addEventListener('click', () => render(tree.root));
  }

  function render(node) {
    el.innerHTML = `
      <p class="coach-q">${esc(node.question)}</p>
      <div class="coach-options"></div>`;
    const box = el.querySelector('.coach-options');
    for (const opt of node.options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'coach-option';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        if (opt.result) resolve(opt.result);
        else render(tree.nodes[opt.next]);
      });
      box.appendChild(btn);
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .coach-q { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 1.15rem; color: #f7f7fa; margin-bottom: 18px; }
    .coach-options { display: flex; flex-direction: column; gap: 10px; }
    .coach-option {
      background: #14142a; border: 1px solid #26263e; border-radius: 10px;
      color: #c9c9d6; font: inherit; font-size: 1rem; text-align: left;
      padding: 14px 18px; cursor: pointer; transition: all 200ms;
    }
    .coach-option:hover { background: #1b1b3a; border-color: #454399; color: #f7f7fa; }
    .coach-results { display: flex; flex-direction: column; gap: 14px; align-items: stretch; }
    .coach-results .pb-card { flex: none; text-align: left; }
    .coach-article { color: #aaaaaa; font-size: 0.9rem; }
    .coach-safety {
      border: 1px solid #454399; border-left: 3px solid #ffc125;
      background: #14142a; border-radius: 0 10px 10px 0;
      color: #f7f7fa; padding: 14px 18px; text-align: left; font-size: 0.95rem;
    }
    .coach-restart {
      background: none; border: none; color: #aaaaaa; font: inherit; font-size: 0.85rem;
      cursor: pointer; text-decoration: underline; margin-top: 6px;
    }
    .coach-restart:hover { color: #ffc125; }`;
  document.head.appendChild(style);

  render(tree.root);
}
