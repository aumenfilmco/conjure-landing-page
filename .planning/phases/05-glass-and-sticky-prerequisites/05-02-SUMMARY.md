---
phase: 05-glass-and-sticky-prerequisites
plan: 02
subsystem: ui
tags: [css, glass-morphism, backdrop-filter, safari, webkit, tailwind, animation]

# Dependency graph
requires:
  - phase: 05-01
    provides: RED test files for GLAS-01–05, FLYT-01

provides:
  - globals.css patched with SVG noise layer, @supports progressive enhancement, hardcoded webkit blur
  - Header.tsx webkit inline style hardcoded (no CSS var references)
  - FeaturesSection rendered without FadeInWrapper in page.tsx

affects:
  - phase: 06-scroll-panel (FadeInWrapper removal unblocks position:sticky)
  - phase: 07-cross-browser-qa (glass surface visual quality)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SVG feTurbulence data-URI as CSS pseudo-element noise texture for glass surface
    - "@supports progressive enhancement: solid fallback outside, glass inside @supports block"
    - Hardcoded px values in React inline styles — CSS var() inside calc/blur() breaks in all browsers

key-files:
  created: []
  modified:
    - conjure-landing-page/src/app/globals.css
    - conjure-landing-page/src/components/sections/Header.tsx
    - conjure-landing-page/src/app/page.tsx

key-decisions:
  - "CSS var() inside React inline style blur() is broken in ALL browsers — must hardcode px value directly"
  - "SVG feTurbulence noise layer added as ::before pseudo-element gives blur() real pixel variance on dark background"
  - "@supports guard separates fallback (solid 90% opacity background) from glass enhancement — GLAS-04"
  - "border-top-color opacity updated from 0.22 to 0.32 in both :root variable and .glass-surface rule"
  - "FadeInWrapper (transform: translateY) removed from FeaturesSection — eliminates transform containing block that would pin sticky elements to animated ancestor instead of viewport"

patterns-established:
  - "Glass progressive enhancement: fallback outside @supports, enhancement inside — order matters for cascade"
  - "Noise texture for glass: SVG feTurbulence as inline data-URI in ::before pseudo-element, opacity 0.04, z-index: 0"

requirements-completed: [GLAS-01, GLAS-02, GLAS-03, GLAS-04, GLAS-05, FLYT-01]

# Metrics
duration: 12min
completed: 2026-03-13
---

# Phase 5 Plan 02: Glass Surface Fixes and FadeInWrapper Removal Summary

**SVG noise layer + @supports progressive enhancement + hardcoded webkit blur (18px) applied to globals.css; Header.tsx CSS-var inline styles replaced with literals; FeaturesSection FadeInWrapper ancestor removed to unblock Phase 6 sticky layout**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-13T08:38:00Z
- **Completed:** 2026-03-13T08:50:00Z
- **Tasks:** 2 of 3 automated tasks complete (Task 3 is checkpoint:human-verify)
- **Files modified:** 3

## Accomplishments

- 7/7 glass.test.ts tests now GREEN (all were RED before this plan)
- 4/4 Header.test.tsx GLAS-03 tests now GREEN
- page.test.tsx FLYT-01 test now GREEN
- 12/13 total suite tests passing (1 pre-existing PricingSection failure unrelated to this plan)
- FeaturesSection transform ancestor eliminated — Phase 6 sticky layout can proceed safely

## Task Commits

Each task was committed atomically:

1. **Task 1: Patch globals.css** - `3f2330a` (feat)
2. **Task 2: Fix Header.tsx webkit inline style + remove FadeInWrapper** - `1f5d8e3` (feat)
3. **Task 3: Visual verification checkpoint** - awaiting human approval

## Files Created/Modified

- `conjure-landing-page/src/app/globals.css` — Added SVG noise ::before layer, @supports wrapper, hardcoded blur values, 0.32 border-top opacity, position:relative + overflow:hidden on .glass-surface
- `conjure-landing-page/src/components/sections/Header.tsx` — Replaced CSS var() references with hardcoded oklch/px values in isScrolled style object
- `conjure-landing-page/src/app/page.tsx` — Removed FadeInWrapper wrapping FeaturesSection; four remaining wrappers (HowItWorks, Pricing, FAQ, Waitlist) preserved

## Decisions Made

- CSS var() inside `blur(var(--x))` in React inline styles resolves to a literal string — browsers cannot evaluate it; hardcoded values are the only correct approach
- The `--glass-border-top` :root variable was also updated from 0.22 to 0.32 to avoid the `not.toContain('0.98 0 0 / 0.22')` assertion (which scans the entire file)
- Pre-existing uncommitted PricingSection test failure documented in `deferred-items.md` — out of scope for this plan

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated :root --glass-border-top variable from 0.22 to 0.32**
- **Found during:** Task 1 (globals.css patch)
- **Issue:** After replacing the glass-surface block, glass.test.ts GLAS-05 still failed because the file still contained `0.98 0 0 / 0.22` in the :root variable declaration
- **Fix:** Updated `--glass-border-top: oklch(0.98 0 0 / 0.22)` to `--glass-border-top: oklch(0.98 0 0 / 0.32)` to match the new glass spec
- **Files modified:** `conjure-landing-page/src/app/globals.css`
- **Verification:** All 7 glass.test.ts tests pass after fix
- **Committed in:** `3f2330a` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — :root variable value inconsistency)
**Impact on plan:** Required for test correctness. No scope creep.

## Issues Encountered

- Pre-existing PricingSection test failure (`getByRole('button', { name: /annual/i })`) exists in uncommitted working tree. Pre-dates this plan. Documented in `deferred-items.md`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All Phase 5 requirement tests GREEN (GLAS-01–05, FLYT-01)
- Pending: Task 3 visual checkpoint (Chrome + Safari glass verification)
- After visual approval: Phase 6 scroll panel build can begin (FadeInWrapper removal unblocks sticky layout)
- Pre-existing PricingSection test failure should be resolved before Phase 7 QA

## Self-Check: PASSED

All key files confirmed present. Both task commits verified in git log.

---
*Phase: 05-glass-and-sticky-prerequisites*
*Completed: 2026-03-13*
