# Project Research Summary

**Project:** Conjure Landing Page — v1.1 Visual Polish
**Domain:** SaaS marketing landing page — scroll-synced sticky panel + glass surface redesign
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

The v1.1 milestone is a focused visual polish pass on an already-functional Next.js 15 landing page. The work is scoped to two independent changes: replacing the static `FeaturesSection` card grid with a scroll-synced sticky panel (the Stripe/Linear two-column pattern), and repairing the broken `.glass-surface` utility so it renders as genuine frosted glass rather than a flat dark rectangle. Both problems are well-understood and have documented solutions — this is not exploratory work. The recommended approach uses CSS `position: sticky` for the panel layout (zero JS for the sticky behavior itself), `IntersectionObserver` via `react-intersection-observer` for active-step detection (one small dependency, no animation engine), and a structural fix to the glass effect by introducing visual noise behind the cards rather than tuning CSS values that cannot work on a featureless dark background.

The highest-confidence finding from research is that the glass effect is broken for a structural reason, not a CSS value problem: `backdrop-filter: blur()` has nothing to work with against a near-black monochrome background. Adding a noise or grain texture behind `.glass-surface` cards gives the blur filter visible pixels to average, producing a real frosted effect at any reasonable blur radius. Separately, a confirmed Safari bug (mdn/browser-compat-data #25914) means CSS variables cannot be used on `-webkit-backdrop-filter` in any Safari version — the current codebase has this bug in both `globals.css` and `Header.tsx`, and both must be patched with hardcoded pixel values.

The primary risk is `position: sticky` silently failing due to ancestor constraints. The existing `FadeInWrapper` that wraps `FeaturesSection` in `page.tsx` applies `transform: translateY()`, which creates a new CSS containing block and breaks sticky positioning entirely. Removing `FadeInWrapper` from around `FeaturesSection` is the correct fix and is low-risk since the section is long enough to already be in view before the user reaches it. All other risks are manageable with standard patterns documented in ARCHITECTURE.md.

---

## Key Findings

### Recommended Stack

The baseline stack (Next.js 15/16, React 19, Tailwind v4, Vitest + RTL) requires no changes for this milestone. One new runtime dependency is recommended: `react-intersection-observer@^10.0.3`, which wraps native `IntersectionObserver` with a clean React hook API (`useInView`). It is React 19 compatible, adds minimal bundle weight beyond its own ~5kB, and avoids the manual `useEffect`/`useRef` boilerplate of the raw Observer API. All other scroll and layout primitives required for v1.1 are browser-native. See `.planning/research/STACK.md` for full alternatives considered.

**Core technologies:**
- `react-intersection-observer@^10.0.3`: active-step detection — wraps `IntersectionObserver` with `useInView` hook, eliminates scroll listener boilerplate, React 19 compatible
- CSS `position: sticky`: sticky panel layout — GPU-composited, zero JS involvement, no jitter
- CSS `backdrop-filter` with hardcoded `-webkit-` values: glass surface blur — must hardcode `blur(18px)` on the webkit prefix line; CSS variables fail on `-webkit-backdrop-filter` in all Safari versions
- `@supports (backdrop-filter: blur(1px))` fallback: graceful degradation for ~3% of browsers without support

**Critical version notes:**
- Tailwind v4 does not reliably emit `-webkit-backdrop-filter` in all build configurations (confirmed open bug, August 2025, still open March 2026). The webkit patch must go in `globals.css` directly — no Tailwind utility covers it.
- `react-intersection-observer` v10 is current stable. The `useInView` API is backward-compatible with v9.

### Expected Features

**Must have — v1.1 launch blockers (all P1):**
- `FeaturesSection` converted to `'use client'` — prerequisite for all scroll logic
- Two-column sticky layout: scrolling feature text steps (left) / sticky screenshot panel (right)
- `IntersectionObserver` active-step detection with `rootMargin: "-40% 0px -40% 0px"` (viewport-center trigger)
- Screenshot crossfade on active-step change — all 6 images pre-rendered in DOM, `opacity: 0/1` toggled, never mount/unmount
- Active step text highlighting — accent color on active, muted on inactive
- Mobile fallback — stacked single-column layout below `md` breakpoint (hide two-column, show card list)
- Browser mockup chrome wrapping the screenshot area
- Noise/grain texture behind `.glass-surface` cards — fixes the root structural cause of the invisible glass effect
- `.glass-surface` CSS tuning: `blur(16px) saturate(180%)`, increased border-top opacity to `0.32`, inner + outer box shadow
- Safari `-webkit-backdrop-filter: blur(18px)` hardcoded in both `globals.css` and `Header.tsx`
- `@supports` fallback for no-`backdrop-filter` browsers

**Defer to v1.2+:**
- Step progress indicator (numbered dots or line) — adds visual noise; reconsider after user testing
- Keyboard navigation between steps — accessibility enhancement, not blocking for v1.1
- Section-level localized radial gradient — add only if noise texture alone proves insufficient

**Anti-features to avoid:**
- GSAP ScrollTrigger — 50KB+ overkill for a 6-step pattern; CSS sticky + IntersectionObserver does the same job
- `scroll` event listeners for active-step — fires on every pixel, main-thread jank, requires manual debounce
- CSS `animation-timeline: scroll()` — incomplete Safari support as of early 2026
- `react-scrollama` / `react-sticky-box` — unnecessary dependency for 6 steps; native pattern is ~30 lines
- `will-change: transform` on multiple elements simultaneously — exhausts GPU compositor layers on mobile

### Architecture Approach

The redesign touches exactly one section (`FeaturesSection`) and one global utility (`.glass-surface`). All other sections (Header, HeroSection, HowItWorksSection, PricingSection, FAQSection, WaitlistSection, Footer) are untouched. `activeIndex` (integer 0–5) is the single piece of state; it lives in `FeaturesSection` and flows down as props to both `FeatureNav` and `FeaturePanel`. The `useScrollSpy` hook owns the `IntersectionObserver` and fires `setActiveIndex` via callback — it does not own state itself. Click-driven navigation in `FeatureNav` calls the same setter and also scrolls the sentinel into view to keep scroll position consistent with displayed state. See `.planning/research/ARCHITECTURE.md` for full component diagram, data flow, and working `useScrollSpy` code.

**Major components:**
1. `FeaturesSection` (rewrite to `'use client'`) — owns `activeIndex` state; renders two-column grid; mounts scroll observers via `useScrollSpy`; removes `FadeInWrapper` from parent `page.tsx`
2. `FeaturePanel` (new) — receives `activeIndex` prop; pre-renders all 6 screenshots with opacity toggling; sticky positioning via pure CSS
3. `FeatureNav` (new, optional) — receives `activeIndex` + `onSelect`; renders feature title list with active indicator; click triggers scroll + state update
4. `useScrollSpy` (new hook) — attaches `IntersectionObserver` to each feature sentinel `<div>`; calls `onActiveChange(i)` on intersection; `observer.disconnect()` in `useEffect` cleanup
5. `.glass-surface` in `globals.css` (modify) — add noise background to section, fix `-webkit-backdrop-filter`, tune blur/border/shadow values

**Recommended file additions:**
- `src/hooks/useScrollSpy.ts`
- `src/components/features/FeaturePanel.tsx`
- `src/components/features/FeatureNav.tsx`

**Build order:** glass fix (Step 1) → `useScrollSpy` hook (Step 2) → `FeaturePanel` (Step 3) → `FeatureNav` (Step 4) → full `FeaturesSection` rewrite (Step 5) → remove `FadeInWrapper` in `page.tsx` (Step 6) → QA pass (Step 7).

### Critical Pitfalls

Research identified 11 v1.1-specific pitfalls. Top 5 in impact order:

1. **`FadeInWrapper` transform breaks `position: sticky`** — `FadeInWrapper` applies `transform: translateY()` on `FeaturesSection`. A CSS `transform` on an ancestor creates a new containing block; `position: sticky` pins to that ancestor instead of the viewport. The sticky panel will not stick. Fix: remove `FadeInWrapper` from around `FeaturesSection` in `page.tsx` before writing any sticky layout code. Audit all ancestors up to `<body>` for `transform`, `filter`, `will-change: transform`, and `contain`.

2. **Safari CSS variable rejection on `-webkit-backdrop-filter`** — Safari 18.3 and all earlier versions silently ignore `backdrop-filter: blur(var(--glass-blur))` on the `-webkit-`-prefixed property. The glass renders as a flat, transparent panel in Safari. The current codebase has this bug in both `globals.css` and `Header.tsx`. Fix: hardcode `-webkit-backdrop-filter: blur(18px)` on both. Keep the unprefixed `backdrop-filter: blur(var(--glass-blur))` for Chrome/Firefox, where variables work fine.

3. **Glass effect is invisible on a dark monochrome background** — `backdrop-filter: blur()` averages the pixels behind the element. The near-black page background (`oklch(0.04 0 0)`) has no visual variation, so the blur averages dark into dark regardless of blur radius. Fix: add a noise or grain texture behind `.glass-surface` cards at the section level. This gives the blur filter content to process, producing a real frosted effect.

4. **`IntersectionObserver` fires for all elements on initial mount** — On first observation, the IO spec fires a callback for every observed element. Without a guard, this sets `activeIndex` to the last feature on page load. Fix: initialize `activeIndex` to 0 in state and either (a) add a `hasInitialized` ref that skips the first callback batch, or (b) check `entry.boundingClientRect.top` against viewport height to determine initial above/below-fold position.

5. **`observer.disconnect()` missing from `useEffect` cleanup** — `IntersectionObserver` continues running after component unmount. React 18 Strict Mode double-invokes effects, causing two observers to run simultaneously and producing flickering active states in development. Fix: always return `() => observer.disconnect()` from the `useEffect` in `useScrollSpy`. This is required, not optional.

---

## Implications for Roadmap

The milestone naturally splits into two parallel tracks (glass fix and scroll panel) with one dependency constraint (the `FadeInWrapper` removal in Phase 1 is required before Phase 3 sticky integration). The recommended order follows the ARCHITECTURE.md build sequence.

### Phase 1: Foundation Fixes
**Rationale:** Two prerequisite changes that unblock everything else. Neither requires new components. Both are independently verifiable before scroll work begins. The Safari backdrop-filter bug affects the entire page (Header and all `.glass-surface` cards), so patching it first means all subsequent browser testing is accurate.
**Delivers:** Working glass effect visible in Safari; `-webkit-backdrop-filter` bug patched in `globals.css` and `Header.tsx`; `@supports` fallback in place; `FadeInWrapper` removed from `FeaturesSection` in `page.tsx` so sticky positioning will work.
**Addresses:** Glass surface MVP (noise texture, CSS tuning, `@supports` fallback, `-webkit-` fix)
**Avoids:** Pitfall V1 (transform ancestor breaks sticky), Pitfall V6 (nested backdrop-filter stacking), Safari variable rejection

### Phase 2: Scroll Infrastructure (Parallel with Phase 1)
**Rationale:** The hook and sub-components have no dependency on Phase 1 changes. They can be built in parallel and each is independently testable with hardcoded props before integration.
**Delivers:** `useScrollSpy` hook (with init guard + cleanup), `FeaturePanel` component (pre-renders all 6 screenshots, opacity toggle), `FeatureNav` component (title list with active indicator) — all verified with hardcoded state before wiring.
**Uses:** `react-intersection-observer` (one new install), native `IntersectionObserver` pattern with `observer.disconnect()` cleanup
**Implements:** `useScrollSpy`, `FeaturePanel`, `FeatureNav` from architecture plan
**Avoids:** Pitfall V3 (init-mount fire guard built into hook), Pitfall V9 (observer cleanup included from the start)

### Phase 3: FeaturesSection Integration
**Rationale:** Wire the scroll infrastructure into the full section rewrite. This is the primary deliverable. Depends on Phase 1 (FadeInWrapper removed) and Phase 2 (components available). This is the highest-risk step — the two-column layout, sticky behavior, mobile fallback, and scroll sync must all work together.
**Delivers:** Complete two-column sticky layout with live scroll sync, screenshot crossfade, active step highlighting, browser mockup chrome, mobile fallback (stacked cards below `md`).
**Addresses:** All P1 scroll panel features from FEATURES.md
**Avoids:** Pitfall V4 (fast scroll — threshold array on IO), Pitfall V5 (sticky container height vs. scroll distance), Pitfall V7 (z-index stacking contexts from backdrop-filter), Pitfall V8 (`dvh` units, not `vh`), Pitfall V10 (`will-change` overuse), Pitfall V11 (no scroll event listeners — use IO only)

### Phase 4: QA and Cross-Browser Verification
**Rationale:** Several failure modes are only visible on specific hardware or browsers. Chrome DevTools device simulation does not accurately reproduce iOS Safari `backdrop-filter` or rubber-band scroll behavior. QA must include a physical device pass.
**Delivers:** Verified behavior in Safari desktop (blur rendering, sticky), verified on physical iOS (dvh height, fast scroll, rubber-band deceleration), accessibility check on FeatureNav buttons, visual confirmation that glass effect is visible and text contrast passes WCAG AA.
**Avoids:** Shipping invisible-glass bug to Safari users, shipping broken sticky to iOS users

### Phase Ordering Rationale

- Phases 1 and 2 can run in parallel — glass fix and scroll infrastructure have no shared dependencies.
- Phase 3 strictly requires Phase 1 (`FadeInWrapper` removed) and Phase 2 (components built) before the integration step begins.
- Phase 4 must follow Phase 3 — cross-browser QA is only meaningful on complete integration.
- Glass fix is sequenced in Phase 1 (not Phase 3) because the Safari blur bug affects the entire page, including the Header — fixing it early ensures all intermediate testing is accurate.

### Research Flags

Phases with standard, well-documented patterns (skip `/gsd:research-phase`):
- **Phase 1 (Foundation Fixes):** Both the Safari backdrop-filter fix (specific CSS values confirmed from MDN + GitHub issues) and the noise-texture approach are concrete, specifiable changes. No ambiguity.
- **Phase 2 (Scroll Infrastructure):** `IntersectionObserver` + `useScrollSpy` pattern is fully specified with working example code in ARCHITECTURE.md. `react-intersection-observer` v10 API is stable.
- **Phase 4 (QA):** Manual testing checklist — no research needed, only execution.

Phases that may need attention during planning:
- **Phase 3 (FeaturesSection Integration):** The browser mockup chrome component (hand-rolled HTML/CSS) has no final markup specified in research. DaisyUI `mockup-browser` is noted as an option but is not a project dependency. Define the chrome markup (title bar, traffic lights, URL bar dimensions) before beginning layout work. Low risk but worth pre-deciding.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All claims verified against official sources — npm, MDN compat data, GitHub issues on Tailwind and react-intersection-observer repos. Safari variable bug confirmed via mdn/browser-compat-data issue #25914 (March 2025). |
| Features | HIGH | Feature scope is tightly constrained to the current codebase. Anti-features are backed by specific technical rationale (bundle size, browser compat gaps, performance). Priority matrix is explicit with P1/P3 classification. |
| Architecture | HIGH | Based on direct codebase read of all affected files plus spec-level references (CSS containing block spec, MDN IntersectionObserver spec). `useScrollSpy` example code in ARCHITECTURE.md is production-quality with cleanup included. |
| Pitfalls | HIGH | All 11 v1.1 pitfalls verified against official specs or confirmed GitHub issues. iOS `100vh`/`dvh` behavior, IO initial-fire behavior, transform containing-block behavior, and Tailwind v4 webkit-prefix bug are all spec- or issue-documented. |

**Overall confidence:** HIGH

### Gaps to Address

- **Browser mockup chrome design:** Research identifies DaisyUI `mockup-browser` as a reference but does not specify exact markup or sizing for a hand-rolled implementation. Decide during Phase 3 planning: use DaisyUI (adds a dependency) or hand-roll (define chrome dimensions — title bar height ~32px, traffic lights, URL bar). Either path works; decide before starting layout.
- **Noise texture implementation method:** Research identifies noise/grain as the structural fix for broken glass but defers the specific approach to implementation. Three options are valid: SVG `<filter>` with `feTurbulence`, tiled noise PNG as `background-image`, or CSS pseudo-element. Any works — pick based on authoring convenience during Phase 1.
- **`FeatureNav` inclusion decision:** Research marks `FeatureNav` as optional. Whether to include a clickable feature title list in the left column is a design call, not a technical constraint. The architecture supports it either way without structural changes.
- **`rootMargin` calibration:** Research specifies `"-40% 0px -40% 0px"` as a starting value for the viewport-center trigger, but this requires tuning against the actual section height and feature row spacing during Phase 3. Plan for a calibration pass before the scroll sync is considered complete.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read: `FeaturesSection.tsx`, `globals.css`, `useFadeIn.ts`, `FadeInWrapper.tsx`, `page.tsx`, `content.ts` — component responsibilities and existing constraints confirmed from source
- [mdn/browser-compat-data issue #25914](https://github.com/mdn/browser-compat-data/issues/25914) — Safari `-webkit-backdrop-filter` CSS variable rejection confirmed March 2025
- [react-intersection-observer npm](https://www.npmjs.com/package/react-intersection-observer) — v10.0.3 current stable, React 19 compatible confirmed
- [react-intersection-observer v10.0.0 release notes](https://github.com/thebuilder/react-intersection-observer/releases/tag/v10.0.0) — API stability confirmed
- [Tailwind CSS GitHub issue #18765](https://github.com/tailwindlabs/tailwindcss/issues/18765) — `-webkit-backdrop-filter` not reliably emitted in v4, confirmed open 2025
- [Can I Use: IntersectionObserver](https://caniuse.com/intersectionobserver) — 97%+ support, Safari 12.1+, iOS 12.2+, no polyfill needed
- [MDN CSS Containing Block spec](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block) — `transform` creates new containing block, breaks sticky positioning (spec-level)
- CSS-Tricks: [Sticky Table of Contents with Scrolling Active States](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/) — scroll spy pattern verification

### Secondary (MEDIUM confidence)
- [CSS-Tricks: Sliding effects using sticky positioning](https://css-tricks.com/creating-sliding-effects-using-sticky-positioning/) — two-column sticky layout pattern
- [Josh W. Comeau: Next-level frosted glass with backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) — structural diagnosis of glass effect failure on dark backgrounds
- [Pudding.cool: Easier scrollytelling with position:sticky](https://pudding.cool/process/scrollytelling-sticky/) — sticky container height and scroll distance pattern
- [lightningcss issue #537](https://github.com/parcel-bundler/lightningcss/issues/537) — corroborates CSS variable restriction on `-webkit-backdrop-filter`
- [bswen.com Safari WebKit CSS Bugs (2026-03-12)](https://docs.bswen.com/blog/2026-03-12-safari-css-issues-workarounds/) — current-date corroboration of webkit blur issues persisting

### Tertiary (MEDIUM-LOW confidence)
- [Aceternity UI: Sticky Scroll Reveal component](https://ui.aceternity.com/components/sticky-scroll-reveal) — reference implementation (React/Tailwind)
- [DaisyUI: mockup-browser component](https://daisyui.com/components/mockup-browser/) — browser chrome reference markup

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
