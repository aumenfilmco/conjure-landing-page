# Pitfalls Research

**Domain:** SaaS marketing landing page — separate Vercel project posting to a live API on a different origin
**Researched:** 2026-03-11 (v1.0), updated 2026-03-12 (v1.1 Visual Polish)
**Confidence:** HIGH (all concern areas verified against official docs, CVE reports, and PostHog docs)

---

## v1.1 Milestone Pitfalls — Scroll-Synced Sticky Panel + Glass Surface Redesign

These pitfalls are specific to the current milestone: replacing `FeaturesSection`'s static card grid with a scroll-synced sticky panel (browser mockup + swapping screenshots), and redesigning `.glass-surface` for visible, consistent blur.

---

### Pitfall V1: `overflow: hidden` on Any Ancestor Silently Kills `position: sticky`

**What goes wrong:**
The sticky panel in `FeaturesSection` stops sticking. No error is thrown. The panel scrolls past normally as if `sticky` were never applied. The failure is invisible in Chrome DevTools' Elements panel because the `sticky` rule looks syntactically correct.

**Why it happens:**
Any ancestor element with `overflow: hidden`, `overflow: auto`, or `overflow: scroll` creates a new scroll container. `position: sticky` pins relative to its scroll container — so if an ancestor has overflow set, sticky pins inside that element, not the viewport. In this codebase, `FadeInWrapper` wraps `FeaturesSection` and could introduce this if it uses `overflow: hidden` to clip the fade-in transform. The `<main>` tag and any layout wrappers are equally suspect.

**How to avoid:**
1. Before implementing the sticky panel, audit every ancestor element from `FeaturesSection` up to `<body>` for any `overflow` value other than `visible`.
2. If you need to clip overflow on a container (to hide the scrolled-away feature text), use `overflow: clip` instead of `overflow: hidden`. Unlike `hidden`, `clip` does not create a new scroll container, so `sticky` continues working against the viewport.
3. Run a one-line check in browser console to confirm: `document.querySelectorAll('[class*="overflow"]')` and inspect each result in DevTools.

**Warning signs:**
- Sticky panel scrolls normally on desktop but suddenly works after removing `FadeInWrapper` or `<main>`.
- `overflow-hidden` Tailwind class anywhere between the sticky element and `<body>`.
- `FadeInWrapper` uses `overflow: hidden` to prevent layout shift during the `translateY` fade.

**Phase to address:** Sticky panel implementation — check ancestors before writing any sticky layout code.

---

### Pitfall V2: `FeaturesSection` is a Server Component — Scroll Logic Requires a New Client Boundary

**What goes wrong:**
The current `FeaturesSection` is a Server Component (no `'use client'` directive). Scroll-synced behavior requires `useEffect`, `useRef`, or `IntersectionObserver` — all of which are client-only APIs. If you add `'use client'` to the top of `FeaturesSection`, the entire component and all its children become client components, including the `<Image>` components and content imports. This inflates the JS bundle unnecessarily.

**Why it happens:**
The quickest fix is adding `'use client'` to the top of the existing component. It works, but it removes RSC benefits for the static parts of the section (heading text, feature descriptions, server-side image optimization).

**How to avoid:**
Split the section into two components:
- `FeaturesSection` (Server Component) — renders the outer section shell, feature copy, and passes feature data as props
- `FeaturesStickyPanel` (Client Component, `'use client'`) — handles all scroll observation, active index state, and image-swapping interactivity

`page.tsx` imports `FeaturesSection` (Server Component) which renders `FeaturesStickyPanel` as a child. RSC boundaries are preserved for everything outside the interactive panel.

**Warning signs:**
- `'use client'` added directly to `FeaturesSection.tsx`.
- Bundle size increases noticeably after adding scroll logic.
- Feature copy content (`FEATURES.SHOT_EXTRACTION`, etc.) is being imported inside a `'use client'` file.

**Phase to address:** Sticky panel implementation — define the client boundary architecture before writing a single line of scroll code.

---

### Pitfall V3: IntersectionObserver Fires on Load for All Observed Elements

**What goes wrong:**
Every `IntersectionObserver` fires once synchronously when elements are first observed, regardless of scroll position. This causes all feature items to register as "entering" on page load, setting the active feature index to the last item (or whichever fires last). The panel shows the wrong screenshot before the user scrolls at all.

**Why it happens:**
The IntersectionObserver spec requires an initial observation callback. Most tutorials show the threshold logic but skip the initialization guard. Developers assume the callback only fires when the user scrolls.

**How to avoid:**
1. On first callback invocation, check `entry.isIntersecting` to confirm the element is actually in the viewport — but also compare `entry.boundingClientRect.top` to the viewport top to determine if the element is above or below the fold.
2. Set the initial active index to 0 (first feature) in state, and only update the index when an element enters from below (user is scrolling down past it) or re-enters from above (user scrolling up).
3. Use a `hasInitialized` ref that starts `false`. On the first observer callback batch, set it to `true` but skip updating active index. Only update on subsequent callbacks.

**Warning signs:**
- On page load (before scroll), the wrong feature image is shown in the sticky panel.
- Active index jumps to the last feature item immediately after mount.
- IntersectionObserver callback fires for 6 entries simultaneously on mount.

**Phase to address:** Sticky panel implementation — build the initialization guard before wiring active index to UI.

---

### Pitfall V4: Fast Scroll Skips Intersection Events

**What goes wrong:**
On fast momentum scroll (especially on iOS with rubber-band deceleration), the user scrolls through multiple feature rows without the IntersectionObserver firing for each one. The sticky panel "jumps" or shows a stale screenshot because intermediate thresholds were never crossed.

**Why it happens:**
IntersectionObserver is asynchronous and throttled to the browser's refresh rate. If the user scrolls 3 feature sections in one frame, the browser may coalesce the callbacks and only report the final intersection state. The intermediate states are never observed.

**How to avoid:**
1. Use a `threshold` array (e.g., `[0, 0.25, 0.5, 0.75, 1.0]`) so the observer fires at multiple points within each feature row, reducing the chance that a fast scroll skips all thresholds.
2. As a fallback, read `entry.boundingClientRect.top` when the callback fires and calculate which feature is "most visible" rather than relying solely on the entry that triggered the callback.
3. Accept that fast scroll may skip one feature's screenshot — this is acceptable UX because the user is visually passing those features, not reading them.

