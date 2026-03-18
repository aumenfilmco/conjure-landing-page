---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [tailwind, css-tokens, oklch, env-vars, copy-constants, vitest]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Vitest RED stubs for env.ts and content.ts; scaffold with globals.css
provides:
  - Tailwind v4 @theme block with 24 OKLCH color tokens and font stack variables
  - Glass surface and glow effect CSS custom properties
  - Typed env var accessors (posthogKey, posthogHost, checkoutUrls) with checkout URL fallback
  - All approved copy constants (HERO, FEATURES, PRICING, WAITLIST, FAQ, HOW_IT_WORKS, SOCIAL_PROOF)
affects:
  - Phase 2 UI components — all depend on these tokens, env vars, and copy constants

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tailwind v4 CSS-first: all color tokens in @theme inline block using OKLCH only (zero hex in @theme)"
    - "Server-only env vars (LEMON_SQUEEZY_*, SUPABASE_*) inventoried but NOT re-exported to avoid client bundle leak"
    - "Checkout URL FALLBACK_URL pattern: || operator against conjurestudio.app/auth/signup constant"
    - "Single source of truth for copy: all marketing text in content.ts, zero inline copy in components"

key-files:
  created:
    - conjure-landing-page/src/lib/env.ts
    - conjure-landing-page/src/lib/content.ts
  modified:
    - conjure-landing-page/src/app/globals.css

key-decisions:
  - "OKLCH-only in @theme block — no hex values, all 24 tokens use oklch() syntax"
  - "Glass surface vars use oklch() with alpha channel rather than rgba for consistency with token system"
  - "Glow vars use hardcoded rgba per brief spec (different green from primary token)"
  - "Server-only vars not re-exported from env.ts — must be accessed via process.env in Server Components only"

patterns-established:
  - "Color token naming: --color-{semantic-name} maps to Tailwind utility bg-{name}, text-{name}"
  - "Copy constants: SCREAMING_SNAKE_CASE for all exported objects and their keys"
  - "Env var fallback: || FALLBACK_URL (not ??) for checkout URLs — empty string should also fall back"

requirements-completed: [FOUND-01, FOUND-04, FOUND-05, FOUND-06]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 1 Plan 02: Brand Tokens, Env Vars, and Copy Constants Summary

**Tailwind v4 @theme with 24 OKLCH color tokens, typed env var accessors with checkout URL fallback, and all approved copy constants turning 10 RED Vitest stubs GREEN**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T21:10:35Z
- **Completed:** 2026-03-11T21:12:21Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- globals.css: full Tailwind v4 @theme block with 24 OKLCH color tokens, font stack, glass surface, and glow variables — zero hex values in @theme
- env.ts: typed accessors for PostHog (client-safe) and checkout URLs (server-only) with FALLBACK_URL fallback
- content.ts: verbatim copy for HERO, FEATURES, PRICING, WAITLIST, FAQ, HOW_IT_WORKS — zero banned words, exact pricing values from brief

## Task Commits

Each task was committed atomically:

1. **Task 1: Write globals.css with all OKLCH brand tokens** - `10f350e` (feat)
2. **Task 2: Write env.ts and content.ts — turn RED stubs GREEN** - `45614a5` (feat)

## Files Created/Modified

- `conjure-landing-page/src/app/globals.css` - Tailwind v4 @theme with 24 OKLCH color tokens, font stack, glass/glow vars, base body styles
- `conjure-landing-page/src/lib/env.ts` - posthogKey, posthogHost, checkoutUrls exports; server-only var inventory
- `conjure-landing-page/src/lib/content.ts` - HERO, FEATURES, PRICING, WAITLIST, FAQ, HOW_IT_WORKS, SOCIAL_PROOF constants

## Decisions Made

- Glass surface vars use `oklch(L C H / alpha)` syntax rather than `rgba()` — consistent with token system while staying out of `@theme` block
- `checkoutUrls` uses `||` not `??` so an empty string env var also falls back to FALLBACK_URL
- Server-only vars (LEMON_SQUEEZY_*, ADMIN_PASSWORD, SUPABASE_*) are documented in a comment inventory but explicitly NOT re-exported — prevents accidental client bundle inclusion

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 configuration files are locked and tested — Phase 2 components can import from globals.css (via Tailwind utilities), env.ts (Server Components only), and content.ts directly
- CORS prerequisite for waitlist API still outstanding (conjurestudio.app must allow landing page origin)
- Hero screenshot asset still pending delivery before output-first hero can be implemented

---
*Phase: 01-foundation*
*Completed: 2026-03-11*
