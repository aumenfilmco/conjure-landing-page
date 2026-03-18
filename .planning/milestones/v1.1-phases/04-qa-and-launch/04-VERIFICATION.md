---
phase: 04-qa-and-launch
verified: 2026-03-17T08:15:00Z
status: passed
score: 5/5 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "PERF-01 code-level remediations applied and accepted as deferred infrastructure gap — image compressed to 64KB, sizes prop wired; runtime LCP of 3.6s is above target but gap is Vercel hobby tier TTFB, not code"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Re-run Lighthouse mobile audit on https://conjurestudio.ai after any infrastructure change (Vercel Pro upgrade)"
    expected: "LCP ≤ 2.5s with hero-screenshot.webp as the LCP element"
    why_human: "PageSpeed Insights requires a live browser against the deployed production URL; current 3.6s is an accepted deferred gap (infrastructure), not a code failure"
  - test: "Submit the waitlist form on https://conjurestudio.ai (production domain)"
    expected: "Form shows success state after submit — no CORS error in browser console"
    why_human: "End-to-end form submission requires a live browser against production; CORS confirmed at API level via curl; browser form state machine requires human confirmation"
---

# Phase 4: QA and Launch — Verification Report (Re-verification)

**Phase Goal:** QA and launch — confirm the landing page is production-ready with CORS fixed, assets optimized, and the waitlist form working end-to-end
**Verified:** 2026-03-17T08:15:00Z
**Status:** passed
**Re-verification:** Yes — after PERF-01 gap closure attempt (Plan 03)

---

## Re-verification Summary

Previous status was `gaps_found` (4/5) with one open gap: PERF-01 (LCP ≤ 2.5s). Plan 03 executed two code-level remediations:

1. Hero image re-compressed at WebP quality 70: **73KB → 64KB** (commit `b536992`, confirmed in filesystem)
2. `sizes="(max-width: 1024px) 100vw, 60vw"` added to the `<Image>` element in HeroSection.tsx (confirmed in code at lines 165–166)

Post-optimisation mobile LCP measured **3.6s** — still above the 2.5s target. Root cause confirmed as Vercel hobby tier cold start TTFB (~1.5–2s per cold request), which is an infrastructure constraint, not a code issue. Per the context provided by the user and documented in 04-03-SUMMARY.md and REQUIREMENTS.md, PERF-01 is **accepted as a deferred gap** — the landing page is declared launch-ready with this limitation noted.

**This re-verification counts PERF-01 as ACCEPTED/DEFERRED (not failed) per explicit user instruction and project documentation.** Score: 5/5.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | CORS: OPTIONS preflight to conjurestudio.app/api/waitlist with Origin: https://conjurestudio.ai returns correct allow-origin header | ✓ VERIFIED | Live curl confirmed in Plan 01; Next.js proxy route eliminates browser-facing CORS entirely |
| 2 | POST to waitlist API with Origin header returns CORS allow-origin header | ✓ VERIFIED | route.ts substantive — proxies to www.conjurestudio.app/api/waitlist, returns upstream response |
| 3 | LCP code-level optimisation applied (hero image compressed, sizes prop wired) | ✓ ACCEPTED/DEFERRED | 64KB hero + sizes prop confirmed in code; LCP 3.6s is Vercel TTFB gap, accepted for launch |
| 4 | All screenshot assets served as image/webp in production | ✓ VERIFIED | 7 WebP files confirmed in public/; PERF-02 passed in human QA |
| 5 | Physical iPhone Safari: no horizontal scroll, all CTAs tappable, waitlist form shows success state | ✓ VERIFIED | PERF-03 human verified on physical device per QA log |

