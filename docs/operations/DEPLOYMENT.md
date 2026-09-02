# Deployment

Updated: 2026-08-29

## Public deployment

A coach forking this repository for their own team most easily deploys to GitHub Pages — see [GitHub Pages portability](../architecture/GITHUB_PAGES.md); `.github/workflows/deploy-pages.yml` builds and publishes automatically on every push to `main`. [Cloudflare Pages portability](../architecture/CLOUDFLARE_PAGES.md) documents that build, the safe-publication boundary, and a release checklist as an alternative if you want a custom domain or the security headers GitHub Pages doesn't support.

An optional nginx configuration for self-hosting on your own server/LAN (denying `docs/`, `deploy/`, `server/`, `tools/`, `data/reflections/`) is not included in this repository — write one from `scripts/build-static.mjs`'s allowlist if you need it, following the same public-build boundary this project enforces in CI.

## Validate a release

```bash
for file in assets/js/*.js; do node --check "$file"; done
node scripts/validate-content.mjs
node scripts/test-content-validation.mjs
node scripts/test-activity-filters.cjs
node scripts/build-static.mjs
git diff --check
```

## Calendar data

The browser never receives Google credentials. Calendar synchronization writes a sanitized schedule containing only the team event fields required by the portal. The active season references that file through its `games` field.

## Feedback service

`server/feedback_api.py` is scaffolded but not running or proxied.

Before deployment:

1. Review input validation and atomic writes.
2. Add Origin/CSRF protection.
3. Create a least-privilege user service bound to `127.0.0.1:8092`.
4. Proxy only `/feedback-api/`.
5. Keep `data/reflections/` denied as static content and ignored by Git.
6. Verify health, failure and retention behavior.
