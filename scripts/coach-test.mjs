#!/usr/bin/env node
// The coach's two CI promises (playbooks-design-spec §8.2, §8.3, §12), on the
// BUILT page with the scripts it actually ships:
//   §8.2  after load, the coach makes zero network requests, whatever the
//         reader clicks: every path through the tree is clicked, for every
//         stored device choice, with the page's ways to the network trapped
//         (below), and the page's own scripts may make none at any time.
//   §8.3  every leaf, as the shipped coach resolves it from the build-time
//         content index, shows at least one playbook that exists in the
//         build (no dead ends), and the tree is at most 3 questions deep.
// Run after `astro build`; CI fails on any violation.
//
// What is trapped:
//   - script APIs, at any time (startup too): fetch, XMLHttpRequest,
//     WebSocket, EventSource, navigator.sendBeacon, Worker, SharedWorker,
//     window.open, import();
//   - every URL-carrying attribute or property set from script (src, srcset,
//     poster, data, href, ping), attached to the page or not, at the moment
//     it is set: a detached `new Image().src` counts;
//   - CSS: url() and @import added after load, in <style> text or in rules
//     (insertRule);
//   - jsdom's own loads after load (stylesheets, frames);
//   - timers: setTimeout, setInterval and requestAnimationFrame run at once,
//     so a delayed request still happens inside the walk.
//   Form submits and navigation fail through jsdom's "Not implemented"
//   errors, which count as failures here.
// Not run: /shared/js/nav.js, the main site's classic script (vettid.org,
// out of this repo's scope).

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
const URL_ATTRS = new Set(['src', 'srcset', 'poster', 'data', 'href', 'ping', 'xlink:href']);
const errors = [];

if (!existsSync(PAGE)) {
  console.error('coach-test: dist/index.html not found — run `npm run build` first');
  process.exit(1);
}
const html = readFileSync(PAGE, 'utf8');

