# D1 feedback integration

Updated: 2026-08-29
Status: deferred until the planned static coaching features are complete (see [Roadmap](../development/ROADMAP.md) M4)

This document is intentionally short. It records the target architecture and non-negotiable gates now, without maintaining detailed Wrangler/config prose for a feature that hasn't started — that level of detail should come from Cloudflare's current docs (linked below) at implementation time, not be frozen here where it will drift.

## Purpose

Provide private, reliable practice/game reflection saving from the public site without making a writable VM filesystem part of the hosted application, while keeping the existing JSON-download/local-inbox workflow as a permanent fallback. This is not part of the first static Pages release — the coaching portal ships without it.

## Target architecture

```text
Reflection form -> Authenticated Pages Function -> validate + prepared INSERT -> D1
                                                                                    |
                                                              authenticated export  v
                                                              -> data/reflections/inbox/ -> Codex synthesis -> coach-approved adaptation
```

Access via the repository port in [Storage portability](STORAGE_PORTABILITY.md); D1 is the first adapter, not a domain dependency. Do not add player names, attendance, photos, contacts, medical information, rankings, diagnoses, or inferred profiles to the schema.

## Stages

1. **Static Pages launch (current):** JSON download + `localStorage` notes only. No reflections, feedback service, or writable API in the public build.
2. **Local prototype:** Pages Functions + versioned migrations against a local-only Wrangler D1 binding; test submission, validation, duplicate prevention, export, review state, and offline retry without touching a production database.
3. **Protected production:** separate preview/production D1 databases; Cloudflare Access on all write/export/review operations; migrations deployed before dependent code; JSON download retained as an escape hatch.

## Release gates — do not enable production writes until all are true

1. Static Pages deployment and custom domain are stable.
2. Local migrations and integration tests pass from empty and upgraded databases.
3. Authentication/authorization tested for both allow and deny cases.
4. Preview and production databases are separate.
5. Origin, CSRF, validation, size, rate, and duplicate controls pass adversarial tests.
6. Offline retry cannot create duplicate records or silently lose an entry.
7. Export/import round trips preserve the current reflection schema.
8. Retention, deletion, backup/export, and incident procedures are documented.
9. No child-identifying or medical data is collected.
10. The coach approves the production workflow.

## Cost

At SmallSide's scale (a few reflections per week for one team), D1/Pages Functions usage is negligible against Cloudflare's Workers Free plan limits — expected cost is $0/month. Verify current pricing and limits against the official pages below before enabling a paid plan; do not treat any cost figure recorded here as current.

## Official references

- [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [Pages local development](https://developers.cloudflare.com/pages/functions/local-development/)
- [Pages D1 bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)
