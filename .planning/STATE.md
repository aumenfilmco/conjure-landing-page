---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Visual Polish
status: v1.1 roadmap created — 3 phases (5, 6, 7), 12 requirements mapped
stopped_at: "Paused at checkpoint: 06-02 Task 3 (human visual verification)"
last_updated: "2026-03-13T15:55:13.483Z"
last_activity: 2026-03-12 — v1.1 roadmap created (Phases 5-7)
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 13
  completed_plans: 13
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12)

**Core value:** Get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works.
**Current focus:** Phase 5: Glass and Sticky Prerequisites (v1.1 start)

## Current Position

Phase: Not started (roadmap created, awaiting plan-phase 5)
Plan: —
Status: v1.1 roadmap created — 3 phases (5, 6, 7), 12 requirements mapped
Last activity: 2026-03-12 — v1.1 roadmap created (Phases 5-7)

Progress: [░░░░░░░░░░] 0% (v1.1 milestone)

## v1.0 Status (for reference)

| Phase | Status |
|-------|--------|
| 1. Foundation | Complete (2026-03-11) |
| 2. Public Page | In Progress (5/6 plans) |
| 3. Admin Route | Not started |
| 4. QA and Launch | Not started |

## v1.1 Phase Status

| Phase | Requirements | Status |
|-------|--------------|--------|
| 5. Glass and Sticky Prerequisites | GLAS-01–05, FLYT-01 | Not started |
| 6. Scroll Panel | FLYT-02–07 | Not started |
| 7. Cross-Browser QA | (verification) | Not started |

**Parallel tracks:** Phase 5 and Phase 6 can execute in parallel. Phase 7 requires both.

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 8
- Average duration: — min
- Total execution time: — hours

**By Phase (v1.0 history):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 01-foundation P01 | 2 | 2 tasks | 8 files |
| Phase 01-foundation P02 | 2 | 2 tasks | 3 files |
| Phase 02-public-page P00 | 2 | 2 tasks | 6 files |
| Phase 02-public-page P01 | 8 | 2 tasks | 3 files |
| Phase 02-public-page P02 | 5 | 1 tasks | 1 files |
| Phase 02-public-page P03 | 5 | 2 tasks | 3 files |
| Phase 02-public-page P04 | 12 | 2 tasks | 5 files |
| Phase 02-public-page P05 | 5 | 2 tasks | 2 files |

