---
phase: 02-public-page
plan: "04"
subsystem: ui
tags: [next.js, react, intersection-observer, server-component, tailwind, glass-morphism]

# Dependency graph
requires:
  - phase: 02-public-page/02-01
    provides: HeroSection with #hero-sentinel div, HowItWorksSection, FeaturesSection
  - phase: 02-public-page/02-02
    provides: PricingSection (client, needs checkoutUrls prop), WaitlistSection
  - phase: 02-public-page/02-03
    provides: SocialProofSection, FAQSection
  - phase: 01-foundation
    provides: globals.css (.fade-in-section/.visible, .glass-surface CSS vars), env.ts (checkoutUrls), content.ts (HERO.CTA_URL, HERO.CTA_PRIMARY)
provides:
  - Sticky Header with glass-on-scroll transition via IntersectionObserver on #hero-sentinel
  - Server Component Footer with copyright and brand link
  - useFadeIn hook — IntersectionObserver-based scroll fade-in for any HTMLElement
  - FadeInWrapper client component wrapping Server Component sections for fade-in
  - Fully assembled page.tsx — all 7 sections in correct order, Server Component integrity maintained
affects: [03-admin, future phases using page.tsx as entry point]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component page.tsx passes server-only checkoutUrls to PricingSection as prop — never imported in client
    - FadeInWrapper pattern: client wrapper around Server Component children for scroll effects
    - IntersectionObserver in useEffect with cleanup (observer.disconnect) for both Header and useFadeIn
    - Header glass transition uses inline styles with CSS vars — avoids Tailwind class toggling
    - Footer computed year via new Date().getFullYear() — no client JS needed

key-files:
  created:
    - conjure-landing-page/src/hooks/useFadeIn.ts
    - conjure-landing-page/src/components/sections/Header.tsx
    - conjure-landing-page/src/components/sections/Footer.tsx
    - conjure-landing-page/src/components/FadeInWrapper.tsx
  modified:
    - conjure-landing-page/src/app/page.tsx

key-decisions:
  - "FadeInWrapper defined as separate client component file — cannot define use client inline in Server Component page.tsx"
  - "Header glass transition uses inline styles with CSS vars (var(--glass-bg) etc) — consistent with globals.css token system"
  - "useFadeIn unobserves element after first intersection (observer.unobserve) — fade-in fires once, no repeated triggers"

patterns-established:
  - "Server-only prop pattern: checkoutUrls imported in page.tsx (Server Component), passed as prop to PricingSection (client component)"
  - "Client wrapper pattern: FadeInWrapper enables scroll animations on otherwise-Server Component sections"
  - "IntersectionObserver cleanup: always call observer.disconnect() in useEffect return"

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
  - PRICE-01
  - PRICE-02
  - PRICE-03
  - PRICE-04
  - PRICE-05
  - PRICE-06
  - WAIT-01
  - WAIT-02
  - WAIT-03
  - WAIT-04
  - WAIT-05
  - WAIT-06
  - WAIT-07
  - SOCIAL-01
  - SOCIAL-02
  - FAQ-01
  - FAQ-02
  - FAQ-03
  - COPY-01
  - COPY-02

# Metrics
duration: 12min
completed: 2026-03-12
---

# Phase 02 Plan 04: Page Assembly Summary

**Sticky glass header, scroll-fade sections, and full page assembly — Server Component page.tsx wiring all 7 sections with checkoutUrls prop-passed from server to PricingSection**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-12T12:39:00Z
- **Completed:** 2026-03-12T12:51:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Header with sticky positioning, transparent over hero, glass surface after scroll using IntersectionObserver on #hero-sentinel
- Footer as Server Component with dynamic year and conjurestudio.app brand link
- useFadeIn hook — clean IntersectionObserver pattern that adds .visible class once on entry then unobserves
- FadeInWrapper client component enables scroll animations on Server Component section children
- page.tsx assembled as Server Component with all 7 sections in correct order and checkoutUrls server-prop pattern maintained

## Task Commits

Each task was committed atomically:

1. **Task 1: Header, Footer, and useFadeIn hook** — `975f6dc` (feat)
2. **Task 2: Assemble page.tsx — wire all sections in order** — `5ed5228` (feat)

## Files Created/Modified
- `conjure-landing-page/src/hooks/useFadeIn.ts` — IntersectionObserver hook, adds .visible to .fade-in-section elements
- `conjure-landing-page/src/components/sections/Header.tsx` — Sticky header, glass-on-scroll via hero-sentinel observer
- `conjure-landing-page/src/components/sections/Footer.tsx` — Minimal footer, Server Component, year + brand link
- `conjure-landing-page/src/components/FadeInWrapper.tsx` — Client wrapper using useFadeIn for below-fold sections
- `conjure-landing-page/src/app/page.tsx` — Full page assembly, Server Component, all 7 sections in order

## Decisions Made
- FadeInWrapper defined as a separate file (`src/components/FadeInWrapper.tsx`) because `'use client'` cannot be declared inline within a Server Component file
- Header glass transition uses inline style object with CSS custom properties (`var(--glass-bg)`, `var(--glass-blur)`, `var(--glass-border)`) rather than class toggling — consistent with the CSS var token system established in Wave 0
- useFadeIn calls `observer.unobserve(el)` after first intersection so the fade fires once per session load, not on every re-entry

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None — build passed on first attempt, all 47 tests remained GREEN.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Full public landing page is now assembled and renders all sections in correct order
- `npm run build` succeeds, static export confirmed at `/`
- All 47 tests GREEN
- Ready for Phase 3 (admin route) or deployment polish

---
*Phase: 02-public-page*
*Completed: 2026-03-12*
