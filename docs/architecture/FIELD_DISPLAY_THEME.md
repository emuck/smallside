# Field display theme

Status: accepted and implemented 2026-08-02

## Decision

SmallSide defaults to **Field view**: near-black text on high-luminance, warm-white surfaces. A persistent **Dark view** is available from the primary navigation for evening, indoor, and user-preference use.

This is deliberately not an operating-system-controlled dark-mode default. The primary context is a coach glancing at an iPhone outdoors, where positive polarity and high luminance are generally more legible. The selected view is stored only in browser `localStorage`; no personal data leaves the device.

## Evidence

- Dobres, Chahine, and Reimer found a positive-polarity legibility advantage and reduced reading thresholds under bright illumination: [Applied Ergonomics study](https://pubmed.ncbi.nlm.nih.gov/28166901/).
- Apple describes Dark Mode as suited to low-light environments and documents ambient-light-based automatic brightness: [Adjust iPhone screen brightness and color](https://support.apple.com/en-gb/guide/iphone/iph60ba71065/26/ios/26).
- WCAG 2.2 requires 4.5:1 contrast for ordinary text and 3:1 for large text; 7:1 is its enhanced target: [Understanding contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Apple recommends checking contrast in both appearances, supporting larger text, and using controls at least 44 by 44 points: [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/) and [UI design tips](https://developer.apple.com/design/tips/).

## Design rules

1. Use semantic tokens from `assets/css/styles.css`; do not add fixed white or black component backgrounds.
2. Target 7:1 for body and secondary text where practical; never fall below WCAG AA.
3. Keep mobile body text at 17px or larger and avoid thin weights for field instructions.
4. Keep primary controls at least 44px high, with a visible keyboard-focus outline.
5. Never rely on green, orange, or any color alone to communicate state or coaching meaning.
6. Test every new component in Field view, Dark view, narrow mobile layout, and `prefers-contrast: more`.
7. Do not attempt to control physical screen brightness. Recommend iPhone Auto-Brightness for outdoor use.

## Implementation

- `assets/js/theme.js` applies Field view before CSS paints, changes the browser theme color, and stores the manual choice.
- The theme uses static CSS, JavaScript, and browser storage only, so it works unchanged on Cloudflare Pages.
- If storage is unavailable or contains an unknown value, Field view is the safe default.
