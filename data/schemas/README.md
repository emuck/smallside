# Data schemas and validation

SmallSide keeps portable record contracts here:

- `activity.schema.json`
- `session.schema.json`
- `league-profile.schema.json`
- `season.schema.json`

The dependency-free validator reads schema-required fields and adds cross-record checks that JSON Schema alone does not express conveniently at this scale, including immutable version references, path containment, date order, provenance and session timing.

```bash
node scripts/validate-content.mjs
node scripts/test-content-validation.mjs
```

The tests copy `data/` into isolated temporary directories and confirm malformed examples are rejected. A full JSON Schema engine is intentionally deferred; if schema complexity grows, record that dependency decision before introducing one.

Authoring guidance is in [Content data model](../../docs/architecture/DATA_MODEL.md).
