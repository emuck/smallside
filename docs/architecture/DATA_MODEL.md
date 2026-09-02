# Content data model

Updated: 2026-08-29

The JSON records under `data/` are SmallSide's source of truth. Application code renders them; it should not become a second authoring location.

## Relationships

```text
Season
  |-- uses one LeagueProfile
  |-- owns one Curriculum
  |-- owns one PracticePattern
  |-- points to Games
  `-- selects Session templates

Curriculum -> Session IDs
Session -> Activity id@version references
Activity -> Source provenance
Reflection -> season/session event context, never a child profile
```

## Records

| Record | Purpose | Authoritative location |
|---|---|---|
| Activity | Reusable football game, adaptations, safety and provenance | `data/library/activities/<id>/v<n>.json` |
| Session | Ordered, timed references to immutable activities | `data/library/sessions/` |
| Season | Team metadata and pointers to all season inputs | `data/seasons/<id>/season.json` |
| Curriculum | Week/cycle themes and session choices | `data/seasons/<id>/curriculum.json` |
| Practice pattern | Recurrence, timezone and future exceptions | `data/seasons/<id>/practice-pattern.json` |
| League profile | Dated local rules and controlling sources | `data/profiles/leagues/` |
| Games | Sanitized calendar events | Season's `games` pointer |
| Reflection | Anonymous team-level observation | `data/reflections/` |
| Active-season pointer | Selects the rendered season | `data/current-season.json` |

## Season and team configuration reference

Everything that changes between teams or seasons lives in `season.json`, `practice-pattern.json` and the league profile it points at — never in application code. `tools/new-season.html` fills out the first two from a form; see [Content packs](CONTENT_PACKS.md#create-a-season).

`data/seasons/<season-id>/season.json`:

| Field | Purpose |
|---|---|
| `id` | Stable slug, matches the folder name. |
| `status` | `active` \| `archived` \| `test`. Required. Exactly one season across `data/seasons/index.json` may be `active`, and it must be the one `data/current-season.json` points at — the validator enforces both. |
| `team.name`, `team.nickname`, `team.coach` | Displayed throughout the portal; `nickname` drives the home-page headline when set. |
| `team.crest.src`, `team.crest.alt` | Optional. `src` must match `assets/images/<slug>.(png\|jpg\|jpeg\|webp)`. |
| `team.coach_bio.*` | `title`, `intro`, `day_job`, `soccer_credentials`, `plan`, `sign_off` (required), `club_experience` (optional), `photo.src`/`photo.alt` (optional, same path pattern as crest). Rendered on the "Meet the coach" page. Think about what's comfortable being public before including a child's name or an employer — see the 2026-08-29 entries in [DECISIONS.md](../development/DECISIONS.md). |
| `timezone` | IANA zone, e.g. `America/Los_Angeles`. |
| `starts`, `ends` | ISO dates; `starts` must not be after `ends`. |
| `league_profile` | Path to a reusable league profile (see below). Shared across any season/team using the same rules. |
| `curriculum` | Path to that season's `curriculum.json` (week/cycle themes and session choices). Not reusable — the wizard doesn't generate this; copy an existing season's as a starting template. |
| `practice_pattern` | Path to that season's `practice-pattern.json`. |
| `games` | Path to a sanitized calendar snapshot (`{"events":[...]}`), typically produced by a calendar-sync workflow outside the browser. |
| `activity_index`, `session_index` | Almost always the shared library paths (`data/library/activities/index.json`, `data/library/sessions/index.json`) — reusable across every team/season. |
| `warmup` | Path to the shared standing warm-up (almost always `data/library/warmup.json`, reusable across every team/season — see below). |
| `opening_session` | A session ID from the session library, used as the first-week template. |

`practice-pattern.json`: `timezone`, `starts`, `ends`, `recurrence` (array of `{weekday, starts_at, ends_at}`), `exceptions` (array of `{date, note, type?}` where `type` is `cancelled` \| `time_change` \| `location_change`).

League profile (`data/profiles/leagues/<id>.json`, reusable across any season that shares the same rules — not team-specific): `id`, `name`, `age_group`, `format.*` (players per side, halves, ball size, substitution/playing-time policy, heading policy, etc. — see `data/profiles/leagues/demo-u9-academy.json` for the full shape), `reviewed_at`, `sources` (provenance), and optional `affiliated_organizations` (array of `{name, url, purpose?}`, HTTPS-only) for club-level links like a coach-training platform — renders on the Resources page.

## Multiple seasons, one public season

A deployment can have any number of seasons configured (`data/seasons/index.json` lists them all), and the local/LAN-only Seasons page (`assets/js/seasons.js`) lets a coach switch their own browser between active, archived and test seasons via `localStorage` — see [Content packs](CONTENT_PACKS.md#multiple-seasons-and-archives). That switching is entirely browser-local and never changes `data/current-season.json`.

The **public build is different and single-season by construction**: `scripts/build-static.mjs` only ever copies the one season `data/current-season.json` points at (plus its league profile, curriculum, sessions and activities), and strips the Seasons route and `data/seasons/index.json` from the output entirely — there is no code path in the public build that can discover or load any other season, archived or test. This is enforced in CI (`.github/workflows/verify.yml` and `.github/workflows/deploy-pages.yml`), not just by convention. A coach forking the repository for their own team most easily deploys to GitHub Pages, since it needs no external account; Cloudflare Pages is documented as an alternative for a custom domain. See [GitHub Pages portability](GITHUB_PAGES.md) and [Cloudflare Pages portability](CLOUDFLARE_PAGES.md).

## Sharing and exporting a session

Every session has a stable, bookmarkable URL: `#sessions/<session-id>` (e.g. `#sessions/welcome-ball-control`). A cold load of that URL renders exactly that session, so a head coach can send it to an assistant ahead of time and it prints identically to what they see on screen. There is no authentication anywhere in this app, so this is an unlisted-link model, not an access-controlled one — do not treat these URLs as private.

