---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `vitest.config.ts` — does not exist yet, created in Wave 0 |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `grep -n '#' src/app/globals.css` (OKLCH guard)
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green + deployed Vercel URL confirmed
- **Max feedback latency:** ~5 seconds (grep instant; vitest ~5s)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-??-01 | 01 | 0 | FOUND-04, FOUND-06 | unit | `npx vitest run src/lib/env.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-02 | 01 | 0 | FOUND-05 | unit | `npx vitest run src/lib/content.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-03 | 01 | 1 | FOUND-01 | grep | `grep -n '#' src/app/globals.css` | ✅ grep | ⬜ pending |
| 1-??-04 | 01 | 1 | FOUND-02 | manual | Browser DevTools — Geist Sans applied to `<html>` | manual-only | ⬜ pending |
| 1-??-05 | 01 | 1 | FOUND-03 | unit | `npx vitest run src/components/providers/PostHogProvider.test.tsx` | ❌ W0 | ⬜ pending |
| 1-??-06 | 01 | 1 | FOUND-04 | unit | `npx vitest run src/lib/env.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-07 | 01 | 1 | FOUND-05 | unit | `npx vitest run src/lib/content.test.ts` | ❌ W0 | ⬜ pending |
| 1-??-08 | 01 | 1 | FOUND-06 | unit | `npx vitest run src/lib/env.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — framework setup for all phases
- [ ] `src/lib/env.test.ts` — stubs for FOUND-04 and FOUND-06; tests `checkoutUrls.scout` returns fallback when env var absent
- [ ] `src/lib/content.test.ts` — stubs for FOUND-05; verifies all exports are defined (non-empty, non-undefined)
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Geist Sans/Mono applied to `<html>` | FOUND-02 | Font rendering is a visual check — no DOM assertion captures font loading state reliably in Vitest | Open deployed URL in browser → DevTools → Elements → `<html>` className contains font variable classes |
| Deployed Vercel URL returns dark background | FOUND-01 | Integration check — requires live deploy, not unit test | Visit deployed URL → background should be near-black (`oklch(0.04 0 0)`) with no visible hex fallback |
| PostHog `$pageview` fires on deployed URL | FOUND-03 | Requires real PostHog project key and network; not mockable in unit tests | Visit deployed URL → PostHog Live Events dashboard → confirm `$pageview` event appears within 5 seconds |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
