# Phase 6: Scroll Panel - Research

**Researched:** 2026-03-13
**Domain:** IntersectionObserver scroll-sync, position:sticky two-column layout, Next.js image crossfade, browser mockup chrome, mobile responsive collapse
**Confidence:** HIGH

## Summary

Phase 6 rewrites `FeaturesSection` from a static card grid into a two-column sticky layout. The left column contains six scrollable feature rows; the right column contains a browser-mockup panel that sticks in the viewport while the left column scrolls. An `IntersectionObserver` detects which feature row is centered in the viewport and drives two state updates: the active index (which highlights that row in mint) and the visible screenshot (which crossfades to the matching image).

The implementation is self-contained in a single React client component. No additional CSS utility classes are needed beyond what Phase 5 delivered. The `react-intersection-observer` library wraps the native IO API with a React-idiomatic `useInView` hook and a ~1.15kB bundle — the roadmap decision to use it stands. All six screenshots are pre-rendered in the DOM at all times; crossfade is achieved by toggling `opacity` (not swapping `src`), avoiding both layout shift and a blank frame. Browser mockup chrome is hand-rolled in ~20 lines of Tailwind utility classes — no new dependency required.

The FadeInWrapper wrapping `FeaturesSection` was removed in Phase 5 (FLYT-01). That removal is the single structural prerequisite for `position: sticky` to work correctly. No `overflow: hidden` or `transform` ancestor should exist between `FeaturesSection` and the document scroll container after Phase 5 completes.

**Primary recommendation:** Rewrite `FeaturesSection` as a single `'use client'` component with `useInView` per feature row, an `activeIndex` state, and inline Tailwind utilities for the two-column/mobile-stack responsive layout.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FLYT-02 | Two-column layout: scrolling feature rows (left), sticky browser-mockup panel (right) | CSS Grid or Flex with `sticky` on right column; scroll container is `<section>` itself at full min-height |
| FLYT-03 | `IntersectionObserver` detects which feature step is in viewport center, updates `activeIndex` 0–5; guard against initial mount fire; disconnect cleanup on unmount | `useInView` with `rootMargin: "-40% 0px -40% 0px"` per row; `react-intersection-observer` fires after real visibility change (v10 suppresses initial false emission) |
| FLYT-04 | Screenshot crossfades to match active feature — all 6 images pre-rendered, opacity toggling | Absolute-positioned `next/image` stack inside mockup panel; `opacity-0`/`opacity-100` toggled on `activeIndex` match; `transition-opacity duration-400` |
| FLYT-05 | Active feature row highlighted mint; inactive rows muted; state updates on scroll without user interaction | Conditional Tailwind classes on each row based on `activeIndex === index` |
| FLYT-06 | Browser mockup chrome (title bar, traffic lights, URL bar) wraps screenshot panel | Hand-rolled HTML/Tailwind — ~20 lines, no external library |
| FLYT-07 | Mobile (below `md` breakpoint): stacked single-column, description above screenshot, no sticky panel | Tailwind `md:` prefix; mobile layout hides sticky panel, renders per-row `<Image>` below each description |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-intersection-observer | ^10.0.3 | `useInView` hook per feature row to detect viewport center | Project roadmap decision; wraps native IO API with React idioms; ~1.15kB gzip; v10 suppresses spurious initial mount fires |
| next/image | built-in (Next 16) | Render all 6 feature screenshots with optimization | Already used in current FeaturesSection; handles WebP delivery, sizing, lazy load |
| Tailwind v4 | built-in | Responsive layout, opacity transitions, accent color classes | Project standard — CSS-first, no config file |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React `useState` | built-in | Track `activeIndex` (0–5) | Single piece of UI state; no need for reducer |
| React `useCallback` | built-in | Stable handler passed to useInView `onChange` callbacks | Avoid unnecessary observer re-registrations on re-render |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-intersection-observer | Raw `useEffect` + `new IntersectionObserver()` | Identical behavior but more boilerplate; `react-intersection-observer` handles observer pooling and cleanup automatically |
| react-intersection-observer | `framer-motion` `useInView` | Framer Motion is a v2 dependency (CONV-01); not in scope for v1.1 |
| Opacity-toggle crossfade | `<Image>` src swap | Src swap causes HTTP re-fetch or cache lookup + decode; opacity toggle is purely CSS, no network round-trip, no layout shift |
| Hand-rolled browser chrome | DaisyUI `mockup-browser` | DaisyUI adds ~40kB; hand-rolled is ~20 Tailwind utility classes with no new dependency |