Screen, print, share and export all render through the single `renderSession()` function in `assets/js/data-driven.js` (exposed as `window.SmallSideRenderSession`) — there is exactly one session layout, not a second copy for sharing or a third for export. The Sessions page adds two export actions next to Print plan: **Copy for Docs/Word** writes the same rendered HTML to the clipboard as `text/html` (with a plain-text fallback) so a coach can paste it into Google Docs or Word and add their own material; **Download .html** saves it as a standalone, self-styled `.html` file. Both wrap `renderSession()`'s output in a minimal inline stylesheet — no new dependency, since a client-side `.docx` library would need a build step this static, no-build site doesn't have.

## Identifiers and versions

Use lowercase kebab-case IDs:

```text
treasure-island
gate-raiders
welcome-ball-control
2027-test-modularity-demo-u9
```

An activity is identified by `id@version`, such as `gate-raiders@1`. Published versions are immutable. Session IDs are stable and unique within the session index.

## Activity contract

An activity includes:

For `contract_version: 2`, controlled activity values come from `data/vocabularies/activity.json`. The validator enforces age band, phase, player range, equipment, skills, decisions, setup complexity, participation, questions, attendance/equipment adaptations, safety and diagram metadata. Provenance remains required for every version and is rendered on the activity card.

- title, age bands and controlled skill tags;
- minimum, recommended and maximum duration;
- `moment` — one of `in-possession`, `out-of-possession`, `transition` or `none` (`data/vocabularies/activity.json`'s `moments` list), the drill's single primary coaching focus. Required unless `all_phase` is `true`. `none` is for a drill with no ball/possession concept at all (a tag or movement game, e.g. `island-escape`) — like `all_phase`, it's excluded from a session's moment-coverage denominator rather than forced into the possession taxonomy. A session displays its own coverage across the three real moments, computed from the activities it references, weighted by that reference's minutes rather than by drill count.
- `all_phase` (optional, must be `true` when present): for a drill that genuinely exercises all three moments (free scrimmage, multi-goal games) rather than one. `moment` is not required when `all_phase` is true and is normally omitted. Its minutes are excluded from the denominator of the session's moment-coverage percentages and shown separately as uncounted time, never silently dropped.
- `moment` and `all_phase` are the one deliberate exemption from activity-version immutability: they're classification metadata, not drill content, so they may be corrected on an existing version in place instead of forcing a new version. See the activity schema's top-level `description` for the same note, so the exemption isn't later "fixed" into forced version churn for a relabel.
- story, setup, instructions and coach lens;
- simplify and challenge adaptations;
- explicit safety notes where relevant;
- review status;
- complete source provenance and rights notes.

See [Content policy](../coaching/CONTENT_POLICY.md) before authoring or translating an activity.

## Session contract

A session includes:

- duration and outcome;
- `status`, required: `draft` or `published`. Draft sessions may carry `NEEDS_COACH_INPUT` placeholders in `theme` or `fourCorners` and are excluded from the Sessions page's session list and theme filter — the validator only hard-fails those placeholders once a session is published. This is the normal, permanent way sessions get authored incrementally, not a one-off workaround. A draft session's direct share URL (`#sessions/<id>`) still renders.
- `theme`, one of the controlled values in `data/vocabularies/activity.json`'s `themes` list (defending, attacking, shooting, space-possession, transition, 1v1-dribbling). Required, so published sessions are browsable and filterable by theme on the Sessions page.
- `fourCorners`, the FA four corners of player development — `technical`, `physical`, `psychological` and `social`, rendered as the session outcomes in that fixed order, identically on screen and in print. Each corner is either a non-empty outcome string or `null`. `null` means the session deliberately does not address that corner — a complete, valid value, not a `NEEDS_COACH_INPUT` placeholder — and renders visibly as "Not a focus in this session" rather than being omitted from the list.
- equipment and coach cues;
- ordered activity references;
- pinned activity version and minutes for every reference.

A session's coverage across the three moments of the game (in possession, out of possession, transition) is not stored on the session — it is computed at render time from the `moment` of each referenced activity, weighted by that reference's minutes, excluding any `all_phase` or `moment: "none"` activity's minutes from the denominator (see Activity contract below). Excluded minutes are shown, not hidden — e.g. "60% in-possession · 25% out-of-possession · 15% transition" with a separate note for the uncounted minutes.

## Standing warm-up

`data/library/warmup.json` (`data/schemas/warmup.schema.json`) is one shared warm-up definition — never copied into a session file. It holds `description`, `setup` and an ordered, id'd `progressions` array. A season points at it via `season.json`'s `warmup` field (almost always the shared library path, like `activity_index`/`session_index`).

`warmup_progressions` (an array of progression ids) lives on the **curriculum week** (`data/seasons/<id>/curriculum.json`'s `cycles[].warmup_progressions`), not on the session — a session repeats across multiple weeks in the curriculum, so a progression pointer on the session itself would force every occurrence to run the same progression. The portal looks up the current week's progressions from the curriculum when rendering a session's warm-up block (falling back to that session's first curriculum appearance when it isn't the active week's plan, e.g. for a direct share link), and renders it as the first block of every session plan with those progressions marked. Editing `warmup.json` updates every session that references it.

Activity minutes must fit the session duration while leaving no more than ten minutes for transitions and reflection. The portal calculates its timeline from these values.

An activity reference can optionally carry `progression` (staged variations of the same activity under one continuous setup) or `shares_setup_with_previous`/`setup_note` (a different activity that reuses the previous block's physical setup) — both minimize setup/explanation time between blocks. See [Content packs](CONTENT_PACKS.md#progression-within-one-setup) for the authoring rules and validation.

## Controlled values

Primary skill vocabulary currently includes:

- `ball-control`
- `running-with-ball`
- `one-v-one-attacking`
- `scoring`
- `defending`
- `passing-support`
- `transition`
- `rotating-goalkeeper`
- `movement-reaction`
- `small-sided-play`

Review states are `draft`, `source-checked`, `field-tested`, `approved` and `retired`.

Moments of the game (`data/vocabularies/activity.json`'s `moments`, on every activity unless `all_phase` is true): `in-possession`, `out-of-possession`, `transition`, `none`.

Session themes (`data/vocabularies/activity.json`'s `themes`, on every session): `defending`, `attacking`, `shooting`, `space-possession`, `transition`, `1v1-dribbling`.

The vocabulary is still being normalized; validation currently enforces review states but not a closed skill enum.

## Validation

Schemas live in `data/schemas/`. The dependency-free validator reads their required fields and enforces additional cross-record rules:

- safe paths contained under `data/`;
- valid season date order;
- unique activity ID/version pairs and session IDs;
- ordered activity duration bounds;
- required provenance and HTTPS source URLs;
- valid review states;
- pinned session-to-activity references;
- curriculum-to-session references;
- plausible session timing.

Run `node scripts/validate-content.mjs`. Regression cases are in `scripts/test-content-validation.mjs`.
