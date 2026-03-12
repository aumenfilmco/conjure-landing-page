---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Visual Polish
status: planning
stopped_at: Defining requirements for v1.1
last_updated: "2026-03-12"
last_activity: 2026-03-12 — Milestone v1.1 started
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-11)

**Core value:** Get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works.
**Current focus:** Phase 1: Foundation

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements for v1.1 Visual Polish
Last activity: 2026-03-12 — Milestone v1.1 started

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: — min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P01 | 2 | 2 tasks | 8 files |
| Phase 01-foundation P02 | 2 | 2 tasks | 3 files |
| Phase 02-public-page P00 | 2 | 2 tasks | 6 files |
| Phase 02-public-page P01 | 8 | 2 tasks | 3 files |
| Phase 02-public-page P02 | 5 | 1 tasks | 1 files |
| Phase 02-public-page P03 | 5 | 2 tasks | 3 files |
| Phase 02-public-page P04 | 12 | 2 tasks | 5 files |
| Phase 02-public-page P05 | 5 | 2 tasks | 2 files |

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
- [Phase 02-public-page]: formState \!== 'idle' disables submit button — covers both submitting and error states (WAIT-03)
- [Phase 02-public-page]: data-placeholder='TESTIMONIAL_REQUIRED' on social proof card — data attribute passes container.innerHTML.includes() where JSX comment would not
- [Phase 02-public-page]: FAQSection uses native details/summary — zero JS, each item opens independently, accessible, answers in DOM for Testing Library
- [Phase 02-public-page]: FadeInWrapper defined as separate client component file — cannot define use client inline in Server Component page.tsx
- [Phase 02-public-page]: useFadeIn unobserves element after first intersection — fade-in fires once per load, no repeated triggers
- [Phase 02-public-page]: Hero screenshot dimensions 2984x1865 passed to next/image width/height props; priority prop required for LCP (PERF-01)
- [Phase 02-public-page]: Removed aspect-video wrapper — next/image w-full h-auto derives aspect from intrinsic dimensions

### Pending Todos

None yet.

### Blockers/Concerns

- ~~**ACTIVE GATE — Vercel deploy (01-03 Task 2):**~~ RESOLVED — Deployed at https://conjure-landing-page.vercel.app/ and https://www.conjurestudio.ai/ (both HTTP 200, 2026-03-11)
- **CORS prerequisite (Phase 2):** `conjurestudio.app/api/waitlist` must return `Access-Control-Allow-Origin` for the landing page origin before the waitlist form can be integration-tested. Change lives in the Conjure app repo, not this one.
- **Hero screenshot asset (Phase 2):** Branded Google Slides deck screenshot is not yet delivered. Without it the output-first hero cannot be implemented. Sourcing this is the first task of Phase 2.
- **Waitlist API response shape (Phase 2):** Exact status codes and error formats from the live `/api/waitlist` endpoint should be confirmed by reading the Conjure app route before designing form error/success logic.

## Session Continuity

Last session: 2026-03-12T17:51:02.619Z
Stopped at: Completed 02-public-page/02-05-PLAN.md — awaiting Task 3 visual checkpoint
Resume file: None
Resume instruction: Begin Phase 2 planning (Public Page)