**Installation:**
```bash
npm install react-intersection-observer
```

---

## Architecture Patterns

### Recommended Component Structure
```
src/components/sections/
├── FeaturesSection.tsx       # 'use client' — full rewrite
└── __tests__/
    └── FeaturesSection.test.tsx  # Vitest tests covering FLYT-02 through FLYT-07
```

The `FeaturesSection` component will be completely replaced. The current implementation is a Server Component returning a static `<ul>` grid. The new implementation requires `'use client'` for `useState` and `useInView`.

### Pattern 1: useInView per Feature Row (FLYT-03)

**What:** Each feature row registers its own `useInView` hook with a center-targeting `rootMargin`. When a row enters the center zone, its `onChange` callback fires `setActiveIndex(index)`.

**When to use:** Any time you need to detect which item in a vertical list is currently "in view" — scroll spy, table of contents, step indicators.

**rootMargin for viewport-center detection:**
- `"-40% 0px -40% 0px"` creates a detection band in the center 20% of the viewport height
- When a feature row enters this band, it becomes the active row
- The band is narrow enough that only one row is active at a time on typical screen heights (each row is ~200-300px tall)

**v10 initial-fire behavior:** `react-intersection-observer` v10 suppresses the initial `inView === false` emission for `onChange` callbacks. Rows that are not in view on mount do NOT fire a false-entry, so `activeIndex` stays at `0` (the first row) on initial load without a guard needed in the onChange handler. However, the first row WILL fire `inView === true` once it actually enters the center band (may not happen at initial scroll position). Set `activeIndex` initial state to `0` and do not reset it unless a row positively enters.

**Example:**
```typescript
// Source: https://github.com/thebuilder/react-intersection-observer
import { useInView } from 'react-intersection-observer'

// Per feature row — index is the row's position (0–5)
function FeatureRow({ feature, index, activeIndex, onActivate }: FeatureRowProps) {
  const { ref } = useInView({
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0,
    onChange: (inView) => {
      if (inView) onActivate(index)
    },
  })

  const isActive = activeIndex === index

  return (
    <div ref={ref} className={isActive ? 'text-primary' : 'text-muted-foreground'}>
      {/* ... */}
    </div>
  )
}
```

**Cleanup:** `react-intersection-observer` handles `observer.disconnect()` internally when the ref element unmounts. No manual cleanup needed.

### Pattern 2: Sticky Two-Column Layout (FLYT-02)

**What:** A CSS Grid (or Flex) container with two columns. The left column contains all 6 feature rows and is the natural scroll flow. The right column has `position: sticky` and a `top` value that centers the panel in the viewport.

**The sticky requirement:** For `position: sticky` to work, the scroll container must be the document body (or a scrolling ancestor with defined height). After Phase 5 removes `FadeInWrapper`, no `transform` or `overflow: hidden` ancestor should exist between `FeaturesSection` and the scroll container.

**Height requirement:** The sticky element's scroll container (the `<section>`) must be taller than the sticky element. Set `min-height` on the section to ensure there is enough scroll travel for the right panel to stay visible throughout all 6 rows.

**Key CSS constraints for sticky to work:**
- No `overflow: hidden` on any ancestor of the sticky element
- No `transform` on any ancestor (Phase 5 prerequisite — FLYT-01 done)
- `top` value must be set on the sticky element (not just `position: sticky`)
- The parent of the sticky element must not have a fixed height shorter than the sticky element

**Example structure:**
```typescript
// Outer section — natural height from left column content
<section className="py-24 px-6 max-w-6xl mx-auto">
  <h2>...</h2>
  {/* Two-column grid — only visible on md+ */}
  <div className="hidden md:grid md:grid-cols-2 md:gap-16 md:items-start">
    {/* Left: scrollable feature rows */}
    <div className="flex flex-col gap-24">
      {FEATURE_LIST.map((feature, i) => (
        <FeatureRow key={feature.key} ... />
      ))}
    </div>
    {/* Right: sticky panel */}
    <div className="sticky top-24">
      <BrowserMockup activeIndex={activeIndex} />
    </div>
  </div>
  {/* Mobile: stacked single-column */}
  <div className="md:hidden flex flex-col gap-16">
    {FEATURE_LIST.map(...)}
  </div>
</section>
```

