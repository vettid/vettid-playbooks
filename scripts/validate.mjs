#!/usr/bin/env node
// Post-build validation — the spec's hard promises, enforced:
//   §8.3  every coach leaf resolves to ≥1 existing playbook (no dead ends)
//   §2.3  built output references no external hosts (exemplary network tab)
//   CSP   no inline <script> (the site-wide policy is script-src 'self')
// Run after `astro build`; CI fails on any violation.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');
const errors = [];

if (!existsSync(DIST)) {
  console.error('validate: dist/ not found — run `npm run build` first');
  process.exit(1);
}

// ── Coach leaves resolve ──
const tree = JSON.parse(readFileSync(join(ROOT, 'src/data/coach-tree.json'), 'utf8'));
const concernsFile = JSON.parse(readFileSync(join(ROOT, 'src/data/concerns.json'), 'utf8'));
const validConcerns = new Set(concernsFile.concerns.map((c) => c.id));

// Collect playbook concern tags from content frontmatter
const pbDir = join(ROOT, 'src/content/playbooks');
const playbookConcerns = [];
for (const f of readdirSync(pbDir)) {
  const src = readFileSync(join(pbDir, f), 'utf8');
  const m = src.match(/^concerns:\s*\[([^\]]+)\]/m);
  const pm = src.match(/^platform:\s*(\S+)/m);
  if (m) playbookConcerns.push({ concerns: m[1].split(',').map((s) => s.trim()), platform: pm?.[1] });
}

function walkTree(node, path) {
  for (const opt of node.options ?? []) {
    if (opt.result) {
      if (opt.result.mode === 'browse') continue;
      for (const c of opt.result.concerns) {
        if (!validConcerns.has(c)) errors.push(`coach: unknown concern "${c}" at ${path} → "${opt.label}"`);
      }
      const hit = playbookConcerns.some((p) =>
        p.concerns.some((c) => opt.result.concerns.includes(c)) &&
        (!opt.result.platform || p.platform === opt.result.platform || p.platform === 'universal'));
      if (!hit) errors.push(`coach: leaf "${opt.label}" at ${path} resolves to zero playbooks`);
    } else if (opt.next) {
      const next = tree.nodes[opt.next];
      if (!next) errors.push(`coach: missing node "${opt.next}"`);
      else walkTree(next, `${path} → ${opt.label}`);
    }
  }
}
walkTree(tree.root, 'root');

// ── Built HTML: no inline scripts, no external references ──
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const EXTERNAL = /(?:src|href)="https?:\/\/(?!vettid\.org)/g;
for (const file of walk(DIST).filter((p) => p.endsWith('.html'))) {
  const rel = file.slice(DIST.length + 1);
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    const body = m[2].trim();
    const isDataBlock = /type="application\/(json|ld\+json)"/.test(attrs);
    if (body.length > 0 && !isDataBlock && !/\bsrc=/.test(attrs)) {
      errors.push(`${rel}: inline <script> (violates site CSP script-src 'self')`);
    }
  }
  for (const m of src.matchAll(EXTERNAL)) {
    // Allow plain outbound <a href> links; forbid loaded resources
    const before = src.slice(Math.max(0, m.index - 200), m.index);
    if (/<(script|link|img|iframe|source|video|audio)\b[^>]*$/.test(before)) {
      errors.push(`${rel}: external resource reference near "${m[0]}"`);
    }
  }
}

// ── Local asset URLs resolve to files the deploy will publish ──
// URL space (see scripts/deploy.mjs): /playbooks/<p> is served from dist/<p>
// (build output), or from dist/playbooks/<p> (the copied public/ tree, which
// deploy merges into the root — so dist/playbooks/* is NOT reachable at
// /playbooks/playbooks/*). Catches Astro base-path doubling, which once
// 404'd every @font-face and dropped the section to system fonts.
// /assets/* and /shared/* live on the main-site origin and aren't checkable here.
const servable = (p) =>
  (!p.startsWith('playbooks/') && existsSync(join(DIST, p))) ||
  existsSync(join(DIST, 'playbooks', p));
for (const file of walk(DIST).filter((p) => p.endsWith('.html') || p.endsWith('.css'))) {
  const rel = file.slice(DIST.length + 1);
  const src = readFileSync(file, 'utf8');
  const refs = [...src.matchAll(/url\(\s*['"]?(\/playbooks\/[^'")?#]+)/g)].map((m) => m[1]);
  if (file.endsWith('.html')) {
    for (const m of src.matchAll(/(?:src|href)="(\/playbooks\/[^"?#]+)"/g)) refs.push(m[1]);
  }
  for (const url of refs) {
    const p = url.slice('/playbooks/'.length);
    // Only asset files (last segment has an extension) — page routes resolve
    // to directory index.html files and aren't checked here.
    if (!/\.[a-z0-9]+$/i.test(p.split('/').pop())) continue;
    if (!servable(p)) errors.push(`${rel}: dead local asset URL ${url}`);
  }
}

// ── Header/nav chrome is styled ONLY by the main site's /shared/nav.css ──
// A local redefinition is how the header drifted from the main site twice
// (fonts, then spacing). Any of these selectors in our built CSS is drift
// waiting to happen.
const CHROME = /header\.site|(?:^|[\s,{};])header\s*\{|\.header-logo|\.coming-soon-chip|\.desktop-nav|\.nav-toggle|\.nav-menu|\.nav-overlay/;
for (const file of walk(DIST).filter((p) => p.endsWith('.css'))) {
  const rel = file.slice(DIST.length + 1);
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const m = css.match(CHROME);
  if (m) errors.push(`${rel}: styles header/nav chrome ("${m[0].trim()}") — that lives in the main site's /shared/nav.css`);
}

if (errors.length) {
  console.error(`validate FAILED (${errors.length}):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('validate OK — coach leaves resolve, no inline scripts, no external resources');