**Warning signs:**
- On mobile, fast-flicking through the features section leaves the sticky panel on the first screenshot.
- `console.log` in the observer callback shows fewer calls than expected when scrolling quickly.

**Phase to address:** Sticky panel implementation — test on a physical mobile device before considering the feature complete.

---

### Pitfall V5: Sticky Panel Height Must Match the Scroll Container Height

**What goes wrong:**
The sticky panel sticks to the viewport as intended, but it sticks for either too little scroll distance (it disappears before the last feature is shown) or indefinitely (it remains sticky after the features section ends and overlaps the Pricing section).

**Why it happens:**
`position: sticky` pins an element within its scroll container until the container scrolls out of view. If the container height (the `FeaturesSection` outer wrapper) is shorter than the combined feature row heights, the panel unsticks too early. If `height: 100%` or no explicit height is set, the container may not provide enough scroll distance for each feature to have its "moment" in the sticky panel.

**How to avoid:**
1. The `FeaturesSection` outer container height must be explicitly set or derive from the sum of feature row heights — typically accomplished by making each feature row a fixed height (e.g., `min-h-[400px]`) and letting the container grow naturally.
2. The sticky panel uses `top: [header-height]` (not `top: 0`) to account for the fixed `Header` — failure to account for header height means the top of the sticky panel disappears behind the header.
3. Test the unstick behavior: the sticky panel should stop being sticky just as the last feature row scrolls past, not when the entire section exits the viewport.

**Warning signs:**
- Sticky panel overlaps `HowItWorksSection` below the features section.
- Top of the sticky panel is obscured by the fixed header.
- The last feature row appears in the panel for a disproportionately long or short scroll distance.

**Phase to address:** Sticky panel layout — verify scroll distances in Chrome DevTools before adding any animation.

---

### Pitfall V6: `backdrop-filter` on `.glass-surface` Fails Silently if Parent Has `overflow: hidden`

**What goes wrong:**
`.glass-surface` already exists in the codebase with `backdrop-filter: blur(18px)` and `-webkit-backdrop-filter: blur(18px)`. After redesigning glass cards for the features panel, blur appears in Chrome but renders as a flat, fully opaque surface in Safari — or disappears entirely on iOS.

**Why it happens:**
Three compounding causes:
1. Safari requires `-webkit-backdrop-filter` to be present (already in the codebase, so this is handled).
2. The glass element is a child of a container that has `backdrop-filter` applied (e.g., the sticky panel itself also uses blur). CSS spec: a `backdrop-filter` element only blurs content behind it within its stacking context. A child of a `backdrop-filter` parent cannot see through the parent to blur the original background — it only blurs the already-blurred parent surface, producing a "double blur" that renders as a washed-out grey.
3. Safari on iOS 18 has a known bug where `background-color` and `backdrop-filter` combined with certain `opacity` values causes the element to render fully white (Apple Community thread confirmed in 2025).

**How to avoid:**
1. Never nest a `backdrop-filter` element inside another `backdrop-filter` element. If the sticky panel frame uses blur, the content cards inside must use a solid (non-blurred) background instead.
2. For the glass cards: use a semi-transparent background without `backdrop-filter` if they are children of a blurred container. Reserve `backdrop-filter` for the outermost glass layer only.
3. Test `.glass-surface` on real Safari iOS — not Chrome DevTools device simulation. Safari's Responsive Design Mode does not accurately emulate `backdrop-filter` rendering.
4. The `opacity` on the background color must be less than 1.0 for blur to show through. Current values (`oklch(0.20 0 0 / 0.55)`) are already semi-transparent — preserve this.

**Warning signs:**
- Glass surface renders as a flat dark rectangle in Safari with no visible blur.
- Cards inside the sticky panel look correct in Chrome but broken in Safari.
- Two elements in the same DOM path both have `backdrop-filter` applied.
- `background-color` set to a fully opaque value on a `backdrop-filter` element.

**Phase to address:** Glass surface redesign — verify in Safari before any other browser.

---

### Pitfall V7: `backdrop-filter` Creates a New Stacking Context — Breaks z-index on Children

**What goes wrong:**
After adding `backdrop-filter` to the sticky panel or glass cards, elements that previously stacked correctly (feature labels, badges, image overlays) start rendering behind the glass surface or in unexpected z-order. Setting `z-index: 100` on child elements has no visible effect.

**Why it happens:**
`backdrop-filter` creates a new CSS stacking context. Child elements' `z-index` values are now scoped to that context and cannot escape it to stack relative to siblings outside the context. This is not a bug — it is CSS spec behavior — but it surprises developers who expect `z-index` to be globally relative.

**How to avoid:**
1. Map the z-index hierarchy before implementing any glass surface. The existing codebase uses `z-index: 50` on the fixed header (`z-50` Tailwind) and `z-10` on text inside feature cards.
2. If the sticky panel uses `backdrop-filter`, all z-indexing for panel-internal elements must be relative to the panel's stacking context, not the document root.
3. Keep `backdrop-filter` on the outermost glass layer. Do not add it to inner elements unless explicitly needed.

**Warning signs:**
- Text inside a glass card disappears behind the card background after adding `backdrop-filter`.
- Feature labels or badges render in wrong order after glass redesign.
- `z-index` changes on child elements have no visible effect.

**Phase to address:** Glass surface redesign — test z-index hierarchy immediately after adding `backdrop-filter` to any container.

---

### Pitfall V8: iOS Safari `100vh` in Sticky Scroll Container Causes Layout Jump

**What goes wrong:**
If the sticky panel uses `height: 100vh` to fill the viewport, iOS Safari renders it correctly when the page first loads, but the panel height jumps when the address bar collapses as the user begins scrolling. This causes a brief layout reflow that can trigger a scroll position snap or make the sticky behavior stutter.

**Why it happens:**
`100vh` in iOS Safari is calculated as the viewport height with the address bar visible (the "small" viewport). When the address bar hides on scroll, `100vh` does not update dynamically. The sticky panel is sized to the old viewport height, creating a visual gap or clipping.