### Pattern 3: Opacity-Toggle Crossfade (FLYT-04)

**What:** All 6 `next/image` components are rendered inside the mockup panel at all times. Each has `position: absolute` and `inset: 0`. The active image gets `opacity-100`; all others get `opacity-0`. CSS `transition-opacity` handles the fade.

**Why this approach over src swap:**
- No network request or cache lookup on swap
- No blank-frame between images (both exist in DOM simultaneously)
- No layout shift (all images are same-sized absolute positioned)
- All images can be `priority` loaded or properly lazy-loaded at initial page parse

**next/image configuration for this pattern:**
- Use `fill` prop on each image with a relative-positioned parent container
- Set `sizes` prop appropriately for the mockup panel width
- First image (`activeIndex === 0`) can set `priority` since it's visible on load
- Remaining 5 images do NOT set `priority` (avoid unnecessary preloads for images that aren't initially visible)

**Example:**
```typescript
// Inside BrowserMockup — relative container sized to match mockup interior
<div className="relative aspect-[16/10] overflow-hidden rounded-b-lg">
  {FEATURE_LIST.map((feature, i) => (
    <div
      key={feature.key}
      className={`absolute inset-0 transition-opacity duration-400 ${
        i === activeIndex ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={i !== activeIndex}
    >
      <Image
        src={feature.img}
        alt={feature.TITLE}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover object-top"
        priority={i === 0}
      />
    </div>
  ))}
</div>
```

### Pattern 4: Hand-Rolled Browser Mockup Chrome (FLYT-06)

**What:** A `<div>` container styled to look like a browser window: title bar with 3 traffic-light dots, URL bar with a fake URL, and the screenshot area below. No external library required.

**Dimensions:**
- Title bar height: ~32px
- Traffic lights: 10–12px circles, gap of 6px, margin-left ~12px, colors: red (`#FF5F56`), yellow (`#FFBD2E`), green (`#27C93F`)
- URL bar height: ~28px (inside or combined with title bar)
- Overall chrome uses the same `glass-surface` treatment as other cards OR a dark tone matching the dark brand

**Example structure:**
```typescript
function BrowserMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 h-8 bg-[oklch(0.12_0_0)] border-b border-border">
        {/* Traffic lights */}
        <span className="w-3 h-3 rounded-full bg-[#FF5F56]" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
        <span className="w-3 h-3 rounded-full bg-[#27C93F]" aria-hidden="true" />
        {/* URL bar */}
        <div className="flex-1 mx-3 h-5 rounded bg-[oklch(0.18_0_0)] flex items-center px-2">
          <span className="text-[10px] text-muted-foreground font-mono truncate">
            conjurestudio.app
          </span>
        </div>
      </div>
      {/* Screenshot area */}
      <div className="relative bg-background">
        {children}
      </div>
    </div>
  )
}
```

**Note:** Traffic light `aria-hidden="true"` on all three — decorative chrome, not interactive. No click handlers needed.

### Pattern 5: Mobile Collapse (FLYT-07)

**What:** Below the `md` breakpoint (768px), hide the two-column grid entirely. Render an alternative single-column layout where each feature appears as: description text above, followed by an `<Image>` below, in a vertical stack.

**Tailwind approach:**
- Two-column grid: `hidden md:grid ...`
- Mobile stack: `md:hidden flex flex-col gap-16`
- In the mobile stack, each item is a `<div>` with description then image — no `useInView` needed, no sticky panel

**Image sizing for mobile:** Each feature image in the mobile stack uses fixed width/height (not `fill`) matching the original aspect ratios from FEATURE_LIST (`w` and `h` props), rendered full-width with `className="w-full h-auto"`.

### Anti-Patterns to Avoid

- **Using `position: fixed` instead of `position: sticky`:** Fixed positioning removes the element from document flow entirely; sticky keeps it in flow and naturally limits scroll range to the parent container
- **Observing all 6 rows with a single observer instance and picking the "most visible":** Fragile — the "most visible" threshold calculation breaks on partial scrolls. One `useInView` per row with center-targeting `rootMargin` is simpler and correct
- **Setting `priority` on all 6 images:** Marks all 6 for preload; only the initially-visible image should be `priority`
- **Using `overflow: hidden` on the section container:** Breaks sticky on the right panel. Use `overflow: clip` if clipping is needed, or avoid it entirely
- **Storing activeIndex in a ref instead of state:** React won't re-render the crossfade images on ref change; use `useState`
- **Passing activeIndex down through page.tsx:** FeaturesSection is self-contained; its internal scroll state should not leak to the page

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IntersectionObserver lifecycle | Manual `useEffect` + observer refs + disconnect logic per row | `react-intersection-observer` `useInView` | Handles observer pooling, cleanup, and the v10 initial-mount suppression already |
| Image crossfade component | Custom image swap state machine | Opacity-toggle on pre-rendered `next/image` stack | No network round-trip, no blank frame, pure CSS |

