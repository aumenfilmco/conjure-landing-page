---
phase: 4
slug: qa-and-launch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing) + manual verification |
| **Config file** | conjure-landing-page/vitest.config.ts |
| **Quick run command** | `cd conjure-landing-page && npx vitest run --reporter=verbose 2>&1 | tail -20` |
| **Full suite command** | `cd conjure-landing-page && npx vitest run 2>&1` |
| **Estimated runtime** | ~15 seconds (automated), manual steps variable |

---

## Sampling Rate

- **After every task commit:** Run `cd conjure-landing-page && npx vitest run --reporter=verbose 2>&1 | tail -20`
- **After every plan wave:** Run `cd conjure-landing-page && npx vitest run 2>&1`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds (automated); manual steps are human-gated checkpoints

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | PERF-03 (CORS) | manual+automated | `curl -I -X OPTIONS https://conjurestudio.app/api/waitlist -H "Origin: https://conjurestudio.ai"` | N/A (external) | ⬜ pending |
| 4-02-01 | 02 | 2 | PERF-01 | manual | PageSpeed Insights — human checkpoint | N/A | ⬜ pending |
| 4-02-02 | 02 | 2 | PERF-02 | manual | DevTools Network tab — human checkpoint | N/A | ⬜ pending |
| 4-02-03 | 02 | 2 | PERF-03 | manual | Physical iPhone Safari — human checkpoint | N/A | ⬜ pending |
| 4-02-04 | 02 | 2 | (copy) | automated | `grep -rn --include="*.tsx" --include="*.ts" --exclude="*.test.*" --exclude="*.spec.*" -i "AI-powered\|platform\|solution\|seamless\|intuitive\|streamline\|template" conjure-landing-page/src/` | ✅ | ⬜ pending |
| 4-02-05 | 02 | 2 | PERF-03 (CORS) | automated | `curl -I -X OPTIONS https://conjurestudio.app/api/waitlist -H "Origin: https://conjurestudio.ai"` | N/A (external) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — all PERF requirements verify production runtime behavior (Lighthouse score, Network tab, physical device, CORS headers) that cannot be automated against the live deployed URL.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lighthouse LCP ≤ 2.5s, hero is LCP element | PERF-01 | Requires live URL + Google infrastructure | Paste https://conjurestudio.ai into pagespeed.web.dev, run mobile audit, confirm LCP ≤ 2.5s and hero image identified as LCP element |
| All assets WebP in Network tab | PERF-02 | Requires browser DevTools inspection of live page | Open conjurestudio.ai, DevTools → Network → filter Images, confirm all screenshot assets are .webp — no .png or .jpg |
| iOS Safari 375px layout | PERF-03 | Requires physical iPhone | Open conjurestudio.ai on iPhone Safari: check for horizontal scroll, tap all CTAs confirm reachable, scroll full page for layout breakage |
| Admin route mobile sanity | (out of scope) | Physical device | Open /admin/login on iPhone — confirm it doesn't break (not polished, just not broken) |
| CORS header present | PERF-03 (waitlist) | External service | `curl -I -X OPTIONS https://conjurestudio.app/api/waitlist -H "Origin: https://conjurestudio.ai"` → must include `Access-Control-Allow-Origin: https://conjurestudio.ai` |
| Waitlist form end-to-end | PERF-03 (waitlist) | Requires production domain + live API | Submit form on conjurestudio.ai with test email — confirm success state shown |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or are correctly marked HUMAN-VERIFY checkpoints
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify or checkpoint
- [ ] Wave 0 not needed — existing infrastructure covers phase
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s for automated steps
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