**Score:** 5/5 must-haves verified (PERF-01 counted as ACCEPTED/DEFERRED per project decision)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `conjure-landing-page/src/lib/content.ts` | WAITLIST.ENDPOINT = '/api/waitlist' | ✓ VERIFIED | Line 129: `ENDPOINT: '/api/waitlist'` |
| `conjure-landing-page/src/app/api/waitlist/route.ts` | Next.js proxy forwarding to www.conjurestudio.app | ✓ VERIFIED | Substantive — const UPSTREAM set, fetch(UPSTREAM) called, upstream status returned |
| `conjure-landing-page/src/components/sections/HeroSection.tsx` | next/image with priority + sizes props | ✓ VERIFIED | priority at line 165; sizes="(max-width: 1024px) 100vw, 60vw" at line 166 |
| `conjure-landing-page/public/hero-screenshot.webp` | WebP hero asset, compressed to 64KB | ✓ VERIFIED | 64KB confirmed (down from 73KB); mtime 2026-03-16 matches Plan 03 execution |
| `conjure-landing-page/public/feature-*.webp` | 6 feature WebP assets | ✓ VERIFIED | All 6 confirmed: camera-package (22K), character-extraction (51K), components (20K), location-extraction (34K), shot-extraction (29K), slides-export (22K) |
| `www.conjurestudio.app/api/waitlist` (external) | CORS headers for conjurestudio.ai origin | ✓ VERIFIED | Live curl OPTIONS confirmed in Plan 01 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| WaitlistSection form submit | /api/waitlist (proxy) | fetch(WAITLIST.ENDPOINT) | ✓ WIRED | WaitlistSection line 18: `fetch(WAITLIST.ENDPOINT, ...)` where ENDPOINT = '/api/waitlist' |
| /api/waitlist proxy route | www.conjurestudio.app/api/waitlist | server-side fetch with JSON body | ✓ WIRED | route.ts: UPSTREAM = 'https://www.conjurestudio.app/api/waitlist'; fetch(UPSTREAM, body) |
| HeroSection next/image | public/hero-screenshot.webp | priority + sizes props | ✓ WIRED | src="/hero-screenshot.webp" at line 161, priority at line 165, sizes at line 166 |
| conjurestudio.ai browser | www.conjurestudio.app/api/waitlist | CORS headers on live API | ✓ WIRED | Live curl OPTIONS confirmed; Next.js proxy eliminates browser-facing CORS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| PERF-01 | 04-02-PLAN.md, 04-03-PLAN.md | LCP ≤ 2.5s on mobile, hero image as LCP element | ACCEPTED/DEFERRED | Code-level fixes applied: 64KB compressed hero (commit b536992), sizes prop wired (HeroSection.tsx line 166), priority prop present (line 165). LCP 3.6s — gap is Vercel hobby tier TTFB. Accepted per user decision. REQUIREMENTS.md records "Accepted gap — 3.6s LCP (Vercel TTFB)". |
| PERF-02 | 04-02-PLAN.md | All screenshot assets delivered as WebP | ✓ SATISFIED | 7 WebP files in public/; manual QA confirmed image/webp Content-Type in Chrome DevTools |
| PERF-03 | 04-01-PLAN.md, 04-02-PLAN.md | Layout correct on mobile and desktop; iOS Safari tested; waitlist form submits from production | ✓ SATISFIED | Physical iPhone Safari: no horizontal scroll, no clipped CTAs; waitlist form success state confirmed; CORS proxy live and substantive |

**Orphaned requirements check:** REQUIREMENTS.md traceability table maps PERF-01, PERF-02, PERF-03 to Phase 4. All three appear in plan frontmatter. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

**Banned-word grep:** Exit code 1 (zero matches across all .tsx/.ts excluding test files) — PASS.
**Test suite:** 77/77 tests passing across 14 test files (1.22s) — PASS.
No placeholder components, stub implementations, or TODO markers found in phase-modified files.

---

### Human Verification Required

#### 1. PERF-01 Re-verification (Post Infrastructure Upgrade Only)

**Test:** Run PageSpeed Insights mobile audit on https://conjurestudio.ai after upgrading to Vercel Pro or equivalent infrastructure change.
**Expected:** LCP ≤ 2.5s; hero-screenshot.webp identified as the LCP element.
**Why human:** PageSpeed Insights requires a live browser against the deployed production URL. Current 3.6s is an accepted deferred gap — this item is only relevant if/when infrastructure is upgraded.

#### 2. Waitlist Form Browser End-to-End

**Test:** Visit https://conjurestudio.ai in a browser, scroll to the waitlist form, submit a test email.
**Expected:** Form transitions to success state; no CORS error in browser DevTools console.
**Why human:** The CORS proxy is confirmed working at the API level. Browser form state machine behavior and absence of browser-enforced CORS errors require a live browser session.

---

### Gaps Summary

No blocking gaps remain. The previous gap (PERF-01) has been addressed at the code level:

- Hero image re-compressed: 73KB → 64KB (commit `b536992`, verified in filesystem at 64K mtime 2026-03-16)
- `sizes` prop added to next/image: `sizes="(max-width: 1024px) 100vw, 60vw"` (verified in HeroSection.tsx lines 165–166)

The remaining LCP delta (3.6s vs 2.5s target) is attributable to Vercel hobby tier cold start TTFB — an infrastructure constraint outside code-level optimisation scope. This has been:

1. Documented as an accepted gap in REQUIREMENTS.md traceability table
2. Recorded in 04-03-SUMMARY.md key-decisions with explicit rationale
3. Accepted by the user as a known launch limitation

The landing page is **launch-ready**. All functional requirements (CORS, WebP assets, mobile layout, waitlist form) are satisfied. PERF-01 is tracked for a future infrastructure task.

---

## Requirement-to-Code Traceability Summary

| Req ID | Code Location | Confirmed Present |
|--------|--------------|------------------|
| PERF-01 | HeroSection.tsx lines 161–166 (next/image + priority + sizes); public/hero-screenshot.webp (64KB) | Code fully optimised; runtime LCP 3.6s — Vercel TTFB gap accepted/deferred |
| PERF-02 | public/*.webp (7 files); no PNG/JPEG referenced in components | Confirmed |
| PERF-03 | WaitlistSection.tsx line 18 → fetch('/api/waitlist') → route.ts → www.conjurestudio.app | Confirmed; human verified on physical device |

---

_Verified: 2026-03-17T08:15:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification after: Plan 03 PERF-01 gap closure_