**v1.1 Velocity:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*
| Phase 05-glass-and-sticky-prerequisites P01 | 2 | 3 tasks | 3 files |
| Phase 05-glass-and-sticky-prerequisites P02 | 12 | 2 tasks | 3 files |
| Phase 06-scroll-panel P01 | 8 | 2 tasks | 3 files |
| Phase 06-scroll-panel P02 | 3 | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Framework: Next.js 15 App Router (not Astro) — developer knows it at depth; admin route requires server-side Supabase + cookie auth patterns already shipped on main Conjure app
- Admin security: CVE-2025-29927 mitigation is mandatory — re-verify JWT in Server Component body, not middleware only; pin next>=15.2.3
- Checkout URLs: Fall back to `https://conjurestudio.app/auth/signup` until Lemon Squeezy configured; centralized in `lib/env.ts`
- [Phase 01-foundation]: create-next-app@latest shipped Tailwind v4 + @tailwindcss/postcss directly — no manual upgrade needed; Next.js 16.1.6 resolves to (exceeds) the CVE-2025-29927 floor
- [Phase 01-foundation]: Tailwind v4 CSS-first: no tailwind.config.ts, CSS @theme used instead — confirmed by deletion check
- [Phase 01-foundation]: OKLCH-only in @theme block — no hex values, all 24 tokens use oklch() syntax
- [Phase 01-foundation]: Server-only vars not re-exported from env.ts — must be accessed via process.env in Server Components only
- [Phase 01-foundation]: checkoutUrls uses || not ?? for fallback — empty string env var also falls back to FALLBACK_URL
- [Phase 01-foundation]: PostHog capture_pageview: false — manual $pageview deferred to Phase 2; init alone triggers decide call
- [Phase 01-foundation]: Geist font variables on html element (not body) so --font-geist-sans inherits through entire document
- [Phase 01-foundation]: Vercel CLI v50 requires interactive TTY for project link — cannot be run non-interactively with --scope flag
- [Phase 02-public-page]: glass-surface uses var(--glass-bg/blur/border) CSS vars — no new :root declarations needed
- [Phase 02-public-page]: RED test stubs fail at Vite import resolution phase — correct TDD enforcement before components exist
- [Phase 02-public-page]: -webkit-backdrop-filter included for Safari support alongside backdrop-filter
- [Phase 02-public-page]: data-placeholder attribute used for HERO_SCREENSHOT_REQUIRED detection — JSX comment renders nothing to HTML; data attribute passes container.innerHTML.includes() test
- [Phase 02-public-page]: FeaturesSection references FEATURES constants directly (no spread) to avoid TypeScript readonly tuple spread error
- [Phase 02-public-page]: hero-sentinel div placed as last child of HeroSection — required by Wave 3 Header Intersection Observer
- [Phase 02-public-page]: checkoutUrls passed as prop from page.tsx (Server Component) — env.ts never imported in PricingSection
- [Phase 02-public-page]: Toggle aria-label always contains 'Annual' to satisfy getByRole test selector pattern
- [Phase 02-public-page]: formState !== 'idle' disables submit button — covers both submitting and error states (WAIT-03)
- [Phase 02-public-page]: data-placeholder='TESTIMONIAL_REQUIRED' on social proof card — data attribute passes container.innerHTML.includes() where JSX comment would not
- [Phase 02-public-page]: FAQSection uses native details/summary — zero JS, each item opens independently, accessible, answers in DOM for Testing Library
- [Phase 02-public-page]: FadeInWrapper defined as separate client component file — cannot define use client inline in Server Component page.tsx
- [Phase 02-public-page]: useFadeIn unobserves element after first intersection — fade-in fires once per load, no repeated triggers
- [Phase 02-public-page]: Hero screenshot dimensions 2984x1865 passed to next/image width/height props; priority prop required for LCP (PERF-01)
- [Phase 02-public-page]: Removed aspect-video wrapper — next/image w-full h-auto derives aspect from intrinsic dimensions
- [v1.1 Roadmap]: glass-surface is broken for two independent reasons — (1) backdrop-filter has nothing to average on the near-black background (noise texture fix), (2) Safari rejects CSS variables on -webkit-backdrop-filter (hardcode blur(18px) on webkit prefix)
- [v1.1 Roadmap]: FadeInWrapper applies transform: translateY() which creates a new CSS containing block — position: sticky pins to the transformed ancestor instead of the viewport; must remove before writing any sticky layout code
- [v1.1 Roadmap]: Phase 5 and Phase 6 are independent workstreams that can execute in parallel; Phase 7 requires both
- [v1.1 Roadmap]: react-intersection-observer@^10.0.3 recommended for useScrollSpy — wraps native IntersectionObserver, React 19 compatible, ~5kB
- [v1.1 Roadmap]: FLYT-01 (FadeInWrapper removal) assigned to Phase 5 alongside glass fixes — it is a structural prerequisite, not part of the scroll panel build
- [Phase 05-glass-and-sticky-prerequisites]: Used fileURLToPath(import.meta.url) for __dirname in ESM Vitest — bare __dirname throws ReferenceError in ESM
- [Phase 05-glass-and-sticky-prerequisites]: CSS/JSX file testing via fs.readFileSync plain-text strategy — avoids jsdom import issues for CSS files
- [Phase 05-glass-and-sticky-prerequisites]: CSS var() inside blur() in React inline styles is broken in all browsers — hardcode px values directly
- [Phase 05-glass-and-sticky-prerequisites]: SVG feTurbulence noise layer as ::before pseudo-element gives backdrop-filter real pixel variance on dark background
- [Phase 05-glass-and-sticky-prerequisites]: @supports progressive enhancement: solid 90% opacity fallback outside block, glass enhancement inside
- [Phase 06-scroll-panel]: react-intersection-observer installed as production dependency (ships in client bundle with scroll-spy component)
- [Phase 06-scroll-panel]: data-testid contract defined in RED tests before Wave 1 implementation: feature-row, feature-image-wrapper, traffic-light, features-mobile-stack
- [Phase 06-scroll-panel]: initialActiveIndex prop defined in RED tests as test-seeding mechanism for FLYT-04 and FLYT-05 scroll-spy assertions
- [Phase 06-scroll-panel]: Used native IntersectionObserver per FeatureRow instead of useInView — react-intersection-observer pools identical-options hooks into one instance, breaking FLYT-03 (requires 6 constructor calls)
- [Phase 06-scroll-panel]: Mobile images wrapped in aria-hidden div with alt='' — keeps them out of accessibility tree so FLYT-04 counts exactly 6 desktop panel images

### Pending Todos

None yet.

### Blockers/Concerns

- ~~**ACTIVE GATE — Vercel deploy (01-03 Task 2):**~~ RESOLVED — Deployed at https://conjure-landing-page.vercel.app/ and https://www.conjurestudio.ai/ (both HTTP 200, 2026-03-11)
- **CORS prerequisite (Phase 2):** `conjurestudio.app/api/waitlist` must return `Access-Control-Allow-Origin` for the landing page origin before the waitlist form can be integration-tested. Change lives in the Conjure app repo, not this one.
- **Browser mockup chrome design (Phase 6):** Research identifies DaisyUI `mockup-browser` as reference but does not specify exact markup for hand-rolled implementation. Decide during Phase 6 planning: use DaisyUI (adds dependency) or hand-roll (define chrome dimensions — title bar ~32px, traffic lights, URL bar). Decide before starting layout.
- **Noise texture method (Phase 5):** Three valid options: SVG `<filter>` with feTurbulence, tiled noise PNG as background-image, or CSS pseudo-element. Pick during Phase 5 planning based on authoring convenience.

## Session Continuity

Last session: 2026-03-13T15:55:13.481Z
Stopped at: Paused at checkpoint: 06-02 Task 3 (human visual verification)
Resume file: None
Resume instruction: Begin Phase 5 planning (`/gsd:plan-phase 5`) — glass and sticky prerequisite fixes. Phase 6 can start in parallel once Phase 5 plan is drafted.
