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
  - Vercel production deployment (PENDING — awaiting interactive CLI deploy)

affects:
  - phase 02 (needs production URL for integration target)
  - phase 03 (needs Vercel project for env var configuration)

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

patterns-established:
  - "PostHog pattern: init in useEffect [], PHProvider wraps children, capture_pageview always false"
  - "Layout pattern: fonts on html, semantic classes (bg-background, text-foreground, font-sans) on body"

requirements-completed: [FOUND-02, FOUND-03]
# FOUND-04 (Vercel deployment) pending — requires interactive terminal deploy

# Metrics
duration: partial (Task 1 complete, Task 2 awaiting human action)
completed: 2026-03-11 (partial)
---

# Phase 1 Plan 03: Layout, PostHog, and Vercel Deploy Summary

**Geist fonts + PostHogProvider wired into root layout with skeleton dark-background page; Vercel deploy awaiting interactive terminal**

## Status: PARTIAL — Awaiting Vercel Deploy

Task 1 complete and committed. Task 2 (Vercel deploy) requires interactive terminal — cannot be run in non-interactive mode with Vercel CLI v50.

## Performance

- **Duration:** ~10 min (Task 1 only)
- **Started:** 2026-03-11T21:14:06Z
- **Completed:** Partial — pending Vercel deploy
- **Tasks completed:** 1 of 2
- **Files created/modified:** 3

## Accomplishments

- `PostHogProvider.tsx` created with `'use client'` directive, `useEffect` init guard, `capture_pageview: false`, `capture_pageleave: true`
- `layout.tsx` replaced — Geist Sans + Mono fonts on `<html>` element, `PostHogProvider` wrapping body, Conjure metadata set
- `page.tsx` replaced — dark background skeleton using `bg-background`, `text-foreground`, `text-muted-foreground` brand tokens
- `npm run build` exits 0 — no TypeScript or compilation errors
- `.env.local` created with all env var stubs (gitignored via `.env*` pattern)

## Task Commits

1. **Task 1: Write root layout, PostHogProvider, and skeleton page** — `f3fb63e` (feat)
2. **Task 2: Deploy to Vercel** — PENDING (awaiting human action)

## Files Created/Modified

- `conjure-landing-page/src/components/providers/PostHogProvider.tsx` — PostHog 'use client' wrapper with useEffect init guard
- `conjure-landing-page/src/app/layout.tsx` — Root layout: Geist fonts, PostHogProvider, Conjure metadata
- `conjure-landing-page/src/app/page.tsx` — Phase 1 skeleton: dark background, infrastructure check text

## Decisions Made

- `capture_pageview: false` on PostHog init — manual `$pageview` will be fired explicitly in Phase 2 when section routing is established. Using init alone triggers the `decide` call (confirms initialization) without firing the event.
- Font variables applied to `<html>` (not `<body>`) so CSS variable `--font-geist-sans` inherits through entire document tree.

## Deviations from Plan

None on Task 1 — plan executed exactly as written.

**Vercel CLI gate (Task 2):** Vercel CLI v50.17.1 exits with `missing_scope` error when `--scope` flag is passed in non-interactive mode. All `vercel`, `vercel link`, `vercel ls` commands with `--scope chris-projects-d333f9de` failed identically. This requires running the deploy in an interactive terminal session.

## User Setup Required

**Vercel deploy requires interactive terminal.** Steps:

1. Open a terminal in: `conjure-landing-page/`
2. Run: `vercel link --scope chris-projects-d333f9de` (interactive — select or create project)
3. Set PostHog key: `vercel env add NEXT_PUBLIC_POSTHOG_KEY production` (enter your `phc_...` key when prompted)
4. Set PostHog host: `vercel env add NEXT_PUBLIC_POSTHOG_HOST production` → `https://us.i.posthog.com`
5. Set optional Lemon Squeezy URLs (or leave empty — fallback URLs are active):
   ```
   vercel env add LEMON_SQUEEZY_SCOUT_CHECKOUT_URL production
   vercel env add LEMON_SQUEEZY_DIRECTOR_CHECKOUT_URL production
   vercel env add LEMON_SQUEEZY_PRODUCER_CHECKOUT_URL production
   vercel env add LEMON_SQUEEZY_STUDIO_CHECKOUT_URL production
   ```
6. Deploy to production: `vercel --prod`
7. Record the production URL
8. Verify: visit URL → confirm dark background, "Infrastructure check" text, no console errors
9. Confirm PostHog: Network tab → `https://us.i.posthog.com/decide` request appears within 2s

After completing, respond with: `deployed: [url]`

## Next Phase Readiness

- Phase 2 needs the Vercel production URL as integration target
- CORS on `conjurestudio.app/api/waitlist` must be configured before waitlist form integration test
- Hero screenshot asset not yet delivered (Phase 2 blocker)
- All brand tokens and infrastructure verified via `npm run build` passing

## Env Vars Still Needed (Vercel Project)

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Required | `phc_...` from PostHog Project Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | Required | `https://us.i.posthog.com` |
| `LEMON_SQUEEZY_*_CHECKOUT_URL` | Optional | Falls back to conjurestudio.app/auth/signup |
| `ADMIN_PASSWORD` | Phase 3 | Leave empty for now |
| `SUPABASE_URL` | Phase 3 | Leave empty for now |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 3 | Leave empty for now |

---
*Phase: 01-foundation*
*Completed: 2026-03-11 (partial — Vercel deploy pending)*
