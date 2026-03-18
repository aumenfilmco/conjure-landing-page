# Phase 4: QA and Launch - Research

**Researched:** 2026-03-15
**Domain:** Launch readiness verification — Lighthouse performance, physical device QA, banned-word compliance, WebP asset verification, CORS configuration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**CORS and waitlist integration**
- CORS is NOT yet configured on conjurestudio.app/api/waitlist — this is a launch blocker
- Fix lives in the Conjure app repo (user owns it) — add `Access-Control-Allow-Origin: https://conjurestudio.ai` to the waitlist route response headers
- Allowed origin: `conjurestudio.ai` only (no localhost, no wildcard)
- Verification method: `curl -X POST https://conjurestudio.app/api/waitlist -H "Origin: https://conjurestudio.ai"` — check for `Access-Control-Allow-Origin` in response headers
- This is a prerequisite step before the landing page can be declared launch-ready

**Lighthouse approach**
- Manual run via PageSpeed Insights (pagespeed.web.dev) — no @lhci/cli tooling needed
- Target: LCP ≤ 2.5s on mobile
- If LCP ≥ 2.5s: treat as a launch blocker — investigate root cause (image size, TTFB) and fix before shipping
- The hero image already has `priority` prop and is `.webp` — expectation is this passes, but must be confirmed

