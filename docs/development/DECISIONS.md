# Decision log

## 2026-07-30 — Start dependency-free

Use semantic HTML, CSS and small vanilla JavaScript routing rather than a framework. This makes the first version fast, auditable, easy to serve on a LAN and free of package maintenance. Revisit only if content authoring or richer diagramming makes a framework materially useful.

## 2026-07-30 — Local-first and no player records

Readiness checks and coach reflections use browser local storage. Do not collect names, photos, medical information, attendance or performance profiles. If that becomes necessary, design authentication, access control, retention and safeguarding review first.

## 2026-07-30 — England Football as the initial methodology reference

Use current England Football Learning material as the initial primary reference for 5–11 coaching, practice design and safeguarding because the requested style was UK L1/L2. Do not assert competition rules until the user's governing association and league are confirmed.

## 2026-07-30 — Spiral curriculum

Themes recur through increasingly demanding games. Success is independent behaviour in small-sided play, not tidy unopposed execution. Familiar, effective activities are intentionally repeated.

## 2026-08-01 — Adopt SmallSide as official product name

Use SmallSide as the official product brand. A given deployment's repository/directory naming is a local choice, not part of the product itself.


## 2026-08-01 — Data-driven season packs

Keep reusable activities and session templates separate from dated league profiles and team seasons. Select the live season through `data/current-season.json`. Validate IDs and references without adding runtime dependencies. Retain browser fallbacks so a content-load failure does not blank the coaching portal.


## 2026-08-01 — Pin immutable activity versions

Store each activity version at `data/library/activities/<id>/v<version>.json`. Sessions reference both ID and version. Published versions are immutable; corrections create a new version so prior seasons remain reproducible. Every version carries the provenance required by the coaching content policy.


## 2026-08-02 — Use Bricolage Grotesque throughout the interface

Use the Google Fonts variable family Bricolage Grotesque for body text, headings, navigation and controls. Its weight and optical-size range provides hierarchy while retaining one recognizable voice. Keep system sans-serif fallbacks and `font-display: swap`; consider self-hosting when offline support becomes a release goal.


## 2026-08-02 — Keep the core portable to Cloudflare Pages

Require core planning, learning and field-delivery features to work as static HTML, CSS, JavaScript, JSON and SVG with relative URLs. Do not make nginx, Python, systemd or filesystem writes core dependencies. Publish only an allowlisted build containing approved demo data; isolate future writes behind reviewed Pages Functions or another explicit adapter.

## 2026-08-02 — Default to a sunlight-first Field theme

Use positive polarity (dark text on a light background) as the default Field theme because SmallSide is primarily read outdoors on a phone. Provide a persistent manual Dark view for evening and low-light use; do not automatically replace Field view from the operating-system preference. Both appearances use the same semantic color tokens, meet at least WCAG AA text contrast, retain visible focus, and keep primary touch targets at least 44 CSS pixels high. The implementation remains static and Cloudflare Pages compatible.

The decision follows evidence that positive-polarity displays improve legibility, Apple guidance positioning Dark Mode for low-light use, and WCAG/Apple contrast guidance. Detailed rationale and maintenance rules are in [Field display theme](../architecture/FIELD_DISPLAY_THEME.md).

## 2026-08-02 — Isolate persistence behind repository ports

Domain and application code depend on operation-focused repository contracts rather than D1 bindings, database clients or generic SQL. Each database owns an adapter and migrations and must pass the shared behavioral contract suite. D1/SQLite is the first implementation, not a permanent domain dependency. See [Storage portability](../architecture/STORAGE_PORTABILITY.md).

## 2026-08-02 — Defer hosted database integration

Complete the curated library, session builder, field-delivery experience and safe Cloudflare publication before implementing D1 or another hosted database. Continue using browser-local notes and portable JSON reflection exports. Preserve the storage-portability and D1 designs as future specifications, not current implementation work.

## 2026-08-02 — Normalize activity metadata through controlled vocabulary

Use `data/vocabularies/activity.json` as the authoring source for filterable skills, decisions, equipment, phase and participation values. Apply the normalized contract to new versions rather than mutating published legacy versions. Keep provenance mandatory and visible on every rendered activity card.

## 2026-08-03 — Keep activity discovery static and reusable

Implement activity matching as a dependency-free pure module shared by the library and future session builder. Persist only non-sensitive filter preferences in browser local storage. Keep the activity records and controlled vocabulary as the source of filter options so new reviewed content appears without interface code changes.

