# Phase 7: Cross-Browser QA — Research

**Researched:** 2026-03-14
**Domain:** Browser compatibility QA, WCAG contrast, Vitest/Playwright testing
**Confidence:** HIGH (findings based on direct code inspection + established browser specs)

---

## Summary

Phase 7 is a verification-and-fix phase. Phases 5 and 6 implemented the glass surface and scroll-synced sticky panel; Phase 7 confirms those features behave correctly on the browsers and devices where their known bugs are most likely to surface. Three of the four success criteria are testable by running the dev server and exercising the page — only WCAG AA contrast requires an external checker against the rendered DOM. No net-new architectural work is expected; the most likely output is a small set of bug fixes if manual device testing surfaces regressions.

Before writing new QA scripts, the phase must first clean up three pre-existing test failures that were deferred from Phases 5 and 6. These are low-risk precision issues, not functional regressions, but they produce noise in the test suite and must be resolved before the suite can serve as a meaningful gate. Once the suite is clean, the plan can address the four QA success criteria with a combination of targeted Vitest additions, a Playwright smoke test, and a structured manual device checklist.

The IntersectionObserver scroll-spy behavior is the hardest criterion to verify with automated tests — Vitest/jsdom cannot simulate real scroll events. A Playwright test against `localhost:3000` covers scroll behavior in a real Chromium engine. Physical iOS Safari testing remains manual; no emulator fully reproduces Mobile Safari's `position: sticky` and `-webkit-backdrop-filter` behaviour.

**Primary recommendation:** Two-plan structure — Wave 0 repairs the deferred test failures and writes targeted automated assertions for the glass/sticky criteria; Wave 1 is a structured manual checklist (iOS Safari physical device, Safari desktop blur, fast-scroll, WCAG contrast) that produces a signed-off QA record.

---

## Pre-Existing Failures That Must Be Fixed First

This is the most important section for the planner. Three test failures are deferred into Phase 7 from earlier phases. They are false positives or off-by-one test precision bugs, not functional regressions. They must be resolved before Phase 7 can add new tests and report a clean suite.

### Failure 1: GLAS-05 — glass.test.ts (file-wide string scan false positive)

**Test:** `expect(css).not.toContain('0.98 0 0 / 0.22')`
**Root cause:** The test performs a full-file substring scan. `globals.css` legitimately contains `oklch(0.98 0 0 / 0.22)` in the `.glass-surface:hover` box-shadow inner rim highlight (`inset 0 1px 0 oklch(0.98 0 0 / 0.22)`) — this is NOT the border-top-color the test intends to check. The GLAS-05 requirement is that `border-top-color` uses 0.32 not 0.22. That requirement is satisfied. The test assertion is too broad.
**Fix options:**
  1. (Preferred) Narrow the test to check the specific property: parse the `.glass-surface` block for `border-top-color` and assert it contains 0.32. Replace the negative `not.toContain` with a scoped assertion.
  2. (Simpler) Change the hover rim highlight value from `0.22` to `0.18` (already used elsewhere) to eliminate the collision — the visual difference is imperceptible. Update the test to match.
**Confidence:** HIGH (direct code inspection — line 194 of globals.css)

### Failure 2: FLYT-03 — FeaturesSection.test.tsx (observer count off by 1)

**Test:** `expect(mockIntersectionObserver).toHaveBeenCalledTimes(6)`
**Actual count:** 7
**Root cause:** `FeaturesSection` creates 6 `IntersectionObserver` instances in `FeatureRow` (one per row) PLUS 1 additional instance in `FeaturesSection` itself for the section-visibility observer (`mockupVisible` state). The section-level observer was added during Phase 6 implementation after the RED test was written. The test contract asserts exactly 6 but the implementation correctly creates 7.
**Fix:** Update the test to assert `toHaveBeenCalledTimes(7)` — 6 row observers plus 1 section observer. Or restructure the test to assert "at least 6" with `toBeGreaterThanOrEqual(6)`. The former is more precise.
**Confidence:** HIGH (direct code inspection — FeaturesSection.tsx useEffect at line 111–119)

