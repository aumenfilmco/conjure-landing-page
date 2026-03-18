---
status: complete
phase: 06-scroll-panel
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md
started: 2026-03-14T00:00:00Z
updated: 2026-03-14T00:02:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Desktop Sticky Panel
expected: On desktop (1280px+), scrolling through the Features section keeps the right panel (browser mockup) fixed in the viewport while the left column scrolls. The panel does not jump, collapse, or scroll away.
result: pass

### 2. Screenshot Crossfade on Scroll
expected: As you scroll through the feature rows, the screenshot inside the browser mockup panel smoothly crossfades to match whichever feature row is centered in the viewport. No flash, blank frame, or layout shift between transitions — all 6 screenshots are in the DOM at all times.
result: pass

### 3. Active Row Highlight
expected: The feature row currently centered in the viewport shows its text in mint/primary color. All other rows are muted. The active state updates automatically as you scroll — no click or interaction required.
result: pass

### 4. Browser Mockup Chrome
expected: The right panel shows browser-style chrome: a title bar with 3 colored traffic-light dots and a URL bar showing "conjurestudio.app". The screenshot fills the area inside the chrome without overflow or clipping.
result: pass

### 5. Mobile Single-Column Layout
expected: At 375px viewport (phone emulation via DevTools or physical device), the two-column layout is gone. Each feature appears as a stacked vertical card — description on top, screenshot below. No sticky panel. No horizontal scroll.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
