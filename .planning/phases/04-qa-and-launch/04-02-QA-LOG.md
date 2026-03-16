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

## Task 2: Manual QA Checklist (pending human verification)

### CHECK 1: Lighthouse LCP (PERF-01)
- URL: https://pagespeed.web.dev → https://conjurestudio.ai (MOBILE audit)
- Target: LCP ≤ 2.5s, LCP element = hero-screenshot.webp
- Result: [PENDING]

### CHECK 2: WebP assets in Network tab (PERF-02)
- URL: https://conjurestudio.ai → Chrome DevTools Network → Img filter
- Target: All screenshot assets return Content-Type: image/webp
- Result: [PENDING]

### CHECK 3: Physical iPhone Safari (PERF-03)
- URL: https://conjurestudio.ai on physical iPhone in Safari
- Target: No horizontal scroll, all CTAs tappable, no layout breakage
- Result: [PENDING]

### CHECK 4: Waitlist form end-to-end (PERF-03 + CORS)
- URL: https://conjurestudio.ai → waitlist form
- Target: Submit shows success state (not error, no CORS errors)
- Result: [PENDING]
