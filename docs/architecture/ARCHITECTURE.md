# Architecture overview

Updated: 2026-08-29

SmallSide is a dependency-free static web application. The same source builds into an allowlisted `dist/` (see [GitHub Pages portability](GITHUB_PAGES.md) and [Cloudflare Pages portability](CLOUDFLARE_PAGES.md)) for public deployment. A coach forking the repository for their own team most easily uses GitHub Pages, since it needs no external account beyond GitHub; Cloudflare Pages is documented as an alternative for a custom domain or extra security headers. A coach self-hosting instead (e.g. behind their own nginx) should deny the same private paths the public build already excludes. Structured JSON is the content boundary: browser code renders it, and development scripts validate it before deployment.

## Runtime

```text
node scripts/build-static.mjs
        |
        v
   dist/ (allowlisted)                     denied from dist/, always:
     |-- index.html + assets/                docs/, deploy/, server/,
     |-- season/library/profile JSON          tools/, data/reflections/
     `-- data/seasons/<id>/schedule.json

Optional future write path
  /feedback-api/ -> loopback service :8092 -> data/reflections/inbox/
  Status: not deployed or proxied
```

The browser has no Google credentials and no direct write access. Calendar synchronization produces a sanitized JSON snapshot outside the browser workflow.

## Browser responsibilities

```text
content-loader.js
  loads active manifest and referenced records
          |
          v
data-driven.js
  validates defensively, selects versions and renders content
          |
          +--> app.js               core shell and emergency fallback
          +--> dynamic.js           schedule and reflections
          +--> rules-resources.js   rules tutorial and resource catalogue
          +--> seasons.js           LAN-only season switcher/archive (stripped from public build)
          `--> development.js       project-development view (stripped from public build)
```

Scripts remain small and framework-free. The full hardcoded coaching fallback is known transitional debt; it prevents a blank field view but duplicates some structured content.

## Content resolution

```text
data/current-season.json (default; LAN-only browser override via localStorage, see assets/js/seasons.js)
          |
          v
season.json
  |-- curriculum.json
  |-- practice-pattern.json
  |-- sanitized games
  |-- league profile
  |-- activity index -> immutable activity versions
  `-- session index  -> sessions pin activity ID + version
```

Details and change procedures are in [CONTENT_PACKS.md](CONTENT_PACKS.md).

## Repository boundaries

| Area | Responsibility |
|---|---|
| `index.html`, `assets/` | Presentation, navigation and defensive rendering |
| `data/library/` | Reusable, source-traceable coaching content |
| `data/profiles/` | Dated league and club rule profiles |
| `data/seasons/` | Team-season configuration and curriculum |
| `data/schemas/` | Machine-readable record contracts |
| `data/reflections/` | Private team-level observations |
| `scripts/` | Validation and regression tests |
| `server/` | Optional loopback-only write capability |
| `deploy/` | Reviewed deployment configuration |
| `docs/` | Product, engineering and coaching knowledge |

## Trust and privacy boundaries

- Public browser data must not contain child identity, contacts, medical details or rankings.
- Coach/team names and sanitized schedule facts are intentionally visible to anyone who can reach a given deployment.
- Activity text is escaped before insertion into generated HTML.
- Manifest paths must remain under `data/`; both loader and validator reject traversal.
- The public build's allowlist (`scripts/build-static.mjs`) excludes server source, reflections, docs and deployment files; a self-hosted deployment should deny the same paths at the web-server level.
- Activity provenance and immutable versions are validated.
- Any authentication or Internet-facing deployment requires a separate threat model.

## Failure behavior

If season content cannot load, the portal keeps emergency fallback material visible and displays a persistent warning. Invalid individual activities are omitted, logged and reported rather than disabling the whole library.

## Deployment portability

GitHub Pages and Cloudflare Pages are both required targets — the build and content boundary must work identically on either. Core features must run from static HTML, CSS, JavaScript, JSON and SVG; deployment-specific writes remain isolated adapters. Never publish the repository root because private and internal files require an allowlisted output. See [GitHub Pages portability](GITHUB_PAGES.md) and [Cloudflare Pages portability](CLOUDFLARE_PAGES.md).

## Change threshold

Keep the static architecture while one trusted editor manages a small library. A framework, database or hosted backend requires a decision record demonstrating a concrete need such as authenticated concurrent editing, multiple simultaneous private teams or cross-device writes. The decision must address migration cost, privacy, offline behavior and simpler alternatives.
