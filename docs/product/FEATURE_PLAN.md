# SmallSide feature plan

Updated: 2026-09-01
Status: public pre-alpha; M2 curated library

## Product loop

```text
Observe -> choose focus -> select activities -> build -> deliver
   ^                                                   |
   |                                                   v
   +----------- approve adaptation <- reflect <--------+
```

## Foundation — complete

- Active-season manifest and team-season packs
- Immutable activity versions
- Reusable session templates with pinned references
- League profiles and sanitized schedules
- Provenance and rights metadata
- Content schemas, validator and malformed-content tests
- Defensive rendering and visible fallback state
- An allowlisted `dist/` build with a content-scan safety check (Cloudflare Pages/GitHub Pages deployment); a self-hosted deployment protects the same private/server paths at the web-server level

## M2 — curated library

### Activity contract

Add the fields needed for useful filtering and field delivery:

- controlled primary skill and decision tags;
- age band, player-count range and session phase;
- duration and equipment;
- setup, instructions and explanation time;
- coach observations and questions;
- easier, harder, attendance and equipment adaptations;
- safety, active-participation and decision-making characteristics;
- source, rights, review status and review date;
- consistent original SVG diagram when it materially helps;
- optional play/pause movement animation when sequence adds genuine clarity.

Target reached in authored content: 17 source-checked activities, currently authored for U7, cover ball control, running, 1v1 attacking, scoring, defending/transition, passing/support, rotating goalkeeper and small-sided play. Field testing remains.

### Session set

Four complete 60-minute templates are authored; field testing remains.


- Build 3 additional 60-minute templates.
- Calculate the timeline from activity minutes.
- Reserve at least one-third for football.
- Limit unfamiliar organization.
- Include transitions and reflection.
- Field-test the first four sessions.

Success: four useful sessions can be delivered without filler.

## M3 — discovery and builder

### Library discovery

Initial static filtering is implemented for search, skill, phase, player count, duration, equipment and goalkeeper involvement. Field validation and integration with the future builder remain.


- Filter by skill, player count, duration, equipment and phase.
- Show familiarity, active-player and decision characteristics.
- Provide mobile detail and print views.

Success: a coach finds an appropriate activity in under one minute.

### Session builder

- Set duration, attendance, equipment and focus.
- Add, remove and reorder activities.
- Calculate active time and transitions.
- Warn about queues, excessive novelty, insufficient football and rule conflicts.
- Save, duplicate, print and export.

Success: a coach creates a valid plan in under five minutes.

## M4 — reflection loop

- Save practice and game reflections privately.
- Link observations to sessions without player identity.
- Identify patterns across multiple events.
- Recommend repeat, simplify or progress with evidence.
- Require approval before changing season themes.

Success: the coach can explain why the next session changed.

## M5 — field usability

- Installable offline/PWA mode
- Large-type touchline view
- Session timer and next-activity control
- Practice cancellation/change display
- Attendance, equipment and poor-weather variants
- Simple diagram editor

## M6 — reusable public platform

- Multiple age and match formats
- League-profile-driven rules tutorial
- Allowlisted Cloudflare Pages build with demonstration data
- Content-pack import/export
- Contributor review workflow
- Localization and translated source notes
- Optional authenticated multi-device sync
- Demonstration data separated from private team data

## Explicit non-goals

- Player rankings, talent predictions or scouting
- Live match statistics
- Registration, payments or club accounting
- Parent social network
- Unconstrained AI activity generation
- Replacing team-administration products

## Definition of done

A feature is complete only when it is:

- useful on a phone and keyboard accessible;
- printable when relevant;
- safe without child identity;
- understandable by a new volunteer coach;
- validated and documented;
- resilient to missing content or network access where practical.
