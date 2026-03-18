---
phase: 5
slug: glass-and-sticky-prerequisites
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + @testing-library/react 16.3.2 |
| **Config file** | `conjure-landing-page/vitest.config.ts` |
| **Quick run command** | `cd conjure-landing-page && npx vitest run` |
| **Full suite command** | `cd conjure-landing-page && npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd conjure-landing-page && npx vitest run`
- **After every plan wave:** Run `cd conjure-landing-page && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 0 | GLAS-01, GLAS-02, GLAS-04, GLAS-05 | unit (CSS source parse) | `cd conjure-landing-page && npx vitest run src/lib/glass.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 0 | GLAS-03 | unit (component render) | `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/Header.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-03 | 01 | 0 | FLYT-01 | unit (source text assert) | `cd conjure-landing-page && npx vitest run src/app/page.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-04 | 01 | 1 | GLAS-01 | unit (CSS source parse) | `cd conjure-landing-page && npx vitest run src/lib/glass.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-05 | 01 | 1 | GLAS-02, GLAS-04, GLAS-05 | unit (CSS source parse) | `cd conjure-landing-page && npx vitest run src/lib/glass.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-06 | 01 | 1 | GLAS-03 | unit (component render) | `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/Header.test.tsx` | ✅ | ⬜ pending |
| 5-01-07 | 01 | 1 | FLYT-01 | unit (source text assert) | `cd conjure-landing-page && npx vitest run src/app/page.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `conjure-landing-page/src/lib/glass.test.ts` — stubs for GLAS-01, GLAS-02, GLAS-04, GLAS-05 (reads globals.css as text, asserts CSS string patterns)
- [ ] `conjure-landing-page/src/app/page.test.tsx` — stub for FLYT-01 (reads page.tsx source, asserts FeaturesSection is not adjacent to FadeInWrapper)
- [ ] Extend `conjure-landing-page/src/components/sections/__tests__/Header.test.tsx` — add test for GLAS-03 (render Header with scrolled state, assert WebkitBackdropFilter is `blur(18px) saturate(180%)`)

**Note on CSS testing strategy:** jsdom does not evaluate CSS files or apply stylesheets. Tests for GLAS-01 through GLAS-05 must read `globals.css` as plain text and assert string patterns — not rely on computed styles. The test file is co-located at `src/lib/glass.test.ts` (not `src/styles/`) to match existing project convention.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Safari desktop frosted glass visible on `.glass-surface` cards | GLAS-01, GLAS-02 | jsdom cannot render `backdrop-filter` or `-webkit-backdrop-filter` | Open dev server in Safari desktop. Scroll to Features section. Confirm cards show visible frosted/blur effect distinct from flat dark rectangle. |
| Header glass matches card glass in Safari | GLAS-03 | jsdom cannot render inline style webkit prefix | In Safari desktop, scroll page to trigger header glass state. Confirm header blur matches feature card blur — no flat/transparent discrepancy. |
| Chrome glass renders correctly | GLAS-01, GLAS-05 | Visual verification of blur quality | Open dev server in Chrome. Confirm `.glass-surface` cards show `blur(16px) saturate(180%)` effect, visible border-top, and inner shadow. |
| Legacy browser fallback renders legibly | GLAS-04 | Requires actual browser without backdrop-filter support | Test in Firefox with `layout.css.backdrop-filter.enabled = false` in about:config, OR disable via DevTools override. Confirm cards show solid dark background, text is legible. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
