# Reflection data

Place portal exports in `inbox/`. Treat each file as an observation, not an automatic instruction.

Suggested Codex prompt:

> Review all new files in data/reflections/inbox, compare them with the current and next two session plans, and propose evidence-based adaptations. Preserve joy and small-sided play, identify repeated patterns rather than reacting to one result, explain each change, then move processed files to reviewed only after I approve.

## Season archives

Each exported reflection carries `season_id`, set to whichever season was showing in the browser when it was submitted (see the [Seasons](../../assets/js/seasons.js) switcher). When a season ends, group its `reviewed/` files by `season_id` — e.g. move them into `data/reflections/reviewed/<season-id>/` — so a past season's notes stay with it. This is a manual filing convention; the browser still has no read access to `data/reflections/`.

## Data rules

- Do not record surnames, medical information, contacts, or rankings.
- Prefer team patterns and anonymous observations.
- Never optimise for score at the expense of equal play, rotation, belonging, or experimentation.
- One reflection may suggest a small adaptation; repeated evidence across 2-3 events can change a theme.
- Preserve originals and record approved changes in `docs/development/ADAPTATION_LOG.md`.
