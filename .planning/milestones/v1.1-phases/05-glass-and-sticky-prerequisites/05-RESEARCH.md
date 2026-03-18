# Phase 5: Glass and Sticky Prerequisites - Research

**Researched:** 2026-03-13
**Domain:** CSS backdrop-filter, Safari WebKit quirks, noise texture generation, CSS position:sticky constraints
**Confidence:** HIGH

## Summary

Phase 5 resolves two independent structural bugs before Phase 6 can build the sticky scroll panel. Bug one: `.glass-surface` produces no visible glass effect because (a) Safari silently drops CSS custom properties inside `-webkit-backdrop-filter` and (b) the near-black background has no colour variance for `blur()` to average, so even when the filter fires it renders identically to the background. Bug two: `FadeInWrapper` wraps `FeaturesSection` with a `transform: translateY()` ancestor, which creates a new CSS containing block; any `position: sticky` element inside it will pin to the transformed box rather than the viewport scroll container.

Both bugs are well-understood. The fix for each is a narrow, surgical CSS or JSX change. No new library dependencies are required for this phase. The noise texture is generated with an inline SVG `feTurbulence` data-URI on a pseudo-element — no PNG asset, no HTTP request. The Safari webkit-prefix fix hardcodes the blur value (`blur(18px)`) directly on the `-webkit-backdrop-filter` property instead of reading from a CSS variable. The sticky fix is a one-line deletion in `page.tsx`.

**Primary recommendation:** Apply all six requirements in a single plan wave — the changes are co-located (globals.css for glass, page.tsx for sticky) and individually tiny; splitting across waves adds ceremony without safety benefit.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GLAS-01 | Noise/grain texture added behind `.glass-surface` cards so `backdrop-filter: blur()` has visual pixels to process on dark background | SVG feTurbulence pseudo-element pattern — no asset needed |
| GLAS-02 | `.glass-surface` patched with hardcoded `-webkit-backdrop-filter: blur(18px)` — CSS vars silently rejected by Safari on webkit-prefixed property | Confirmed: Safari 9–17.6 require `-webkit-` prefix AND reject CSS variables on that prefixed property |
| GLAS-03 | `Header.tsx` glass effect patched with same hardcoded webkit blur | Same Safari bug, same fix — Header uses inline `style` so fix lives in component, not CSS |
| GLAS-04 | `@supports (backdrop-filter: blur(1px))` fallback block provides solid background for non-supporting browsers | Standard `@supports` pattern; MDN baseline 2024 shows ~97% global coverage, legacy tail still needs fallback |
| GLAS-05 | `.glass-surface` CSS tuned — `blur(16px) saturate(180%)`, border-top opacity `0.32`, inner and outer box shadows | Pure CSS values change — no API research needed |
| FLYT-01 | `FadeInWrapper` removed from around `FeaturesSection` in `page.tsx` — transform ancestor breaks `position: sticky` | Confirmed CSS spec behaviour: any `transform` on an ancestor creates a new containing block, disabling sticky relative to viewport |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | — | All changes are CSS + one JSX edit | Phase uses no new dependencies |

### Noise Texture: Inline SVG feTurbulence
No library. The SVG filter is embedded as a `background-image: url("data:image/svg+xml,...")` on a `::before` pseudo-element. This is the approach recommended by CSS-Tricks ("Grainy Gradients") and ibelick.com — zero HTTP requests, scales to any size, seamless tile.

**Installation:** None required. All existing dependencies (Tailwind v4, Next.js 16, Vitest) remain unchanged.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG feTurbulence inline | Tiled noise PNG asset | PNG adds an HTTP request and requires an asset file; SVG is code-only and equally performant |
| SVG feTurbulence inline | CSS `body::before` shared noise layer | Shared layer blurs with the body pseudo-element already in use for ambient glow; per-card pseudo-element isolates the effect |
| Hardcode webkit blur | Remove the webkit prefix | Cannot remove: Safari 9–17.6 require `-webkit-backdrop-filter`; without it those versions show no blur |

---

## Architecture Patterns

### Pattern 1: SVG Noise via Pseudo-Element (GLAS-01)

**What:** A `::before` pseudo-element on the section containing `.glass-surface` cards (or directly on `.glass-surface` itself) renders a tiled SVG feTurbulence noise texture at low opacity. This gives `backdrop-filter: blur()` real pixel variance to process.

**When to use:** Any time backdrop-filter renders invisible against a near-uniform dark background.

**Placement decision:** Apply the noise at the `.glass-surface` element level rather than at the section ancestor. This is self-contained, works regardless of what wraps the component, and avoids z-index fights with the ambient body glow.

