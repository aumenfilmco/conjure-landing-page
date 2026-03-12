---
phase: 02-public-page
plan: "01"
subsystem: ui
tags: [react, nextjs, posthog, tailwind, glass-surface, tdd, vitest]

# Dependency graph
requires:
  - phase: 02-public-page/02-00
    provides: glass-surface and fade-in-section CSS utilities, RED test stubs for HeroSection
  - phase: 01-foundation
    provides: Next.js app, content.ts, PostHog provider, globals.css tokens

provides:
  - HeroSection component with PostHog CTA tracking and browser chrome mockup
  - HowItWorksSection component rendering 3 steps from content.ts
  - FeaturesSection component with 5 glass-surface cards and screenshot placeholders

affects:
  - 02-02-PLAN (PricingSection — same glass-surface pattern)
  - 02-03-PLAN (WaitlistSection — same section structure)
  - 02-04-PLAN (SocialProofAndFAQ — same section structure)
  - Wave 3 Header — depends on hero-sentinel div for Intersection Observer

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "'use client' for components with browser APIs (PostHog onClick); Server Components for pure render"
    - "All marketing copy sourced from @/lib/content — zero inline strings in component files"
    - "data-placeholder attribute pattern for screenshot placeholders (test-detectable without DOM comments)"
    - "glass-surface class applied directly via className string — no wrapper utilities"
    - "5th card in 2-col grid: md:col-span-2 max-w-sm mx-auto w-full for centered solo item"

key-files:
  created:
    - conjure-landing-page/src/components/sections/HeroSection.tsx
    - conjure-landing-page/src/components/sections/HowItWorksSection.tsx
    - conjure-landing-page/src/components/sections/FeaturesSection.tsx
  modified: []

key-decisions:
  - "data-placeholder attribute used for HERO_SCREENSHOT_REQUIRED detection — JSX comment {/* */} renders nothing to HTML; data attribute passes container.innerHTML.includes() test check"
  - "FeaturesSection references FEATURES constants directly (no spread) to avoid TypeScript readonly tuple spread error"
  - "hero-sentinel div placed as last child of HeroSection section element — required by Wave 3 Header Intersection Observer"
  - "text-primary (mint) used for HOW step numbers only, not for any headings — consistent with CONTEXT.md locked decision"

patterns-established:
  - "Pattern 1: Server Component default — omit 'use client' unless onClick or browser API is needed"
  - "Pattern 2: Screenshot placeholders use data-placeholder attribute so tests can detect them via innerHTML string match"
  - "Pattern 3: Section layout uses max-w-5xl or max-w-6xl mx-auto with px-6 py-24 spacing"

requirements-completed:
  - HERO-01
  - HERO-02
  - HERO-03
  - HERO-04
  - HOW-01
  - HOW-02
  - FEAT-01
  - FEAT-02
  - FEAT-03
  - FEAT-04
  - FEAT-05
  - FEAT-06

# Metrics
duration: 8min
completed: 2026-03-12
---

# Phase 2 Plan 01: Upper Sections Summary

**HeroSection ('use client' with PostHog CTA tracking + browser chrome mockup), HowItWorksSection (3-step Server Component), and FeaturesSection (5 glass-surface cards with FEAT-06 screenshot placeholders) — all copy sourced from content.ts, 5/5 HeroSection tests GREEN**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-12T12:43:00Z
- **Completed:** 2026-03-12T12:51:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- HeroSection with browser chrome mockup (traffic-light dots, address bar), PostHog CTA capture on click, and HERO_SCREENSHOT_REQUIRED data-placeholder for future asset delivery
- hero-sentinel div included as Wave 3 Header Intersection Observer dependency
- HowItWorksSection and FeaturesSection as pure Server Components — no 'use client' needed
- FeaturesSection 5th card centered at bottom of 2-col grid via md:col-span-2 max-w-sm mx-auto
- TypeScript build passes; all 5 HeroSection tests GREEN; other RED stubs remain RED as expected (Wave 1 scope)

## Task Commits

Each task was committed atomically:

1. **Task 1: HeroSection** - `595807d` (feat)
2. **Task 2: HowItWorksSection and FeaturesSection** - `77968a6` (feat)

## Files Created/Modified
- `conjure-landing-page/src/components/sections/HeroSection.tsx` - 'use client' hero with headline, subhead, CTA, browser chrome mockup, hero-sentinel
- `conjure-landing-page/src/components/sections/HowItWorksSection.tsx` - Server Component with 3 steps from HOW_IT_WORKS.STEPS, Geist Mono step numbers
- `conjure-landing-page/src/components/sections/FeaturesSection.tsx` - Server Component with 5 glass-surface cards, FEAT-06 screenshot placeholders

## Decisions Made
- Used `data-placeholder="HERO_SCREENSHOT_REQUIRED"` attribute instead of HTML comment — JSX `{/* */}` comments don't render to HTML, so `container.innerHTML.includes('HERO_SCREENSHOT_REQUIRED')` would fail without the data attribute approach
- Referenced FEATURES constants directly in FEATURE_LIST array (e.g., `TITLE: FEATURES.COMPONENT_ASSEMBLY.TITLE`) rather than spreading readonly tuple items, avoiding TypeScript type errors

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- HeroSection, HowItWorksSection, and FeaturesSection ready to be imported in page.tsx
- hero-sentinel div present for Wave 3 Header Intersection Observer
- Screenshot placeholders (data-placeholder attributes) mark locations where assets are needed
- Wave 1 RED tests for PricingSection, WaitlistSection, SocialProofAndFAQ remain RED — to be turned GREEN by plans 02-02, 02-03, 02-04

---
*Phase: 02-public-page*
*Completed: 2026-03-12*
