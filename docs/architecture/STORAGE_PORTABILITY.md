# Storage portability

Updated: 2026-08-29
Status: accepted design; not yet implemented — deferred until M4 (see [D1 feedback integration](D1_FEEDBACK.md) and [Roadmap](../development/ROADMAP.md))

This document is intentionally short. It records the durable decision and shape now, so a future implementer doesn't have to re-derive it, without maintaining detailed implementation prose for code that doesn't exist yet. Expand it when M4 actually starts.

## Decision

Application and domain code must depend on a narrow **reflection repository port**, never directly on D1, SQLite, SQL strings, Wrangler bindings, or a database client. Each deployment supplies an adapter that implements the port and passes the same behavioral contract tests. The goal is straightforward replacement of storage infrastructure, not a claim that one SQL file runs unchanged on every database.

## Canonical record

```js
{
  id: "reflection-id", schemaVersion: 1, eventType: "practice", eventDate: "2026-08-18",
  joy: "...", independentBehaviour: "...", focus: ["finding-space"], engagement: 3,
  challenge: "about right", context: "...", status: "new",
  createdAt: "2026-08-18T19:15:00.000Z", reviewedAt: null, sourceRequestId: "client-generated-id"
}
```

Adapters map to and from this shape. Domain and UI code never see database rows, columns, or driver objects.

## Repository port

```js
// All methods async, even for memory/file adapters.
{ create(reflection), getById(id), findBySourceRequestId(id), list({status,eventType,fromDate,toDate,cursor,limit}), transitionStatus({id,from,to,at}), healthCheck() }
```

No generic `query(sql)` escape hatch — it would leak persistence concerns into application code.

## Adapters

- **D1** — production adapter for Cloudflare Pages, prepared statements only.
- **Memory** — fast deterministic adapter for unit/contract tests; never a production store.
- **Local D1** — the same D1 adapter against Wrangler's local binding, proving migrations/SQL work before production.
- **Future SQLite/PostgreSQL** — add only when a real deployment need exists; each still implements the port independently.

Storage driver selection happens once, at the composition root, and fails closed for an unknown driver — never a silent fallback to memory or files.

## Contract test suite (every adapter must pass all of these)

Create/retrieve a full record; idempotent duplicate `sourceRequestId`; reject conflicting IDs/invalid states; deterministic listing and filtering; bounded pagination; only `new → exported → reviewed` transitions, atomically; Unicode/JSON round-trip; normalized not-found/conflict/unavailable/unexpected errors; correctness under simultaneous duplicate submissions; migration tests from empty and prior schema versions.

## Error contract

Adapters throw or return only `StorageUnavailableError`, `StorageConflictError`, `StorageValidationError`, `StorageUnexpectedError`. Never expose SQL, table names, bindings, credentials, or driver messages in an HTTP response.

## Acceptance criteria

- No application or UI module imports a database driver or D1 binding.
- No Pages Function contains SQL.
- D1 and memory adapters pass the identical contract suite.
- Canonical JSON export round-trips across adapters.
- Adding a second SQL adapter requires no service or UI changes.
- Documentation never claims arbitrary SQL compatibility — portability comes from the tested repository contract, not from shared SQL syntax.
