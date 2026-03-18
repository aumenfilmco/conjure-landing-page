---
phase: 02-public-page
plan: "05"
subsystem: ui
tags: [next-image, lcp, hero, webp, performance]

# Dependency graph
requires:
  - phase: 02-public-page/02-04
    provides: HeroSection with HERO_SCREENSHOT_REQUIRED placeholder and hero-sentinel div
provides:
  - HeroSection with next/image replacing placeholder, priority prop for LCP
  - hero-screenshot.webp (2984x1865) in public/ directory
affects: [phase-03, perf-phase]

# Tech tracking
tech-stack:
  added: []
  patterns: [next/image with priority for above-the-fold LCP element]

key-files:
  created:
    - conjure-landing-page/public/hero-screenshot.webp
  modified:
    - conjure-landing-page/src/components/sections/HeroSection.tsx

key-decisions:
  - "Hero screenshot dimensions 2984x1865 passed directly to Image width/height props — Python/PIL used to extract from WebP metadata"
  - "Removed aspect-video wrapper div — next/image with w-full h-auto determines aspect ratio from intrinsic dimensions"

patterns-established:
  - "next/image priority pattern: above-the-fold images always get priority prop for LCP"

requirements-completed: [HERO-03]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 2 Plan 05: Hero Screenshot Wiring Summary

**Branded 2984x1865 WebP hero screenshot wired into HeroSection via next/image with priority prop for LCP optimization, replacing the HERO_SCREENSHOT_REQUIRED placeholder**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-12T13:49:00Z
- **Completed:** 2026-03-12T13:51:00Z
- **Tasks:** 2 (Task 1 pre-delivered by user; Task 2 auto)
- **Files modified:** 2

## Accomplishments
- Hero screenshot asset (2984x1865 WebP) delivered and committed to public/
- `next/image` with `priority` prop replaces the placeholder — LCP element is now optimized
- All 5 HeroSection tests remain GREEN (screenshot test passes via img element)
- Full 47-test suite GREEN; `npm run build` compiles clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Deliver hero screenshot asset** - pre-delivered by user (asset included in Task 2 commit)
2. **Task 2: Wire next/image into HeroSection** - `a0eb2cb` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `conjure-landing-page/public/hero-screenshot.webp` - Branded Google Slides deck screenshot, 2984x1865, 301K WebP
- `conjure-landing-page/src/components/sections/HeroSection.tsx` - Added `import Image from 'next/image'`; replaced placeholder div with Image component (priority, width=2984, height=1865)

## Decisions Made
- Hero screenshot dimensions 2984x1865 extracted from WebP metadata using Python/PIL and passed directly to Image component width/height props
- Removed `aspect-video` class from wrapper div — next/image with `w-full h-auto` derives aspect ratio from intrinsic dimensions, making the fixed-ratio wrapper unnecessary

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Asset was pre-delivered by user before execution.

## Next Phase Readiness
- Task 3 (visual verification checkpoint) is the remaining gate for Phase 2 completion
- All automated checks pass; human must verify: hero screenshot renders in browser chrome mockup, scroll/fade behaviors work, PostHog events fire, mobile layout at 375px is correct
- Phase 3 planning can begin once Task 3 is approved

---
*Phase: 02-public-page*
*Completed: 2026-03-12*