**How to avoid:**
1. Use `100dvh` (dynamic viewport height) for any full-viewport-height containers in the sticky layout. `dvh` updates as the address bar shows/hides.
2. Alternative: use `100svh` (small viewport height) if you want the panel to size to the most conservative (address bar visible) measurement and never resize.
3. The existing `FadeInWrapper` and section containers do not use `vh` units, so this only becomes a risk when explicitly sizing the sticky panel.

**Warning signs:**
- Sticky panel height visibly snaps or jumps on first scroll on iOS Safari.
- Layout reflow visible in Chrome DevTools Performance timeline when scrolling on mobile.
- Panel uses `h-screen` (Tailwind's `height: 100vh`) rather than `h-dvh` or explicit pixel heights.

**Phase to address:** Sticky panel implementation — use `dvh` units from the start, not as a later fix.

---

### Pitfall V9: IntersectionObserver Not Cleaned Up on Component Unmount

**What goes wrong:**
When the user navigates away from the landing page (e.g., clicks a CTA to the signup page) and returns via browser back, the IntersectionObserver from the previous mount is still running. React's Strict Mode (enabled in development) mounts and unmounts components twice, causing two observers to run simultaneously. This produces flickering active states and incorrect feature highlighting.

**Why it happens:**
Developers set up `IntersectionObserver` in a `useEffect` but forget the cleanup function. The observer continues observing disconnected DOM nodes. React 18 Strict Mode double-invokes effects in development, surfacing this immediately — but it's still a real memory and correctness issue in production for multi-page Next.js navigations.

**How to avoid:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(callback, options)
  refs.forEach(ref => { if (ref.current) observer.observe(ref.current) })
  return () => observer.disconnect() // REQUIRED
}, [])
```
Always return a cleanup function from `useEffect` that calls `observer.disconnect()`. Do not call `observer.unobserve()` on each element individually — `disconnect()` clears all observations at once.

**Warning signs:**
- Feature panel flickers between two states in development (Strict Mode double-invoke signature).
- Memory usage climbs on repeated page navigation.
- Active index state updates after the component has already unmounted (React warning: "Can't perform a React state update on an unmounted component").

**Phase to address:** Sticky panel implementation — include cleanup in the initial `useEffect` structure.

---

### Pitfall V10: `will-change: transform` Overuse Degrades Mobile Performance

**What goes wrong:**
Adding `will-change: transform` or `will-change: opacity` to every animated element in the sticky panel (feature images, text labels, the panel container) causes the browser to promote each element to its own GPU compositing layer. On low-end Android devices and older iPhones, having too many compositing layers exhausts GPU memory and causes frame drops worse than not using `will-change` at all.

**Why it happens:**
Developers add `will-change` as a blanket performance optimization after seeing it recommended for animations. More is not better — each compositor layer has overhead.

**How to avoid:**
1. Apply `will-change: transform` only to the single element that is actively animating: the outgoing/incoming feature image during the crossfade transition.
2. Remove `will-change` after the transition completes. Use a `transitionend` event or a timeout to clear it.
3. The existing `body::before` pseudo-element already uses `position: fixed` (which promotes to a compositor layer). The fixed header adds another. Keep total compositor layers under 5 for the features section.

**Warning signs:**
- Chrome DevTools "Layers" panel shows 10+ compositing layers in the features section.
- Frame rate drops to below 30fps during feature scroll on a mid-range device.
- `will-change` applied to section containers or text elements rather than only to the transitioning image.

**Phase to address:** Sticky panel animation implementation — benchmark on a mid-range device before shipping.

---

### Pitfall V11: Header's Scroll Listener Conflicts with IntersectionObserver Pattern

**What goes wrong:**
The current `Header` component uses a raw `scroll` event listener (`window.addEventListener('scroll', ...)`) to detect when to apply glass blur. If `FeaturesSection` adds a second scroll listener (rather than using IntersectionObserver), there are now two scroll listeners on the same page. On mobile, synchronous scroll callbacks are throttled. The header glassmorphism may lag behind scroll position while the features panel is also processing scroll.

**Why it happens:**
The Header was built first with a simple scroll listener. It works in isolation. The features scroll logic gets added separately. Nobody audits the total scroll listener count.

**How to avoid:**
1. The `FeaturesSection` sticky panel must use `IntersectionObserver` — not a scroll listener — for active feature detection. Intersection Observer runs off the main thread; scroll listeners block it.
2. The `Header`'s scroll listener is acceptable as a one-off at `{ passive: true }`. Do not add a second scroll listener for features.
3. If future polish needs scroll position in multiple places, abstract a single `useScrollY` hook that all components subscribe to — one listener, multiple consumers.

**Warning signs:**
- `window.addEventListener('scroll', ...)` appears in `FeaturesSection` or `FeaturesStickyPanel`.
- Header glass transition lags noticeably behind scroll position on mobile.
- More than one `scroll` event listener visible in Chrome DevTools Event Listeners panel.

**Phase to address:** Sticky panel implementation — use IntersectionObserver as the only scroll-detection mechanism.

---

## Technical Debt Patterns (v1.1 Additions)

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Add `'use client'` to all of `FeaturesSection` instead of splitting a child Client Component | Faster to implement | Entire section loses RSC benefits; larger JS bundle; static copy ships as client JS | Never acceptable — split at the interactive boundary |
| Use `scroll` event listener instead of IntersectionObserver for active feature tracking | Simpler mental model | Two scroll listeners on the page; main thread blocked; header glass lag on mobile | Never acceptable — IntersectionObserver is the right tool |
| Skip Safari testing for glass surface and "test later" | Faster iteration | `backdrop-filter` Safari bugs are not visible in Chrome DevTools; discovered too late | Never acceptable — Safari must be tested before marking glass work complete |
| Use `overflow: hidden` on the scroll container to clip feature text | Clips overflowing content correctly in Chrome | Silently breaks `position: sticky` in all browsers | Never — use `overflow: clip` instead |
| Apply `will-change: transform` to the entire sticky panel container | Slightly smoother animation | Excessive compositor layers; GPU memory pressure on mobile | Only acceptable as temporary debugging aid — remove before shipping |

---

## Integration Gotchas (v1.1 Additions)

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| FeaturesSection (Server Component) + scroll logic | Add `'use client'` to `FeaturesSection.tsx` directly | Extract `FeaturesStickyPanel` as a separate Client Component; keep `FeaturesSection` as a Server Component that renders it |
| `backdrop-filter` on `.glass-surface` + sticky panel frame | Apply blur to both the panel frame and the glass cards inside it | Apply `backdrop-filter` to only the outermost glass layer; use solid semi-transparent background on nested cards |
| `position: sticky` + `FadeInWrapper` | `FadeInWrapper` may use `overflow: hidden` to prevent layout shift during translateY fade | Verify `FadeInWrapper` uses `overflow: clip` or no overflow, not `overflow: hidden` |
| Header glass + features scroll | Features section adds a `scroll` listener, conflicting with header's scroll listener | Features section uses only IntersectionObserver; Header retains its single passive scroll listener |

---

## Performance Traps (v1.1 Additions)

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Nested `backdrop-filter` elements | Double-blur renders as grey matte; GPU thrash | Never nest blur inside blur; one layer only | Immediately on any browser; worst on iOS Safari |
| Too many compositor layers from `will-change` | Frame drops to <30fps on mid-range mobile during scroll | Apply `will-change` only to the actively transitioning image; remove after transition | On low-end Android at ~5+ simultaneous animated layers |
| Feature image crossfade using `opacity: 0/1` without `position: absolute` | Layout reflows on each image swap; CLS during scroll | Use `position: absolute` on all images stacked in the same container; toggle `opacity` only | Every image swap fires a layout recalculation |
| `dvh` unit not supported in very old browsers | Sticky panel height jumps on scroll in iOS <15.4 | Use `dvh` with `vh` fallback: `height: 100vh; height: 100dvh` | iOS <15.4 (Safari shipped dvh in 15.4, March 2022) |

---

## UX Pitfalls (v1.1 Additions)

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Scroll-synced panel disabled on mobile but no fallback layout | Mobile users see a broken or empty features section | Show the static card grid on mobile (`md:hidden` + `hidden md:block`); sticky panel only on `lg:` and above |
| Feature image swap has no transition | Panel feels broken — screenshots snap instantly | 200ms crossfade with `opacity` transition between images |
| Sticky panel stays visible when user scrolls past features section | Panel overlaps Pricing section content | Ensure sticky panel `top` offset + panel height ≤ container height; verify unstick behavior |
| Active feature indicator not visible on mobile | User cannot tell which feature is highlighted | If using dot indicators or tab labels, ensure they are large enough (44px min touch target) on mobile |

---

## "Looks Done But Isn't" Checklist (v1.1 Additions)

- [ ] **Sticky behavior:** Test on real iOS Safari. Sticky panel pins and unpins at the correct scroll positions. No layout jump when address bar hides.
- [ ] **Glass surface:** Open in Safari iOS (not Chrome DevTools). Glass cards show visible blur against the dark background. No flat grey matte. No fully-white card.
- [ ] **Nested blur check:** Confirm in DOM that no `backdrop-filter` element is a child of another `backdrop-filter` element.
- [ ] **Overflow audit:** From `FeaturesSection` wrapper up to `<body>`, no ancestor uses `overflow: hidden`. Run `document.querySelectorAll('[class*="overflow-hidden"]')` in browser console.
- [ ] **Observer cleanup:** Confirm `useEffect` in `FeaturesStickyPanel` returns `() => observer.disconnect()`.
- [ ] **Client boundary scope:** Confirm `'use client'` is only on `FeaturesStickyPanel` (or equivalent), not on `FeaturesSection` itself.
- [ ] **Scroll listener count:** Chrome DevTools Event Listeners panel shows exactly one `scroll` listener on `window` (the header) — not two.
- [ ] **Mobile fallback:** At 390px viewport width, the sticky panel is hidden and the static feature grid is shown. No broken layout.
- [ ] **Initial state:** On page load before any scroll, the sticky panel shows the first feature's screenshot (not the last or a random one).

---

## Recovery Strategies (v1.1 Additions)

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| `overflow: hidden` ancestor breaks sticky | LOW | Replace `overflow: hidden` with `overflow: clip` on the offending ancestor; test immediately |
| Safari glass surface flat/white | MEDIUM | Remove `backdrop-filter` from nested cards; apply only to outermost glass layer; retest |
| Observer not cleaned up / double-fire | LOW | Add `return () => observer.disconnect()` to the `useEffect` cleanup function |
| `will-change` causing GPU memory pressure | LOW | Remove `will-change` from all elements except the actively transitioning image |
| `'use client'` on entire FeaturesSection | MEDIUM | Extract `FeaturesStickyPanel` as a separate `'use client'` component; move scroll logic there; revert `FeaturesSection` to Server Component |

---

## Pitfall-to-Phase Mapping (v1.1 Additions)

| Pitfall | Prevention Phase | Verification |
|---------|-----------------|--------------|
| `overflow: hidden` kills sticky | Before sticky layout code — audit DOM structure | `document.querySelectorAll('[class*="overflow-hidden"]')` returns nothing in the ancestor path |
| Wrong `'use client'` boundary | Architecture decision before implementation | `FeaturesSection.tsx` has no `'use client'` directive |
| IntersectionObserver init fire | During sticky panel implementation | On page load, first feature image shown; no observer-triggered state changes before first scroll |
| Fast scroll skips events | Sticky panel implementation — test on mobile device | Feature panel transitions smoothly on iOS momentum scroll |
| Sticky panel height / unstick | Sticky panel layout | Panel stops sticking before Pricing section appears in viewport |
| Nested `backdrop-filter` | Glass surface redesign — first change | No `backdrop-filter` element is a descendant of another in the DOM |
| `backdrop-filter` stacking context | Glass surface redesign | Text and badge z-indexes work correctly after blur is applied |
| iOS `100vh` jump | Sticky panel implementation | No layout jump on iOS Safari when address bar collapses; use `dvh` from the start |
| Observer cleanup | Sticky panel implementation | Strict Mode: no duplicate observations; no state updates after unmount |
| `will-change` overuse | Animation polish | Chrome DevTools Layers panel shows ≤5 compositor layers in features section |
| Header scroll + features IntersectionObserver conflict | Sticky panel implementation | Zero `scroll` event listeners on `window` from FeaturesSection |

---

---

## v1.0 Pitfalls (Original Milestone)

---

### Pitfall 1: Admin Route Protected Only at Middleware — Not at the Data Layer

**What goes wrong:**
The `/admin` route relies on a middleware check against `ADMIN_PASSWORD`. If auth is enforced only in middleware and not in the route handler / Server Component itself, CVE-2025-29927 (CVSS 9.1, disclosed March 2025) lets an attacker bypass middleware entirely by sending the header `x-middleware-subrequest: middleware` (or any matching path value). The Supabase query runs unauthenticated and the waitlist table is exposed.

**Why it happens:**
Developers treat middleware as the security boundary. It feels clean. But Next.js middleware was designed for edge routing logic, not as a security gate — the CVE proves this. Vercel's edge layer strips the malicious header only for requests hosted on Vercel itself; any other deployment surface is fully exposed.

**How to avoid:**
1. Re-verify the password in the Server Component or route handler, not only in middleware. Middleware is a redirect helper, not an auth wall.
2. Use Next.js 15.2.3 or later (patched version). Confirm `package.json` pins `next` at `>=15.2.3`.
3. The check in the route handler: read `ADMIN_PASSWORD` from `process.env` server-side, compare against a `?password=` query param or `Authorization` header using `crypto.timingSafeEqual` to prevent timing attacks.
4. Never expose the Supabase service-role key to the client bundle — only read from `process.env` server-side.

**Warning signs:**
- `middleware.ts` contains the only password check; the `/admin` page component has no auth guard of its own.
- `ADMIN_PASSWORD` referenced in client-side code or visible in `_next/static` bundle.
- `next` version < 15.2.3 in `package.json`.

**Phase to address:** Foundation / Setup phase (before any admin route is built)

---

### Pitfall 2: CORS Rejection on the Waitlist Form POST

**What goes wrong:**
The landing page (`conjurestudio.app` subdomain or separate domain) sends a cross-origin POST to `https://conjurestudio.app/api/waitlist`. If the Conjure app's API route does not return `Access-Control-Allow-Origin` with the landing page's exact origin, the browser blocks the response. The form silently "submits" but the entry never reaches Supabase. Users see no error unless the UI handles the rejected fetch.

