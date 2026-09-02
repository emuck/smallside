# Activity research and authoring

Updated: 2026-08-29

This workflow turns trusted coaching ideas into source-traceable SmallSide activities without copying protected wording or diagrams.

## Research order

1. Current club, league and national-federation guidance
2. Federation coach-education libraries
3. Recognized child-development and coach-education organizations
4. Licensed or clearly reusable community material
5. Commercial material as inspiration only, never copied without permission

Start from the sources in the portal catalogue. Prefer primary sources and record the page, publisher, review date and rights interpretation before drafting.

## Research funnel

```text
Source candidate
      |
      v
Age/safety/relevance screen
      |
      v
Extract the coaching idea, not wording or artwork
      |
      v
Write original SmallSide activity + provenance
      |
      v
Create original SVG setup
      |
      v
Validate -> coaching review -> field test -> approve
```

Reject an idea when it creates long lines, elimination, low ball contact, adult tactical complexity or a setup that takes too long to explain.

## Controlled vocabulary

New activities use `contract_version: 2` and select machine-readable values from `data/vocabularies/activity.json`. Do not invent a near-synonym when an existing value expresses the same concept. Propose a vocabulary addition explicitly when a genuinely new coaching concept is needed, then update validation and documentation with it.

Published legacy versions remain readable. Create a new immutable version to bring an existing activity onto the current contract; do not retrofit a published record in place.

## Activity authoring checklist

Every record should identify:

- visible attribution: source title, publisher, URL, review date, adaptation status and rights notes;

- the football problem and primary decisions;
- age band, player range, duration, area and equipment;
- setup that can be explained quickly, and that supports at least one in-place progression (a rule or number change that needs no new setup or explanation) before a coach must move to a different activity;
- short original instructions;
- what the coach should observe;
- one or two useful questions;
- simplify, challenge, attendance and equipment variations;
- safety and inclusion considerations;
- source, publisher, URL, rights status and review notes.

Create a new immutable version for reusable changes. Never revise a version that has been used by a session.

## Diagram standard

SVG is the canonical visual.

A useful diagram should show only what the coach needs to set up:

- field boundary and dimensions;
- goals, gates, zones and cones;
- starting player positions;
- balls;
- one or two movement paths;
- a compact legend when symbols are not obvious.

```text
+---------------------------+
| A o  ----->        |goal| |
|                           |
|        x defender         |
|                           |
| |goal|        <-----  o A |
+---------------------------+

o attacker   x defender   ---> player/ball path
```

Requirements:

- original SmallSide artwork;
- readable on a phone and in grayscale print;
- meaningful text alternative;
- consistent colors and symbols;
- no essential information conveyed by color alone;
- responsive `viewBox`;
- no external image dependency.

## Optional movement animation

Animation should clarify a sequence that a static arrow cannot, not decorate the card.

Use browser-native SVG plus CSS or the Web Animations API:

```text
Static setup -> Play movement -> Reset
                   |
        ball/player markers follow
        the same paths shown by arrows
```

Rules:

- animation is off until the coach presses Play;
- provide Pause/Reset;
- respect `prefers-reduced-motion`;
- keep the static diagram fully usable and printable;
- include a short textual sequence;
- do not require video, canvas, a framework or a server;
- keep files small enough for unreliable field connectivity.

This approach works unchanged on the LAN deployment and Cloudflare Pages.

## Review states

- `draft`: original record exists but source/content review is incomplete
- `source-checked`: provenance and rights notes reviewed
- `field-tested`: delivered and reflected on
- `approved`: suitable for the curated library
- `retired`: preserved for history but no longer offered for new sessions
