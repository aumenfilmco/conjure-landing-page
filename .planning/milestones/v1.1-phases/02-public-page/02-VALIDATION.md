---
phase: 2
slug: public-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3 + Testing Library |
| **Config file** | `conjure-landing-page/vitest.config.ts` |
| **Quick run command** | `cd conjure-landing-page && npm test -- --run` |
| **Full suite command** | `cd conjure-landing-page && npm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd conjure-landing-page && npm test -- --run`
- **After every plan wave:** Run `cd conjure-landing-page && npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-00-01 | 00 | 0 | ALL | unit stub | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 2-01-01 | 01 | 1 | HERO-01,02,03,04 | unit | `npm test -- --run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | HOW-01,02 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | FEAT-01–06 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | PRICE-01–06 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 2 | WAIT-01–07 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 2-02-03 | 02 | 2 | SOCIAL-01,02 / FAQ-01–03 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 3 | COPY-01,02 | unit | `npm test -- --run` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 3 | Header scroll | manual | — | n/a | ⬜ pending |
| 2-03-03 | 03 | 3 | Section fade-in | manual | — | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `conjure-landing-page/src/components/sections/__tests__/HeroSection.test.tsx` — stubs for HERO-01,02,03,04
- [ ] `conjure-landing-page/src/components/sections/__tests__/HowItWorksSection.test.tsx` — stubs for HOW-01,02
- [ ] `conjure-landing-page/src/components/sections/__tests__/FeaturesSection.test.tsx` — stubs for FEAT-01–06
- [ ] `conjure-landing-page/src/components/sections/__tests__/PricingSection.test.tsx` — stubs for PRICE-01–06
- [ ] `conjure-landing-page/src/components/sections/__tests__/WaitlistSection.test.tsx` — stubs for WAIT-01–07
- [ ] `conjure-landing-page/src/components/sections/__tests__/SocialProofAndFAQ.test.tsx` — stubs for SOCIAL-01,02,FAQ-01–03
- [ ] `conjure-landing-page/src/lib/content.test.ts` — add banned-word assertions for COPY-01,02 (extend existing file)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sticky header transparent → glass on scroll | HERO (page chrome) | Intersection Observer not available in jsdom | Open conjurestudio.ai, scroll slowly past hero, verify header gains glass backdrop |
| Section fade-in on scroll entry | Page chrome | Intersection Observer not available in jsdom | Scroll down page, verify each section fades in as it enters viewport |
| PostHog events firing live | HERO-04, PRICE-05,06, WAIT-06,07 | Requires real PostHog connection | Open PostHog Live Events, interact with CTAs and form, verify events appear within 30s |
| No horizontal scroll at 375px | SC-5 | Requires real device | Open on physical iOS Safari 375px, scroll/tap all CTAs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
