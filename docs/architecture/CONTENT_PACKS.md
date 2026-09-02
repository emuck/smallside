# Content packs and season configuration

Updated: 2026-08-31

SmallSide separates reusable coaching content, league rules and team-season choices. This allows a new season to reuse activities without editing application code.

## Resolution flow

```text
data/current-season.json
          |
          v
data/seasons/<season-id>/season.json
          |
          +--> league_profile ------> data/profiles/leagues/
          +--> curriculum ----------> weekly themes + session IDs
          +--> practice_pattern ----> recurring days + exceptions
          +--> games ---------------> sanitized calendar snapshot
          +--> activity_index ------> immutable activity versions
          +--> session_index -------> reusable session templates
          |                               |
          |                               `-- activity_id@version
          `--> warmup --------------> shared standing warm-up + progressions
                                          ^
                     curriculum.json's cycles[].warmup_progressions selects one per week
```

`data/current-season.json` selects the season a fresh visitor sees by default. On the local/LAN deployment, the Seasons page (`assets/js/seasons.js`, listed in `data/seasons/index.json`) lets a coach switch their own browser to any other configured season — active, archived or test — without changing the default anyone else gets. The public build (Cloudflare Pages or GitHub Pages — both run the same `scripts/build-static.mjs`) has no season index and no Seasons route; it always ships exactly the one season named in `current-season.json`. See "Multiple seasons and archives" below.

## Multiple seasons and archives

Every season in `data/seasons/index.json` carries a `status`: `active` (exactly one, and it must be the one `current-season.json` points at — the validator enforces both), `archived` (a past season, kept for reference), or `test` (fabricated data used to exercise modularity, never real team/child information). `node scripts/validate-content.mjs` fully validates every listed season, not just the active one, so an archived or test season can't silently rot.

Switching seasons is browser-local: the Seasons page writes the chosen manifest path to `localStorage` and reloads; `content-loader.js` honors that override only if it's still listed in `data/seasons/index.json`, otherwise it silently falls back to the default. A callout banner appears on every page while a non-default or non-active season is showing, with a one-click return to the current season. This never touches `data/current-season.json` — only an explicit edit to that file changes what a fresh visitor or the public site sees.

To archive a finished season: set its `status` to `archived` in `season.json`, leave it listed in `data/seasons/index.json`, and point `current-season.json` at the new one (whose own `status` must be `active`). Reflections exported while a season was showing carry that season's `id` in `season_id` — see [reflections](../../data/reflections/README.md#season-archives) for filing them.

## Ownership

| Location | Changes when | Reusable? |
|---|---|---|
| `data/library/activities/<id>/v<n>.json` | A reusable activity earns a new version | Yes |
| `data/library/sessions/` | A reusable session composition changes | Yes |
| `data/library/warmup.json` | The shared standing warm-up or its progressions change | Yes |
| `data/profiles/leagues/` | Published competition rules change | Across matching seasons |
| `data/seasons/<id>/curriculum.json` | That season's progression, or a week's warm-up progression choice, changes | No |
| `data/seasons/<id>/practice-pattern.json` | That season's recurring schedule changes | No |
| `data/seasons/<id>/schedule.json` | Calendar synchronization runs | No — one season's own sanitized snapshot |
| `data/current-season.json` | Another season becomes active | N/A |

## Immutable activity versions

An activity's identity is `id@version`.

```text
gate-raiders/
  v1.json       historical version; never edit after use
  v2.json       correction or reusable content change
```

Sessions pin both fields:

```json
{
  "activity_id": "gate-raiders",
  "activity_version": 1,
  "minutes": 13
}
```

To adopt version 2, add `v2.json`, list it in the activity index, and update only sessions that should use it. This keeps historical seasons reproducible. A timing or one-session variation belongs on the session reference and does not require a new activity version.

## Progression within one setup

Setup and explanation are not play. When two consecutive blocks would use a similar area and one can be reached from the other by changing a single variable (numbers, scoring method, restart), author them as one activity reference with a `progression` array instead of two separate blocks that each pay for their own setup and explanation:

```json
{
  "activity_id": "team-scrimmage",
  "activity_version": 1,
  "minutes": 30,
  "progression": [
    {"minutes": 15, "note": "First half. Coach-managed restarts; rotate the goalkeeper."},
    {"minutes": 15, "note": "Second half, same setup. Switch ends; rotate anyone who hasn't played every role."}
  ]
}
```

