---
phase: 6
slug: scroll-panel
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + @testing-library/react 16.3.2 |
| **Config file** | `conjure-landing-page/vitest.config.ts` |
| **Quick run command** | `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/FeaturesSection.test.tsx` |
| **Full suite command** | `cd conjure-landing-page && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/FeaturesSection.test.tsx`
- **After every plan wave:** Run `cd conjure-landing-page && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 0 | FLYT-02 | unit | `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/FeaturesSection.test.tsx` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 0 | FLYT-03 | unit | same | ❌ W0 | ⬜ pending |
| 6-01-03 | 01 | 0 | FLYT-04 | unit | same | ❌ W0 | ⬜ pending |
| 6-01-04 | 01 | 0 | FLYT-05 | unit | same | ❌ W0 | ⬜ pending |
| 6-01-05 | 01 | 0 | FLYT-06 | unit | same | ❌ W0 | ⬜ pending |
| 6-01-06 | 01 | 0 | FLYT-07 | unit | same | ❌ W0 | ⬜ pending |
| 6-02-01 | 02 | 1 | FLYT-02,FLYT-03 | unit | same | ✅ W0 | ⬜ pending |
| 6-02-02 | 02 | 1 | FLYT-04,FLYT-05 | unit | same | ✅ W0 | ⬜ pending |
| 6-02-03 | 02 | 1 | FLYT-06 | unit | same | ✅ W0 | ⬜ pending |
| 6-02-04 | 02 | 1 | FLYT-07 | unit | same | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `conjure-landing-page/src/components/sections/__tests__/FeaturesSection.test.tsx` — RED stubs for FLYT-02, FLYT-03, FLYT-04, FLYT-05, FLYT-06, FLYT-07 with `vi.stubGlobal('IntersectionObserver', mockConstructor)` in `beforeEach`
- [ ] Dependency install: `cd conjure-landing-page && npm install react-intersection-observer` — must run before RED tests can import the hook

*(Existing infrastructure: Vitest + @testing-library/react + jsdom already configured in `vitest.config.ts` — no new framework setup needed)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sticky panel stays fixed while left column scrolls | FLYT-02 | jsdom has no scroll geometry; IO is mocked in unit tests | Open `localhost:3000` on desktop, scroll through Features section, observe right panel stays in viewport |
| Screenshot crossfades smoothly (no flash, no blank frame) | FLYT-04 | CSS opacity transitions and visual timing cannot be asserted in Vitest | Scroll through Features on desktop; observe each transition is smooth with no white flash between images |
| Active row highlight updates without user interaction | FLYT-05 | IO-triggered state update requires real browser scroll | Scroll slowly; verify mint accent appears on the row entering the viewport center zone |
| Mobile layout: no sticky panel at 375px | FLYT-07 | Responsive layout requires real or simulated viewport | Open DevTools mobile simulator at 375px width; verify stacked layout with no sticky right panel |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
