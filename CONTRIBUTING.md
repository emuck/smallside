# Contributing to SmallSide

SmallSide is an open-source, pre-alpha project. Contributions must preserve its child-first, source-traceable and local-first boundaries.

## Read first

- [Product brief](docs/product/PRODUCT_BRIEF.md)
- [Architecture overview](docs/architecture/ARCHITECTURE.md)
- [Content data model](docs/architecture/DATA_MODEL.md)
- [Content policy](docs/coaching/CONTENT_POLICY.md)
- [Decision log](docs/development/DECISIONS.md)

Do not add child names, contacts, medical information, rankings or talent projections.

## Add or revise an activity

1. Follow the activity schema and existing versioned examples.
2. Write original instructions and diagrams.
3. Include complete provenance, rights and review notes.
4. Add a new immutable version; do not edit one already used.
5. Add the version path to the activity index.
6. Update only sessions that should adopt it.
7. Run validation and inspect the rendered activity.

Public availability does not grant permission to copy wording, diagrams or video.

## Add a session or season

- Sessions reference `activity_id`, `activity_version` and minutes.
- Session timing must leave a reasonable transition/reflection allowance.
- Seasons select existing sessions, league profiles and sanitized schedules.
- Follow the procedure in [Content packs](docs/architecture/CONTENT_PACKS.md).
- For a new team/season, `tools/new-season.html` generates `season.json` and `practice-pattern.json` from a form instead of hand-editing JSON — serve the repo locally (see [README](README.md#run-and-validate)) and open `tools/new-season.html`. It does not build `curriculum.json`; copy an existing season's as a starting template. Adding a new league profile keeps it listed in `data/profiles/leagues/index.json` so the wizard's dropdown picks it up.

## Code changes

- Keep the static application working until a decision record changes the architecture.
- Preserve phone, keyboard, print and low-bandwidth usability.
- Put authorable content in JSON rather than JavaScript.
- Escape content before generated HTML.
- Explain collection, access and retention before adding data writes.

## Required checks

```bash
for file in assets/js/*.js; do node --check "$file"; done
node scripts/validate-content.mjs
node scripts/test-content-validation.mjs
git diff --check
```

Also inspect affected routes on the live or local site.

## Licensing

Application source code is [MIT-licensed](LICENSE). Coaching content and documentation (activities, sessions, diagrams, `docs/coaching/`) is [CC BY-SA 4.0](LICENSE-CONTENT). By contributing, you agree your contribution is licensed under the license that already covers the area you're changing.

Do not introduce third-party code or coaching content with an incompatible or unknown license. If you adapt a public resource (a federation guide, a published drill), say so explicitly in the `source` field and confirm the adaptation is your own wording/artwork, not a reproduction — see [Add or revise an activity](#add-or-revise-an-activity) above.
