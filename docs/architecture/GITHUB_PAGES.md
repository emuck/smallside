# GitHub Pages portability

Updated: 2026-08-29

GitHub Pages is the easiest way for a new coach to stand up their own SmallSide site: fork the repository, fill out a season with [`tools/new-season.html`](../../README.md#run-and-validate), enable Pages once in repository settings, and every push to `main` deploys automatically. No external account beyond GitHub is required. [Cloudflare Pages](CLOUDFLARE_PAGES.md) remains the recommended target for a custom domain or when the security headers below matter for your deployment.

## What's the same as Cloudflare Pages

Everything in [Cloudflare Pages portability](CLOUDFLARE_PAGES.md)'s architecture constraint and safe publication boundary applies unchanged: `scripts/build-static.mjs` builds the same allowlisted `dist/` from the same season data, with the same content scan and the same exclusions (`server/`, `deploy/`, `docs/`, `tools/`, `data/reflections/`, the LAN-only `seasons`/`development` routes). The app's hash-based routing and relative asset URLs work identically under either host.

## What's different

- **No custom HTTP headers.** GitHub Pages serves static files with a fixed header set; it does not support the `_headers` file Cloudflare Pages reads for `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`. The deploy workflow removes `dist/_headers` before publishing so it doesn't sit there unused and misleading. If those headers matter for your deployment — for example before sharing the link outside your own team — use Cloudflare Pages instead, or put a CDN capable of adding headers in front of GitHub Pages.
- **Subpath by default.** A project site (the default for a forked repo) is served at `https://<username>.github.io/<repository>/`, not at the domain root. The app already uses only relative paths, so this works without changes — verified in `public/404.html`'s return link and throughout `index.html`/`assets/js`. A custom domain (via a `CNAME` file, see below) removes the subpath.
- **Deploy trigger.** `.github/workflows/deploy-pages.yml` runs the same validate/build/boundary-check steps as `.github/workflows/verify.yml`, then publishes `dist/` using `actions/upload-pages-artifact` and `actions/deploy-pages` — no `gh-pages` branch, no third-party action.

## First deployment

1. Fork or clone the repository into your own GitHub account.
2. Configure your own season: run `tools/new-season.html` (see [Content packs](CONTENT_PACKS.md#create-a-season)) or edit `data/seasons/` directly, then point `data/current-season.json` at it.
3. Run the same local checks Cloudflare Pages' runbook calls for: `node scripts/validate-content.mjs`, `node scripts/test-content-validation.mjs`, `node scripts/build-static.mjs`, then serve `dist/` locally and exercise every route.
4. In your fork's GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (a one-time setting; it is not part of this repository's checked-in configuration).
5. Push to `main`. The **Deploy to GitHub Pages** workflow validates, builds and publishes; the Pages URL appears in the workflow run summary and in **Settings → Pages**.
6. Every subsequent push to `main` redeploys automatically. Use **Actions → Deploy to GitHub Pages → Run workflow** to redeploy without a new commit.

## Custom domain

Add a `CNAME` file containing your domain to the repository root (GitHub Pages reads it from the published output, so either commit it at the repo root and add it to the build's copy list, or add it directly under `public/` alongside `404.html` so `scripts/build-static.mjs` picks it up the same way). Then follow [GitHub's custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for the DNS record. This repository does not ship a `CNAME` file itself — a coach standing up their own fork chooses their own domain, if any (see [Cloudflare Pages portability](CLOUDFLARE_PAGES.md#project-and-hostname-separation) if you'd rather use Cloudflare Pages for the custom domain).

## Official references

- [GitHub Pages: about](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
- [Publishing with a custom GitHub Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
- [Custom domain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
