## What this changes and why

## Checklist

- [ ] Read [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] No child names, contacts, medical information, rankings or talent
      projections were added anywhere in this change
- [ ] New/changed activities and sessions include complete provenance and
      rights metadata (`source` field)
- [ ] Ran the required checks:
      ```bash
      for file in assets/js/*.js; do node --check "$file"; done
      node scripts/validate-content.mjs
      node scripts/test-content-validation.mjs
      node scripts/test-activity-filters.cjs
      git diff --check
      ```
- [ ] Inspected the affected route(s) in a local or preview build
