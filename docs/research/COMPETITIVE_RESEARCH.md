# SmallSide competitive research

Reviewed: 2026-08-01

## Scope

This is a lightweight product and name landscape review, not legal, trademark, security, or financial due diligence. Sources were checked directly where possible. Product claims and pricing can change.

## Executive finding

The market is crowded around drill volume, diagramming, match administration, and generic AI generation. The clearest opening is a source-traceable, development-first system for volunteer coaches of young players:

1. Curated games rather than an unfiltered drill catalogue.
2. Age and format guardrails built into every recommendation.
3. A fast mix-and-match session builder.
4. Team-level reflection that adjusts future sessions conservatively.
5. No child rankings, talent predictions, or unnecessary personal data.
6. Local-first and open-source operation.

## Commercial landscape

| Product | Primary strength | Relevant capabilities | Implication for SmallSide |
|---|---|---|---|
| The Coaching Manual | Expert content and coach education | Large video library, diagram/practice creator, feedback comments, folders, season plans | Do not compete on production volume. Explain why, when, and how to adapt a smaller set of young-player games. |
| easy2coach | Breadth and mature all-in-one workflow | 1,000-3,000+ drills depending page, hundreds of plans, filters, drag/drop sessions, tactics, team management, collaboration | Keep SmallSide narrower, faster, and transparent. Avoid becoming another club-management suite. |
| Sport Session Planner | Advanced visualisation | Thousands of plans, 3D/animated diagrams, curriculum planning, sharing and public ratings; individual plan listed at US$85/year | Use simple readable diagrams first. 3D is not needed for U7 delivery. |
| coachbetter | Integrated coaching/team platform | Drill content, session planning, team communication, attendance, stats and player profiles | Differentiate through privacy and team-level learning rather than individual performance tracking. |
| Pitch Planner | Volunteer-coach match workflow | Practice builder, drill cards, rosters, lineups, attendance, substitutions and playing time | Direct workflow competitor; SmallSide must be stronger at curriculum quality and adaptation. |
| MatchDay Coach / MatchdayIQ / Whistled | Matchday administration | Lineups, substitutions, playing time, reports, parent views and some practice planning | Do not prioritise live match statistics. League rules, equitable rotation and post-game team observations are enough. |
| PlayOS Sports | Broad youth-soccer platform | Coach drill/session tools, match voice workflow, fair minutes, player-development products | Avoid the operating-system positioning and player-development surveillance. |
| CoachFlow and similar AI planners | Fast session generation | Generate plans from age, theme and player count | SmallSide recommendations must be inspectable, source-linked and constrained by known games rather than invented drills. |
| MOJO | Young-player accessibility | Mobile practice plans and activity videos; historically partnered with US Youth Soccer | Match the ease of use while remaining web-based, adaptable and open. |

## Open-source landscape

GitHub searches for soccer coaching session planners, football training planners, drill libraries and tactics boards produced few substantial projects.

Notable results:

- `stepun/training-session-planner`: recent React/TypeScript planner with PDF export; no license detected.
- `JAbbottSportScience/soccer_drill_library`: recent public drill-storage repository; no license detected.
- `maklad42/react-footy-tactics`: small recent React tactics board; no license detected.
- `tjokimie/catenaccio`: older MIT-licensed tactics board.
- Numerous small tactics-board experiments with little adoption and generally no declared license.

A public repository is not automatically reusable. Projects without an explicit license should be treated as all-rights-reserved. We may study product behaviour but should not copy code, diagrams, or content.

## Feature gap

SmallSide should combine capabilities that are rarely present together:

| Need | Existing market | SmallSide position |
|---|---|---|
| High-quality U5-U10 content | Often mixed into very large all-age libraries | Small, reviewed, source-linked catalogue |
| Coach tutorial | Usually separate from session builder | Instructions, observation cues and adaptations on every card |
| Reflection | Comments, ratings or player evaluations | Team-pattern evidence feeding the next two sessions |
| Adaptation | Manual editing or opaque AI | Explainable recommendation using one changed variable |
| Privacy | Rosters, stats and player profiles are common | No player identity required for core workflow |
| League fit | Often generic formats | Rules-aware time, format, heading and participation checks |
| Offline/local ownership | Usually hosted SaaS | Local-first web app and exportable structured content |
| Open contribution | Limited | Reviewable game schema, provenance and contribution policy |

## Naming review

### SmallSide

Official product name. The name directly evokes small-sided football and scales beyond U7. General web search found no obvious soccer-coaching platform using the exact name. GitHub search found only unrelated small projects and no established exact-name coaching product.

Risks:

- It is close to the generic phrase "small-sided," so trademark strength may be limited.
- Domain, app-store, corporate-name and formal trademark checks remain outstanding.
- Search discoverability will require a descriptive subtitle.

Suggested presentation:

> SmallSide - youth soccer practice planning

### Names rejected or deprioritised

- Touchline: several active football coaching, team-management and fan products use it.
- SessionForge: numerous GitHub projects already use the name.
- GrassrootsOS: conflicts conceptually with active PlayOS positioning and overstates the product.
- PlayFoundry: relatively clear and distinctive, but does not immediately communicate soccer.

## Product principles derived from research

- Optimise for the volunteer coach preparing in 10 minutes.
- Treat every external game as source material to review and rewrite, not content to copy.
- Measure catalogue quality by usability and learning returns, not item count.
- Make the session editable; never present generated output as authoritative.
- Prefer team observations over individual ratings.
- Never optimise U7 sessions for score or early positional specialisation.
- Build excellent print/mobile views before advanced animation.
- Keep the content format portable and documented.

## Sources

- The Coaching Manual session planner: https://www.thecoachingmanual.com/features/session-planner
- easy2coach: https://www.easy2coach.net/en/training/
- easy2coach pricing: https://www.easy2coach.net/en/pricing/
- Sport Session Planner: https://www.sportsessionplanner.com/?a=page&page=features.html
- coachbetter: https://www.coachbetter.com/solutions/for-coaches
- Pitch Planner: https://pitch-planner.app/features/
- PlayOS: https://playossports.com/
- MatchDay Coach: https://www.matchdaycoach.app/
- MatchdayIQ: https://www.matchdayiq.com/
- GitHub repository search performed 2026-08-01.
