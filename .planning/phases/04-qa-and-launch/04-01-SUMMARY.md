---
phase: 04-qa-and-launch
plan: "01"
subsystem: api
tags: [cors, waitlist, api, cross-origin, fetch]

# Dependency graph
requires:
  - phase: 02-public-page
    provides: WaitlistSection with cross-origin fetch to conjurestudio.app/api/waitlist
provides:
  - CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers) on www.conjurestudio.app/api/waitlist for https://conjurestudio.ai origin
  - OPTIONS preflight handling returning HTTP 204 with CORS headers
  - Landing page endpoint updated to www subdomain to bypass 307 redirect
affects: [04-02-qa-checklist]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CORS for cross-origin POST with Content-Type: application/json requires explicit OPTIONS preflight handler returning 200/204"
    - "Vercel app: non-www domain issues 307 redirect; CORS headers must be on the redirect target (www subdomain)"

key-files:
  created: []
  modified:
    - conjure-landing-page/src/lib/content.ts

key-decisions:
  - "Landing page ENDPOINT updated to https://www.conjurestudio.app/api/waitlist — non-www redirects via 307 before browser receives CORS headers, causing preflight failure"
  - "CORS headers deployed to conjurestudio.app (Conjure app repo, separate deployment) — Access-Control-Allow-Origin locked to https://conjurestudio.ai, no wildcard"

patterns-established:
  - "Verify CORS with curl OPTIONS + curl POST before marking complete — browser cannot report the exact error text"

requirements-completed: [PERF-03]

# Metrics
duration: 5min
completed: 2026-03-16
---

# Phase 4 Plan 01: CORS Headers for Waitlist API Summary

**CORS preflight and POST headers deployed to www.conjurestudio.app/api/waitlist, unlocking the waitlist form on the production landing page at conjurestudio.ai**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-16T12:28:12Z
- **Completed:** 2026-03-16T12:29:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- CORS headers (`Access-Control-Allow-Origin: https://conjurestudio.ai`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type`) deployed to the conjurestudio.app Conjure app repo and live in production
- OPTIONS preflight returns HTTP 204 with CORS headers — browser preflight now succeeds before the POST
- Landing page ENDPOINT constant updated from `conjurestudio.app` to `www.conjurestudio.app` to avoid 307 redirect (which strips CORS response headers before they reach the browser)
- All 77 landing page tests still passing after endpoint URL change

## Task Commits

1. **Task 1: Add CORS headers to conjurestudio.app/api/waitlist** - `895139b` (fix) — landed as human action + landing page endpoint fix
2. **Task 2: Verify CORS headers with curl** — no files changed (verification-only task)

## Files Created/Modified

- `conjure-landing-page/src/lib/content.ts` — Updated `WAITLIST.ENDPOINT` from `https://conjurestudio.app/api/waitlist` to `https://www.conjurestudio.app/api/waitlist`

## Decisions Made

- **www subdomain required:** `conjurestudio.app` issues a 307 redirect to `www.conjurestudio.app`. The browser sends the CORS preflight to the non-www URL, receives a redirect with no CORS headers, and blocks the request. Pointing the endpoint at the www subdomain directly avoids the redirect and receives the CORS headers immediately.
- **Origin locked to `https://conjurestudio.ai`:** No trailing slash, no wildcard, exactly matching the production landing page origin. This is a locked decision established in the plan.

## curl Verification Output

**OPTIONS preflight check:**
```
HTTP/2 204
access-control-allow-headers: Content-Type
access-control-allow-methods: POST, OPTIONS
access-control-allow-origin: https://conjurestudio.ai
```

**POST with Origin header:**
```
< access-control-allow-headers: Content-Type
< access-control-allow-methods: POST, OPTIONS
< access-control-allow-origin: https://conjurestudio.ai
```

**Test suite:**
```
Test Files  14 passed (14)
     Tests  77 passed (77)
```

## Deviations from Plan

None — plan executed exactly as written, with the additional discovery that the non-www domain issues a 307 redirect (handled by updating the landing page ENDPOINT constant to www subdomain, which is the correct fix).

## Issues Encountered

- `conjurestudio.app` (non-www) returns HTTP 307 redirect to `www.conjurestudio.app` before the CORS headers can be served. The browser's CORS preflight does not follow redirects — it sees the 307 with no `Access-Control-Allow-Origin` header and blocks the request. Resolved by updating `WAITLIST.ENDPOINT` in `content.ts` to point directly to the www subdomain.

## User Setup Required

None — no external service configuration required beyond the CORS header deploy to conjurestudio.app (already completed).

## Next Phase Readiness

- Plan 02 (QA checklist) is now unblocked — the waitlist form end-to-end test can run from the production domain
- Both curl checks confirm CORS headers are live and correctly configured
- 77 landing page tests all green — no regressions

---
*Phase: 04-qa-and-launch*
*Completed: 2026-03-16*
