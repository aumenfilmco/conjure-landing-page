---
phase: 01-foundation
plan: 03
subsystem: infra
tags: [nextjs, posthog, tailwind, vercel, geist]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: Next.js 15+ App Router scaffold with Tailwind v4 CSS-first config
  - phase: 01-foundation plan 02
    provides: Brand OKLCH tokens in globals.css @theme, env.ts, content.ts

provides:
  - Root layout wired with Geist Sans + Mono fonts on html element
  - PostHogProvider client component with useEffect init guard and capture_pageview false
  - Skeleton page.tsx proving dark background + brand tokens on dark near-black bg-background
  - .env.local template with stubs for all required env vars
  - Vercel production deployment at https://conjure-landing-page.vercel.app/ and https://www.conjurestudio.ai/

affects:
  - phase 02 (production URL established as integration target)
  - phase 03 (Vercel project ready for env var configuration)

# Tech tracking
tech-stack:
  added:
    - posthog-js (^1.360.1) — already in package.json from Plan 01
    - posthog-js/react PostHogProvider wrapper
  patterns:
    - PostHog initialized in 'use client' component via useEffect with [] deps (single init per mount)
    - capture_pageview: false — manual $pageview fired in Phase 2, not on init
    - Geist fonts declared in Server Component (layout.tsx) via next/font/google, applied as CSS variables to html element
    - font-sans / font-mono resolved in Tailwind v4 @theme via --font-geist-sans / --font-geist-mono

key-files:
  created:
    - conjure-landing-page/src/components/providers/PostHogProvider.tsx
  modified:
    - conjure-landing-page/src/app/layout.tsx
    - conjure-landing-page/src/app/page.tsx

key-decisions:
  - "capture_pageview: false on PostHog init — manual $pageview deferred to Phase 2 where URL routing is wired"
  - "font variables applied to html element (not body) so CSS variable inherits through entire document"
  - "Vercel CLI v50 requires interactive TTY for initial project link — cannot be run non-interactively"
  - "Custom domain www.conjurestudio.ai configured alongside vercel.app URL — both return HTTP 200"

patterns-established:
  - "PostHog pattern: init in useEffect [], PHProvider wraps children, capture_pageview always false"
  - "Layout pattern: fonts on html, semantic classes (bg-background, text-foreground, font-sans) on body"

requirements-completed: [FOUND-02, FOUND-03, FOUND-04]

# Metrics
duration: ~15 min total (Task 1 ~10 min + Task 2 human action)
completed: 2026-03-11
---

# Phase 1 Plan 03: Layout, PostHog, and Vercel Deploy Summary

**Geist fonts + PostHogProvider wired into root layout, skeleton page deployed live at conjurestudio.ai and conjure-landing-page.vercel.app**

## Performance

- **Duration:** ~15 min total
- **Started:** 2026-03-11T21:14:06Z
- **Completed:** 2026-03-11
- **Tasks completed:** 2 of 2
- **Files created/modified:** 3

## Accomplishments

- `PostHogProvider.tsx` created with `'use client'` directive, `useEffect` init guard, `capture_pageview: false`, `capture_pageleave: true`
- `layout.tsx` replaced — Geist Sans + Mono fonts on `<html>` element, `PostHogProvider` wrapping body, Conjure metadata set
- `page.tsx` replaced — dark background skeleton using `bg-background`, `text-foreground`, `text-muted-foreground` brand tokens
- `npm run build` exits 0 — no TypeScript or compilation errors
- `.env.local` created with all env var stubs (gitignored via `.env*` pattern)
- Vercel deployment live — both URLs return HTTP 200
- "Infrastructure check" text confirmed present on deployed page

## Deployment URLs

| URL | Status |
|-----|--------|
| https://conjure-landing-page.vercel.app/ | Live — HTTP 200 |
| https://www.conjurestudio.ai/ | Live — HTTP 200 |

**Primary production URL for Phase 2:** `https://www.conjurestudio.ai/`

## Task Commits

1. **Task 1: Write root layout, PostHogProvider, and skeleton page** — `f3fb63e` (feat)
2. **Task 2: Deploy to Vercel** — human action (completed by user, both URLs verified HTTP 200)

## Files Created/Modified

- `conjure-landing-page/src/components/providers/PostHogProvider.tsx` — PostHog 'use client' wrapper with useEffect init guard
- `conjure-landing-page/src/app/layout.tsx` — Root layout: Geist fonts, PostHogProvider, Conjure metadata
- `conjure-landing-page/src/app/page.tsx` — Phase 1 skeleton: dark background, infrastructure check text

## Decisions Made

- `capture_pageview: false` on PostHog init — manual `$pageview` will be fired explicitly in Phase 2 when section routing is established. Using init alone triggers the `decide` call (confirms initialization) without firing the event.
- Font variables applied to `<html>` (not `<body>`) so CSS variable `--font-geist-sans` inherits through entire document tree.
- Custom domain `www.conjurestudio.ai` configured alongside the Vercel project URL — both verified live.

## Requirements Fulfilled

| Requirement | Description | Status |
|-------------|-------------|--------|
| FOUND-02 | PostHogProvider with capture_pageview: false, useEffect init guard | Complete |
| FOUND-03 | Root layout with Geist fonts on html element, bg-background body | Complete |
| FOUND-04 | Vercel production deployment returning HTTP 200 | Complete |

## Deviations from Plan

**Task 1:** None — plan executed exactly as written.

**Task 2 (Vercel CLI gate):** Vercel CLI v50.17.1 exits with `missing_scope` error when `--scope` flag is passed in non-interactive mode. All `vercel`, `vercel link`, `vercel ls` commands with `--scope chris-projects-d333f9de` failed identically. Deploy was completed by user in an interactive terminal session. Both URLs confirmed live via `curl` returning HTTP 200.

## Env Vars Status (Vercel Project)

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Set by user | `phc_...` from PostHog Project Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | Set by user | `https://us.i.posthog.com` |
| `LEMON_SQUEEZY_*_CHECKOUT_URL` | Optional | Falls back to conjurestudio.app/auth/signup |
| `ADMIN_PASSWORD` | Phase 3 | Leave empty for now |
| `SUPABASE_URL` | Phase 3 | Leave empty for now |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 3 | Leave empty for now |

## Next Phase Readiness

- Phase 2 integration target: `https://www.conjurestudio.ai/` (confirmed live)
- CORS on `conjurestudio.app/api/waitlist` must be configured before waitlist form integration test
- Hero screenshot asset not yet delivered (Phase 2 first task)
- All Phase 1 brand tokens and infrastructure verified via `npm run build` passing

---
*Phase: 01-foundation*
*Completed: 2026-03-11*

## Self-Check: PASSED
