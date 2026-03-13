---
phase: 06-scroll-panel
plan: 01
subsystem: testing
tags: [vitest, react-intersection-observer, tdd, features-section]

# Dependency graph
requires:
  - phase: 05-glass-and-sticky-prerequisites
    provides: FadeInWrapper removed from FeaturesSection — sticky layout now viable
provides:
  - react-intersection-observer@10.0.3 installed as production dependency
  - FeaturesSection.test.tsx with 6 RED failing tests for FLYT-02 through FLYT-07
  - IntersectionObserver global stub pattern established for Vitest/jsdom
affects:
  - 06-scroll-panel Wave 1 implementation (turns these RED tests GREEN)
  - 07-cross-browser-qa (depends on scroll panel being built)

# Tech tracking
tech-stack:
  added: [react-intersection-observer@10.0.3]
  patterns: [TDD Wave 0 RED stubs, IntersectionObserver vi.stubGlobal for jsdom, data-testid contract defined before implementation]

key-files:
  created:
    - conjure-landing-page/src/components/sections/__tests__/FeaturesSection.test.tsx
  modified:
    - conjure-landing-page/package.json
    - conjure-landing-page/package-lock.json

key-decisions:
  - "react-intersection-observer installed as production dependency (not devDependency) — ships in client bundle with the scroll-spy component"
  - "IntersectionObserver stubbed via vi.stubGlobal in beforeEach/afterEach — correct Vitest pattern for jsdom environments"
  - "Test file does NOT import useInView or react-intersection-observer directly — stub allows component import to succeed without test needing it"
  - "data-testid contract defined in RED tests: feature-row, feature-image-wrapper, traffic-light, features-mobile-stack — Wave 1 implementer must honor these IDs"

patterns-established:
  - "RED tests use data-testid queries to specify exact DOM contract before implementation — Wave 1 cannot deviate from these IDs"
  - "initialActiveIndex prop defined in tests as test-seeding mechanism — Wave 1 must accept this prop to make FLYT-04 and FLYT-05 testable"

requirements-completed: [FLYT-02, FLYT-03, FLYT-04, FLYT-05, FLYT-06, FLYT-07]

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 6 Plan 01: Scroll Panel RED Tests Summary

**react-intersection-observer@10.0.3 installed and 6 RED TDD stubs written for the scroll-synced FeaturesSection scroll panel (FLYT-02 through FLYT-07)**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-13T15:41:00Z
- **Completed:** 2026-03-13T15:49:21Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Installed react-intersection-observer@10.0.3 as production dependency (not devDep)
- Created FeaturesSection.test.tsx with 6 tests — all failing against the current static Server Component for the right reasons (assertion failures, not import errors)
- Established data-testid contract that Wave 1 implementer must satisfy: `feature-row`, `feature-image-wrapper`, `traffic-light`, `features-mobile-stack`
- Confirmed IntersectionObserver vi.stubGlobal pattern works cleanly in Vitest 3.2.4 + jsdom

## Task Commits

1. **Task 1: Install react-intersection-observer** - `e65d32c` (chore)
2. **Task 2: Write RED failing tests for FLYT-02 through FLYT-07** - `82d2bfc` (test)

## Files Created/Modified

- `conjure-landing-page/src/components/sections/__tests__/FeaturesSection.test.tsx` - 6 RED tests covering FLYT-02 through FLYT-07 with full IntersectionObserver stub setup
- `conjure-landing-page/package.json` - react-intersection-observer@^10.0.3 added to dependencies
- `conjure-landing-page/package-lock.json` - lock file updated

## Decisions Made

- react-intersection-observer goes in `dependencies`, not `devDependencies` — the Wave 1 component will use useInView in the production bundle, so it belongs with runtime deps.
- Test file stubs IntersectionObserver globally but does not import useInView — the component will import it; the stub just prevents jsdom from throwing on the import side effect.
- `initialActiveIndex` prop chosen as the test-seeding mechanism for FLYT-04 and FLYT-05 — allows deterministic assertions without requiring scroll simulation in jsdom.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All 6 tests fail with assertion errors (expected behaviors missing from the static Server Component), not syntax or import errors. Exit code is 1.

## Next Phase Readiness

- Wave 1 (plan 06-02) can begin immediately — it has a complete test contract to satisfy
- The Wave 1 implementer must:
  1. Convert FeaturesSection from Server Component to Client Component
  2. Add `initialActiveIndex` prop
  3. Add `data-testid` attributes: `feature-row`, `feature-image-wrapper`, `traffic-light`, `features-mobile-stack`
  4. Implement useInView scroll-spy calling IntersectionObserver 6 times
  5. Implement opacity toggling for image panel
  6. Implement browser mockup chrome with 3 traffic lights + "conjurestudio.app" URL bar
  7. Implement mobile stack container

---
*Phase: 06-scroll-panel*
*Completed: 2026-03-13*