## 2026-08-29 — Publish the real season, with the coach's identity as a deliberate exception to "demo data only", on the coach's own Cloudflare Pages deployment

The 2026-08-11 open-source/Cloudflare readiness review found that the public build shipped real team, coach, and schedule identity, and recommended holding public publication until that content was replaced with a demonstration season. The repository owner decided to proceed with a real season on their own private/Cloudflare Pages deployment in the meantime rather than wait for that separation, after reviewing exactly what personal information it disclosed and deciding what they were and weren't willing to make public about their own family. No child or family member other than the deploying coach's own is named anywhere in that build; that boundary is not the coach's to waive on anyone else's behalf.

This decision applies to that coach's own deployment, not to this public repository — see the 2026-09-01 decision below for why this repository takes the opposite approach.

## 2026-08-29 — Prefer progression within one setup over swapping activities

Coaching peer review of the session structure observed that a sequence of several short, distinct activity blocks spends a large share of each block on setup and explanation rather than play, and recommended combining related blocks into fewer, longer practices that progress a single setup by changing one variable instead of re-explaining a new one.

Added `progression` as an optional field on a session's activity reference (`data/schemas/session.schema.json`), validated so stage minutes sum to the reference's total (`scripts/validate-content.mjs`), and rendered as staged notes within one timeline block (`assets/js/data-driven.js`). Recorded as guardrail 9 in [PLATFORM_PLAN.md](../product/PLATFORM_PLAN.md) and documented in [CONTENT_PACKS.md](../architecture/CONTENT_PACKS.md). Applied to the existing library by merging each session's split scrimmage-half blocks into one 30-minute `team-scrimmage` reference with two progression stages, as a template for future sessions. This does not change the underlying activity library or require new activity versions — `progression` composes existing content, it does not replace `variation`, which remains correct for blocks that are genuinely a new setup.

## 2026-08-29 — Support GitHub Pages as the easiest fork-and-deploy path

The multi-tenant idea (many unrelated coaches sharing one deployment) was deliberately set aside as a long-term goal, not pursued now. The near-term path for "help more coaches" is each coach forking the repository and running their own deployment. Cloudflare Pages, this repository's own target, requires an external account; GitHub Pages needs nothing beyond the GitHub account a coach already has to fork the repo.

Added `.github/workflows/deploy-pages.yml` (validates, builds, applies the same public-build boundary checks as `verify.yml`, then publishes via `actions/upload-pages-artifact`/`actions/deploy-pages` — no `gh-pages` branch) and `docs/architecture/GITHUB_PAGES.md`. Documented honestly, not silently: GitHub Pages does not support the `_headers` file Cloudflare Pages uses for CSP/frame/referrer headers, so the deploy workflow drops it rather than leave a dead file; a coach who needs those headers should use Cloudflare Pages instead. Confirmed the app already uses only relative paths (required since a GitHub Pages project site is served under `/<repository>/`, not the domain root) and fixed the one absolute link in `public/404.html` that would have broken under a subpath. README now presents fork-and-deploy-to-GitHub-Pages as the lead path for a new coach, with Cloudflare Pages as the alternative for a custom domain or those headers.

## 2026-08-29 — Resolve team crest and coach photo from season data at build time

`scripts/build-static.mjs` hardcoded the current team's crest and coach-photo filenames in its Cloudflare Pages asset allowlist, even though both are already configured per season in `season.json` (`team.crest.src`, `team.coach_bio.photo.src`) and rendered dynamically in the browser. A new team/season with different image filenames would silently 404 on the public site unless someone also edited the build script — a modularity gap for adopting the platform beyond one team.

The build now reads both paths from the active season's data and copies whichever files it finds there, validated against the same `assets/images/<slug>.(png|jpg|jpeg|webp)` pattern the renderer already uses. Swapping a season's crest or coach photo is now a data-only change. Also added `affiliated_organizations` (optional) to the league profile schema, so a club's coach-training or resource links travel with the reusable league profile and render on the Resources page without code changes — see [CONTENT_PACKS.md](../architecture/CONTENT_PACKS.md).

## 2026-08-29 — Let different activities share one physical setup

The earlier `progression` field (this date, above) only covers one activity staged over time. The same peer feedback also asked for the more general case: different activities in a session that happen to use a compatible footprint, sequenced so the coach only builds cones/goals once instead of striking and rebuilding between blocks.

