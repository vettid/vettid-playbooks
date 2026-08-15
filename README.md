# vettid-playbooks

Education and coaching content served at [vettid.org/playbooks](https://vettid.org/playbooks) —
articles that teach the *why* of security, privacy, and trust; playbooks that
coach the *how*, step by step, on the reader's own device; and a client-side
coach that routes a concern to the right playbook.

Everything is static content plus client-side JavaScript. **No backend, no
accounts, no analytics, and no data leaves the device** — enforced by CI
(`npm run check`: coach-leaf validation, no inline scripts, no external
resources) and by vettid.org's site-wide CSP.

## Develop

```bash
npm install
npm run dev        # local dev server (http://localhost:4321/playbooks/)
npm run build      # static build to dist/
npm run check      # post-build validation (CI runs this)
```

## Deploy

Served through the main vettid.org CloudFront distribution via a path-routed
S3 origin (see `docs/playbooks-design-spec.md` in the vettid.org repo):

```bash
npm run deploy     # build + validate + s3 sync + scoped invalidation
```

## Writing content

See [CONTRIBUTING.md](CONTRIBUTING.md) — the style guide is short and it is
the product.

Design spec: `docs/playbooks-design-spec.md` in [vettid/vettid.org](https://github.com/vettid/vettid.org).
