import { defineConfig } from 'astro/config';

// Served at vettid.org/playbooks/* through CloudFront path routing.
// 'directory' build format emits clean URLs (slug/index.html), matching the
// main distribution's rewrite function.
export default defineConfig({
  site: 'https://vettid.org',
  base: '/playbooks',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // The site-wide CSP is script-src 'self': never inline anything
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
