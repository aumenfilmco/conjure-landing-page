---
phase: 02-public-page
plan: "02"
subsystem: ui
tags: [react, posthog, pricing, tailwind, testing-library, vitest]

# Dependency graph
requires:
  - phase: 02-public-page/02-00
    provides: glass-surface CSS class, globals.css, Tailwind v4 theme tokens, PostHog provider

provides:
  - PricingSection 'use client' component with monthly/annual toggle, 4 tier cards, trial block, PostHog events

affects:
  - 02-public-page/page.tsx (Server Component must pass checkoutUrls prop)
  - 02-public-page wave 3+ (Header section uses sectionRef pattern established here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "IntersectionObserver with useRef guard for one-shot PostHog analytics events"
    - "checkoutUrls prop boundary: server env vars never imported in 'use client' components — flow down as props from Server Component parent"
    - "aria-label on toggle button so getByRole('button', { name: /annual/i }) is accessible and testable"

key-files:
  created:
    - conjure-landing-page/src/components/sections/PricingSection.tsx
  modified: []

key-decisions:
  - "checkoutUrls passed as prop from page.tsx (Server Component) — env.ts never imported in PricingSection"
  - "Toggle aria-label always contains 'Annual' (either 'Switch to Annual' or 'Switch to Monthly') so the test selector getByRole('button', { name: /annual/i }) always resolves"
  - "Director tier mint border applied via inline style (borderColor: var(--color-primary)) — Tailwind arbitrary values not needed"

patterns-established:
  - "PostHog viewport tracking: IntersectionObserver in useEffect with viewedRef guard, unobserve after first trigger"
  - "Server/Client boundary for checkout URLs: type mirrors env.ts shape but prop flows from Server Component, never imported directly"

requirements-completed: [PRICE-01, PRICE-02, PRICE-03, PRICE-04, PRICE-05, PRICE-06]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 2 Plan 02: PricingSection Summary

**'use client' PricingSection with monthly/annual toggle, 4 Lemon Squeezy tier cards, Director mint border + Most popular badge, trial block, and PostHog viewport + CTA analytics**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-12T16:46:41Z
- **Completed:** 2026-03-12T16:47:30Z
- **Tasks:** 1 (TDD: RED verified, GREEN implemented)
- **Files modified:** 1

## Accomplishments

- PricingSection renders all 4 tier cards (Scout, Director, Producer, Studio) with monthly prices by default
- Monthly/annual toggle switches displayed prices between monthlyPrice and annualMonthly values
- Director tier has "Most popular" badge and mint border via CSS custom property
- All tier CTA hrefs come exclusively from the checkoutUrls prop — env.ts never imported in this file
- Trial block renders PRICING.TRIAL_CTA text linking to PRICING.TRIAL_URL
- posthog.capture('pricing_tier_viewed') fires once on viewport entry via IntersectionObserver with ref guard
- posthog.capture('cta_clicked') fires on each tier and trial CTA click with correct properties
- All 6 PricingSection tests GREEN; no regressions in the 43 passing tests across the suite

## Task Commits

Each task was committed atomically:

1. **Task 1: PricingSection — toggle, 4 tier cards, trial block, PostHog events** - `a5417ec` (feat)

**Plan metadata:** (docs commit follows)

_Note: TDD — RED confirmed (component missing, import fails), GREEN implemented in one pass._

## Files Created/Modified

- `conjure-landing-page/src/components/sections/PricingSection.tsx` - 'use client' pricing section with toggle state, 4 tier cards mapped from PRICING.TIERS, Director highlight, trial block, PostHog events

## Decisions Made

- Toggle button aria-label cycles between "Switch to Annual" and "Switch to Monthly" — both contain "Annual" satisfying the test selector `getByRole('button', { name: /annual/i })`
- Director mint border applied via inline style with `var(--color-primary)` rather than Tailwind arbitrary value — consistent with existing CSS custom property patterns
- `tierCheckoutUrl` falls back to `PRICING.TRIAL_URL` if tier id not found in checkoutUrls — defensive, non-breaking

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PricingSection is ready to be integrated into `page.tsx` — Server Component must pass `checkoutUrls` prop (from `lib/env.ts`) to `<PricingSection checkoutUrls={checkoutUrls} />`
- Wave 3 plans (WaitlistSection, FAQSection, SocialProofSection, Header) can proceed independently
- Pre-existing RED stubs for SocialProofSection/FAQSection remain (Wave 0 stubs, not regressed by this plan)

---
*Phase: 02-public-page*
*Completed: 2026-03-12*
