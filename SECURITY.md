# Security policy

SmallSide is a static coaching-content application with no accounts,
authentication or server-side user data by default (see
[docs/architecture/DATA_MODEL.md](docs/architecture/DATA_MODEL.md)). The
optional `server/feedback_api.py` loopback service is not deployed in the
public build.

## Reporting a vulnerability

Please do not open a public issue for a security report. Instead, use
GitHub's private vulnerability reporting for this repository (Security tab →
"Report a vulnerability").

Include what you found, how to reproduce it, and the affected version/commit.
We aim to acknowledge reports within a few days.

## Scope

In scope: the static application (`index.html`, `assets/js/`, `assets/css/`),
the content-validation and build scripts (`scripts/`), and the optional
`server/feedback_api.py` adapter.

Out of scope: findings that require a coach's own deployment to be
misconfigured contrary to `docs/operations/DEPLOYMENT.md` (for example, an
un-proxied, publicly-reachable feedback service), and vulnerabilities in
third-party services this project links to (GitHub Pages, Cloudflare Pages,
Google Fonts, federation resource sites).