**Example:**
```css
/* Source: ibelick.com/blog/create-grainy-backgrounds-with-css — adapted */
.glass-surface {
  position: relative;
  overflow: hidden;
}
.glass-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px;
  opacity: 0.04;
  z-index: 0;
}
/* All card content must be z-index: 1 or higher */
```

**Why opacity 0.04:** Dark-on-dark noise. Too high and the card reads as static; too low and it does nothing for the blur. Tune between 0.03–0.06 to taste.

**CRITICAL:** `.glass-surface` children must have `position: relative; z-index: 1` or the pseudo-element will paint on top of text.

### Pattern 2: Safari Webkit Blur Hardcode (GLAS-02, GLAS-03)

**What:** Safari 9–17.6 require the `-webkit-backdrop-filter` prefix AND silently reject CSS custom properties on that prefixed property. The fix is to write the literal blur value instead of `var(--glass-blur)`.

**Confirmed by:** GitHub issue mdn/browser-compat-data #25914 (February 2025) — reporter and multiple commenters confirmed CSS variables fail on `-webkit-backdrop-filter` in Safari without the "CSS Unprefixed Backdrop Filter" developer flag enabled. Maintainer's contradicting test was on Safari 18.3 with flags enabled — not production Safari behaviour.

**In globals.css (GLAS-02):**
```css
/* BEFORE (broken in Safari): */
-webkit-backdrop-filter: blur(var(--glass-blur));

/* AFTER (fixed): */
-webkit-backdrop-filter: blur(18px) saturate(180%);
backdrop-filter: blur(16px) saturate(180%);
```

Note: The `backdrop-filter` (unprefixed) CAN use CSS variables and will work in Chrome/Firefox. Only the webkit-prefixed version needs the hardcoded value.

**In Header.tsx (GLAS-03):** The header applies glass via an inline `style` prop:
```tsx
// BEFORE (broken in Safari):
WebkitBackdropFilter: 'blur(var(--glass-blur))',

// AFTER (fixed):
WebkitBackdropFilter: 'blur(18px)',
backdropFilter: 'blur(18px) saturate(180%)',
```

React's `style` prop does not support CSS custom property syntax inside function call arguments — so this was always going to fail in any browser. Hardcode for both properties in the Header.

### Pattern 3: `@supports` Fallback (GLAS-04)

**What:** Browsers that don't support `backdrop-filter` (or have it disabled) get a solid background so glass text remains legible. MDN marks `backdrop-filter` as Baseline 2024 (September 2024), but ~3% of users are on legacy browsers.

**Standard pattern:**
```css
/* Base: solid fallback (legacy browsers see only this) */
.glass-surface {
  background: oklch(0.14 0 0 / 0.90);
}

/* Enhancement: glass for supporting browsers */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-surface {
    background: linear-gradient(
      145deg,
      oklch(0.20 0 0 / 0.55) 0%,
      oklch(0.10 0 0 / 0.35) 100%
    );
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
  }
}
```

**Note on test strategy:** jsdom (used by Vitest) does not implement `@supports` or `backdrop-filter`. Fallback tests must assert that a solid background rule exists in the CSS source, not that it renders visually. The Vitest test for GLAS-04 should parse globals.css content and confirm the fallback selector is present.

### Pattern 4: FadeInWrapper Removal (FLYT-01)

**What:** The CSS specification states that any ancestor with `transform`, `perspective`, `filter`, `contain`, `will-change: transform`, or `translate` properties creates a new containing block. `position: sticky` pins to the nearest scrollable ancestor, but the containing block calculation is distorted by the transform wrapper — the sticky element behaves as if its scroll container is the transformed box, not the viewport.

**Current state:** `FadeInWrapper` renders `<div class="fade-in-section">` with `.fade-in-section { transform: translateY(1rem); }` until the `.visible` class fires. Even after `.visible` is added, the div still has `transition: transform 0.5s ease` in place. This means the element carries a transform for the transition duration.

**Fix:** Remove the `<FadeInWrapper>` wrapper from around `FeaturesSection` in `page.tsx`:
```tsx
// BEFORE:
<FadeInWrapper>
  <FeaturesSection />
</FadeInWrapper>

// AFTER:
<FeaturesSection />
```

`FeaturesSection` itself does not use fade-in — the fade-in animation is a wrapper concern. Removing the wrapper does not affect `FeaturesSection` rendering.

