---
phase: 05-glass-and-sticky-prerequisites
plan: 01
subsystem: testing
tags: [vitest, tdd, css, glass, backdrop-filter, safari]

# Dependency graph
requires: []
provides:
  - "RED test contract for globals.css glass-surface fixes (GLAS-01, GLAS-02, GLAS-04, GLAS-05)"
  - "RED test contract for Header.tsx webkit backdrop hardcoding (GLAS-03)"
  - "RED test contract for FeaturesSection FadeInWrapper removal (FLYT-01)"
affects:
  - "05-02 (glass-surface fixes) — must turn 7 glass.test.ts assertions green"
  - "05-03 (Header webkit fix) — must turn 3 Header.test.tsx assertions green"
  - "05-04 (FeaturesSection unwrap) — must turn 1 page.test.tsx assertion green"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "fs.readFileSync + fileURLToPath(import.meta.url) for reading CSS/JSX as plain text in Vitest ESM"
    - "Whitespace-flexible regex /<FadeInWrapper[^>]*>[\s\S]{0,50}<FeaturesSection/ for JSX structure assertions"

key-files:
  created:
    - conjure-landing-page/src/lib/glass.test.ts
    - conjure-landing-page/src/app/page.test.tsx
    - conjure-landing-page/src/components/sections/__tests__/Header.test.tsx
  modified: []

key-decisions:
  - "Used fileURLToPath(import.meta.url) instead of __dirname in ESM Vitest context — avoids ReferenceError in ESM modules"
  - "fs.readFileSync plain-text CSS/JSX strategy — avoids jsdom import issues, asserts actual file content not runtime behavior for CSS"
  - "GLAS-05 border-top-color test asserts absence of 0.22 and presence of 0.32 — brittle to exact value but directly matches the spec"

patterns-established:
  - "CSS file testing: readFileSync + string assertions, not CSS-in-JS or jsdom style computation"
  - "JSX structure testing: readFileSync page.tsx source + regex matching for structural patterns"

requirements-completed: []  # RED phase only — requirements completed when GREEN in subsequent plans

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 5 Plan 01: Glass and Sticky Prerequisites — RED Tests Summary

**Three test files establishing failing-first contracts for all six Phase 5 requirements: noise layer, Safari webkit hardcoding, @supports guard, opaque fallback, hardcoded blur, FadeInWrapper removal.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-13T12:34:32Z
- **Completed:** 2026-03-13T12:36:30Z
- **Tasks:** 3
- **Files modified:** 3 created

## Accomplishments

- `glass.test.ts` — 7 failing tests covering GLAS-01 (noise layer + opacity), GLAS-02 (webkit literal value), GLAS-04 (@supports block + opaque fallback), GLAS-05 (hardcoded blur + border-top opacity)
- `Header.test.tsx` — 3 failing GLAS-03 tests asserting WebkitBackdropFilter and backdropFilter must be hardcoded pixel values, plus 1 baseline passing test
- `page.test.tsx` — 1 failing FLYT-01 test asserting FeaturesSection must not be inside FadeInWrapper

## Task Commits

Each task was committed atomically:

1. **Task 1: Write RED tests for GLAS-01, GLAS-02, GLAS-04, GLAS-05 (glass.test.ts)** - `f439512` (test)
2. **Task 2: Write RED test for GLAS-03 (extend Header.test.tsx)** - `7ebc7b6` (test)
3. **Task 3: Write RED test for FLYT-01 (page.test.tsx)** - `ff36d13` (test)

## Files Created/Modified

- `conjure-landing-page/src/lib/glass.test.ts` — Reads globals.css via fs.readFileSync; 7 tests for glass-surface CSS patterns (all RED)
- `conjure-landing-page/src/components/sections/__tests__/Header.test.tsx` — Renders Header, simulates scroll, asserts inline style values (3 RED, 1 passing)
- `conjure-landing-page/src/app/page.test.tsx` — Reads page.tsx source; asserts FeaturesSection not wrapped in FadeInWrapper (RED)

## Decisions Made

- Used `fileURLToPath(import.meta.url)` instead of `__dirname` — Vitest runs as ESM; bare `__dirname` throws ReferenceError in ESM context
- Path from `src/lib/glass.test.ts` to `src/app/globals.css` is `../app/globals.css` (one level up, not two) — initial plan comment said `../../app/globals.css` which was incorrect; fixed via Rule 1 auto-fix during initial run
- `Header.test.tsx` is a new file (confirmed: no prior Header test existed in `__tests__/`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect relative path in glass.test.ts**
- **Found during:** Task 1 verification run
- **Issue:** Plan comment specified `path.resolve(__dirname, '../../app/globals.css')` but test lives at `src/lib/` making the correct path `../app/globals.css` (one `../` not two)
- **Fix:** Changed `../../app/globals.css` to `../app/globals.css`
- **Files modified:** `conjure-landing-page/src/lib/glass.test.ts`
- **Verification:** Tests ran and produced RED failures (not ENOENT) after fix
- **Committed in:** f439512 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary correction; no scope change.

## Issues Encountered

- Pre-existing PricingSection test failure detected in full suite run (caused by uncommitted working-tree modifications from prior work session). Out of scope — logged here, not fixed. Will resolve when those working-tree changes are committed.

## Next Phase Readiness

- All 11 new test assertions are RED and will turn green when Phase 5 implementation plans (05-02 through 05-04) execute the fixes
- Verify command for each plan is directly named in the test file paths: `npx vitest run src/lib/glass.test.ts`, `npx vitest run src/components/sections/__tests__/Header.test.tsx`, `npx vitest run src/app/page.test.tsx`

---
*Phase: 05-glass-and-sticky-prerequisites*
*Completed: 2026-03-13*