**Key insight:** Both the "scroll detection" and "crossfade" problems look complex but are solved by simple, proven patterns. The entire component can be written in ~150 lines of TSX without any animation library.

---

## Common Pitfalls

### Pitfall 1: overflow:hidden Ancestor Breaks Sticky
**What goes wrong:** The right sticky panel fails to stick — it scrolls away with the content or collapses to a short height.
**Why it happens:** Any ancestor with `overflow: hidden`, `overflow: auto`, or `overflow: scroll` becomes the scroll container for the sticky element, not the viewport. The sticky panel then runs out of scroll travel immediately.
**How to avoid:** After writing the layout, inspect every parent element in DevTools. Use `overflow: clip` if clipping is required (clip does not create a scroll container). Specifically: do NOT add `overflow-hidden` to the `<section>`, the two-column grid `<div>`, or the left column `<div>`.
**Warning signs:** The panel appears to "stick" only for the first pixel of scroll, then disappears or snaps to bottom.

### Pitfall 2: rootMargin Percentage Units are Relative to Root, Not Element
**What goes wrong:** The active row fires at the wrong scroll position — too early or too late.
**Why it happens:** `rootMargin` percentages are relative to the root element's dimensions (the viewport), not the observed element's dimensions. `-40% 0px -40% 0px` always means 40% of viewport height from top and bottom, regardless of how tall the feature rows are.
**How to avoid:** At 900px viewport height, the center zone is 180px tall (20% of 900px). Feature rows taller than 180px will have the observer fire before the row is fully centered. Tune `rootMargin` values during development — `-35% 0px -45% 0px` biases the detection zone slightly above center, which feels more natural for content that enters from the bottom.
**Warning signs:** First or last feature rows never become active, or two rows appear active simultaneously on a short viewport.

### Pitfall 3: Initial activeIndex = 0 Never Confirmed by Observer
**What goes wrong:** The first feature row should be active on page load, but the observer never fires for it because it starts in view (and react-intersection-observer v10 suppresses the initial `false` emission — but the `true` emission still fires when the element enters the observation zone).
**Why it happens:** If the page loads with the Features section below the fold, none of the rows are in the center zone initially. When the user scrolls to the section, the first row enters the zone and fires `inView: true` correctly. However, if the Features section is near the top of the page, the first row may already be past the center zone before IntersectionObserver registers, and no `onChange` fires.
**How to avoid:** Initialize `activeIndex` to `0`. The first row will be highlighted by default. As the user scrolls, each subsequent row fires and updates the index. If the user scrolls up past the first row's center zone, it will fire again and reset to index 0.
**Warning signs:** No row appears highlighted on initial page load; the highlight only appears after scrolling.

### Pitfall 4: z-index Conflict Between Sticky Panel and Overlapping Elements
**What goes wrong:** The sticky panel disappears behind other content, or the ambient glow from `body::before` appears above the panel.
**Why it happens:** `position: sticky` elements create their own stacking context when combined with `z-index`. The `body > div` rule in `globals.css` sets `position: relative; z-index: 1` on the PostHog wrapper. The sticky panel needs its own `z-index` to layer correctly.
**How to avoid:** Add `z-index: 10` (or Tailwind `z-10`) to the sticky panel div. Since the ambient glow is on `body::before` with `z-index: 0`, and content is at `z-index: 1`, the sticky panel at `z-index: 10` will always render above the glow.
**Warning signs:** The sticky panel appears translucent or obscured when scrolling past sections with glow effects.

### Pitfall 5: next/image fill Requires Explicit Parent Dimensions
**What goes wrong:** Images render at 0×0 or produce a Next.js error: "Image with fill must have a parent with position: relative."
**Why it happens:** `next/image` with `fill` prop requires the parent container to have `position: relative` AND explicit dimensions (either via width/height, padding-bottom trick, or `aspect-ratio`).
**How to avoid:** The mockup screenshot area should be `position: relative` with an explicit `aspect-ratio` (e.g., `aspect-[16/10]`). Each image wrapper inside should be `absolute inset-0`.
**Warning signs:** Console error about parent dimensions; blank space where images should appear.