// The page's own module scripts. Astro's output for this page has no
// imports; one that did would load more code at runtime, so it fails here.
const scripts = [];
for (const tag of html.matchAll(/<script\b([^>]*)>/g)) {
  const attrs = tag[1];
  const src = attrs.match(/\bsrc="([^"]+)"/)?.[1];
  if (!/\btype="module"/.test(attrs) || !src) continue;
  const code = readFileSync(join(DIST, src.replace(/^\/playbooks\//, '')), 'utf8');
  if (/^\s*import\b|\bimport\s*\(|^\s*export\b/m.test(code)) errors.push(`${src}: imports or exports (would load at runtime)`);
  scripts.push(code);
}
if (scripts.length === 0) errors.push('index.html: no module scripts found');

/** A fresh page, loaded, with its scripts run and every way to the network
 *  recorded. "After load" starts once the window's load event has fired;
 *  the scripts' own network calls count at any time. */
async function page(device) {
  const requests = [];
  let loaded = false;
  const note = (kind, url, always = false) => requests.push({ kind, url: String(url), counts: always || loaded });

  // jsdom's own loads (stylesheets, frames): recorded, answered empty, never
  // sent. Those it makes while reading the page's HTML don't count.
  const interceptor = requestInterceptor((request) => {
    note('load', request.url);
    const type = request.url.endsWith('.css') ? 'text/css' : 'application/octet-stream';
    return new Response('', { status: 200, headers: { 'Content-Type': type } });
  });
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => {
    // A stylesheet jsdom can't parse is jsdom's limit, not the page's.
    if (/Could not parse CSS stylesheet/.test(e.message)) return;
    errors.push(`page error: ${e.message}`);
  });
  const { window } = new JSDOM(html, {
    url: 'https://vettid.org/playbooks/',
    runScripts: 'outside-only',
    resources: { interceptors: [interceptor] },
    pretendToBeVisual: true,
    virtualConsole,
  });

  // Script APIs: recorded whenever they are called, then refused.
  const refuse = (kind) => function (url) {
    note(kind, url, true);
    throw new Error(`coach-test: ${kind} is not allowed`);
  };
  window.fetch = function (url) {
    note('fetch', url?.url ?? url, true);
    // Rejected, but marked handled: the call is what's reported, not a crash.
    const refused = Promise.reject(new Error('coach-test: fetch is not allowed'));
    refused.catch(() => {});
    return refused;
  };
  window.navigator.sendBeacon = refuse('sendBeacon');
  window.WebSocket = refuse('WebSocket');
  window.EventSource = refuse('EventSource');
  window.XMLHttpRequest.prototype.open = function (_m, url) { note('XMLHttpRequest', url, true); throw new Error('coach-test: XMLHttpRequest is not allowed'); };
  window.Worker = refuse('Worker');
  window.SharedWorker = refuse('SharedWorker');
  window.open = refuse('window.open');

  // URL-carrying attributes and properties, at the moment they are set
  // (the HTML parser doesn't go through these, so the page's own markup
  // isn't counted). A plain <a href> loads nothing until followed.
  const urlSet = (el, name, value) => {
    const n = String(name).toLowerCase();
    if (!URL_ATTRS.has(n)) return;
    if (el.localName === 'a' && n === 'href') return;
    note(`${el.localName}[${n}]`, value, true);
  };
  const { Element } = window;
  const setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) { urlSet(this, name, value); return setAttribute.call(this, name, value); };
  const setAttributeNS = Element.prototype.setAttributeNS;
  Element.prototype.setAttributeNS = function (ns, name, value) { urlSet(this, name, value); return setAttributeNS.call(this, ns, name, value); };
  for (const [cls, props] of [
    ['HTMLImageElement', ['src', 'srcset']], ['HTMLSourceElement', ['src', 'srcset']],
    ['HTMLMediaElement', ['src']], ['HTMLVideoElement', ['poster']], ['HTMLScriptElement', ['src']],
    ['HTMLIFrameElement', ['src']], ['HTMLEmbedElement', ['src']], ['HTMLObjectElement', ['data']],
    ['HTMLLinkElement', ['href']], ['HTMLAnchorElement', ['ping']], ['HTMLAreaElement', ['ping']],
  ]) {
    const proto = window[cls]?.prototype;
    for (const prop of props) {
      if (!proto) continue;
      const d = Object.getOwnPropertyDescriptor(proto, prop);
      if (d?.set) {
        Object.defineProperty(proto, prop, { ...d, set(v) { urlSet(this, prop, v); d.set.call(this, v); } });
      } else {
        // jsdom lacks it (ping): reflect the attribute, as a browser does.
        Object.defineProperty(proto, prop, {
          configurable: true,
          get() { return this.getAttribute(prop) ?? ''; },
          set(v) { this.setAttribute(prop, v); },
        });
      }
    }
  }
  // CSS rules added by script.
  const insertRule = window.CSSStyleSheet.prototype.insertRule;
  window.CSSStyleSheet.prototype.insertRule = function (rule, i) {
    if (/url\(|@import/i.test(rule)) note('insertRule', rule, true);
    return insertRule.call(this, rule, i);
  };

  // Timers run at once (an interval three times), so a delayed request
  // happens inside the walk instead of after it.
  const now = (fn, args) => setTimeout(() => { try { fn(...args); } catch (e) { errors.push(`page error: ${e.message}`); } }, 0);
  window.setTimeout = (fn, _ms, ...args) => (typeof fn === 'function' ? now(fn, args) : null, 0);
  window.setInterval = (fn, _ms, ...args) => { if (typeof fn === 'function') for (let i = 0; i < 3; i++) now(fn, args); return 0; };
  window.requestAnimationFrame = (fn) => { now(fn, [0]); return 0; };
  // Layout APIs jsdom doesn't have; no network either way.
  window.Element.prototype.scrollIntoView = () => {};

  if (device) window.localStorage.setItem('vettid-device', device);
  for (const code of scripts) window.eval(`(function(){"use strict";\n${code}\n})();`);
  if (window.document.readyState !== 'complete') await new Promise((r) => window.addEventListener('load', r));
  loaded = true;
  // CSS text present at load is the baseline (multiset: a second identical
  // url() added later still counts).
  const baseline = cssUrls(window);
  const newCss = () => {
    const left = [...baseline];
    return cssUrls(window).filter((u) => {
      const i = left.indexOf(u);
      if (i >= 0) { left.splice(i, 1); return false; }
      return true;
    });
  };
  return { window, coach: window.document.getElementById('coach'), requests, newCss };
}

/** Every url() and @import in the page's <style> text and parsed rules. */
function cssUrls(window) {
  const out = [];
  const grab = (text) => { for (const m of text.matchAll(/url\(([^)]*)\)|@import\s+[^;]+/gi)) out.push(m[0]); };
  for (const s of window.document.querySelectorAll('style')) grab(s.textContent || '');
  for (const el of window.document.querySelectorAll('[style]')) grab(el.getAttribute('style') || '');
  for (const sheet of window.document.styleSheets) {
    try { for (const r of sheet.cssRules) grab(r.cssText); } catch { /* unreadable: nothing to add */ }
  }
  return out;
}

const first = await page(null);
if (!first.coach) {
  console.error('coach-test FAILED: index.html has no #coach element');
  process.exit(1);
}
const tree = JSON.parse(first.coach.dataset.tree);
first.window.close();

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

// A /playbooks/... link that the build publishes (a page's index.html).
const published = (href) => {
  const p = href.replace(/^\/playbooks\/?/, '').replace(/[?#].*$/, '');
  return existsSync(join(DIST, p, 'index.html')) || existsSync(join(DIST, p));
};

let walked = 0;
let afterLoad = 0;
const record = (p) => {
  for (const r of p.requests.filter((x) => x.counts)) {
    afterLoad++;
    errors.push(`coach: network request: ${r.kind} ${r.url}`);
  }
  for (const u of p.newCss()) {
    afterLoad++;
    errors.push(`coach: CSS added after load that loads something: ${u}`);
  }
};
// Let what the clicks started (timers run at once) settle before counting.
const settle = () => new Promise((r) => setTimeout(r, 50));
const rootQuestion = tree.root.question;
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
    if (ok && result.mode === 'browse') {
      if (!p.window.document.querySelector('.shelf')) errors.push(`coach: "browse" at ${where}, but the page has no .shelf`);
    } else if (ok) {
      const cards = [...p.coach.querySelectorAll('.coach-results a.pb-card')];
      if (cards.length === 0) errors.push(`coach: leaf ${where} shows zero playbooks`);
      for (const a of cards) {
        const href = a.getAttribute('href') || '';
        if (!published(href)) errors.push(`coach: leaf ${where} links to ${href}, which the build doesn't publish`);
      }
      const restart = p.coach.querySelector('button.coach-restart');
      if (!restart) errors.push(`coach: no "Start over" at ${where}`);
      else {
        restart.click();
        if (p.coach.querySelector('.coach-q')?.textContent !== rootQuestion) errors.push(`coach: "Start over" at ${where} doesn't show the first question`);
      }
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

console.log(`coach-test: ${paths.length} leaves × ${DEVICES.length} device choices walked (${walked}); ${afterLoad} requests`);
if (errors.length) {
  console.error(`coach-test FAILED (${errors.length}):`);
  for (const e of [...new Set(errors)]) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('coach-test OK — zero network requests, every leaf shows a published playbook, depth ≤ 3');