**Why it happens:**
The endpoint was built as an internal API. It works fine from the Conjure app itself (same origin). Adding a second origin (the landing page) requires explicit CORS headers, which developers often only add after the first browser console error in production.

**How to avoid:**
1. In the Conjure app's `app/api/waitlist/route.ts`, add an `OPTIONS` handler that returns `Access-Control-Allow-Origin: https://[landing-page-origin]`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type`.
2. On the POST handler, add the same `Access-Control-Allow-Origin` header to the response.
3. Do not use `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true` — the spec forbids this combination and browsers reject it.
4. Test the form from the actual deployed landing page URL (not localhost) before marking the feature complete. Localhost bypasses CORS in some environments, masking the problem.

**Warning signs:**
- Network tab shows the POST returning 200 in development but blocked with CORS error on staging.
- No `OPTIONS` handler on the `api/waitlist` route.
- The landing page and the Conjure app have different origins but CORS was never discussed in the Conjure app's API implementation.

**Phase to address:** Integration phase — specifically when wiring the waitlist form to the live API

---

### Pitfall 3: Brand Color Fidelity Lost via Hex Approximation

**What goes wrong:**
Tailwind v4 uses OKLCH throughout its default palette and expects custom tokens to be defined with OKLCH values in an `@theme` block. Developers copying colors from screenshots, design tools, or older briefs often paste in hex approximations. For example, the primary mint `oklch(0.92 0.18 142)` maps loosely to `#9aff8f` but the OKLCH value renders brighter and more vivid on wide-gamut displays (P3). Using the hex produces a visually duller result — and violates the explicit project constraint that "no hex approximations from screenshots" are allowed.

