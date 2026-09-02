# Development status

Updated: 2026-09-01
Release stage: public pre-alpha
This repository always ships the fictional demo season, so it has no live team deployment of its own. GitHub Pages is the supported fork-and-deploy target (`.github/workflows/deploy-pages.yml`) for a coach standing up their own team — see [GitHub Pages portability](../architecture/GITHUB_PAGES.md); Cloudflare Pages is documented as an alternative for a custom domain.

## Current milestone

M2 — first curated activity library.

The starter content target is reached: 17 source-checked activities and 4 complete, published session templates, currently authored for the U7 age band. Field testing and reflection remain before M2 closes.

## Shipped

### Coaching portal

- Responsive planning, print and touchline-friendly views
- Sunlight-first Field theme with persistent Dark view
- Four complete sessions (currently authored for U7)
- 11-cycle curriculum
- Practice/game reflection export
- Sanitized match calendar
- League-profile-driven rules tutorial (demo profile shown here; configurable per league/club)
- Federation resource catalogue and club-level affiliated organizations, both data-driven
- Practice-schedule exception authoring (generates an updated `practice-pattern.json` to save and redeploy)
- Persistent mobile activity filters for search, skill, phase, players, duration, equipment and goalkeeper use
- Session outcomes as the FA's four corners of player development, with an explicit "Not a focus in this session" render for a corner the session's activities genuinely don't support
- Sessions browsable and filterable by theme; each session shows its own moment-of-the-game coverage (in/out of possession, transition), computed from its activities and weighted by minutes, with free-play/no-ball minutes shown separately rather than dropped
- A shared standing warm-up with a season-long technique progression selected per curriculum week, rendered as the first block of every session
- Draft/published session status: a session may carry incomplete fields while in draft (excluded from the Sessions list and theme filter) and is only held to full validation once published — the permanent incremental-authoring flow, not a one-off migration step
- Stable, bookmarkable per-session share URLs (`#sessions/<id>`) that render and print identically to the normal view
- Session export: copy as rich HTML for pasting into Google Docs/Word, or download as a standalone `.html` file — both reuse the same render function as screen, print and share

### Scalable content foundation

- Season/team configuration fully data-driven: team, coach bio, crest and coach photo, timezone, league profile, all resolved from season data at build time (no hardcoded filenames)
- Multiple seasons per deployment with a `status` (active/archived/test); a LAN-only Seasons page switches a coach's own browser between them, stripped entirely from the public build
- A fictional test season (different age group, format and timezone) proves the modularity rather than asserting it
- `tools/new-season.html`: a local, form-based wizard that generates `season.json` and `practice-pattern.json`
- Separate reusable library, league profiles and team-season packs
- Immutable activity versions pinned by sessions; superseded versions retired out of the browsable index
- Controlled activity vocabulary for skills, decisions, equipment, phase, attendance and participation
- Session blocks can progress one setup over time (`progression`) or share a setup with a different activity (`shares_setup_with_previous`), minimizing time spent on setup/explanation instead of play
- Original setup diagrams and visible source attribution on normalized activity cards
- Required provenance and rights metadata
- Data-driven activity, curriculum, session and schedule rendering
- Session timing generated from record durations
- Visible fallback behavior for missing or malformed content

### Quality and operations

- Dependency-free reference validator, now validating every configured season (not just the active one)
- Thirty-two malformed-content regression cases plus a ten-case browser regression suite (Playwright) covering routing, security headers, private-path exclusion, share URLs and export
- Browser-side and validator path containment
- JSON-derived content escaping
- `scripts/build-static.mjs` allowlist excludes server source, private reflections, docs, deployment files and local-only tools from every public build
- CI-enforced public-build boundary (private paths, LAN-only routes) on every push, for both Cloudflare Pages and GitHub Pages builds

## Next deliverables

1. Field-test the four opening sessions and record team-level reflections.
2. Promote or revise activities from field evidence without changing more than one variable at a time.
3. Begin the static session builder after the starter sessions pass field review.
4. Complete static field-delivery and Cloudflare/GitHub Pages publication features before revisiting hosted reflection saving.

## Known debt

- Emergency fallback content duplicates the four initial activities.
- No in-app session builder yet — sessions are still hand-authored JSON (M3).
- The wizard doesn't generate `curriculum.json` or a new league profile, and doesn't fill out a new session's `theme`/`fourCorners`/`status`; all stay manual.
- No activity in the current library has a clean out-of-possession `moment` — every 1v1/2v1 drill's `coach_lens` is written from the attacker's side. Real, visible in each session's moment coverage, and left unresolved intentionally rather than relabeled to look more balanced.
- A session's warm-up progression is resolved from the active curriculum week; a direct share/export link to a session outside the current week falls back to that session's first curriculum appearance, which may not be the progression a reader actually wants.
- The optional feedback service is not deployed.
- Google Fonts require Internet access.
- Static JS/CSS caching may require a hard refresh after deployment.
- Open-source readiness (M6): this repository now carries licenses, governance files, and demo-only data (see `docs/development/DECISIONS.md`, 2026-09-01). A completed threat-model review is still open.

## Source of truth

- Current state: this document
- Priorities and acceptance criteria: [Feature plan](../product/FEATURE_PLAN.md)
- Milestone strategy: [Platform plan](../product/PLATFORM_PLAN.md)
- Durable choices: [Decision log](DECISIONS.md)
