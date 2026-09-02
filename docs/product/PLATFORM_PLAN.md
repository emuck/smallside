# SmallSide platform plan

Updated: 2026-08-29

## Objective

Build an open, practical system that helps volunteer youth-soccer coaches choose high-value games, assemble age-appropriate sessions, deliver them clearly, and adapt a season using team-level observations.

## Product strategy

```text
Reviewed activities
       |
       v
Reusable sessions -> season curriculum -> deliver -> reflect
       ^                                      |
       |                                      v
       +------------ evidence-based adaptation
```

SmallSide's intended advantage is not the largest drill catalogue. It is a smaller source-traceable library, clear coach education, fast session construction and a conservative reflection loop designed for young children.

## Non-negotiables

- Safety, belonging, enjoyment and equal opportunity
- Frequent ball contacts and meaningful decisions
- Small-sided football in every session
- No elimination, long queues or early position specialization
- No player rankings, talent predictions or unnecessary child data
- Source provenance for every reusable activity
- Coach control over programme changes
- Current club and league rules override generic guidance

## Technical strategy

- Remain local-first and dependency-free while one trusted editor manages the system.
- Keep reusable content separate from league and season configuration.
- Preserve historical seasons through immutable activity versions.
- Validate content relationships before deployment.
- Keep Google credentials and private reflections outside the browser.
- Add infrastructure only after a concrete user need crosses the documented architecture threshold.

See [Architecture](../architecture/ARCHITECTURE.md) and [Content packs](../architecture/CONTENT_PACKS.md).

## Milestones

| Milestone | Outcome | Status |
|---|---|---|
| M1 Foundation | Validated season packs, source-traceable versioned content and safe deployment | Complete |
| M2 Curated library | 17 reviewed activities and 4 complete, published sessions (currently authored for U7) | Current |
| M3 Discovery/builder | Find an activity in one minute; build a session in five | Planned |
| M4 Reflection/adaptation | Explain evidence behind approved session changes | Planned |
| M5 Field usability | Reliable offline and touchline delivery | Planned |
| M6 Open-source readiness | Rights-reviewed, private data separated, public governance ready | Planned |

Detailed scope and acceptance criteria are in [FEATURE_PLAN.md](FEATURE_PLAN.md). The current snapshot and known debt are in [STATUS.md](../development/STATUS.md).

## Session guardrails

These apply to any session in any age band or league profile, not only the U7 content currently authored. A standard youth small-sided session should:

1. Start with an immediately playable ball activity.
2. Include no more than one unfamiliar organization.
3. Move from exploration into opposition.
4. Reserve at least one-third of the session for free or lightly constrained football.
5. Give every player frequent involvement.
6. Include an easier and harder adjustment.
7. End with a short player reflection.
8. Comply with the selected league profile and safety rules.
9. Prefer progressing one setup over swapping to a new one. Every new activity block costs setup and explanation time that isn't play; if two blocks would use a similar area and can be reached by changing one variable, author them as one longer block with staged progression (see `progression` on a session's activity reference in [Content packs](../architecture/CONTENT_PACKS.md)) rather than as two separate blocks with their own setup and explanation.
10. Order different activities by shared footprint, not just theme. When two different activities in the same session use a compatible field size and markers (e.g. two rectangular fields with mini goals, or a shared set of cone gates), sequence them back to back and mark the later one `shares_setup_with_previous` with a `setup_note` describing the small adjustment needed, instead of striking the setup and building a new one. Only mark it when the footprints genuinely overlap — do not claim a shared setup between activities that need a different field shape or area.

## Open-source gate

Before making the repository public:

- choose compatible code and coaching-content licenses;
- distinguish original, adapted and linked-only material;
- replace private team data with demonstration data;
- add a code of conduct and public review workflow;
- complete a privacy/threat-model review;
- confirm no confidential links or content are distributed unintentionally.

Architecture and curriculum decisions belong in [DECISIONS.md](../development/DECISIONS.md). Approved season adaptations belong in [ADAPTATION_LOG.md](../development/ADAPTATION_LOG.md).