**Scope:** Only the `FeaturesSection` wrapper is removed. Other `FadeInWrapper` usages (`HowItWorksSection`, `PricingSection`, `FAQSection`, `WaitlistSection`) are not changed in Phase 5 — those sections don't use `position: sticky`.

### Anti-Patterns to Avoid

- **Setting `overflow: hidden` on `.glass-surface`'s parent to clip the noise pseudo-element:** If the parent clips the blur, it also clips the frosted effect. Set overflow on the glass element itself only when necessary.
- **Applying `will-change: transform` as a performance hint on `.glass-surface`:** `will-change: transform` promotes the element to a compositing layer and can prevent backdrop-filter from seeing content behind it on some browsers. Avoid it on glass elements.
- **Using `isolation: isolate` on `.glass-surface`:** Creates a new stacking context, which can make backdrop-filter sample only the isolate context background rather than content behind the element.
- **Applying CSS variables inside `-webkit-backdrop-filter`:** Confirmed broken in Safari without developer flags. Always hardcode the webkit-prefixed value.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Noise texture | Custom canvas-generated PNG at runtime | SVG feTurbulence inline data-URI | Canvas adds JS complexity; SVG is CSS-only, cached by browser, zero bytes transferred |
| Feature detection | JS check for `CSS.supports('backdrop-filter','blur(1px)')` | `@supports` CSS rule | CSS feature queries run before paint; JS detection requires a render cycle and extra code |

---

## Common Pitfalls

### Pitfall 1: SVG Noise Covers Card Text
**What goes wrong:** The `::before` pseudo-element paints over card title and body text, making them hard to read.
**Why it happens:** Pseudo-element is `position: absolute; inset: 0; z-index: 0` but card content has no explicit z-index, so stacking order is document order — pseudo-element wins if it appears after content in the paint order.
**How to avoid:** Any direct child of `.glass-surface` that holds text or interactive content must have `position: relative; z-index: 1`. The existing FeaturesSection cards already have `<div class="relative z-10 p-7 ...">` — confirm this survives the CSS update.
**Warning signs:** Card text is slightly washed out or has a grainy tint.

### Pitfall 2: `@supports` Block Specificity Conflict
**What goes wrong:** The fallback solid background is overridden by a more-specific Tailwind utility class applied to `.glass-surface` elements in JSX.
**Why it happens:** `@supports` wrapping does not increase specificity. A Tailwind `bg-*` class can override the fallback.
**How to avoid:** Define the base fallback background directly on `.glass-surface` (not inside `@supports`). Move only the glass enhancement into `@supports`. Ensure no `bg-*` class is applied alongside `.glass-surface` in JSX.
**Warning signs:** Legacy browser test shows transparent card against background.

### Pitfall 3: Header Inline Style Overrides CSS
**What goes wrong:** The Header applies glass via an inline `style` prop only when `isScrolled` is true. Inline styles have higher specificity than stylesheet rules, so any `.glass-surface` CSS changes won't apply to the Header.
**Why it happens:** Header was built with inline style because the glass effect is conditional (only appears on scroll).
**How to avoid:** The Header fix must be applied in the inline style object in `Header.tsx`, not in globals.css. The `WebkitBackdropFilter` key in the style object must use hardcoded `blur(18px)`, not a CSS variable.
**Warning signs:** Chrome glass fix works but Header still shows flat background in Safari after scroll.

### Pitfall 4: Noise Texture Visible as Grain in Chrome
**What goes wrong:** The noise texture is too opaque (> 0.08 opacity) and creates a visible static-television effect rather than a subtle premium texture.
**Why it happens:** Dark backgrounds amplify texture contrast. The opacity values that look subtle on light backgrounds are too strong on near-black.
**How to avoid:** Target opacity 0.03–0.05 for the noise pseudo-element. Verify against the actual dark background at 1x and 2x display densities.
**Warning signs:** Cards look dirty or pixelated, especially in screenshots.

### Pitfall 5: FadeInWrapper Removal Breaks Other Sections
**What goes wrong:** Removing `FadeInWrapper` from all sections by mistake causes every section to appear immediately without fade animation.
**Why it happens:** The requirement says to remove only the `FeaturesSection` wrapper.
**How to avoid:** Edit only the `FeaturesSection` block in `page.tsx`. The other five `FadeInWrapper` usages remain. Verify after editing that `HowItWorksSection`, `PricingSection`, `FAQSection`, and `WaitlistSection` still have their wrappers.
**Warning signs:** All page sections animate immediately on load with no fade-in delay.

---

## Code Examples

### Complete `.glass-surface` Target State (globals.css)

