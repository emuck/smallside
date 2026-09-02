# SmallSide

<img src="assets/images/smallside-app-logo.png" alt="SmallSide logo" width="160">

[![Verify site](https://github.com/emuck/smallside/actions/workflows/verify.yml/badge.svg)](https://github.com/emuck/smallside/actions/workflows/verify.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE-CONTENT)

SmallSide is a youth-soccer season companion for volunteer coaches. It helps a coach choose reviewed activities, prepare age-appropriate sessions, deliver them clearly, and adapt the season from team-level observations.

Team, club, league and coach identity are all configuration, not code — nothing in `assets/js/` or `index.html` names a specific club or team. This repository always ships a fictional demo season (see `data/seasons/2027-test-modularity-demo-u9/`); forking it and replacing that configuration with your own team is the supported way to run this for real.

## What works today

- Responsive planning, printing and touchline-friendly views
- Active-season configuration selected through one manifest, with LAN-only archive/switching between multiple configured seasons
- Immutable, versioned activity records with provenance
- Reusable session templates with pinned activity versions and calculated timing
- Data-driven weekly curriculum, sized to whatever season is configured
- Recurring practice schedule and sanitized Google Calendar game snapshot
- League-profile-driven rules tutorial and federation resource catalogue, with optional club-level links (affiliated organizations)
- Practice-schedule change authoring and practice/game reflection export
- Session outcomes as the FA's four corners of player development; sessions browsable/filterable by theme; per-session moment-of-the-game coverage weighted by minutes; a shared standing warm-up with a season-long progression
- Stable per-session share URLs and export (rich-HTML clipboard copy or standalone `.html` download), reusing the same render as screen and print
- Dependency-free content validation, covering every configured season, not just the active one
- Public build that excludes private reflections, server source, docs, local-only authoring tools and LAN-only routes (Seasons switcher, Development)

See [current development status](docs/development/STATUS.md) for the exact milestone and known debt.

## How the pieces fit

```text
Reusable library       League profiles
 activities + sessions       |
          \                  |
           +----> season manifest <---- practice pattern + games
                         |
                 current-season.json
                         |
                    web portal
```

A new season is activated by changing `data/current-season.json`; application code does not need to change. To fill out a new team/season's files without hand-editing JSON, serve the repo locally (see [Run and validate](#run-and-validate) below) and open `tools/new-season.html` — a form-based wizard that generates `season.json` and `practice-pattern.json` for you to save into `data/seasons/<season-id>/`. Read [Content packs and season configuration](docs/architecture/CONTENT_PACKS.md) for the complete workflow, including the parts the wizard doesn't cover yet (curriculum, new league profiles).

## Run your own team's site

The content model above is reusable across teams and clubs on purpose — this is meant to be forked, not just read. To stand up your own:

1. Fork this repository.
2. Configure your team/season with `tools/new-season.html` (above) and point `data/current-season.json` at it.
3. In your fork's **Settings → Pages**, set **Source** to **GitHub Actions**. Push to `main` — the included workflow validates, builds and deploys automatically. No account beyond GitHub is needed. See [GitHub Pages portability](docs/architecture/GITHUB_PAGES.md).

[Cloudflare Pages](docs/architecture/CLOUDFLARE_PAGES.md) is documented as an alternative — better suited if you want a custom domain or the security headers GitHub Pages doesn't support.

## Repository map

```text
index.html                     Static application entry point
assets/css/                    Styles and print rules
assets/js/                     Browser shell, loaders and feature routes
data/current-season.json       Active-season pointer
data/library/activities/       Immutable activity versions
data/library/sessions/         Reusable session templates
data/profiles/leagues/         Source-backed rules profiles
data/seasons/                  Team-season manifests, curricula and sanitized calendar snapshots
data/schemas/                  Content contracts
data/vocabularies/             Controlled authoring values
data/reflections/              Private reflection workflow; excluded from the public build
scripts/                       Content validation and regression tests
tools/                         Local-only authoring tools (new-season wizard); not deployed
server/                        Optional loopback-only write service
docs/                          Product, architecture and operating knowledge
```

## Run and validate

Preview the source locally:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`.

Before committing:

```bash
for file in assets/js/*.js; do node --check "$file"; done
node scripts/validate-content.mjs
node scripts/test-content-validation.mjs
node scripts/test-activity-filters.cjs
node scripts/build-static.mjs
npm ci
npx playwright install chromium
npm run test:browser
git diff --check
```

See [Deployment](docs/operations/DEPLOYMENT.md) for publishing your own fork.

## Documentation

Start with the [documentation guide](docs/README.md). The most useful architecture documents are:

- [Architecture overview](docs/architecture/ARCHITECTURE.md)
- [Content packs and season changes](docs/architecture/CONTENT_PACKS.md)
- [Content data model](docs/architecture/DATA_MODEL.md)
- [Feature plan](docs/product/FEATURE_PLAN.md)
- [Decision log](docs/development/DECISIONS.md)

## Boundaries

SmallSide prioritizes safety, enjoyment, belonging, equal opportunity, frequent ball contact and meaningful decisions. It does not rank children, predict talent or require player identities for its core workflow.

It is a coaching aid, not a replacement for club policy, safeguarding requirements, qualifications, medical guidance or current league rules.

SmallSide is pre-alpha software. Application source code is [MIT-licensed](LICENSE); coaching content and documentation is [CC BY-SA 4.0](LICENSE-CONTENT). This repository intentionally contains no real team, coach or child identity — everything here is either reusable library content or the fictional demo season.
