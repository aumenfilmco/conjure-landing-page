---
phase: 7
slug: cross-browser-qa
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^3.2.4 |
| **Config file** | `conjure-landing-page/vitest.config.ts` |
| **Quick run command** | `cd conjure-landing-page && npm run test` |
| **Full suite command** | `cd conjure-landing-page && npm run test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd conjure-landing-page && npm run test`
- **After every plan wave:** Run `cd conjure-landing-page && npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green (0 failures)
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 07-01-01 | 01 | 0 | GLAS-05 | unit (CSS scan) | `npm run test` | ⬜ pending |
| 07-01-02 | 01 | 0 | FLYT-03 | unit (IO count) | `npm run test` | ⬜ pending |
| 07-01-03 | 01 | 0 | PricingSection | unit (toggle role) | `npm run test` | ⬜ pending |
| 07-02-01 | 02 | 1 | GLAS-01–05 | manual (Safari desktop) | — | ⬜ pending |
| 07-02-02 | 02 | 1 | iOS sticky/glass | manual (physical device) | — | ⬜ pending |
| 07-02-03 | 02 | 1 | FLYT fast-scroll | manual (any browser) | — | ⬜ pending |
| 07-02-04 | 02 | 1 | WCAG AA contrast | manual (DevTools/webaim) | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Fix `glass.test.ts` GLAS-05 — narrow assertion to avoid `border-top-color` false positive
- [ ] Fix `FeaturesSection.test.tsx` FLYT-03 — update expected IntersectionObserver count from 6 to 7 (section-level observer added in Phase 6)
- [ ] Fix `PricingSection.test.tsx` annual toggle — update role query from `button` to `switch`

*All three are 1-2 line changes in test files, no production code changes.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Glass blur visible in Safari desktop | GLAS-01–05 | WebKit rendering cannot be simulated in jsdom | Open localhost:3000 in Safari, scroll to pricing/features, confirm blur visible |
| Sticky panel on physical iOS Safari | FLYT-02 | Physical device required for true Safari render | Open deployed URL on iPhone, scroll Features section |
| Fast-scroll active state accuracy | FLYT-03 | IntersectionObserver timing is device-dependent | Scroll Features section rapidly; verify correct row highlights within one stop |
| WCAG AA contrast on .glass-surface | (visual QA) | Computed colors require rendered page + contrast tool | Use DevTools color picker or webaim.org/resources/contrastchecker on glass card text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
