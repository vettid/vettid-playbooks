#!/usr/bin/env node
// Generate dist/sitemap.xml from the built pages. Served at
// https://vettid.org/playbooks/sitemap.xml and registered in the main
// site's robots.txt. Runs as part of `npm run build`.

import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');
const BASE = 'https://vettid.org/playbooks';

if (!existsSync(DIST)) {
  console.error('sitemap: dist/ not found — run astro build first');
  process.exit(1);
}

const pages = [];
function walk(dir, rel) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      // dist/playbooks is the copied public/ tree (fonts), not pages
      if (rel === '' && name === 'playbooks') continue;
      walk(p, rel ? `${rel}/${name}` : name);
    } else if (name === 'index.html') {
      pages.push(rel ? `${BASE}/${rel}` : BASE);
    }
  }
}
walk(DIST, '');
pages.sort();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), xml);
console.log(`sitemap: ${pages.length} URLs → dist/sitemap.xml`);
