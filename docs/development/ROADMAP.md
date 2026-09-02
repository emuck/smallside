# Roadmap

This document shows delivery order. [Development status](STATUS.md) records what is complete; the [feature plan](../product/FEATURE_PLAN.md) contains detailed acceptance criteria.

```text
Foundation        Curated library       Session builder       Adaptation
   done      ->      current       ->       next        ->       later
```

## M1 — foundation: complete

- Local-first responsive portal
- Product and coaching-content policies
- Active-season manifests and league profiles
- Immutable, source-traceable activity versions
- Reusable session references
- Validation, regression tests and deployment protections

## M2 — curated library: current

- Normalize controlled vocabularies
- Reach 17 reviewed activities (currently authored for U7) — source-check complete; field testing pending
- Add diagrams and attendance/equipment adaptations
- Assemble 4 useful 60-minute sessions — authored; field testing pending
- Field-test and record review status

Exit: four distinct sessions can be delivered without filler, and every activity passes content and provenance review.

## M3 — discovery and session builder

- Filter activities by focus, duration, player count and equipment — implemented; field validation pending
- Assemble and reorder a timed session
- Calculate transitions and free-play proportion
- Warn about excessive novelty, queues and rule conflicts
- Save, duplicate, print and export

Exit: a volunteer coach can create a valid session in under five minutes.

## M4 — reflection and adaptation

Hosted database work remains deferred until the static library, builder and field-delivery features are complete. Continue using browser-local notes and JSON reflection export.

- Save reflections privately
- Connect observations to sessions without child identity
- Detect repeated team patterns across events
- Recommend one-variable repeats, simplifications or progressions
- Keep coach approval and an adaptation audit trail

## M5 — field usability

- Offline/PWA support
- Large-type touchline mode and timer
- Attendance, equipment and weather variants
- Simple diagram editor

## M6 — open-source readiness

- Separate demonstration data from private team data
- Select compatible code and content licenses
- Add public contribution governance
- Complete privacy and threat-model review
- Publish only after content-rights gates pass

## Deferred until demonstrated need

- Multiple *unrelated* coaches privately sharing one deployment (true multi-tenancy, needing auth and per-coach data isolation). What's already supported is narrower and simpler: one coach can configure and switch between several of their own seasons/teams locally, and each coach can fork the repository to run their own independent deployment — see [Content packs](../architecture/CONTENT_PACKS.md#multiple-seasons-and-archives) and [GitHub Pages portability](../architecture/GITHUB_PAGES.md).
- Authentication and multi-device synchronization
- Database or framework migration
- Club administration, registration, payments or player evaluation