Additionally: in Tailwind v4, `@theme` variables become CSS custom properties. If colors are defined as hex inside `@theme`, Tailwind v4 will not convert them to OKLCH — it emits them as-is. The brand specification is not preserved in the stylesheet.

**Why it happens:**
Designers specify OKLCH; developers reach for the nearest hex because it's familiar. Browser DevTools still show hex by default. Figma color pickers export hex. The path of least resistance leads away from OKLCH.

**How to avoid:**
1. Define every brand color token directly in OKLCH inside `@theme` in `globals.css` — copy values verbatim from `LANDING-PAGE-BRIEF.md` Section 1.
2. Do not accept hex values in any brand token definition. Review `globals.css` before marking UI work complete.
3. Use the `oklch()` CSS function directly: `--color-mint: oklch(0.92 0.18 142);`
4. Verify on a wide-gamut display (or Chrome DevTools color picker showing P3 gamut) that the rendered mint is visually distinct from a hex approximation.

**Warning signs:**
- Any `#` character in the `@theme` block for brand colors.
- Color values copied from a screenshot rather than from the brief document.
- `tailwind.config.js` still present and defining colors (v4 uses CSS-first, not config-first).

**Phase to address:** Design tokens / CSS foundation phase — must be locked before any component work

---

### Pitfall 4: Copy Drift During Implementation

**What goes wrong:**
Approved copy from `LANDING-PAGE-BRIEF.md` Section 2 (Feature-to-Benefit Translations) and the tone-of-voice rules in Section 4 gets paraphrased during implementation. Banned words ("AI-powered," "platform," "seamless," "intuitive," "workflow automation," "generative AI," "storyboard software," "template," "streamline") reappear because they are natural developer shorthand. Feature names get truncated. Pricing copy gets rounded or approximated.

**Why it happens:**
Developers type component copy from memory or paraphrase when wiring props. The brief is in a separate document. Under time pressure, "close enough" becomes the default.

**How to avoid:**
1. Treat approved copy as a source file: copy strings verbatim from `LANDING-PAGE-BRIEF.md` into a `content.ts` or `copy.ts` constants file at the start of the project. All components reference this file — they never contain inline string literals for user-facing copy.
2. Add a banned-word grep check as a pre-commit hook or CI step: `grep -rn "AI-powered\|platform\|seamless\|intuitive\|workflow automation\|generative AI\|storyboard software\|template\|streamline" src/`.
3. Copy review pass before deployment: load the live page and compare every visible string against the brief.

