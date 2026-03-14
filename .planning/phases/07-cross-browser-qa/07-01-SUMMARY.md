---
phase: 07-cross-browser-qa
plan: "01"
subsystem: test-suite
tags: [vitest, test-repair, glass-surface, scroll-spy, pricing-toggle]
dependency_graph:
  requires: [06-02-SUMMARY.md, 05-02-SUMMARY.md]
  provides: [green-test-suite]
  affects: [07-02-PLAN.md]
tech_stack:
  added: []
  patterns: [scoped-css-regex-assertion, aria-role-query-precision]
key_files:
  created: []
  modified:
    - conjure-landing-page/src/lib/glass.test.ts
    - conjure-landing-page/src/components/sections/__tests__/FeaturesSection.test.tsx
    - conjure-landing-page/src/components/sections/__tests__/PricingSection.test.tsx
decisions:
  - "GLAS-05 uses regex block extraction scoped to .glass-surface block to avoid false positive from hover rim shadow (0.22) in box-shadow"
  - "FLYT-03 observer count is 7 (6 FeatureRow + 1 section-level) — updated from stale 6"
  - "PricingSection toggle uses role=switch not role=button — distinct ARIA roles do not fall back to button"
metrics:
  duration_minutes: 1
  completed_date: "2026-03-14"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
---

# Phase 7 Plan 01: Test Suite Repair Summary

**One-liner:** Fixed three precision test failures — scoped GLAS-05 CSS regex, corrected FLYT-03 observer count to 7, and switched PricingSection toggle query to role=switch.

## Objective

Fix three pre-existing test failures deferred from Phases 5 and 6 so the Vitest suite is fully green before the manual QA checkpoint in Wave 1.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix GLAS-05 — narrow border-top-color assertion | e375296 | glass.test.ts |
| 2 | Fix FLYT-03 — observer count 6 → 7 | acce742 | FeaturesSection.test.tsx |
| 3 | Fix PricingSection — toggle role button → switch | 187f27f | PricingSection.test.tsx |

## Verification

Final suite run: **10 test files passed, 65 tests passed, 0 failed.**

```
Test Files  10 passed (10)
Tests  65 passed (65)
```

## What Was Fixed

### Task 1: GLAS-05 (glass.test.ts)

The existing assertion `expect(css).not.toContain('0.98 0 0 / 0.22')` scanned the entire globals.css file. Line 194 contains a legitimate hover rim highlight in `.glass-surface:hover` box-shadow using `0.22`, which triggered a false positive. The fix extracts just the `.glass-surface { ... border-top-color` block via regex and scopes the `not.toContain('0.22')` assertion to that block only.

### Task 2: FLYT-03 (FeaturesSection.test.tsx)

The test was written during RED phase expecting 6 IntersectionObserver instances (one per FeatureRow). The Phase 6 implementation added a 7th section-level observer in FeaturesSection itself for `mockupVisible` state. The describe and it descriptions were updated, and the assertion was corrected to `toHaveBeenCalledTimes(7)` with inline comments explaining the 6+1 breakdown.

### Task 3: PricingSection toggle (PricingSection.test.tsx)

The annual toggle element has `role="switch"` in the DOM. Testing Library's `getByRole('button')` does not match elements with a distinct ARIA role like `switch`. Changed the single role string from `'button'` to `'switch'` — no other changes.

## Deviations from Plan

None — plan executed exactly as written. All three fixes were surgical, one-to-one replacements with no production file changes.

## Self-Check: PASSED

- glass.test.ts: modified and all GLAS tests green
- FeaturesSection.test.tsx: modified and FLYT-03 through FLYT-07 green
- PricingSection.test.tsx: modified and all 6 PricingSection tests green
- Commits e375296, acce742, 187f27f: all verified in git log
- No production files (globals.css, FeaturesSection.tsx, PricingSection.tsx) modified
