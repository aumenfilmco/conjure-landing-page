# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-11)

**Core value:** Get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works.
**Current focus:** Phase 1: Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-11 — Roadmap created, ready to begin Phase 1 planning

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

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Framework: Next.js 15 App Router (not Astro) — developer knows it at depth; admin route requires server-side Supabase + cookie auth patterns already shipped on main Conjure app
- Admin security: CVE-2025-29927 mitigation is mandatory — re-verify JWT in Server Component body, not middleware only; pin next>=15.2.3
- Checkout URLs: Fall back to `https://conjurestudio.app/auth/signup` until Lemon Squeezy configured; centralized in `lib/env.ts`

### Pending Todos

None yet.

### Blockers/Concerns

- **CORS prerequisite (Phase 2):** `conjurestudio.app/api/waitlist` must return `Access-Control-Allow-Origin` for the landing page origin before the waitlist form can be integration-tested. Change lives in the Conjure app repo, not this one.
- **Hero screenshot asset (Phase 2):** Branded Google Slides deck screenshot is not yet delivered. Without it the output-first hero cannot be implemented. Sourcing this is the first task of Phase 2.
- **Waitlist API response shape (Phase 2):** Exact status codes and error formats from the live `/api/waitlist` endpoint should be confirmed by reading the Conjure app route before designing form error/success logic.

## Session Continuity

Last session: 2026-03-11
Stopped at: Roadmap written. STATE.md initialized. Ready to run `/gsd:plan-phase 1`.
Resume file: None