**Warning signs:**
- JSX files contain multi-word marketing strings as inline literals rather than referencing a constants file.
- Grep for any banned word returns hits in `.tsx` or `.astro` files.
- Pricing numbers in components differ from `POSITIONING.md` Section 4.2.

**Phase to address:** All content phases — establish the constants file in the foundation phase; enforce the grep check throughout

---

### Pitfall 5: PostHog Fires Duplicate Events or Fires Before Initialization

**What goes wrong:**
Two failure modes are common:

1. **Double initialization**: In Astro (or any framework with partial hydration), PostHog's snippet is included in both a layout-level `<script>` and a component-level `<script>`. It initializes twice. Every event fires twice.
2. **Missing `is:inline` in Astro**: Without the `is:inline` directive on the PostHog `<script>` tag, Astro processes it as a module, breaking the `window.posthog` global and causing TypeScript errors at build time.
3. **Events captured before `posthog.init()` completes**: Calling `posthog.capture()` synchronously on page load before init resolves drops the event silently.

**Why it happens:**
PostHog's own documentation shows a snippet that works in plain HTML. Frameworks add processing layers the snippet wasn't designed for. The initialization problem is silent — no errors, just missing data in the PostHog dashboard.

**How to avoid:**
1. Place the PostHog initialization snippet once, in the root layout, with `is:inline` (Astro) or as a `Script` component with `strategy="afterInteractive"` (Next.js).
2. Guard initialization: `if (!window.posthog) { posthog.init(...) }` prevents double-init on client-side navigation.
3. For Astro with `ClientRouter` (view transitions), add a listener: fire `posthog.capture('$pageview')` on `document.addEventListener('astro:page-load', ...)` — not on every component mount.
4. Capture custom events (`waitlist_form_submitted`, `cta_clicked`, etc.) only inside user interaction handlers (onClick, onSubmit) — never on module-level load.
5. Verify event deduplication in the PostHog dashboard after first deploy: check that each form submission shows exactly one `waitlist_form_submitted` event per distinct_id.

**Warning signs:**
- PostHog event count is 2x the number of actual interactions.
- `window.posthog` is undefined in browser console after page load.
- TypeScript build error: `Property 'posthog' does not exist on type 'Window & typeof globalThis'`.
- `posthog.capture()` calls at module scope (outside event handlers).

**Phase to address:** Analytics integration phase

---

### Pitfall 6: Mobile Dark Theme — Contrast and Viewport Breakdowns

**What goes wrong:**
Design-forward dark UIs built desktop-first commonly fail mobile in these specific ways:

1. **OKLCH wide-gamut colors look washed out on OLED phones**: Some Android OLED displays render wide-gamut OKLCH colors differently than macOS monitors. The primary mint at `oklch(0.92 0.18 142)` may appear nearly white on some screens, losing contrast against light text.
2. **Hero screenshot asset overflows on small viewports**: A Google Slides deck screenshot displayed at desktop scale does not scale down cleanly. Without `width={X} height={Y}` set on the `<Image>` component and `object-contain` CSS, the image either clips or forces horizontal scroll.
3. **Sticky CTAs or fixed elements obscure content on iOS Safari**: iOS Safari's dynamic toolbar eats viewport height. Elements positioned using `100vh` get clipped. Use `100dvh` (dynamic viewport height) in 2025.
4. **Text contrast on dark backgrounds**: Using `oklch(0.92 0.18 142)` as body text color on a near-black background may fail WCAG AA (4.5:1 minimum). Reserve the mint for accent elements and CTAs, not body copy.

**Why it happens:**
Desktop previews look correct in Chrome. Mobile testing is deferred. iOS Safari behaves differently from Chrome mobile, particularly around viewport units and color rendering.

**How to avoid:**
1. Test on a physical iOS device before marking any section complete — not just Chrome DevTools mobile simulation.
2. Define a max-width on screenshot assets and use `overflow: hidden` on their containers.
3. Replace `100vh` with `100dvh` for any full-screen section.
4. Run WCAG contrast check on all text/background OKLCH pairs: the primary mint `oklch(0.92 0.18 142)` should not be used as body text on `oklch(0.10 0.01 0)` — verify ratio.

**Warning signs:**
- Hero section requires horizontal scroll on iPhone 14 screen width (390px).
- Fixed/sticky nav obscures the first CTA on iOS.
- Only tested in Chrome DevTools responsive mode, never on a physical device.

**Phase to address:** Responsive polish phase (or QA gate within each UI phase)

---

### Pitfall 7: LCP Fails Due to Unoptimized Screenshot Assets

**What goes wrong:**
The brief specifies "show the deliverable first" — which means the Google Slides deck screenshot is the hero image. An unoptimized PNG or JPEG at full resolution will be the LCP element. A 2MB screenshot image on a mobile connection can take 4+ seconds to load, failing Google's 2.5-second LCP threshold. This directly impacts SEO and conversion since Directors hitting the page on mobile leave before the image renders.

**Why it happens:**
Designers export full-resolution screenshots (2880×1800 or similar) from macOS. Developers drop them into `/public` without processing. They look fine on a fast connection.