### Failure 3: PricingSection annual toggle test

**Test:** `screen.getByRole('button', { name: /annual/i })`
**Root cause:** The toggle uses `role="switch"` and `aria-label` alternates between 'Switch to Annual' and 'Switch to Monthly'. Testing Library's `getByRole('button')` does not match `role="switch"` elements (switch is a distinct ARIA role). The query must use `getByRole('switch')` or the aria-label must match what the test expects on initial render.
**Current aria-label at initial render:** `'Switch to Annual'` (contains "Annual") — so `getByRole('switch', { name: /annual/i })` should match.
**Fix:** Change `getByRole('button', { name: /annual/i })` to `getByRole('switch', { name: /annual/i })` in the test.
**Confidence:** HIGH (direct inspection of PricingSection.tsx line 56-58 and test line 44)

---

## Standard Stack

### Core (what this phase uses)

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Vitest | ^3.2.4 | Unit/component test runner | Already installed; jsdom environment |
| @testing-library/react | ^16.3.2 | Component rendering + queries | Already installed |
| Playwright | n/a | Scroll behavior, real browser | `.playwright-cli/` and `.playwright-mcp/` dirs exist — Playwright tooling is present in the project root |
| Browser DevTools | n/a | WCAG contrast check | Built into Chrome/Safari DevTools |
| axe DevTools / contrast checker | browser extension | WCAG AA 4.5:1 audit | Free Chrome/Edge extension; also available at webaim.org/resources/contrastchecker |

### Playwright Status

The project has `.playwright-cli/` and `.playwright-mcp/` directories with timestamped console logs and page screenshots — Playwright has been used for visual inspection in earlier phases. However, Playwright is NOT installed as a project dependency in `conjure-landing-page/package.json`. If Playwright automation is needed for Phase 7 (scroll-spy verification), it must either be added as a dev dependency or executed from the project root directory where it is already available.

**Recommendation:** For the scroll-spy fast-scroll criterion, use a Playwright test against `localhost:3000`. The infrastructure already exists. The test can run `npm run dev` in background and navigate + scroll programmatically.

**Vitest is already configured:**
```bash
# Quick run (from conjure-landing-page/)
npm run test
# Watch mode
npm run test:watch
```

---

## Architecture Patterns

### Pattern 1: QA Phase Structure (Wave 0 + Wave 1)

**Wave 0 — Automated repair and additions (Claude-executable):**
1. Fix the 3 deferred test failures (glass.test.ts, FeaturesSection.test.tsx, PricingSection.test.tsx)
2. Add Vitest assertions covering CSS properties that automated tests can verify (no new component changes)
3. Optionally add a Playwright smoke test for scroll-spy behavior in real Chromium

**Wave 1 — Manual verification checklist (human-required):**
1. iOS Safari physical device test (glass visible, sticky works, mobile layout correct, no horizontal scroll)
2. Safari desktop test (blur visible, consistent with Chrome)
3. Fast-scroll Features section test (correct feature highlights within one scroll-stop)
4. WCAG AA contrast check on `.glass-surface` text

This split is required because browser rendering bugs in Safari/iOS cannot be reproduced in jsdom or even Chrome DevTools mobile emulation.

### Pattern 2: WCAG AA Contrast Checking

**WCAG AA requirement:** text contrast ratio ≥ 4.5:1 against background.

**For `.glass-surface`:** Text color is `oklch(0.98 0 0)` (near-white foreground). Background is a glass layer: approximately `oklch(0.14 0 0 / 0.45)` composited over `oklch(0.04 0 0)` (near-black body background). The effective rendered background is very dark — approximately L 0.04–0.08 — so contrast is extremely high (effectively white on black).

**However**, the WCAG criterion must be verified on the RENDERED page, not the CSS tokens, because the glass enhancement includes a green orb gradient overlay (`oklch(0.92 0.18 142 / 0.44)`) which lightens the card corner. In that region, text that sits near the bright corner could fail. The mint gradient reaches 44% opacity at the orb center.

