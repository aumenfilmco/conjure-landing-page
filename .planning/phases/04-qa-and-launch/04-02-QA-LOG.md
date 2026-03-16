# Phase 04 Plan 02 — QA Log

## Task 1: Automated Baseline (completed 2026-03-16)

### Banned-word grep

Command:
```
grep -rn "AI-powered|platform|solution|leverage|seamless|intuitive|workflow automation|generative AI|storyboard software|asset management|collaboration hub|template|streamline" \
  conjure-landing-page/src/ --include="*.tsx" --include="*.ts" --exclude="*.test.*" --exclude="*.spec.*"
```

Result: **PASS** — zero matches (grep exit code 1)

### Test suite

Command: `npx vitest run`

Result: **PASS** — 77/77 tests passing across 14 test files (1.19s)

---

## Task 2: Manual QA Checklist (completed 2026-03-16)

### CHECK 1: Lighthouse LCP (PERF-01)
- URL: https://pagespeed.web.dev → https://conjurestudio.ai (MOBILE audit)
- Target: LCP ≤ 2.5s, LCP element = hero-screenshot.webp
- Result: **FAIL** — LCP 3.3s (non-www) / 3.8s (www); target was ≤ 2.5s
- LCP element: hero image (correct — hero-screenshot.webp identified as LCP element)
- Gap: 0.8s–1.3s over target. Potential causes: TTFB on Vercel edge, image size, priority prop working but initial server response slow.
- Status: **OPEN GAP — PERF-01 not met**

### CHECK 2: WebP assets in Network tab (PERF-02)
- URL: https://conjurestudio.ai → Chrome DevTools Network → Img filter
- Target: All screenshot assets return Content-Type: image/webp
- Result: **PASS** — all image assets served as WebP

### CHECK 3: Physical iPhone Safari (PERF-03)
- URL: https://conjurestudio.ai on physical iPhone in Safari
- Target: No horizontal scroll, all CTAs tappable, no layout breakage
- Result: **PASS** — no horizontal scroll, no layout breakage

### CHECK 4: Waitlist form end-to-end (PERF-03 + CORS)
- URL: https://conjurestudio.ai → waitlist form
- Target: Submit shows success state (not error, no CORS errors)
- Result: **PASS** — form submits successfully; CORS resolved via Next.js API proxy route at /api/waitlist

---

## Summary

| Check | Requirement | Result |
|-------|------------|--------|
| Banned-word grep | COPY-01 | PASS |
| Test suite (77/77) | — | PASS |
| Lighthouse LCP (mobile) | PERF-01 | **FAIL** — 3.3s/3.8s vs ≤ 2.5s target |
| WebP assets | PERF-02 | PASS |
| Physical iPhone Safari | PERF-03 | PASS |
| Waitlist form (production) | PERF-03 + CORS | PASS |

**PERF-01 is an open gap.** All other checks passed. Page is functionally launch-ready but does not meet the original LCP performance target.