---

## Code Examples

Verified patterns from official sources:

### useInView with rootMargin for scroll-spy
```typescript
// Source: https://github.com/thebuilder/react-intersection-observer
import { useInView } from 'react-intersection-observer'

const { ref, inView } = useInView({
  rootMargin: '-40% 0px -40% 0px',
  threshold: 0,
})
// Attach ref to the element you want to observe
// inView is true when the element is in the center 20% of the viewport
```

### onChange variant (preferred for activeIndex pattern)
```typescript
// Source: https://github.com/thebuilder/react-intersection-observer
const { ref } = useInView({
  rootMargin: '-40% 0px -40% 0px',
  threshold: 0,
  onChange: (inView) => {
    if (inView) setActiveIndex(index)
  },
})
// No inView state needed in the component — side effect only
```

### Crossfade stack with next/image fill
```typescript
// Source: Next.js docs — next/image fill
// All images pre-rendered; opacity toggled by CSS class
<div className="relative aspect-[16/10]">
  {images.map((img, i) => (
    <div
      key={img.key}
      className={`absolute inset-0 transition-opacity duration-500 ${
        i === activeIndex ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Image src={img.src} alt={img.alt} fill sizes="50vw" className="object-cover" />
    </div>
  ))}
</div>
```

### IntersectionObserver mock for Vitest
```typescript
// Source: https://vitest.dev/api/vi.html (vi.stubGlobal pattern)
// In test setup or beforeEach block
const IntersectionObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}))
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.addEventListener('scroll', handler)` for scroll sync | `IntersectionObserver` | 2016 (IO), mainstream ~2019 | No scroll event overhead; fires only on element boundary crossing |
| `<img>` src swap for image transitions | All-in-DOM opacity toggle | Well-established pattern | Eliminates blank frames and network re-requests |
| Custom JS sticky calculation | `position: sticky` CSS | Stable since Safari 13 (2019) | Zero JavaScript for the sticky behavior itself |
| `transform` ancestor causing sticky breakage | Remove transform from ancestor (FLYT-01 done) | CSS spec, always true | Phase 5 prerequisite now complete |

**Deprecated/outdated:**
- Scroll event listeners for "active section" detection: replaced by IntersectionObserver in all modern implementations
- `position: -webkit-sticky`: still useful as a fallback prefix for older Safari, but all Safari versions that ship today support unprefixed `sticky`

---

## Open Questions

1. **Feature count: 5 or 6?**
   - What we know: `FEATURE_LIST` in current `FeaturesSection.tsx` contains 6 items. `content.ts` defines 6 features in `FEATURES`. REQUIREMENTS.md says "5 Feature cards" in Phase 2 success criteria but the `FEATURES` object has 6 keys.
   - What's unclear: The requirement says FEAT-01 through FEAT-05 (5 requirements) but the implemented FEATURE_LIST has 6 items including SHOT_EXTRACTION. FEAT-06 covers visual assets for "Moments 2–5". The 6th entry (shot_extraction) appears to have been added without a corresponding FEAT-XX requirement.
   - Recommendation: Use all 6 items from FEATURE_LIST as-is. The research requirement IDs (FLYT-02 through FLYT-07) do not specify a count. The planner should match the existing FEATURE_LIST without debate.

2. **Top offset for sticky panel**
   - What we know: The Header uses a sticky top offset. The sticky panel needs a `top` value that accounts for the Header height so it doesn't overlap.
   - What's unclear: Header height is not documented in research files. Typically ~64px for a standard header.
   - Recommendation: Use `top-20` (80px) or `top-24` (96px) Tailwind class on the sticky panel. Verify visually during implementation.

3. **Aspect ratio of mockup interior**
   - What we know: Feature images have mixed aspect ratios — `w: 1200, h: 450` (16/4.5, roughly 8/3) for shot_extraction and slides_export; `w: 800, h: 600` (4/3) for the other four.
   - What's unclear: The mockup should have a consistent interior size. Using the wide aspect ratio clips the tall images; using the tall ratio wastes space for the wide ones.
   - Recommendation: Use `aspect-[16/10]` (1.6:1) as a compromise. Wide images use `object-cover object-top` to show the top portion; tall images also show well in this ratio. The mockup chrome adds fixed overhead — the interior just needs a consistent defined dimension.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + @testing-library/react 16.3.2 |
| Config file | `conjure-landing-page/vitest.config.ts` |
| Quick run command | `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/FeaturesSection.test.tsx` |
| Full suite command | `cd conjure-landing-page && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FLYT-02 | Two-column layout renders (grid with left + sticky right column) | unit | `npx vitest run src/components/sections/__tests__/FeaturesSection.test.tsx` | ❌ Wave 0 |
| FLYT-03 | IntersectionObserver registered for each feature row | unit | same | ❌ Wave 0 |
| FLYT-04 | All 6 images present in DOM; only activeIndex image is opacity-100 | unit | same | ❌ Wave 0 |
| FLYT-05 | Active row has mint accent class; inactive rows have muted class | unit | same | ❌ Wave 0 |
| FLYT-06 | Browser mockup chrome markup present (traffic lights, URL bar) | unit | same | ❌ Wave 0 |
| FLYT-07 | Mobile layout: no sticky panel, each feature has image below description | unit | same | ❌ Wave 0 |

