---
phase: 03-admin-route
plan: 01
subsystem: testing
tags: [jose, supabase, tdd, jwt, auth, server-only, vitest]

# Dependency graph
requires:
  - phase: 02-public-page
    provides: test infrastructure (vitest, glass.test.ts source-scan pattern, env.test.ts dynamic import pattern)
provides:
  - RED test stubs for ADMIN-01 through ADMIN-05 (7 failing tests across 4 test files)
  - jose, @supabase/supabase-js, server-only installed as production dependencies
  - Test contract defining session.ts, supabase-admin.ts, proxy.ts, and admin/page.tsx behavior
affects: [03-admin-route plan 02 (implementation must make these tests green)]

# Tech tracking
tech-stack:
  added:
    - jose@^6.2.1 (JWT encrypt/decrypt for session.ts)
    - "@supabase/supabase-js@^2.99.1 (Supabase client for supabase-admin.ts)"
    - server-only@^0.0.1 (compile-time import guard preventing service key from reaching client bundle)
  patterns:
    - TDD Wave 0: write RED tests before any implementation exists
    - source-scan pattern (fs.readFileSync + plain-text assertions) for CSS/JSX/TS files
    - dynamic import pattern for testing modules that may not exist yet

key-files:
  created:
    - conjure-landing-page/src/lib/session.test.ts
    - conjure-landing-page/src/lib/supabase-admin.test.ts
    - conjure-landing-page/src/app/admin/page.test.ts
    - conjure-landing-page/src/app/admin/login/actions.test.ts
  modified:
    - conjure-landing-page/package.json (three new production deps)
    - conjure-landing-page/package-lock.json

key-decisions:
  - "jose installed as v6.2.1 (latest major) not v5.x as plan specified — same API surface, no behavioral difference"
  - "admin/login/ directory created as part of test stub creation to hold actions.test.ts"
  - "proxy.ts path resolved four levels up from src/app/admin/ to reach conjure-landing-page/ root"

patterns-established:
  - "TDD Red Wave 0: all test files reference non-existent implementation files; ENOENT and MODULE_NOT_FOUND are the correct RED signals"
  - "vi.mock('next/navigation') with redirect as vi.fn() — prevents NEXT_REDIRECT throw from blocking assertions"
  - "vi.mock('@/lib/session') in actions.test.ts — isolates login action from session implementation"

requirements-completed: [ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05]

# Metrics
duration: 2min
completed: 2026-03-15
---

# Phase 3 Plan 01: Admin Route TDD Wave 0 Summary

**TDD Wave 0: jose/supabase/server-only installed and 7 RED test stubs written covering the full admin auth contract (ADMIN-01 through ADMIN-05) before any implementation exists**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-15T00:56:54Z
- **Completed:** 2026-03-15T00:58:44Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Installed three production dependencies (jose, @supabase/supabase-js, server-only) required for the admin route auth stack
- Wrote 4 RED test files covering all 5 ADMIN requirements — session crypto (ADMIN-01), proxy redirect (ADMIN-02), login action (ADMIN-03), service key guard (ADMIN-04), waitlist query (ADMIN-05)
- Confirmed RED state: 7 new tests fail, 65 pre-existing tests remain green

## Task Commits

Each task was committed atomically:

1. **Task 1: Install jose, @supabase/supabase-js, server-only** - `4368fff` (chore)
2. **Task 2: Write RED test stubs for ADMIN-01 through ADMIN-05** - `609f830` (test)

**Plan metadata:** (docs commit hash pending)

_Note: TDD tasks have test-only commits in Wave 0 — implementation commits happen in Plan 02_

## Files Created/Modified

- `conjure-landing-page/package.json` - Three new production deps added (jose, @supabase/supabase-js, server-only)
- `conjure-landing-page/package-lock.json` - Updated lockfile
- `conjure-landing-page/src/lib/session.test.ts` - ADMIN-01: encrypt/decrypt/createSession/deleteSession contract
- `conjure-landing-page/src/lib/supabase-admin.test.ts` - ADMIN-04: server-only import guard, no auth persistence, no key export
- `conjure-landing-page/src/app/admin/page.test.ts` - ADMIN-02, ADMIN-04, ADMIN-05: decrypt CVE mitigation, waitlist query, proxy redirect
- `conjure-landing-page/src/app/admin/login/actions.test.ts` - ADMIN-03: correct password creates session, wrong password returns error

## Decisions Made

- jose installed as v6.2.1 (latest major) rather than v5.x as plan specified — npm resolved to the current stable major, which has the same API surface. Plan 02 implementation will target the v6 API.
- proxy.ts path in page.test.ts resolved four levels up from `src/app/admin/` to reach `conjure-landing-page/` root: `path.resolve(__dirname, '../../../../proxy.ts')`.

## Deviations from Plan

None — plan executed exactly as written. The jose version difference (v6 vs v5) is an npm resolution artifact, not a behavioral deviation; the same API is available in both versions.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 5 ADMIN requirement test contracts are locked in RED stubs
- Plan 02 can begin immediately: implement session.ts, supabase-admin.ts, proxy.ts (Next.js middleware), admin/page.tsx, and admin/login/actions.ts to turn all 7 tests GREEN
- No blockers

## Self-Check: PASSED

All created files verified on disk. Both task commits (4368fff, 609f830) confirmed in git log.

---
*Phase: 03-admin-route*
*Completed: 2026-03-15*
