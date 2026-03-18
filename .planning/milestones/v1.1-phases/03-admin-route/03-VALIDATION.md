---
phase: 3
slug: admin-route
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | conjure-landing-page/vitest.config.ts |
| **Quick run command** | `cd conjure-landing-page && npx vitest run --reporter=verbose 2>&1 | tail -20` |
| **Full suite command** | `cd conjure-landing-page && npx vitest run 2>&1` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd conjure-landing-page && npx vitest run --reporter=verbose 2>&1 | tail -20`
- **After every plan wave:** Run `cd conjure-landing-page && npx vitest run 2>&1`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | ADMIN-01 | unit (RED stub) | `npx vitest run src/lib/session.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 0 | ADMIN-02 | unit (RED stub) | `npx vitest run src/app/admin/page.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 0 | ADMIN-03 | unit (RED stub) | `npx vitest run src/app/admin/login/actions.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 0 | ADMIN-04 | unit (RED stub) | `npx vitest run src/lib/supabase-admin.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 0 | ADMIN-05 | unit (RED stub) | `npx vitest run src/app/admin/page.test.tsx` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | ADMIN-01 | unit | `npx vitest run src/lib/session.test.ts` | ✅ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | ADMIN-02 | unit | `npx vitest run src/app/admin/page.test.tsx` | ✅ W0 | ⬜ pending |
| 3-02-03 | 02 | 1 | ADMIN-03 | unit | `npx vitest run src/app/admin/login/actions.test.ts` | ✅ W0 | ⬜ pending |
| 3-02-04 | 02 | 1 | ADMIN-04 | unit | `npx vitest run src/lib/supabase-admin.test.ts` | ✅ W0 | ⬜ pending |
| 3-02-05 | 02 | 1 | ADMIN-05 | unit | `npx vitest run src/app/admin/page.test.tsx` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/session.test.ts` — RED stubs for ADMIN-01 (encrypt/decrypt session, cookie attributes)
- [ ] `src/app/admin/page.test.tsx` — RED stubs for ADMIN-02 (unauthenticated redirect), ADMIN-04 (renders waitlist data), ADMIN-05 (sorted newest-first, count shown)
- [ ] `src/app/admin/login/actions.test.ts` — RED stubs for ADMIN-03 (success sets cookie + redirects, failure returns error, no cookie)
- [ ] `src/lib/supabase-admin.test.ts` — RED stub for ADMIN-04 (createAdminClient returns client, import guard)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CVE-2025-29927 bypass blocked | ADMIN-01 | Requires live running server + curl with header | `curl -H "x-middleware-subrequest: middleware" http://localhost:3000/admin` must return 307 redirect, not 200 with page content |
| Session cookie is httpOnly + Secure | ADMIN-03 | Requires browser DevTools inspection | Log in, open DevTools → Application → Cookies → confirm `admin_session` has HttpOnly and Secure flags |
| SUPABASE_SERVICE_ROLE_KEY not in bundle | ADMIN-04 | Requires browser DevTools network search | Ctrl+F in DevTools → Network → search for the key value — must return 0 results |
| Login redirects correctly on success | ADMIN-03 | Requires running server + browser | Submit correct password → should redirect to `/admin` and show waitlist table |
| Wrong password no cookie | ADMIN-03 | Requires running server + browser | Submit wrong password → error shown, no `admin_session` cookie set |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