Added optional `shares_setup_with_previous` (boolean) and `setup_note` (string) to a session's activity reference. The validator requires `setup_note` whenever the flag is set and rejects it on a session's first activity. The renderer shows it as a lighter, connected timeline row instead of implying a fresh setup. Applied to the two places in the existing library where the activities' own `setup` text genuinely describes overlapping footprints: `goal-rush` → `win-it-score-it` in `attack-defend-score.json` (two lanes with mini goals) and `find-a-friend` → `pass-or-pounce` in `find-friend-attack-space.json` (two 2v1 fields). Left `welcome-ball-control.json` and `protect-turn-escape.json` unchanged — their activities' setups do not genuinely overlap without a field redesign, and this field should never be used to assert a shared setup that isn't real.

## 2026-08-29 — Support multiple seasons and browser-local switching, LAN-only

`CONTENT_PACKS.md` had deferred multi-team support: "Supporting simultaneous teams would require an explicit selector or separate deployment." The coach wants to archive finished seasons, browse them later, and stand up a test season to prove a second team/league configuration actually works — without waiting on the `ARCHITECTURE.md` change threshold's triggering conditions (authenticated concurrent editing, cross-device writes), none of which apply here.

Implemented entirely within the existing static architecture, no framework or backend added:

- `season.json` gets an optional `status` (`active` | `archived` | `test`). `scripts/validate-content.mjs` now validates every season listed in a new `data/seasons/index.json`, not just the active one, and enforces exactly one `active` season that matches `data/current-season.json`.
- `assets/js/seasons.js` (new): a "Seasons" page listing every season by status with a one-click switch, plus a persistent banner on every route while a non-default season is showing. Switching writes the chosen manifest to `localStorage` and reloads; it never edits `data/current-season.json`.
- LAN-only, matching how Reflect and Development already work: the route is stripped from the public `index.html` in `scripts/build-static.mjs`, and `tools/` and `data/seasons/index.json` are not part of the Pages/Cloudflare build allowlist, so the public site still ships exactly the one season named in `current-season.json` with no way to discover or reach any other. A local/self-hosted deployment that wants the same denial for `tools/` at the web-server level should configure that explicitly; the Seasons route itself is intentionally visible to whoever can reach that deployment directly.
- Added `data/seasons/2027-test-modularity-demo-u9/` (status `test`, later promoted to `active` for this public repository) with a new, clearly fictional `data/profiles/leagues/demo-u9-academy.json` (different age group, format and timezone than a typical real deployment) to genuinely exercise the modularity claim rather than assert it untested. It reuses the shared session library unchanged to also prove session reusability across teams.
- Reflections exported while a season is showing now carry that season's `season_id` (`assets/js/dynamic.js`), per the earlier decision to keep the reflection review workflow manual and file-based rather than building in-browser read access to `data/reflections/` — that boundary is unchanged.

## 2026-08-31 — FA four corners, theme, moment/all_phase/none, and draft/published sessions

An FA-trained coach's review asked for three additions to the session model: the FA's four corners of player development as fixed session outcomes, a controlled theme so sessions are browsable by topic across weeks, and each activity's "moment of the game" (in/out of possession, transition) so a session can show its own coverage across the three, weighted by minutes rather than drill count.