**Tooling approach (in order of reliability):**
1. Open the deployed page (or `localhost:3000`) in Chrome DevTools → Elements panel → CSS → click any color → the DevTools color picker shows contrast ratio against the parent element's background.
2. Screenshot the rendered glass card → paste into webaim.org/resources/contrastchecker to sample specific pixels.
3. Chrome DevTools Accessibility panel → "Contrast ratio" badge on the element.

**Shortcut assertion:** `--color-foreground: oklch(0.98 0 0)` on dark glass `oklch(0.14 0 0 / 0.45)` over `oklch(0.04 0 0)` background — the contrast is extremely high (white on near-black). The concern is text inside the green orb bright spot. The orb is at a card corner; body text is not positioned at corners. Visually confirm this during the manual checkpoint.

### Pattern 3: iOS Safari `position: sticky` Known Quirks

Relevant to FLYT-01 verification and the Phase 7 sticky panel check on physical iOS Safari.

**Confirmed Safari sticky requirements (HIGH confidence — MDN + WebKit bugs):**
- The sticky element's scroll container must NOT have `overflow: hidden` or `overflow: auto` applied anywhere between the sticky element and the viewport. The FeaturesSection implementation explicitly documents this: "no overflow:hidden on section or grid container".
- A `transform` on any ancestor element will create a new containing block, causing sticky to pin to the transformed ancestor. FadeInWrapper was removed in Phase 5 to address this.
- `-webkit-overflow-scrolling: touch` on an ancestor (common in older mobile patterns) breaks sticky in Mobile Safari. This is less likely in a Next.js 16 app using standard Tailwind but worth checking.
- iOS Safari 15+ supports `position: sticky` reliably. Devices running iOS 14 or earlier may have issues — however, the project targets modern browsers and this is unlikely to be a concern.

**What to verify on physical iOS Safari:**
- Scroll through Features section — sticky right panel (desktop) should not apply on 375px mobile. The `md:hidden` / `hidden md:grid` split handles this correctly in the current implementation.
- Mobile stacked layout: description-above-screenshot, no horizontal overflow.

**Current implementation risk — `style={{ top: '8rem' }}`:** The sticky panel uses an inline style for `top`. This is safe in Safari as long as the containing block is the viewport (which it is, assuming no overflow or transform ancestors). Confirm during manual QA.

### Pattern 4: Fast-Scroll Scroll-Spy Robustness

The `IntersectionObserver` approach with `rootMargin: '-40% 0px -40% 0px'` means only the row in the center 20% of the viewport fires. During fast scroll, multiple rows may enter and exit the intersection zone before the browser can fire callbacks.

**Known behavior:** Native `IntersectionObserver` callbacks are asynchronous and batched — during fast scroll, the last row to intersect before the scroll stops is what fires. This naturally produces "correct feature highlights within one scroll-stop" behavior. No additional debouncing is needed.

**Automated test limitation:** Vitest/jsdom stubs `IntersectionObserver` — it cannot simulate real scroll intersection events. A Playwright test can simulate real scrolls in Chromium.