```css
/* Source: ibelick.com pattern + Safari webkit fix from mdn/browser-compat-data#25914 */

/* ─── Glass Surface Utility ────────────────────────── */

/* Fallback: solid background for browsers without backdrop-filter */
.glass-surface {
  position: relative;
  overflow: hidden;
  background: oklch(0.14 0 0 / 0.90); /* solid fallback */
  border: 1px solid oklch(0.98 0 0 / 0.12);
  border-top-color: oklch(0.98 0 0 / 0.32);
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

/* Noise layer — gives blur() real pixels to process on dark background */
.glass-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px;
  opacity: 0.04;
  z-index: 0;
}

/* Enhancement: glass effect for supporting browsers */
@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass-surface {
    background: linear-gradient(
      145deg,
      oklch(0.20 0 0 / 0.55) 0%,
      oklch(0.10 0 0 / 0.35) 100%
    );
    /* Unprefixed: CSS variables work here in Chrome/Firefox */
    backdrop-filter: blur(16px) saturate(180%);
    /* Webkit-prefixed: MUST hardcode — Safari rejects CSS vars on this property */
    -webkit-backdrop-filter: blur(18px) saturate(180%);
  }
}

.glass-surface:hover {
  box-shadow:
    0 0 32px rgba(168, 250, 138, 0.25),
    0 0 8px rgba(168, 250, 138, 0.15),
    inset 0 1px 0 oklch(0.98 0 0 / 0.08);
  border-color: oklch(0.92 0.18 142 / 0.25);
  border-top-color: oklch(0.92 0.18 142 / 0.35);
}
```

### Header.tsx Inline Style Fix (GLAS-03)

```tsx
/* Source: existing Header.tsx — webkit fix applied to isScrolled style */
style={
  isScrolled
    ? {
        backgroundColor: 'oklch(0.14 0 0 / 0.45)',
        /* Unprefixed: standard Chrome/Firefox path */
        backdropFilter: 'blur(16px) saturate(180%)',
        /* Webkit-prefixed: hardcoded — CSS vars rejected by Safari on this property */
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: '1px solid oklch(0.98 0 0 / 0.12)',
      }
    : {}
}
```

### page.tsx FadeInWrapper Removal (FLYT-01)

```tsx
/* BEFORE — transform ancestor blocks position:sticky */
<FadeInWrapper>
  <FeaturesSection />
</FadeInWrapper>

/* AFTER — FeaturesSection renders directly, no transform ancestor */
<FeaturesSection />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS variables in `-webkit-backdrop-filter` | Hardcoded literal values only on webkit prefix | Always broken, documented Feb 2025 | Safari glass requires explicit blur values |
| Flat dark card backgrounds | SVG feTurbulence noise + backdrop-filter | Technique popularized ~2022 | Dark glass cards with visible depth |
| Per-browser JS feature detection | `@supports` CSS queries | CSS3, well-supported | No JS required for progressive enhancement |
| `backdrop-filter` prefixed-only | Unprefixed `backdrop-filter` reaches Baseline | September 2024 | ~97% global coverage; webkit prefix still needed for ~3% |

**Deprecated/outdated:**
- `-webkit-backdrop-filter: blur(var(--glass-blur))`: Never worked in production Safari; confirmed broken in mdn/browser-compat-data#25914
- `transform: translateY()` on FadeInWrapper with sticky descendants: Must be removed before any sticky layout is written

---

## Open Questions

1. **Noise opacity tuning**
   - What we know: 0.04 opacity on dark backgrounds is a safe starting point from ibelick.com patterns
   - What's unclear: The exact value that looks "premium" vs "grainy" on this specific background (`oklch(0.04 0 0)`) requires visual inspection
   - Recommendation: Start at 0.04. The planner should include a tuning step in the task list with visual verification criterion

2. **FadeInWrapper on other sections after Phase 6**
   - What we know: `HowItWorksSection`, `PricingSection`, `FAQSection`, and `WaitlistSection` retain their FadeInWrapper in Phase 5
   - What's unclear: If Phase 6 adds sticky to any other section, those wrappers will need removal too
   - Recommendation: Phase 5 removes only the `FeaturesSection` wrapper. Phase 6 planning should check its sticky sections for the same issue.

3. **Safari desktop visual verification**
   - What we know: The webkit blur fix is confirmed correct per spec and community reports
   - What's unclear: Cannot be Vitest-verified (jsdom does not render CSS filters)
   - Recommendation: Phase 7 handles the Safari verification gate. Phase 5 success criteria for glass blur is manual inspection on Safari desktop — plan tasks should note this explicitly.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + @testing-library/react 16.3.2 |
| Config file | `conjure-landing-page/vitest.config.ts` |
| Quick run command | `cd conjure-landing-page && npx vitest run` |
| Full suite command | `cd conjure-landing-page && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GLAS-01 | `.glass-surface::before` block exists in globals.css with SVG noise background-image | unit (CSS source parse) | `cd conjure-landing-page && npx vitest run src/styles/glass.test.ts` | Wave 0 |
| GLAS-02 | `-webkit-backdrop-filter` in globals.css uses hardcoded `blur(18px)` not `var(--glass-blur)` | unit (CSS source parse) | same | Wave 0 |
| GLAS-03 | Header.tsx `WebkitBackdropFilter` value is `blur(18px)` not a CSS variable | unit (component render) | `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/Header.test.tsx` | Wave 0 |
| GLAS-04 | `@supports` block exists in globals.css; base `.glass-surface` has solid opaque background | unit (CSS source parse) | `cd conjure-landing-page && npx vitest run src/styles/glass.test.ts` | Wave 0 |
| GLAS-05 | `.glass-surface` CSS contains `blur(16px) saturate(180%)` and border-top opacity value | unit (CSS source parse) | same | Wave 0 |
| FLYT-01 | `FeaturesSection` is NOT wrapped in `FadeInWrapper` in page.tsx | unit (source text assert) | `cd conjure-landing-page && npx vitest run src/app/page.test.tsx` | Wave 0 |

