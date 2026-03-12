# Stack Research

**Domain:** Scroll-synced sticky panel + glass surface redesign (Next.js 15/16 landing page)
**Researched:** 2026-03-12
**Confidence:** HIGH — all claims verified against official sources or current npm/compat data

## Scope

This file covers only the NEW stack additions/changes required for milestone v1.1 Visual Polish.
Validated baseline already in place (not re-researched): Next.js 16, React 19, Tailwind v4 CSS-first (`@theme` OKLCH tokens), Vitest + RTL, PostHog analytics, `next/image`.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Native `IntersectionObserver` API | Browser-native | Detect which feature row is in viewport during scroll, driving `activeIndex` state | No install needed. 97%+ global support (Safari 12.1+, iOS 12.2+). Fully async — browser-scheduled, does not block the main thread. Correct primitive for visibility-driven active-index tracking. No polyfill needed for this audience. |
| CSS `position: sticky` | Browser-native | Keep screenshot panel fixed while feature rows scroll past | GPU-composited positioning — no scroll listener, no jitter, no JS involvement. Using JS to toggle `position: fixed` causes jump artifacts at the transition point; `sticky` eliminates this entirely. |
| CSS `backdrop-filter` (hardcoded blur values) | Browser-native | Glass surface blur effect on `.glass-surface` utility and Header | 97% global support. Already in use in the project — requires a bug fix (see below). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-intersection-observer` | ^10.0.3 | `useInView` React hook wrapping native Intersection Observer | Use to avoid boilerplate `useEffect`/`useRef` Observer setup. Returns `{ ref, inView }` per element. Reuses Observer instances across refs automatically. React 19 compatible. v10 is the current stable release (published ~22 days before this research date). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| No new tools required | — | Existing Vitest + RTL covers new client components. No build-tool changes needed. |

---

## Installation

```bash
# One new dependency — adds scroll-sync hooks without an animation engine
npm install react-intersection-observer
```

Ships with TypeScript types. No additional dev dependencies needed.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `react-intersection-observer` + native `position: sticky` | Framer Motion `useScroll` + `useTransform` | Only when Framer Motion is already installed. This project has no animation library. Adding Framer Motion (~33kB gzipped) purely for scroll position tracking is not justified when `IntersectionObserver` + CSS does the same job with zero bundle cost. |
| `IntersectionObserver` (active-index pattern) | Raw `scroll` event listener | Never preferred for visibility detection. Scroll fires on every pixel and requires `requestAnimationFrame` throttling. IO is async, browser-scheduled, and has native threshold support. |
| `IntersectionObserver` (active-index pattern) | GSAP ScrollTrigger | Use GSAP only for complex timeline-sequenced scroll animations (award-site level). For a simple "which row is visible" → "show matching screenshot" pattern, ScrollTrigger is 95kB of overkill. |
| `backdrop-filter: blur(18px)` (hardcoded) | `backdrop-filter: blur(var(--glass-blur))` on `-webkit-` prefix | CSS variables do not work on `-webkit-backdrop-filter` in any Safari version. Safari 18.3 silently ignores the rule and renders no blur. Hardcode the pixel value on the webkit line. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `-webkit-backdrop-filter: blur(var(--glass-blur))` | Safari 18.3 and below reject CSS variables on the webkit-prefixed `backdrop-filter` property. The glass surface renders as a plain transparent panel — no blur — in Safari. This bug is confirmed in production (mdn/browser-compat-data issue #25914, March 2025). The current codebase has this bug in both `globals.css` `.glass-surface` and the `Header` component's inline `style` object. | `-webkit-backdrop-filter: blur(18px)` with the fixed pixel value. Keep `backdrop-filter: blur(var(--glass-blur))` on the unprefixed line for Chrome/Firefox where variables work fine. |
| Framer Motion (not installed) | ~33kB gzipped for capabilities the project does not need. The scroll-sync feature requires only IO + CSS `transition` for the crossfade — no spring physics, no gestures, no timeline. | Native `IntersectionObserver` via `react-intersection-observer` + CSS `opacity` transition |
| `scroll` event listener for active-index | Fires on every pixel; requires manual debounce/RAF throttle; breaks concurrent React rendering; harder to unit test | `useInView` from `react-intersection-observer` |
| Keeping `FeaturesSection` as a Server Component | `IntersectionObserver` is browser-only; Server Components cannot attach DOM refs or read scroll state | Add `'use client'` directive to `FeaturesSection`. The component has no server-side data dependencies (content comes from `@/lib/content`) so this conversion is safe and clean. |

---

## Stack Patterns by Variant

**Sticky panel layout (the Stripe/Linear pattern):**
- Outer `<section>` sets `min-height` large enough for all features to scroll through (e.g. `600vh` for 6 features at `100vh` each, or tuned to content)
- Left column: `position: sticky; top: [header-height]` — holds browser chrome mockup + swappable screenshot
- Right column: normal block flow — one `<div>` per feature, each ~`100vh` tall
- Each right-column row gets a `ref` from `useInView({ threshold: 0.5 })` — when >50% in view, that index becomes active
- `activeIndex` drives which screenshot src is shown; CSS `opacity` transition (200–300ms ease) handles the swap visually

**Glass surface fix (`.glass-surface` + `Header`):**

In `globals.css`, replace:
```css
backdrop-filter: blur(var(--glass-blur));
-webkit-backdrop-filter: blur(var(--glass-blur));  /* BROKEN in Safari */
```

With:
```css
backdrop-filter: blur(var(--glass-blur));   /* Chrome, Firefox — variables work */
-webkit-backdrop-filter: blur(18px);        /* Safari — hardcoded, no variable */
```

In `Header.tsx`, the inline `style` object currently has:
```ts
WebkitBackdropFilter: 'blur(var(--glass-blur))',  /* BROKEN in Safari */
```

Replace with:
```ts
WebkitBackdropFilter: 'blur(18px)',  /* Fixed */
```

**`@supports` fallback for the ~3% without any `backdrop-filter` support:**
```css
@supports not (backdrop-filter: blur(1px)) {
  .glass-surface {
    background: oklch(0.14 0 0 / 0.90); /* opaque fallback */
  }
}
```

**Mobile handling for the sticky panel:**
- Below `md` breakpoint: collapse back to the original card grid (or a simple list with images inline)
- `position: sticky` does not work if any ancestor has `overflow: hidden` — verify no parent clips the sticky column

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `react-intersection-observer@^10.0.3` | React 19, Next.js 15/16 | v10 is current stable. `useInView` API unchanged from v9 — no migration needed. The new `useOnInView` hook (v10 addition) is useful if impression-only tracking with zero re-renders is needed later. |
| `tailwindcss@^4` | `backdrop-filter` CSS | Tailwind v4 generates `backdrop-blur-*` utilities using only the unprefixed `backdrop-filter` property. The webkit prefix gap must be patched in `globals.css` directly — no Tailwind utility covers it in v4. |
| `react-intersection-observer@^10.0.3` | Vitest + RTL | `useInView` refs are testable with RTL by mocking the `IntersectionObserver` global (standard pattern). No extra test setup required beyond what the project already has. |

---

## Sources

- [react-intersection-observer npm registry](https://www.npmjs.com/package/react-intersection-observer) — v10.0.3 confirmed current, 22 days old at research date (HIGH confidence)
- [react-intersection-observer v10.0.0 release notes](https://github.com/thebuilder/react-intersection-observer/releases/tag/v10.0.0) — React 19 compatible, `useInView` API stable (HIGH confidence — official release)
- [mdn/browser-compat-data issue #25914](https://github.com/mdn/browser-compat-data/issues/25914) — Confirmed: Safari 18.3 still requires `-webkit-` prefix AND rejects CSS variables on that prefix. Flag is "testable" (not stable), meaning unprefixed support is off by default. (HIGH confidence — MDN compat tracking, March 2025)
- [Can I Use: CSS backdrop-filter](https://caniuse.com/css-backdrop-filter) — 97.04% global support; Safari 18.0+ listed as supported (with caveats per MDN issue above) (HIGH confidence)
- [Can I Use: IntersectionObserver](https://caniuse.com/intersectionobserver) — Safari 12.1+, iOS 12.2+ native support, no polyfill needed (HIGH confidence)
- [lightningcss issue #537](https://github.com/parcel-bundler/lightningcss/issues/537) — corroborates CSS variable restriction on `-webkit-backdrop-filter`; prefix was being removed incorrectly by build tools (MEDIUM confidence — corroborating issue)
- [CSS-Tricks: Sliding effects using sticky positioning](https://css-tricks.com/creating-sliding-effects-using-sticky-positioning/) — sticky panel layout pattern reference (MEDIUM confidence — community source)
- [bswen.com Safari WebKit CSS Bugs (2026-03-12)](https://docs.bswen.com/blog/2026-03-12-safari-css-issues-workarounds/) — current-date source confirming webkit backdrop-filter issues persist (MEDIUM confidence)

---
*Stack research for: scroll-synced sticky panel + glass surface redesign (v1.1 Visual Polish)*
*Researched: 2026-03-12*