**Playwright scroll test approach:**
```javascript
// Navigate to features section, scroll rapidly through it, assert active state
await page.evaluate(() => {
  document.querySelector('[data-testid="feature-row"]:last-child')?.scrollIntoView()
})
// Assert last row text has the active (text-primary) class or mint color
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| WCAG contrast ratio calculation | Custom contrast formula | Chrome DevTools color picker, webaim.org, or axe browser extension |
| Safari UA detection in CSS | JS navigator.userAgent sniffing | `-webkit-backdrop-filter` already in globals.css (sufficient) |
| Custom scroll event listener for scroll-spy | Replace IntersectionObserver with scroll | Keep existing IntersectionObserver — it is the correct modern API |
| Mobile Safari polyfill for `position: sticky` | JavaScript sticky shim | Not needed for iOS 15+ — just verify the overflow/transform prerequisites are met |

---

## Common Pitfalls

### Pitfall 1: Chrome DevTools mobile emulation is NOT iOS Safari

**What goes wrong:** Developer tests on Chrome DevTools iPhone emulation and declares "mobile works." Then on a physical iPhone, `position: sticky` fails or `-webkit-backdrop-filter` produces no blur.

**Why it happens:** Chrome mobile emulation uses the Blink rendering engine. iOS Safari uses WebKit. The `-webkit-backdrop-filter` CSS variable issue was an actual Safari-only bug. Chrome emulation would not reproduce it.

**How to avoid:** The iOS Safari physical device test is MANDATORY for this phase — emulation is insufficient.

### Pitfall 2: The `FLYT-03` test count is fragile

**What goes wrong:** Test counts exact `IntersectionObserver` constructor calls. Each time FeaturesSection gains or loses an observer (e.g., adding a header section observer), this test breaks.

**Why it happens:** Testing implementation details (observer count) rather than behavior (correct row activates on scroll).

**How to avoid:** After fixing FLYT-03 to assert 7, note in the test that the count is 6 row observers + 1 section observer. Comment the test clearly so future contributors know why.

### Pitfall 3: GLAS-05 test assertion is too broad

**What goes wrong:** Adding any CSS that includes `oklch(0.98 0 0 / 0.22)` — even for a different property — causes the GLAS-05 test to fail.

**Why it happens:** `not.toContain()` on a raw CSS file string matches anywhere in the file.

**How to avoid:** Scope the test assertion to the `border-top-color` property specifically. Extract the `.glass-surface` block from the file string, then assert within that block.

### Pitfall 4: Contrast check only at card center — missing bright orb region

**What goes wrong:** Checking contrast of card body text against the dark background center but missing that the mint green orb gradient in the card corner (`oklch(0.92 0.18 142 / 0.44)`) significantly lightens that region.

**Why it happens:** Token-level math says white-on-black is fine. The rendered composition is different.

**How to avoid:** Sample contrast visually at the brightest point in the card corner, not just the center. Use the DevTools color picker on a pixel near the top-left (or whichever corner has the orb) rather than the center.

### Pitfall 5: IntersectionObserver FLYT-03 was written before the section observer was added

**What goes wrong:** The RED test specified exactly 6 calls. The implementation added a 7th observer (section-level visibility for mockupVisible). The test was never updated.

**Why it happens:** Implementation diverged from the test contract during Phase 6 development (the section observer was an auto-fix addition).

**How to avoid:** Already known — fix is to update the assertion to 7 with a clear comment. Document why.

---

## Code Examples

### Fixing FLYT-03: Update observer count assertion

```typescript
// Source: direct inspection of FeaturesSection.tsx
// 6 FeatureRow observers (rows 0–5) + 1 section observer (mockupVisible)
it('instantiates IntersectionObserver once per feature row plus one section observer', () => {
  render(<FeaturesSection />)
  // 6 row observers + 1 section-visibility observer = 7 total
  expect(mockIntersectionObserver).toHaveBeenCalledTimes(7)
})
```

### Fixing PricingSection toggle test

```typescript
// The toggle has role="switch", not role="button"
// Before fix:
const toggle = screen.getByRole('button', { name: /annual/i })
// After fix:
const toggle = screen.getByRole('switch', { name: /annual/i })
```

### Narrowing GLAS-05 test to avoid false positive

```typescript
// Before fix: broad file scan
expect(css).not.toContain('0.98 0 0 / 0.22')