`progression` stage minutes must sum to the reference's `minutes`; the validator enforces this. Use the plain `variation` string instead when a block is genuinely a distinct setup, not a staged continuation of the previous one. See guardrail 9 in [PLATFORM_PLAN.md](../product/PLATFORM_PLAN.md).

## Shared setup across different activities

`progression` covers one activity staged over time. A separate, related case: two *different* activities that happen to use a compatible footprint (same field size and markers, or a reusable subset of cone gates), where sequencing them back to back means the coach only builds the setup once. Mark the later reference `shares_setup_with_previous: true` with a `setup_note` describing what to adjust:

```json
{
  "activity_id": "win-it-score-it",
  "activity_version": 1,
  "minutes": 10,
  "variation": "Short 1v1 rounds with an immediate counterattack after a ball win.",
  "shares_setup_with_previous": true,
  "setup_note": "Same two lanes and mini goals as goal-rush; narrow each lane slightly and hand out bibs to split into 1v1 pairs."
}
```

The validator requires a non-empty `setup_note` whenever `shares_setup_with_previous` is true, and rejects it on a session's first activity (there is nothing before it to share with). This is a claim about the physical setup, not the coaching idea — only use it when the two activities' `setup` text in the activity library genuinely describes overlapping field size and markers. Do not reorder or pair activities just to use this field; author the session in the order that serves the players, and use it only where a real footprint match already exists. See guardrail 10 in [PLATFORM_PLAN.md](../product/PLATFORM_PLAN.md).

## Affiliated organizations

A league profile can optionally list `affiliated_organizations`: clubs or bodies coaches should know about that aren't a rules source, such as a coach-training platform.

```json
"affiliated_organizations": [
  {"name": "Example club coach training", "url": "https://example.com/coach-training", "purpose": "Coach-education modules assigned by the club."}
]
```

`url` must be HTTPS; the validator enforces this. It renders on the Resources page (`#catalogue`), above the federation resource catalogue. Because it lives on the league profile rather than the season, switching to a different club's profile automatically swaps which organizations appear — no code change needed.

## Create a season

1. Create `data/seasons/<season-id>/`.
2. Add `season.json`, `curriculum.json` and `practice-pattern.json`. `tools/new-season.html` — a local, form-based wizard (see [README](../../README.md#run-and-validate) for how to serve the repo locally) — generates `season.json` and `practice-pattern.json` for you; it does not build `curriculum.json`, so copy an existing season's as a starting template.
3. Select a reviewed league profile. If it's new, add it under `data/profiles/leagues/` and list it in `data/profiles/leagues/index.json` so the wizard's dropdown finds it.
4. Reference the reusable activity and session indexes, and the shared `data/library/warmup.json` (the wizard fills in `warmup` with that path by default).
5. Build the curriculum from existing session IDs, adding one `warmup_progressions` entry per week (see [Standing warm-up](DATA_MODEL.md#standing-warm-up)) — advance through the progression list across the season rather than holding one progression for many weeks.
6. If any session is new rather than reused, give it `theme`, `fourCorners` and `status: "draft"` (see [Session contract](DATA_MODEL.md#session-contract)) — a draft session may carry incomplete fields and won't block validation, but is excluded from the Sessions page until flipped to `status: "published"`.
7. Point the season's `games` field at a sanitized schedule.
8. Run:

   ```bash
   node scripts/validate-content.mjs
   node scripts/test-content-validation.mjs
   ```
9. Review the season, session, rules and calendar routes.
10. Change `data/current-season.json` only when ready to activate it.

## Current season

The active pack is the fictional demo season `2027-test-modularity-demo-u9`:

- Demo U9 Academy league profile (clearly fictional, different age group/format/timezone than a real deployment would use)
- Reuses the full reusable activity and session library unchanged, to prove that reusability across teams/ages
- Empty sanitized game snapshot

A second fictional season, `2026-fictional-archived-demo` (`status: "archived"`), exists purely to exercise multi-season validation and the archive/switch workflow — see [Multiple seasons and archives](#multiple-seasons-and-archives) above.

A real deployment's curriculum, practice pattern and league profile look like these but with your own team's real content.

## Future import/export

A portable content pack should eventually contain a manifest plus referenced records and source metadata. Import/export is not implemented. Until it is, contributors add reviewed files directly and rely on validation.