**How to avoid:**
1. Use Next.js `<Image>` component (or Astro's `<Image>` equivalent) — automatic WebP/AVIF conversion, responsive `srcset`, and lazy loading by default.
2. For the hero image specifically: set `priority` (Next.js) or `loading="eager"` + `fetchpriority="high"` — the LCP element must not lazy-load.
3. Export screenshots at 2x max width of their display container (e.g., if displayed at 800px wide, export at 1600px), not at Retina screen resolution.
4. Target < 200KB for the hero screenshot after compression.

**Warning signs:**
- `/public` contains `.png` files over 500KB.
- Hero image uses a plain `<img>` tag instead of the framework's Image component.
- Lighthouse LCP score is red (>4s) on the performance audit.
- Hero `<Image>` component has no `priority` prop.

**Phase to address:** Initial hero section build; image optimization must be applied on first implementation, not as a later polish pass

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode checkout URLs as `#` until Lemon Squeezy is configured | Unblocks UI build | CTAs are non-functional in production; easy to miss before launch | Acceptable if env var fallback to `https://conjurestudio.app/auth/signup` is wired from day one |
| Inline copy strings in JSX instead of a `content.ts` constants file | Faster first pass | Copy drift, banned words reappear, pricing values drift; very hard to audit | Never acceptable — the brief explicitly forbids copy changes |
| Skip `priority` on hero image and add it "later" | Builds faster | LCP failure; hero is always the LCP element, this is not optional | Never acceptable for the primary hero image |
| Use hex colors while building and "convert later" | Easier to eyeball | Brand violation; conversion is easily forgotten; OKLCH rendering is different, not equivalent | Never acceptable — conversion is not a safe approximation |
| Protect `/admin` in middleware only | Simpler code | CVE-2025-29927 bypass; Supabase table exposed | Never acceptable — double-check must exist at the route handler level |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `POST https://conjurestudio.app/api/waitlist` | No CORS headers on the Conjure app endpoint; works in dev (same origin), breaks from landing page domain | Add `OPTIONS` handler + `Access-Control-Allow-Origin` header to the Conjure app's `api/waitlist` route before first landing page deploy |
| PostHog (Astro) | Missing `is:inline` on the script tag; PostHog processes as module; `window.posthog` undefined | Always use `is:inline` for the initialization snippet; use `is:inline` attribute, not module syntax |
| PostHog (Next.js) | Placing `posthog.init()` in a `useEffect` inside multiple components; initializes on every component mount | Single init in root layout with a guard: `if (!window.posthog.__loaded) { posthog.init(...) }` |
| Supabase (admin view) | Importing the service-role key in a component that ships to the client bundle | Only read `SUPABASE_SERVICE_ROLE_KEY` inside a Server Component or API route — never in client components |
| Lemon Squeezy checkout URLs | Hardcoded `undefined` or empty string when env var is not set; `href` renders as `href="undefined"` | Always provide a fallback: `process.env.LEMON_SQUEEZY_DIRECTOR_URL ?? 'https://conjurestudio.app/auth/signup'` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full-resolution screenshot as hero | Lighthouse LCP > 4s; slow First Contentful Paint on mobile | Use framework Image component with `priority`, export at 2x display width | Immediately on any mobile connection; always affects LCP |
| Multiple web fonts (Geist Sans + Geist Mono) loaded without display swap | FOUT (flash of invisible text); layout shift on load | `font-display: swap` in `@font-face`; preload the primary weight | Every page load until fonts cache |
| `<Image>` without explicit `width` and `height` | CLS (Cumulative Layout Shift) as image loads; content jumps | Always pass explicit dimensions or use `fill` with a sized container | Every page load |
| Unguarded admin Supabase query (no pagination) | If waitlist grows to thousands of rows, admin page loads slowly | Add `LIMIT 500` or paginate from the start | At ~1,000 signups |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Middleware-only auth on `/admin` | CVE-2025-29927 header bypass exposes Supabase waitlist data to anyone | Re-check `ADMIN_PASSWORD` inside the Server Component/route handler, not only in `middleware.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` in client-accessible env var (missing `NEXT_PUBLIC_` prefix check is not enough — bundler leaks are subtle) | Supabase RLS bypassed; full DB write access | Audit with `NEXT_PUBLIC_` prefix search; service role key must only appear in server contexts |
| `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true` | Browser blocks the request (spec violation); or if allowed, credential leakage | Never combine wildcard origin with credentials header; use explicit landing page origin |
| Password comparison using `===` instead of `crypto.timingSafeEqual` | Timing attack allows password enumeration | Use Node.js `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` |
| `ADMIN_PASSWORD` logged in server console or error messages | Credential exposure in Vercel log drain | Never log env vars; ensure error handlers don't include `process.env` in output |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Waitlist form shows no loading state during POST | Director clicks submit, nothing happens visually; they click again, duplicate submission | Disable the submit button + show spinner immediately on submit; re-enable only on error |
| Form error message exposes API internals ("500 Internal Server Error") | Confuses non-technical users; exposes implementation details | Show "Something went wrong — try again" for 5xx; "You're already on the list" for duplicate email (the API returns 200 for duplicates, so handle this client-side) |
| Pricing CTA falls back to trial URL but button still says "Start [Tier] Plan" | User clicks "Start Director Plan", lands on generic signup; expectation mismatch | When using fallback URL, update button text to "Join Waitlist" or "Get Early Access" |
| Social proof section with raw `<!-- TESTIMONIAL_REQUIRED -->` HTML comment visible in rendered output | Comment appears as text in some Astro/JSX configurations | Ensure comment is inside a conditional: `{false && <TestimonialSection />}` or use a proper TODO block |
| Banned words in copy make the page sound generic/corporate | ICPs (Directors, Agency CDs) feel like they're reading standard SaaS copy; stops scroll | Grep audit before every deploy; constants file enforced |

---

## "Looks Done But Isn't" Checklist

- [ ] **Waitlist form:** Verify the POST reaches `conjurestudio.app/api/waitlist` from the *deployed* landing page domain — not just from localhost. Check Supabase for the test row.
- [ ] **Admin route:** Verify the password check exists in the Server Component body, not only in `middleware.ts`. Test by sending `x-middleware-subrequest: middleware` header manually.
- [ ] **Brand colors:** Grep for `#` in the `@theme` block. Zero results expected for brand tokens.
- [ ] **Banned copy words:** Grep output is empty for all 10 banned terms across all source files.
- [ ] **PostHog events:** Open PostHog Live Events dashboard, submit the waitlist form once. Confirm exactly one `waitlist_form_submitted` event appears.
- [ ] **Hero image:** Run Lighthouse on the deployed page. LCP must be < 2.5s on mobile simulation.
- [ ] **Mobile layout:** Load on a physical iPhone (Safari, not Chrome) at 390px viewport. No horizontal scroll. No clipped CTAs behind Safari toolbar.
- [ ] **Checkout URL fallback:** Confirm env vars are unset in a branch deploy and all pricing CTAs still link to `https://conjurestudio.app/auth/signup` — not `href="undefined"`.
- [ ] **Supabase key scope:** Confirm `SUPABASE_SERVICE_ROLE_KEY` does not appear in `NEXT_PUBLIC_` form or in any client bundle (search `_next/static` in browser DevTools).

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CORS failure discovered post-launch | LOW | Add CORS headers to Conjure app `api/waitlist` route; redeploy Conjure app; no landing page change needed |
| Admin bypass discovered | MEDIUM | Hotfix: add server-side password check; rotate `ADMIN_PASSWORD`; audit Supabase logs for unauthorized access |
| Brand colors are hex approximations | MEDIUM | Replace hex with OKLCH values in `@theme`; rebuild; redeploy. Visual regression on all color-bearing components. |
| Copy drift discovered before launch | LOW | Update `content.ts` constants; components inherit the fix automatically if constants file pattern was followed |
| Duplicate PostHog events in data | MEDIUM | Remove double-init; historical data is already double-counted and cannot be corrected retroactively; add event deduplication filter in PostHog dashboard |
| Hero LCP failure | LOW | Add `priority` prop to hero `<Image>`; compress source file; redeploy |
| `href="undefined"` on pricing CTAs | LOW | Add env var fallback string; redeploy |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-----------------|--------------|
| Admin middleware-only auth (CVE-2025-29927) | Foundation / Admin route phase | Manual: send `x-middleware-subrequest` header, confirm 401 returned from route handler |
| CORS on waitlist form POST | Integration / Form wiring phase | Test POST from deployed landing page URL; check Supabase for entry |
| Brand color hex approximation | Design tokens / CSS foundation phase | Grep for `#` in `@theme`; visual check on wide-gamut display |
| Copy drift and banned words | All phases (enforce from start) | Pre-deploy grep audit across all source files |
| PostHog duplicate events | Analytics integration phase | PostHog Live Events: 1 event per form submission |
| Mobile dark theme breakdowns | Responsive polish phase (QA gate each phase) | Physical iPhone Safari test; no horizontal scroll |
| Hero LCP failure | Initial hero section build | Lighthouse mobile LCP < 2.5s on deployed URL |
| Checkout URL `undefined` | Pricing section phase | Test with env vars unset on branch deploy |
| Supabase key scope leak | Admin route phase | `NEXT_PUBLIC_` search; bundle audit |

---

## Sources

### v1.1 Sources

- CSS sticky and overflow: [Polypane — all the ways position:sticky can fail](https://polypane.app/blog/getting-stuck-all-the-ways-position-sticky-can-fail/), [CSS-Tricks — dealing with overflow and sticky](https://css-tricks.com/dealing-with-overflow-and-position-sticky/), [terluinwebdesign — overflow: clip not overflow: hidden](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/)
- IntersectionObserver pitfalls: [Chrome for Developers — sticky headers with IO](https://developer.chrome.com/docs/css-ui/sticky-headers), [BenNadel — top -1px sentinel pattern](https://www.bennadel.com/blog/3932-using-a-top-of-1px-to-observe-position-sticky-intersection-changes-in-angular-11.0.3.htm), [xjavascript — IO scroll direction](https://www.xjavascript.com/blog/how-do-i-know-the-intersectionobserver-scroll-direction/)
- backdrop-filter Safari bugs: [Tailwind GitHub Issue #13844 — backdrop-blur webkit](https://github.com/tailwindlabs/tailwindcss/issues/13844), [Tailwind GitHub Discussion #15103 — nested backdrop-blur](https://github.com/tailwindlabs/tailwindcss/discussions/15103), [Medium — overcoming backdrop-filter in Safari](https://medium.com/@wendyteo.wy/enhancing-my-web-portfolio-overcoming-backdrop-filter-challenges-in-safari-0f84aae74a83), [Apple Community thread — iOS 18 backdrop-filter + background-color bug](https://discussions.apple.com/thread/255764118)
- backdrop-filter stacking context: [Medium — backdrop-filter fails with positioned children](https://medium.com/@aqib-2/why-backdrop-filter-fails-with-positioned-child-elements-0b82b504f440), [MDN — stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
- iOS viewport height: [Smashing Magazine — new viewport units](https://www.smashingmagazine.com/2023/12/new-css-viewport-units-not-solve-classic-scrollbar-problem/), [modern-css.com — dvh, svh, lvh](https://modern-css.com/mobile-viewport-height-without-100vh-hack/)
- will-change overuse: [MDN — will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change), [CSS-Tricks — when to reach for contain and will-change](https://css-tricks.com/when-is-it-right-to-reach-for-contain-and-will-change-in-css/)
- React Server Component boundaries: [LogRocket — 6 RSC performance pitfalls in Next.js](https://blog.logrocket.com/react-server-components-performance-mistakes), [Next.js docs — use client directive](https://nextjs.org/docs/app/api-reference/directives/use-client)
- backdrop-filter GPU performance: [shadcn/ui GitHub Issue #327 — backdrop-filter performance](https://github.com/shadcn-ui/ui/issues/327)

### v1.0 Sources

- Next.js CVE-2025-29927 middleware bypass: [ProjectDiscovery analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass), [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/)
- Tailwind v4 OKLCH and `@theme`: [Tailwind CSS v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4), [Tailwind CSS Colors docs](https://tailwindcss.com/docs/customizing-colors)
- Tailwind v4 hex fallback discussion: [GitHub Discussion #16392](https://github.com/tailwindlabs/tailwindcss/discussions/16392)
- PostHog SPA tracking and duplicate events: [PostHog SPA pageviews tutorial](https://posthog.com/tutorials/single-page-app-pageviews), [Avoiding duplicate events](https://posthog.com/questions/avoiding-duplicate-events), [Idempotency issue #17211](https://github.com/PostHog/posthog/issues/17211)
- PostHog Astro integration pitfalls: [PostHog Astro docs](https://posthog.com/docs/libraries/astro), [posthog-js Astro issue #627](https://github.com/PostHog/posthog-js/issues/627)
- CORS on Vercel: [Vercel CORS guide](https://vercel.com/kb/guide/how-to-enable-cors)
- Core Web Vitals and LCP: [Next.js image optimization](https://nextjs.org/docs/14/app/building-your-application/optimizing/images), [Vercel Core Web Vitals guide](https://vercel.com/kb/guide/optimizing-core-web-vitals-in-2024)

---

*Pitfalls research for: Conjure Landing Page — v1.1 scroll-synced sticky panel and glass surface redesign*
*Researched: 2026-03-12*