`moment` moved onto the activity (not the session) since it's a property of the reusable drill, not any one session that happens to use it. Two refinements followed real content: `all_phase` (optional, must be `true`) marks a drill that genuinely exercises all three moments (free scrimmage, multi-goal games), where `moment` is not required and is normally omitted — forcing a single primary moment onto `team-scrimmage` or `four-goal-switch` would have been an arbitrary pick, not a finding. `moment: "none"` covers a drill with no ball/possession concept at all (`island-escape`, a tag game) — like `all_phase`, its minutes are excluded from a session's moment-coverage denominator and shown separately as uncounted, rather than forcing a no-ball game into the possession taxonomy or silently dropping its time. `moment` and `all_phase` are the one deliberate exemption from activity-version immutability (see `data/schemas/activity.schema.json`'s description field): they're classification metadata, not drill content.

`fourCorners` entries may be `null`, meaning the session deliberately does not address that corner — a complete, valid value, not a backfill placeholder — rendered visibly as "Not a focus in this session" (reworded from an earlier "Not addressed" after adversarial review flagged it as reading like missing data rather than a deliberate choice). Three of the four current sessions have `social: null`: none of their activities involve reading or communicating with a teammate, and padding the corner with invented wording would have hidden a real content gap instead of surfacing it.

Added `status` (`draft` | `published`, required) to the session schema. The validator only hard-fails `NEEDS_COACH_INPUT` placeholders and unsupported `theme`/`moment` enum values once a session is published; draft sessions may carry placeholders and are excluded from the Sessions page's session list and theme filter (a direct share URL still renders them). This is the permanent authoring flow — a session gets its required fields backfilled incrementally and is published when the content is real, not a one-off migration step.

The resulting moment coverage is deliberately unflattering in a useful way: three of the four sessions read as 100% in-possession outside their scrimmage block, because every 1v1/2v1 drill's `coach_lens` in the current library is written from the attacker's side. That's real information about the curriculum, not a labeling bug, and it was left as-is rather than relabeled to look more balanced.

## 2026-08-31 — Standing warm-up as one shared entity, progression choice on the curriculum week

Every session should open with the same warm-up so players start on the ball without waiting for an explanation, per the same coaching review. Modeled as `data/library/warmup.json` (`data/schemas/warmup.schema.json`) — one shared definition with an ordered, id'd `progressions` array — referenced by `season.json`'s `warmup` field the same way `activity_index`/`session_index` already are. Editing it once updates every session that references it.

The week's selected progression id(s) first went on the session itself (`warmup_progressions`), then moved to the curriculum's week entry (`cycles[].warmup_progressions`) once real content exposed the problem: a session repeats across multiple weeks in an 11-week curriculum (`welcome-ball-control` runs in week 1 and again in week 9), so a progression pointer on the session file forced every occurrence to run the same progression, defeating the point of a season-long progression. `renderSession()` takes the progressions as an explicit argument rather than reading them off the session; the Sessions page resolves them from the active curriculum week, falling back to the session's first curriculum appearance for a direct share link outside the current week — a known limitation, not a routing overhaul, since share URLs aren't week-scoped.

The warm-up content itself was authored, reviewed, and replaced once already: an initial four-cone-square suggestion turned out not to be the drill actually run. The current pair-passing definition (two players between two cones each, shifting and passing across a gap) and its 8-step technique progression came from the coach directly, not from either party's assumption.

## 2026-08-31 — Stable per-session share URLs and rich-HTML export, one render function

Coaches wanted to send a specific session to an assistant ahead of time, and to paste a session into Google Docs or Word to add their own material. Both needed a single canonical session layout rather than a second copy for sharing and a third for export.

`app.js`'s router now splits an optional `/param` off any hash route, so `#sessions/<id>` cold-loads that exact session — a stable, bookmarkable URL that prints identically to the screen view. There is no authentication anywhere in this app, so these are unlisted links, not access-controlled ones; that limitation is stated in `DATA_MODEL.md`, not silently assumed. Session tabs and the season page's week links navigate to this URL directly instead of only flipping in-memory JS state, which was the previous, non-shareable mechanism.

Export reuses `renderSession()`'s own output rather than a separate template: "Copy for Docs/Word" writes it to the clipboard as `text/html` with a plain-text fallback; "Download .html" saves a standalone, self-styled file. Chose rich HTML over Markdown or `.docx`: no new dependency, since a client-side `.docx` library needs a build step this static site doesn't have, and the ask was specifically to paste into Docs/Word, not to hand-edit a text file.

## 2026-09-01 — License the project and split public/private repos for GitHub

Completed the M6 open-source-readiness gates the 2026-08-29 decision above deferred. Added `LICENSE` (MIT, application code) and `LICENSE-CONTENT` (CC BY-SA 4.0, coaching content/docs), plus `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `.github/ISSUE_TEMPLATE`/`PULL_REQUEST_TEMPLATE.md`. `soccer3.png` was confirmed as the coach's own photo with faces blurred for the privacy of other individuals in it — no separate rights review needed.

Chose the split-repo model the 2026-08-11 readiness review originally recommended, rather than continuing the 2026-08-29 real-identity exception onto GitHub: this repository stays the coach's private operational copy (real season, schedule and identity, as already decided), and a separate public repository is built from a reviewed export — the fictional `2027-test-modularity-demo-u9` season as the active season, with the real season, real league profile, real schedule and this coach's photos excluded — rather than rewriting this repository's history. A fresh export was chosen over history rewriting as the lower-risk path, per the original review's own recommendation.