// After fix: scope to the glass-surface border-top-color property
// Extract the .glass-surface block and test within it
const glassSurfaceBlock = css.match(/\.glass-surface\s*\{[^}]+border-top-color:[^;]+/)?.[0] ?? ''
expect(glassSurfaceBlock).toContain('0.32')
expect(glassSurfaceBlock).not.toContain('0.22')
```

### iOS Safari sticky prerequisite check (manual verification script)

```
Manual checklist item — confirm in Safari DevTools (desktop) and physical iPhone:
1. Open DevTools > Elements > select the sticky panel div
2. Confirm computed position is "sticky"
3. Confirm no ancestor has overflow:hidden (check .features-desktop-grid and section ancestors)
4. Confirm no ancestor has transform applied (FadeInWrapper was removed in Phase 5)
```

---

## State of the Art

| Old Approach | Current Approach | Impact on Phase 7 |
|--------------|------------------|-------------------|
| `FadeInWrapper` (transform ancestor) | Removed — Phase 5 | Sticky now works in Safari; verify removal held |
| CSS `var(--glass-blur)` on webkit prefix | Hardcoded `blur(18px)` — Phase 5 | Safari blur works; verify visually on device |
| Flat near-black background | SVG feTurbulence noise grain — Phase 5 | Blur has pixels to process; verify glass is visible |
| Static feature card grid | Scroll-synced sticky panel — Phase 6 | Sticky panel to verify on desktop + iOS |
| `useInView` from react-intersection-observer | Native `IntersectionObserver` per row — Phase 6 | Ensures 6 separate observer instances; FLYT-03 test count must reflect 7 total |

---

## Open Questions

1. **Playwright test scope: add to package.json or use root-level installation?**
   - What we know: `.playwright-cli/` and `.playwright-mcp/` exist in the project root; Playwright is NOT in `conjure-landing-page/package.json`
   - What's unclear: Whether a Playwright test should be added to the `conjure-landing-page` package (adds a devDependency) or whether the planner should treat the scroll-spy criterion as manual-only.
   - Recommendation: If the planner wants automated scroll-spy coverage, add `@playwright/test` as a devDependency and add a `playwright.config.ts` targeting `localhost:3000`. If the project context discourages new dependencies for a QA phase, treat it as manual-only. The manual checklist alone satisfies the Phase 7 success criteria.

2. **GLAS-05 test fix: narrow assertion or change hover color?**
   - What we know: Line 194 `inset 0 1px 0 oklch(0.98 0 0 / 0.22)` in the hover box-shadow causes the false positive. Neither approach is wrong.
   - What's unclear: Whether the planner wants to modify `globals.css` (change `0.22` to `0.18` in hover shadow) or modify only the test.
   - Recommendation: Fix the test assertion (narrow to border-top-color block). Avoid changing design tokens for test-only reasons.

3. **Physical iOS Safari device availability**
   - What we know: The success criteria explicitly require physical iOS Safari device testing.
   - What's unclear: Whether the developer has access to a physical iOS device running Safari.
   - Recommendation: The plan should include this as a mandatory human checkpoint, not a skippable step. If no physical device is available, BrowserStack (remote device lab) is an alternative but adds time and cost.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^3.2.4 |
| Config file | `conjure-landing-page/vitest.config.ts` |
| Quick run command | `cd conjure-landing-page && npm run test` |
| Full suite command | `cd conjure-landing-page && npm run test` (no separate watch-mode gate) |

### Phase Requirements → Test Map

This is a verification phase with no new requirement IDs. The phase covers GLAS-01–05 and FLYT-01–07 from a QA/production angle. The test map reflects existing coverage + Phase 7 additions:

| Req ID | Behavior | Test Type | Automated Command | Status Before Phase 7 |
|--------|----------|-----------|-------------------|-----------------------|
| GLAS-01 | Noise texture on glass surface | unit (CSS scan) | `npm run test` | GREEN |
| GLAS-02 | Hardcoded `-webkit-backdrop-filter: blur(18px)` | unit (CSS scan) | `npm run test` | GREEN |
| GLAS-03 | Header webkit blur hardcoded | unit (CSS scan) | `npm run test` | GREEN |
| GLAS-04 | `@supports` fallback block present | unit (CSS scan) | `npm run test` | GREEN |
| GLAS-05 | border-top-color 0.32 | unit (CSS scan) | `npm run test` | RED (false positive) — fix in Wave 0 |
| GLAS-01–05 production | Glass visible on Safari desktop | manual | — | Phase 7 Wave 1 checkpoint |
| FLYT-01 | No FadeInWrapper transform ancestor | unit (page.tsx scan) | `npm run test` | GREEN |
| FLYT-02 | Sticky panel in right column | unit (component render) | `npm run test` | GREEN |
| FLYT-03 | IntersectionObserver × N per feature row | unit (constructor count) | `npm run test` | RED (count = 7 not 6) — fix in Wave 0 |
| FLYT-04 | All 6 images in DOM, active controls opacity | unit (component render) | `npm run test` | GREEN |
| FLYT-05 | Active row text-primary class | unit (component render) | `npm run test` | GREEN |
| FLYT-06 | Browser mockup chrome rendered | unit (component render) | `npm run test` | GREEN |
| FLYT-07 | Mobile stacked layout | unit (component render) | `npm run test` | GREEN |
| FLYT-02/03 fast-scroll | Correct feature activates on fast scroll | integration (Playwright or manual) | `playwright test` or manual | Not yet automated |
| iOS Safari sticky | Sticky panel correct on physical device | manual | — | Phase 7 Wave 1 checkpoint |
| WCAG AA contrast | `.glass-surface` text ≥ 4.5:1 | manual (DevTools/webaim) | — | Phase 7 Wave 1 checkpoint |
| PricingSection toggle | Annual pricing toggle works | unit (component render) | `npm run test` | RED (wrong role query) — fix in Wave 0 |

### Sampling Rate

- **Per Wave 0 task:** `cd conjure-landing-page && npm run test` — must be clean (0 failures) before Wave 1 begins
- **Phase gate:** Full suite green (`Test Files 0 failed`) before manual Wave 1 checklist

### Wave 0 Gaps

- [ ] Fix `src/lib/glass.test.ts:54` — narrow GLAS-05 assertion to avoid `0.22` false positive from hover shadow
- [ ] Fix `src/components/sections/__tests__/FeaturesSection.test.tsx:39` — update FLYT-03 count from 6 to 7
- [ ] Fix `src/components/sections/__tests__/PricingSection.test.tsx:44` — change `getByRole('button')` to `getByRole('switch')`
- [ ] (Optional) Add Playwright config + one scroll-spy smoke test — requires `@playwright/test` devDependency

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection of `conjure-landing-page/src/app/globals.css` — glass CSS implementation
- Direct code inspection of `conjure-landing-page/src/components/sections/FeaturesSection.tsx` — IntersectionObserver structure
- Direct code inspection of `conjure-landing-page/src/components/sections/PricingSection.tsx` — toggle role attribute
- Direct inspection of failing Vitest output — 3 failures with exact error messages
- `.planning/phases/05-glass-and-sticky-prerequisites/05-02-SUMMARY.md` — implementation decisions
- `.planning/phases/06-scroll-panel/06-02-SUMMARY.md` — Phase 6 implementation decisions + deferred items

### Secondary (MEDIUM confidence)

- MDN Web Docs: `position: sticky` — overflow and transform containing block requirements
- WCAG 2.1 Success Criterion 1.4.3 — 4.5:1 minimum contrast for normal text (AA level)
- WebKit known behavior: CSS custom properties rejected on `-webkit-`-prefixed properties — documented in Phase 5 decisions

### Tertiary (LOW confidence)

- iOS Safari sticky scroll edge cases with `-webkit-overflow-scrolling: touch` — historical issue, less relevant for modern iOS 15+ targets

---

## Metadata

**Confidence breakdown:**
- Pre-existing failures: HIGH — confirmed by direct test run + code inspection
- Standard stack: HIGH — all tools already installed and configured
- Architecture: HIGH — QA phase structure is well-established; Safari quirks are documented from Phase 5 decisions
- Pitfalls: HIGH for test precision issues (direct inspection); MEDIUM for iOS Safari rendering edge cases (browser-specific, must verify on device)
- WCAG contrast: MEDIUM — token math suggests pass, but rendered orb gradient requires visual verification

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable CSS specs; browser rendering for backdrop-filter is stable in iOS 15+)
