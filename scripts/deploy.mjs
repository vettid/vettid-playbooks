#!/usr/bin/env node
// Deploy the built site to the /playbooks/* origin bucket.
//
// The S3 key space must mirror the URL space (the CloudFront behavior passes
// /playbooks/<path> through as the object key). The build output doesn't map
// 1:1 onto that:
//   - pages and _astro bundles sit at dist/ root        → keys playbooks/<path>
//   - public/ files (fonts) are copied to dist/playbooks → keys playbooks/<path>
//     (Astro's dev server serves public/ unprefixed, which is why the public
//     tree carries its own playbooks/ folder — at deploy the two trees merge)
//
// So: assemble one correct tree in .deploy/, then sync it twice — long cache
// for hashed assets and fonts, no-cache for HTML and the sitemap (mirroring
// the main site's split), with --delete only on the asset pass.

import { cpSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');
const TREE = join(ROOT, '.deploy');
const BUCKET = 's3://vettid-org-playbooks/playbooks';
const DISTRIBUTION = 'E17RU9Q7P4C2QY';

if (!existsSync(join(DIST, 'sitemap.xml'))) {
  console.error('deploy: dist/sitemap.xml missing — run npm run build first');
  process.exit(1);
}

rmSync(TREE, { recursive: true, force: true });
cpSync(DIST, TREE, { recursive: true });
// Merge the copied public/ tree into the root, where its URLs live
// (public/ may be absent — fonts now come from the main site's /assets/)
if (existsSync(join(TREE, 'playbooks'))) {
  cpSync(join(TREE, 'playbooks'), TREE, { recursive: true });
  rmSync(join(TREE, 'playbooks'), { recursive: true });
}

const run = (args) => {
  console.log('> aws', args.join(' '));
  execFileSync('aws', args, { stdio: 'inherit' });
};

// Assets: immutable-ish, one week; --delete prunes removed files
run(['s3', 'sync', TREE, BUCKET, '--delete',
  '--exclude', '*.html', '--exclude', 'sitemap.xml',
  '--cache-control', 'public,max-age=604800']);

// HTML + sitemap: always revalidate
run(['s3', 'sync', TREE, BUCKET,
  '--exclude', '*', '--include', '*.html', '--include', 'sitemap.xml',
  '--cache-control', 'no-cache,must-revalidate']);

run(['cloudfront', 'create-invalidation',
  '--distribution-id', DISTRIBUTION, '--paths', '/playbooks/*']);

rmSync(TREE, { recursive: true, force: true });
console.log('deploy: done');
