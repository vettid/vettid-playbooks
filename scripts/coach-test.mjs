#!/usr/bin/env node
// The coach's two CI promises (playbooks-design-spec §8.2, §8.3, §12), on the
// BUILT page with the scripts it actually ships:
//   §8.2  after load, the coach makes zero network requests, whatever the
//         reader clicks: every path through the tree is clicked, for every
//         stored device choice, with every way a page reaches the network
//         trapped.
//   §8.3  every leaf, as the shipped coach resolves it from the build-time
//         content index, shows at least one playbook (no dead ends), and the
//         tree is at most 3 questions deep.
// Run after `astro build`; CI fails on any violation.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import jsdom from 'jsdom';

const { JSDOM, VirtualConsole, requestInterceptor } = jsdom;

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');
const PAGE = join(DIST, 'index.html');
const MAX_DEPTH = 3;
const DEVICES = [null, 'ios', 'android', 'grapheneos', 'all'];
const errors = [];

if (!existsSync(PAGE)) {
  console.error('coach-test: dist/index.html not found — run `npm run build` first');
  process.exit(1);
}
const html = readFileSync(PAGE, 'utf8');

// The page's own module scripts. Astro's output has no imports; one that did
// would load more code at runtime, so it fails here.
const scripts = [...html.matchAll(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((m) => {
  const code = readFileSync(join(DIST, m[1].replace(/^\/playbooks\//, '')), 'utf8');
  if (/^\s*import\b|\bimport\s*\(|^\s*export\b/m.test(code)) errors.push(`${m[1]}: imports or exports (would load at runtime)`);
  return code;
});
if (scripts.length === 0) errors.push('index.html: no module scripts found');

/** A fresh page, loaded, with its scripts run and every network path
 *  recorded; "after load" starts once the window's load event has fired. */
async function page(device) {
  const requests = [];
  let loaded = false;
  const note = (kind, url) => requests.push({ kind, url: String(url), afterLoad: loaded });
  // Every load jsdom itself makes (stylesheets, frames, images, its own
  // XMLHttpRequest and WebSocket): recorded, answered empty, never sent.
  const interceptor = requestInterceptor((request) => {
    note('resource', request.url);
    const type = request.url.endsWith('.css') ? 'text/css' : 'application/octet-stream';
    return new Response('', { status: 200, headers: { 'Content-Type': type } });
  });
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => errors.push(`page error: ${e.message}`));
  const { window } = new JSDOM(html, {
    url: 'https://vettid.org/playbooks/',
    runScripts: 'outside-only',
    resources: { interceptors: [interceptor] },
    pretendToBeVisual: true,
    virtualConsole,
  });
  // The script-level network APIs: each records, and refuses.
  const refuse = (kind) => function (url) {
    note(kind, url);
    throw new Error(`coach-test: ${kind} is not allowed`);
  };
  window.fetch = refuse('fetch');
  window.navigator.sendBeacon = refuse('sendBeacon');
  window.WebSocket = refuse('WebSocket');
  window.EventSource = refuse('EventSource');
  window.XMLHttpRequest.prototype.open = refuse('XMLHttpRequest');
  window.Worker = refuse('Worker');
  window.SharedWorker = refuse('SharedWorker');
  window.open = refuse('window.open');
  // Layout APIs jsdom doesn't have; no network either way.
  window.Element.prototype.scrollIntoView = () => {};
  if (device) window.localStorage.setItem('vettid-device', device);
  for (const code of scripts) window.eval(`(function(){"use strict";\n${code}\n})();`);
  if (window.document.readyState !== 'complete') await new Promise((r) => window.addEventListener('load', r));
  loaded = true;
  // jsdom doesn't fetch images (or media) itself, so anything that would
  // load is also checked in the DOM: what was there at load is the baseline.
  const baseline = new Set(loading(window));
  const newLoads = () => loading(window).filter((x) => !baseline.has(x));
  return { window, coach: window.document.getElementById('coach'), requests, newLoads };
}

/** Elements that make the browser load something, as "tag attr=url". Plain
 *  <a href> links load nothing until followed, so they don't count. */
function loading(window) {
  const out = [];
  for (const el of window.document.querySelectorAll('[src],[srcset],[poster],[data],link[href],[style*="url("]')) {
    for (const a of ['src', 'srcset', 'poster', 'data']) if (el.hasAttribute(a)) out.push(`${el.localName} ${a}=${el.getAttribute(a)}`);
    if (el.localName === 'link') out.push(`link href=${el.getAttribute('href')}`);
    const st = el.getAttribute('style') || '';
    for (const m of st.matchAll(/url\(([^)]*)\)/g)) out.push(`${el.localName} style url(${m[1]})`);
  }
  return out;
}

const first = await page(null);
if (!first.coach) {
  console.error('coach-test FAILED: index.html has no #coach element');
  process.exit(1);
}
const tree = JSON.parse(first.coach.dataset.tree);

// Every path from the root to a leaf, as option labels; depth checked on
// the way (questions asked, the root's included).
const paths = [];
const collect = (node, labels, d) => {
  if (d > MAX_DEPTH) errors.push(`coach: deeper than ${MAX_DEPTH} questions at "${node.question}"`);
  for (const opt of node.options ?? []) {
    const path = [...labels, opt.label];
    if (opt.result) paths.push({ path, result: opt.result });
    else if (!tree.nodes[opt.next]) errors.push(`coach: missing node "${opt.next}" at ${path.join(' → ')}`);
    else collect(tree.nodes[opt.next], path, d + 1);
  }
};
collect(tree.root, [], 1);
if (paths.length === 0) errors.push('coach: no leaves');

let walked = 0;
let afterLoad = 0;
const record = (p) => {
  for (const r of p.requests.filter((x) => x.afterLoad)) {
    afterLoad++;
    errors.push(`coach: network request after load: ${r.kind} ${r.url}`);
  }
  for (const x of p.newLoads()) {
    afterLoad++;
    errors.push(`coach: element added after load that loads something: ${x}`);
  }
};
// Let anything the clicks started settle before counting.
const settle = () => new Promise((r) => setTimeout(r, 50));
for (const device of DEVICES) {
  for (const { path, result } of paths) {
    const p = await page(device);
    const where = `${path.join(' → ')} (device ${device ?? 'none'})`;
    let ok = true;
    for (const label of path) {
      const b = [...p.coach.querySelectorAll('button.coach-option')].find((x) => x.textContent === label);
      if (!b) {
        errors.push(`coach: option "${label}" not on screen at ${where}`);
        ok = false;
        break;
      }
      b.click();
    }
    if (ok && result.mode !== 'browse') {
      const cards = p.coach.querySelectorAll('.coach-results a.pb-card').length;
      if (cards === 0) errors.push(`coach: leaf ${where} shows zero playbooks`);
      // Start over, too.
      p.coach.querySelector('button.coach-restart')?.click();
    }
    walked++;
    await settle();
    record(p);
    p.window.close();
  }
}
// The device rows, which the coach listens to, clicked after a result.
{
  const p = await page(null);
  const leaf = paths.find((x) => x.result.mode !== 'browse');
  for (const label of leaf?.path ?? []) {
    [...p.coach.querySelectorAll('button.coach-option')].find((x) => x.textContent === label)?.click();
  }
  for (const b of p.window.document.querySelectorAll('[data-device-row] button')) b.click();
  await settle();
  record(p);
  p.window.close();
}

console.log(`coach-test: ${paths.length} leaves × ${DEVICES.length} device choices walked (${walked}); ${afterLoad} requests after load`);
if (errors.length) {
  console.error(`coach-test FAILED (${errors.length}):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('coach-test OK — zero network requests after load, every leaf shows a playbook, depth ≤ 3');
