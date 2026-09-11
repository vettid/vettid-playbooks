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
    // In production /shared/* and /assets/* serve from the main-site origin
    // on the same domain (path-routed CloudFront). The dev server proxies
    // them to the live site so the shared nav chrome works locally too.
    server: {
      proxy: {
        '/shared': { target: 'https://vettid.org', changeOrigin: true },
        '/assets': { target: 'https://vettid.org', changeOrigin: true },
      },
    },
  },
});