**Physical device testing**
- Physical iPhone available — use it directly
- Scope: full criterion 3 pass — horizontal scroll check, tap all CTAs to confirm reachable, scroll full page for layout breakage
- Admin route: basic sanity check only (confirm /admin/login doesn't break on mobile — not polished, just not broken)
- Admin is desktop-only utility; mobile polish is out of scope

**Banned-word grep**
- Target: all `.tsx` and `.ts` files in `conjure-landing-page/src/` (not content.ts only)
- Catches any banned words that slipped into component files directly
- Zero matches required before launch

### Claude's Discretion
- Order of the QA checklist steps within the plan
- Whether CORS fix and landing page QA are in the same plan or separate plans

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | LCP ≤ 2.5s on mobile — hero screenshot served as `next/image` with `priority` prop | Hero image already at `/hero-screenshot.webp` with `priority` prop confirmed in `HeroSection.tsx:165`. PageSpeed Insights is the verification tool. |
| PERF-02 | All screenshot assets delivered as WebP | Verified: `public/` contains `hero-screenshot.webp` + 6 `feature-*.webp` files. PNG files (`Conjure-*.png`) are originals not referenced in production components. Network tab confirms at runtime. |
| PERF-03 | Layout renders correctly on mobile (375px) and desktop (1440px) — tested on physical iOS Safari device | Physical iPhone available. Test scope: no horizontal scroll, all CTAs reachable, no layout breakage. |
</phase_requirements>

---

## Summary

Phase 4 is a verification-only phase with one external dependency action. No new features are written. The landing page is already deployed at `conjurestudio.ai`. All three PERF requirements are primarily verified through manual inspection and tooling — not automated tests.

Current state (confirmed by direct code inspection): the banned-word grep is already clean (zero matches in non-test `.tsx`/`.ts` files), the hero image has `priority` prop set in `HeroSection.tsx`, and all production screenshot assets in `public/` are `.webp`. The test suite is fully green at 77 tests. The only unresolved blocker is CORS — `conjurestudio.app/api/waitlist` does not yet return `Access-Control-Allow-Origin: https://conjurestudio.ai`.

The planning question is primarily sequencing: CORS fix is a cross-repo action the user must perform; the plan should give them the exact curl verification command. All other QA steps (Lighthouse, device test, banned-word grep, Network tab WebP check) are independent of each other and can be ordered for human convenience.

**Primary recommendation:** Split into two plans — Plan 1 is the CORS fix with verification (external blocker, must go first), Plan 2 is the landing page QA checklist (Lighthouse, device, banned-word, WebP) that runs against the deployed URL. Both plans produce a VERIFICATION.md artifact confirming pass/fail on each success criterion.

---

## Standard Stack

### Core Verification Tools

| Tool | Version | Purpose | How Used |
|------|---------|---------|----------|
| PageSpeed Insights | web service | Lighthouse mobile audit for LCP ≤ 2.5s | Manual run at pagespeed.web.dev with production URL |
| curl | system | CORS header verification | OPTIONS preflight + POST origin header check |
| grep / ripgrep | system | Banned-word compliance scan | Pattern match against all `.tsx`/`.ts` in `src/` |
| Chrome DevTools Network tab | browser | WebP asset confirmation | Filter by image, confirm all screenshot assets return `image/webp` Content-Type |
| Physical iPhone + Safari | device | Mobile layout and CTA reachability | Manual scroll and tap test at 375px |
| Vitest | existing | Test suite stays green | `npm test` inside `conjure-landing-page/` |

### No New Dependencies Required

This phase installs nothing. All verification is performed with existing system tools, browser DevTools, and the deployed production URL.

---

## Architecture Patterns

### Plan Structure (Recommended: 2 Plans)

```
Phase 4
├── 04-01-PLAN.md  CORS fix and verification (cross-repo action + curl confirmation)
└── 04-02-PLAN.md  Landing page QA checklist (Lighthouse, device, banned-word, WebP)
```

**Rationale for split:** The CORS fix is a blocking external action in a different repo. It has a single discrete success condition (curl shows `Access-Control-Allow-Origin` header). Separating it lets the planner mark Plan 1 complete as soon as CORS is live, then run Plan 2 independently against the production URL.

**Alternative (single plan):** If the user prefers one consolidated checklist, CORS verification goes first as Step 1 with a hard gate — subsequent steps only proceed after Step 1 passes. Either approach is valid; the two-plan split is recommended for clarity.

### QA Checklist Order (within Plan 2)

Recommended sequence for human efficiency:

1. **Banned-word grep** — runs in < 1 second, no browser required, eliminates fastest-to-catch failures first
2. **WebP asset check** — open DevTools Network tab on production URL, filter by Img type
3. **Lighthouse mobile audit** — PageSpeed Insights on `https://conjurestudio.ai`, record LCP value and LCP element
4. **Physical device test** — iPhone Safari, scroll full page, tap all CTAs, confirm no horizontal scroll
5. **CORS/waitlist form test** — final end-to-end: submit real email from production page, confirm success state (depends on Plan 1 completing first)

### CORS Fix Pattern (for cross-repo action)

The fix is one response header addition to the `/api/waitlist` route in the Conjure app repo:

```
Access-Control-Allow-Origin: https://conjurestudio.ai
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

The OPTIONS preflight must also be handled (return 200 with the headers above) because the browser sends a preflight before the POST when the content-type is `application/json`.

### Verification Commands

**CORS preflight check:**
```bash
curl -I -X OPTIONS https://conjurestudio.app/api/waitlist \
  -H "Origin: https://conjurestudio.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
# Expected: Access-Control-Allow-Origin: https://conjurestudio.ai in response headers
```

**CORS POST check:**
```bash
curl -X POST https://conjurestudio.app/api/waitlist \
  -H "Origin: https://conjurestudio.ai" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-test@example.com","name":"QA Test"}' \
  -v 2>&1 | grep -i "access-control"
# Expected: < Access-Control-Allow-Origin: https://conjurestudio.ai
```

**Banned-word grep (run from conjure-landing-page/):**
```bash
grep -rn \
  "AI-powered\|platform\|solution\|leverage\|seamless\|intuitive\|workflow automation\|generative AI\|storyboard software\|asset management\|collaboration hub\|template\|streamline" \
  src/ --include="*.tsx" --include="*.ts" \
  --exclude="*.test.*" --exclude="*.spec.*"
# Expected: zero output (no matches)
```

Note: The grep must exclude test files (`*.test.*`, `*.spec.*`) because `content.test.ts` contains the banned word list as test data. This is correct behavior — the test file holding the list is not public-facing copy.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lighthouse CI gating | @lhci/cli, custom scripts | PageSpeed Insights (manual) | User decision: manual run only; no CI setup in scope |
| CORS proxy | Server-side proxy route in Next.js | Proper CORS headers on the API server | Masking the issue with a proxy would break the intent of WAIT-02 (direct cross-origin fetch) |
| Automated device testing | Playwright mobile emulation | Physical iPhone | Physical device test is a success criterion requirement — emulation does not satisfy it |

---

## Common Pitfalls

### Pitfall 1: grep matches test files, produces false positive
**What goes wrong:** Running the banned-word grep without excluding test files produces matches in `content.test.ts`, which defines the BANNED_WORDS array as a constant. This would falsely fail the criterion.
**How to avoid:** Always pass `--exclude="*.test.*" --exclude="*.spec.*"` flags to grep.
**Warning signs:** Matches appear only in files ending in `.test.ts` — those are false positives.

### Pitfall 2: CORS preflight not handled (OPTIONS 405)
**What goes wrong:** The Conjure app may return `Access-Control-Allow-Origin` on POST but not handle OPTIONS preflight. The browser sends OPTIONS first for cross-origin `application/json` requests. If OPTIONS returns 404 or 405, the browser blocks the POST before it even sends.
**How to avoid:** Verify both the OPTIONS preflight and the POST response include the CORS header. The curl command above checks preflight specifically.
**Warning signs:** Browser shows "CORS error" even after header appears on POST response.

### Pitfall 3: LCP element is not the hero image
**What goes wrong:** PageSpeed Insights flags a different element as LCP (e.g., headline text, a large background element), meaning the `priority` prop optimization isn't covering the actual bottleneck.
**How to avoid:** Check the PageSpeed Insights report explicitly for which element is identified as the LCP element. It should name `hero-screenshot.webp`. If it names something else, investigate what changed.
**Warning signs:** LCP element in report is "text" or a different image.

### Pitfall 4: PNG originals served in production
**What goes wrong:** The `public/` directory contains `Conjure-*.png` originals that were source files. If any component accidentally references these instead of the `.webp` equivalents, they'll appear in the Network tab.
**How to avoid:** In the Network tab, filter by image type and inspect Content-Type for each asset. Confirm all screenshot assets show `image/webp`.
**Warning signs:** Any image request returns `image/png` or `image/jpeg` in the Network tab.

### Pitfall 5: Waitlist form test on localhost vs. production
**What goes wrong:** Testing the waitlist form from `localhost:3000` will fail even after CORS is correctly configured, because the allowed origin is `https://conjurestudio.ai` only. Localhost is intentionally excluded.
**How to avoid:** All waitlist form verification must be done from the production URL (`conjurestudio.ai`), not localhost.
**Warning signs:** Form shows error state after CORS fix is deployed — check which origin you're testing from.

---

## Current State (Verified by Code Inspection)

| Check | Status | Evidence |
|-------|--------|----------|
| Banned-word grep (non-test files) | CLEAN | grep returns zero matches across all `.tsx`/`.ts` excluding test files |
| Hero image WebP | CLEAN | `public/hero-screenshot.webp` exists |
| Hero image `priority` prop | CLEAN | `src/components/sections/HeroSection.tsx:165` contains `priority` |
| Feature images WebP | CLEAN | 6 `feature-*.webp` files in `public/` |
| PNG originals in `public/` | Present (not in use) | `Conjure-*.png` files exist but are not referenced in production components |
| Test suite | GREEN | 77 tests, 14 files, all passing |
| CORS on conjurestudio.app/api/waitlist | NOT CONFIGURED | Launch blocker — fix required in Conjure app repo |
| Lighthouse LCP | UNVERIFIED | Must run PageSpeed Insights against production URL |
| Physical device test | UNVERIFIED | Must run on physical iPhone |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (version from package.json — current install) |
| Config file | `conjure-landing-page/vitest.config.ts` |
| Quick run command | `cd conjure-landing-page && npm test -- --run` |
| Full suite command | `cd conjure-landing-page && npm test -- --run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | LCP ≤ 2.5s, hero image is LCP element, `priority` prop in source | manual | PageSpeed Insights on `https://conjurestudio.ai` | N/A — manual-only |
| PERF-02 | All screenshot assets return `image/webp` Content-Type in production | manual | Chrome DevTools Network tab on production URL | N/A — manual-only |
| PERF-03 | No horizontal scroll, all CTAs reachable, no layout breakage on physical iOS Safari at 375px | manual | Physical iPhone Safari on `https://conjurestudio.ai` | N/A — manual-only |

**Note on manual-only tests:** All three PERF requirements verify production runtime behavior (network response headers, browser rendering on physical hardware, Lighthouse scoring). These cannot be meaningfully automated against the production URL in a unit/integration test. The existing `content.test.ts` already covers COPY-01 (banned-word compliance) at the unit level — that test remains part of the suite and must stay green, but PERF-01 through PERF-03 require manual verification steps as defined in the success criteria.

### Sampling Rate

- **Per task commit:** `cd conjure-landing-page && npm test -- --run` (suite runs in ~1.3s)
- **Per wave merge:** `cd conjure-landing-page && npm test -- --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers the automated portion of phase requirements. No new test files need to be created. The plan should verify the suite stays green at each step but no new test authoring is required for this phase.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `conjure-landing-page/src/components/sections/HeroSection.tsx` — `priority` prop confirmed at line 165
- Direct code inspection: `conjure-landing-page/public/` listing — all production screenshot assets are `.webp`
- Direct code inspection: `conjure-landing-page/src/lib/content.ts` — zero banned words in copy constants
- Live grep execution: banned-word grep across all `.tsx`/`.ts` excluding test files — zero matches confirmed
- Live test run: `npm test -- --run` — 77 tests, 14 files, all passing
- `04-CONTEXT.md` — locked decisions, CORS state, verification commands

### Secondary (MEDIUM confidence)
- `REQUIREMENTS.md` traceability table — PERF-01, PERF-02, PERF-03 status confirmed as Pending
- `ROADMAP.md` Phase 4 success criteria — exact pass/fail conditions documented

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Current state assessment: HIGH — verified by direct code inspection and test execution
- CORS behavior: HIGH — locked decision in CONTEXT.md, standard browser preflight behavior
- LCP outcome: MEDIUM — `priority` prop and `.webp` format are strong signals but actual score depends on TTFB and Vercel CDN, which cannot be measured without running PageSpeed Insights
- Physical device: LOW — layout looks correct at 375px in development but physical Safari on iOS has distinct rendering quirks; must test

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable — no new libraries, no configuration drift expected)