**Note on CSS testing strategy:** jsdom does not evaluate CSS files or apply stylesheets. Tests for GLAS-01 through GLAS-05 must read `globals.css` as a text file and assert string patterns (e.g., `expect(css).toContain('-webkit-backdrop-filter: blur(18px)')`) — not use computed styles. This is a valid, deterministic approach for CSS source validation.

### Sampling Rate
- **Per task commit:** `cd conjure-landing-page && npx vitest run`
- **Per wave merge:** `cd conjure-landing-page && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `conjure-landing-page/src/styles/glass.test.ts` — covers GLAS-01, GLAS-02, GLAS-04, GLAS-05 (reads globals.css as text, asserts patterns)
- [ ] `conjure-landing-page/src/components/sections/__tests__/Header.test.tsx` — covers GLAS-03 (renders Header, checks WebkitBackdropFilter value in scrolled state)
- [ ] `conjure-landing-page/src/app/page.test.tsx` — covers FLYT-01 (reads page.tsx as text, asserts FeaturesSection is not adjacent to FadeInWrapper)

**Note:** The glass.test.ts file path puts CSS tests in a `src/styles/` directory that does not yet exist. Alternative is to co-locate at `src/lib/glass.test.ts` — planner should choose one canonical location.

---

## Sources

### Primary (HIGH confidence)
- mdn/browser-compat-data GitHub issue #25914 — CSS variables rejected by Safari on `-webkit-backdrop-filter`; confirmed by multiple reporters (Feb 2025)
- caniuse.com/css-backdrop-filter — Safari support timeline: prefixed required 9–17.6, Baseline Sept 2024
- ibelick.com/blog/create-grainy-backgrounds-with-css — SVG feTurbulence pseudo-element pattern with exact CSS
- CSS-Tricks "Grainy Gradients" — SVG inline data-URI technique with contrast/brightness amplification
- BrowserStack — transform ancestor breaks position:sticky confirmed CSS spec behaviour

### Secondary (MEDIUM confidence)
- WebSearch: `@supports (backdrop-filter: blur(1px))` fallback pattern — consistent across multiple CSS reference sites
- WebSearch: position:sticky transform ancestor fix — consistent across MDN, LogRocket, Squash.io

### Tertiary (LOW confidence)
- caniuse.com "2 known bugs" for backdrop-filter — bug detail text not accessible, assumed to include CSS variable issue based on primary source corroboration

---

## Metadata

**Confidence breakdown:**
- Safari CSS variable rejection on webkit-prefix: HIGH — confirmed by mdn/browser-compat-data community report with explicit testing
- SVG noise texture technique: HIGH — verified against ibelick.com and CSS-Tricks primary sources
- @supports fallback pattern: HIGH — MDN and multiple references consistent
- transform/sticky interaction: HIGH — CSS spec-defined behaviour, multiple sources consistent
- Noise opacity tuning values: LOW — 0.04 is a starting point, exact value requires visual verification

**Research date:** 2026-03-13
**Valid until:** 2026-09-13 (stable CSS spec area; Safari 19 could resolve the CSS variable issue but would not break the hardcoded fix)
