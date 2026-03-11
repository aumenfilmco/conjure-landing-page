---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [nextjs, tailwind, postcss, posthog, vitest, testing-library, typescript]

# Dependency graph
requires: []
provides:
  - Next.js 16 App Router scaffold in conjure-landing-page/
  - Tailwind v4 with CSS-first @theme (no tailwind.config.ts)
  - PostCSS pipeline via @tailwindcss/postcss
  - posthog-js in dependencies
  - Vitest + @testing-library/react + jsdom test infrastructure
  - RED stub tests for env.ts (checkoutUrls, posthogKey) and content.ts (copy constants)
affects: [01-02, 01-03, 02-foundation, all-phases]

# Tech tracking
tech-stack:
  added:
    - next@16.1.6
    - react@19.2.3
    - posthog-js@^1.360.1
    - tailwindcss@^4
    - "@tailwindcss/postcss@^4"
    - vitest@^3.2.4
    - "@vitejs/plugin-react@^5.1.4"
    - "@testing-library/react@^16.3.2"
    - "@testing-library/jest-dom@^6.9.1"
    - jsdom@^27.0.1
  patterns:
    - TDD RED-GREEN-REFACTOR cycle established: stub tests written before implementations
    - Vitest with jsdom environment for Next.js App Router components
    - Dynamic imports in tests (await import('./module')) to isolate env var state

key-files:
  created:
    - conjure-landing-page/package.json
    - conjure-landing-page/postcss.config.mjs
    - conjure-landing-page/tsconfig.json
    - conjure-landing-page/next.config.ts
    - conjure-landing-page/vitest.config.ts
    - conjure-landing-page/src/test/setup.ts
    - conjure-landing-page/src/lib/env.test.ts
    - conjure-landing-page/src/lib/content.test.ts
    - conjure-landing-page/src/app/globals.css
  modified: []

key-decisions:
  - "Tailwind v4 CSS-first approach confirmed: no tailwind.config.ts, CSS @theme instead"
  - "create-next-app@latest shipped v4 Tailwind automatically, no manual upgrade needed"
  - "Next.js at 16.1.6 (above 15.2.3 CVE floor), not explicitly pinned to 15.x"
  - "Dynamic imports in tests allow per-test env var isolation without module cache issues"

patterns-established:
  - "Test stubs: Write RED tests referencing files that don't exist yet; Plan 02 makes them GREEN"
  - "Checkout URL fallback pattern: env vars optional, fallback to conjurestudio.app/auth/signup"
  - "vitest.config.ts: jsdom environment, globals: true, @/ alias pointing to src/"

requirements-completed: [FOUND-04, FOUND-05, FOUND-06]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Next.js 16 App Router scaffold with Tailwind v4 CSS-first, PostHog, Vitest test infrastructure, and 10 RED stub tests establishing the TDD contract for env.ts and content.ts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T21:06:26Z
- **Completed:** 2026-03-11T21:08:37Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Scaffolded Next.js 16 App Router project in `conjure-landing-page/` with TypeScript, App Router, src/ dir
- Installed and confirmed Tailwind v4 with `@tailwindcss/postcss` PostCSS pipeline (no tailwind.config.ts, v4 CSS-first)
- Installed PostHog (posthog-js@^1.360.1) and full Vitest test stack
- Created vitest.config.ts with jsdom environment, @/ alias, and test glob pattern
- Wrote 10 RED stub tests (5 for env.ts, 5 for content.ts) establishing the TDD contract for Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold repo and install all dependencies** - `de8ffd5` (feat)
2. **Task 2: Create Vitest config and stub test files** - `bdf041f` (test)

## Files Created/Modified
- `conjure-landing-page/package.json` - Project manifest with all dependencies and test scripts
- `conjure-landing-page/postcss.config.mjs` - Uses @tailwindcss/postcss (v4 only, no v3 plugin)
- `conjure-landing-page/vitest.config.ts` - Test runner config: jsdom, globals, @/ alias, src/**/*.test.ts glob
- `conjure-landing-page/src/test/setup.ts` - @testing-library/jest-dom setup file
- `conjure-landing-page/src/lib/env.test.ts` - RED tests: checkoutUrls fallback (4 tiers) + posthogKey type check
- `conjure-landing-page/src/lib/content.test.ts` - RED tests: HERO CTA text, all top-level exports defined, PRICING.TIERS shape
- `conjure-landing-page/src/app/globals.css` - Tailwind v4 CSS entry (via scaffold)
- `conjure-landing-page/next.config.ts` - Next.js 16 config (scaffold default)

## Decisions Made
- **create-next-app already shipped Tailwind v4:** The scaffold installed `tailwindcss@^4` and `@tailwindcss/postcss@^4` directly — no manual upgrade step was needed. Plan called for upgrading from v3, but v3 was never present.
- **Next.js 16.1.6 instead of 15.x:** `create-next-app@latest` resolved to Next 16. This exceeds the CVE-2025-29927 floor (>=15.2.3) and is safe to use.
- **Dynamic imports in test files:** `await import('./env')` pattern ensures each test gets a fresh module evaluation and env var state is correctly isolated per `beforeEach` cleanup.

## Deviations from Plan

None — plan executed exactly as written, with one benign observation: `create-next-app@latest` shipped Tailwind v4 directly so the explicit upgrade step was a no-op. All other steps executed as specified.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required at this stage.

## Next Phase Readiness
- Foundation is ready: Next.js 16 running, Tailwind v4 active, PostHog installed, Vitest finds test files
- Plan 02 must create `src/lib/env.ts` and `src/lib/content.ts` to turn the 10 RED tests GREEN
- Plan 03 (brand tokens) can immediately add CSS `@theme` variables to `src/app/globals.css`

---
*Phase: 01-foundation*
*Completed: 2026-03-11*