**Testing strategy note:** `jsdom` does not implement `IntersectionObserver`. Tests MUST stub it with `vi.stubGlobal('IntersectionObserver', mockConstructor)` in the test file's `beforeEach` or in the test setup. FLYT-03 tests that the mock constructor was called once per feature row (6 times), not that scroll events fire. FLYT-04, FLYT-05 test the rendered output when `activeIndex` prop is set to a specific value (0, 3, 5) — the test controls the state, not the observer.

**Component architecture implication for testability:** `FeaturesSection` should accept an optional `initialActiveIndex` prop (default `0`) so tests can control which feature row appears active without needing to trigger IntersectionObserver callbacks. This is a clean testing seam.

### Sampling Rate
- **Per task commit:** `cd conjure-landing-page && npx vitest run src/components/sections/__tests__/FeaturesSection.test.tsx`
- **Per wave merge:** `cd conjure-landing-page && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `conjure-landing-page/src/components/sections/__tests__/FeaturesSection.test.tsx` — covers FLYT-02, FLYT-03, FLYT-04, FLYT-05, FLYT-06, FLYT-07
- [ ] Dependency install: `cd conjure-landing-page && npm install react-intersection-observer` — must run before RED tests can import the hook

*(Existing test infrastructure: Vitest + @testing-library/react + jsdom already configured in `vitest.config.ts` — no new framework setup needed)*

---

## Sources

### Primary (HIGH confidence)
- [react-intersection-observer GitHub](https://github.com/thebuilder/react-intersection-observer) — useInView API, rootMargin options, v10 changelog (initial-mount suppression), bundle size (~1.15kB)
- [MDN IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — rootMargin specification (viewport-relative percentages)
- [Vitest vi.stubGlobal docs](https://vitest.dev/api/vi.html) — IntersectionObserver mock pattern
- Project codebase: `FeaturesSection.tsx`, `globals.css`, `content.ts`, `vitest.config.ts` — confirmed existing patterns, image paths, Tailwind v4 setup

### Secondary (MEDIUM confidence)
- [CSS-Tricks: Sticky TOC with scroll active states](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/) — rootMargin scroll-spy pattern confirmed
- [terluinwebdesign.nl: overflow:clip vs overflow:hidden for sticky](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/) — overflow:clip workaround confirmed across multiple sources

### Tertiary (LOW confidence)
- [WebSearch: browser mockup CSS examples](https://codepen.io/adrienjarthon/pen/ogjjoj) — traffic light color values and dimensions are approximate from CodePen examples; exact values (#FF5F56, #FFBD2E, #27C93F) widely cited as "macOS standard" but not from an Apple spec document

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — react-intersection-observer is the roadmap-specified library; confirmed React 19 compatible (React peer dep listed as >=16); bundle size verified from official repo
- Architecture: HIGH — IntersectionObserver rootMargin center-detection, opacity-toggle crossfade, and hand-rolled browser chrome are all well-established patterns with multiple source confirmation
- Pitfalls: HIGH — overflow:hidden/sticky interaction is confirmed CSS spec behavior; rootMargin percentage semantics confirmed from MDN; IO initial-mount behavior confirmed from react-intersection-observer v10 changelog

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (react-intersection-observer API is stable; Tailwind v4 and Next.js 16 APIs are stable)
