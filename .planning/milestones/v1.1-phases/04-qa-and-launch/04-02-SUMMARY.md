---
phase: 04-qa-and-launch
plan: 02
subsystem: testing
tags: [qa, performance, lighthouse, webp, mobile, cors, waitlist]

requires:
  - phase: 04-01
    provides: CORS proxy route at /api/waitlist enabling production waitlist form submission

provides:
  - Full pre-launch QA checklist results against https://conjurestudio.ai
  - PERF-01 gap documented (LCP 3.3s–3.8s vs ≤ 2.5s target)
  - PERF-02 confirmed (all assets WebP in production)
  - PERF-03 confirmed (iOS Safari rendering + waitlist form end-to-end)
  - COPY-01 confirmed (zero banned words, 77/77 tests passing)

affects: [future-perf-optimization, v1.1-phases]

tech-stack:
  added: []
  patterns:
    - "QA log pattern: task-level pass/fail with exact values recorded in 04-02-QA-LOG.md"

key-files:
  created:
    - .planning/phases/04-qa-and-launch/04-02-QA-LOG.md
    - .planning/phases/04-qa-and-launch/04-02-SUMMARY.md
  modified: []

key-decisions:
  - "PERF-01 recorded as open gap — LCP 3.3s (non-www) / 3.8s (www) does not meet ≤ 2.5s target; page declared functionally launch-ready with this known gap"
  - "PERF-02 and PERF-03 confirmed: WebP assets served correctly in production, physical iOS Safari renders without layout breakage"
  - "Waitlist form CORS resolved via Next.js API proxy at /api/waitlist (implemented in Plan 01)"

patterns-established: []

requirements-completed:
  - PERF-02
  - PERF-03

duration: ~45min (including human verification)
completed: 2026-03-16
---

# Phase 4 Plan 02: QA and Launch Checklist Summary

**Pre-launch QA run against https://conjurestudio.ai — 4/5 checks passed; PERF-01 (LCP ≤ 2.5s) is an open gap at 3.3s–3.8s mobile**

## Performance

- **Duration:** ~45 min (including human verification window)
- **Started:** 2026-03-16T12:30:40Z
- **Completed:** 2026-03-16
- **Tasks:** 2/2
- **Files modified:** 1 (QA log)

## Accomplishments

- Banned-word grep confirmed clean — zero matches across all .tsx/.ts source files (excluding tests)
- Test suite confirmed green — 77/77 tests passing across 14 test files
- PERF-02 confirmed — all production screenshot assets served as image/webp (no PNG/JPEG leaking through)
- PERF-03 confirmed — physical iPhone Safari renders with no horizontal scroll, all CTAs reachable, waitlist form submits successfully from production domain
- PERF-01 gap documented — LCP 3.3s (non-www) / 3.8s (www); target was ≤ 2.5s; hero image is the correct LCP element but server response adds latency

## QA Results

| Check | Requirement | Result | Value |
|-------|------------|--------|-------|
| Banned-word grep | COPY-01 | **PASS** | 0 matches |
| Test suite | — | **PASS** | 77/77 tests |
| Lighthouse LCP mobile | PERF-01 | **FAIL** | 3.3s (non-www), 3.8s (www) |
| WebP assets (Network tab) | PERF-02 | **PASS** | All image/webp |
| Physical iPhone Safari | PERF-03 | **PASS** | No issues |
| Waitlist form (production) | PERF-03 + CORS | **PASS** | Success state confirmed |

## Task Commits

Each task was committed atomically:

1. **Task 1: Banned-word grep and test suite baseline** - `614312e` (chore)
2. **Task 2: Manual QA checklist results** - (part of docs metadata commit)

**Plan metadata:** (final commit — docs complete plan)

## Files Created/Modified

- `.planning/phases/04-qa-and-launch/04-02-QA-LOG.md` — QA log with per-check pass/fail and values

## Decisions Made

- **PERF-01 recorded as open gap:** LCP of 3.3s–3.8s on mobile does not meet the ≤ 2.5s target. The hero image is correctly identified as the LCP element (next/image priority prop is working), but TTFB on Vercel edge adds latency. The page is declared functionally launch-ready with this known gap — LCP optimization is a post-launch concern or can be addressed in v1.1.
- **PERF-02 and PERF-03 fully confirmed:** WebP asset serving and iOS Safari layout both verified against live production.
- **Waitlist CORS path confirmed:** The Next.js API proxy at `/api/waitlist` (implemented in Plan 01) resolves the CORS issue; production form submission works end-to-end.

## Deviations from Plan

None — plan executed as written. QA results recorded as-found. PERF-01 failure is a pre-existing condition, not introduced by this plan.

## Issues Encountered

**PERF-01 LCP gap (3.3s–3.8s vs ≤ 2.5s target)**

The LCP target was not met on either the non-www or www production URL. The hero image is the LCP element (next/image priority prop working correctly), so the issue is not a mis-identified LCP element. Likely causes:

1. Vercel TTFB — cold starts or edge network latency inflating time-to-first-byte
2. Hero image file size — hero-screenshot.webp may be too large despite WebP format
3. Third-party scripts (PostHog) potentially blocking render

This is not a blocking launch issue for an invite-only waitlist page, but should be addressed before broader public promotion.

## User Setup Required

None — no external service configuration required by this plan.

## Next Phase Readiness

- Phase 4 (QA and Launch) is complete. The page is functionally live and launch-ready.
- v1.1 work (Phases 5–7: glass surface, scroll panel, cross-browser QA) can proceed as planned.
- **Known gap to address post-launch or in v1.1:** PERF-01 LCP optimization (target ≤ 2.5s, current 3.3s–3.8s). Options: compress hero-screenshot.webp further, investigate TTFB via Vercel analytics, defer PostHog init.

---
*Phase: 04-qa-and-launch*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: `.planning/phases/04-qa-and-launch/04-02-SUMMARY.md`
- FOUND: `.planning/phases/04-qa-and-launch/04-02-QA-LOG.md`
- FOUND: commit `614312e` (Task 1 — automated baseline)
- FOUND: commit `fca37f4` (docs — plan complete)
