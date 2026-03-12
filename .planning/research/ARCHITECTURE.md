# Architecture Research

**Domain:** Scroll-synced sticky panel + glass surface redesign — Conjure Landing Page v1.1
**Researched:** 2026-03-12
**Confidence:** HIGH (existing codebase is fully readable; scroll-spy pattern is well-established)

---

## Milestone Scope

This document focuses on the v1.1 milestone: replacing the static `FeaturesSection` card grid with a scroll-synced sticky panel (left: scrolling feature text; right: sticky screenshot display) and fixing `.glass-surface` so it reads as actual glass in Safari. Everything else on the page (Header, HeroSection, HowItWorksSection, PricingSection, FAQSection, WaitlistSection, Footer) is untouched.

---

## System Overview

The redesign touches exactly one section (`FeaturesSection`) and one global utility (`.glass-surface`). The existing architecture is server-first. The new `FeaturesSection` must become a Client Component because it drives interactive scroll state.

```
page.tsx (Server Component)
|
+-- FadeInWrapper (Client) -- REMOVE from around FeaturesSection (see Anti-Pattern 1)
|
+-- FeaturesSection (REWRITE: 'use client')
|   |
|   +-- [left column] Feature text blocks
|   |     Each block has an invisible scroll sentinel <div>
|   |     useScrollSpy hook observes all sentinels
|   |
|   +-- [right column] FeaturePanel (new, sticky)
|         Receives activeIndex prop
|         Renders FEATURE_LIST[activeIndex].img via next/image
|
+-- FeatureNav (new, optional sticky left column)
      Receives activeIndex + onSelect props
      Renders feature title list with active indicator
      Clicking a title scrolls sentinel into view + sets state

globals.css
  .glass-surface (MODIFY: add explicit -webkit-backdrop-filter)
```

`activeIndex` (integer 0–5) is the single piece of state. Everything flows down from it.

---

## Component Responsibilities

| Component | New or Modified | Responsibility | Client or Server |
|-----------|----------------|----------------|-----------------|
| `FeaturesSection` | Modified (full rewrite) | Owns `activeIndex` state; renders two-column sticky layout; mounts scroll observers | `'use client'` |
| `FeatureNav` | New | Vertical list of feature titles with active indicator; receives `activeIndex` + `onSelect` | Client (receives props; no own state) |
| `FeaturePanel` | New | Sticky screenshot display; receives `activeIndex`; renders `FEATURE_LIST[activeIndex].img` | Client (receives props; no own state) |
| `useScrollSpy` | New hook | Attaches `IntersectionObserver` to each feature's scroll sentinel; calls `setActiveIndex` when sentinel enters viewport | Client hook |
| `.glass-surface` | Modified | Adds `-webkit-backdrop-filter` explicitly; increases background opacity for visible contrast against dark bg | CSS utility in `globals.css` |
| `FadeInWrapper` | Removed from FeaturesSection | No longer wraps FeaturesSection (sticky conflict; see Anti-Pattern 1) | — |
| `content.ts` / `FEATURES` | Unchanged | Source of truth for copy; `FEATURE_LIST` array stays in `FeaturesSection` | N/A |

---

## Recommended File Structure (additions and changes only)

```
conjure-landing-page/src/
├── components/
│   ├── sections/
│   │   └── FeaturesSection.tsx        # REWRITE — becomes 'use client'
│   └── features/                      # NEW folder
│       ├── FeatureNav.tsx             # NEW — sticky nav list
│       └── FeaturePanel.tsx           # NEW — sticky screenshot
├── hooks/
│   ├── useFadeIn.ts                   # Unchanged
│   └── useScrollSpy.ts               # NEW — IntersectionObserver for active index
└── app/
    └── globals.css                    # MODIFY .glass-surface only
```

Rationale for `components/features/` subfolder: keeps sub-components out of the flat `sections/` directory. `FeaturesSection.tsx` imports from it; nothing else does.

---

## Architectural Patterns

### Pattern 1: Scroll Spy via IntersectionObserver

**What:** Each feature in the list has an invisible sentinel `<div>` placed at the top of that feature block. An `IntersectionObserver` with `rootMargin: '0px 0px -50% 0px'` fires when a sentinel crosses the viewport midpoint. When it enters, `setActiveIndex(i)` is called.

**When to use:** When scroll position must drive UI state without polling `window.scrollY` on every frame.

**Trade-offs:**
- Pro: No scroll event listeners — zero jank, runs off main thread.
- Pro: Handles rapid scrolling correctly (last intersecting entry wins).
- Con: `rootMargin` percentage values are relative to the root (viewport), not the element — requires tuning.
- Con: Needs cleanup on unmount to avoid observer leaks.

**Confidence:** HIGH — well-established pattern; used by CSS-Tricks, Linear, Stripe-style feature sections.

**Example:**
```typescript
// src/hooks/useScrollSpy.ts
'use client'
import { useEffect, useRef } from 'react'

export function useScrollSpy(
  count: number,
  onActiveChange: (index: number) => void,
) {
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = sentinelRefs.current.indexOf(entry.target as HTMLDivElement)
            if (i !== -1) onActiveChange(i)
          }
        })
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 },
    )
    sentinelRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [count, onActiveChange])

  return sentinelRefs
}
```

### Pattern 2: Two-Column Sticky Layout via CSS Only

**What:** The section uses CSS grid with two columns. The left column contains the scrolling feature text blocks (natural document flow). The right column uses `position: sticky; top: [offset]` — the panel stays fixed while the left content scrolls past it.

**When to use:** Any "reading pane" that must track scrolling content on the other side.

**Trade-offs:**
- Pro: Pure CSS — no JS for sticky behavior itself.
- Pro: Well-supported across all modern browsers.
- Con: Sticky breaks silently if any ancestor has `overflow: hidden` or a CSS `transform`. This is the most common failure mode. See Anti-Pattern 1.

**Example layout:**
```tsx
// Inside FeaturesSection
<section className="relative py-24 px-6 max-w-5xl mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

    {/* Left: scrolling feature blocks */}
    <div>
      {FEATURE_LIST.map((f, i) => (
        <div key={f.key} className="mb-32">
          {/* invisible sentinel — observed by useScrollSpy */}
          <div ref={(el) => { sentinelRefs.current[i] = el }} aria-hidden="true" />
          <h3 className="text-foreground font-medium text-xl mb-3">{f.TITLE}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{f.OUTCOME}</p>
        </div>
      ))}
    </div>

    {/* Right: sticky screenshot panel */}
    <div className="sticky top-24 self-start">
      <FeaturePanel activeIndex={activeIndex} />
    </div>

  </div>
</section>
```

### Pattern 3: Controlled Active State Lifted to Parent

**What:** `FeaturesSection` owns `activeIndex` as `useState`. `useScrollSpy` fires `setActiveIndex` via callback. `FeatureNav` also triggers `setActiveIndex` on click. Both `FeatureNav` and `FeaturePanel` are purely display — they receive `activeIndex` as a read-only prop.

**When to use:** Multiple child components must react to the same scalar state.

**Trade-offs:**
- Pro: Single source of truth — no sync bugs.
- Pro: Click and scroll both drive the same setter.
- Con: Click path should also call `sentinelRefs.current[i].scrollIntoView({ behavior: 'smooth' })` so the scroll position stays consistent with the displayed feature. If omitted, the scroll spy will eventually override the click-selected state as the user scrolls.

---

## Data Flow

### Scroll-Driven Active State

```
User scrolls down page
    |
    v
IntersectionObserver (useScrollSpy) fires on sentinel[i] entering viewport midpoint
    |
    v
onActiveChange(i) callback --> setActiveIndex(i) in FeaturesSection
    |
    +--> activeIndex prop to FeatureNav  --> highlights title i
    +--> activeIndex prop to FeaturePanel --> renders FEATURE_LIST[i].img
```

### Click-Driven Active State

```
User clicks title i in FeatureNav
    |
    v
onSelect(i) prop --> setActiveIndex(i) in FeaturesSection
                 --> sentinelRefs.current[i].scrollIntoView({ behavior: 'smooth' })
    |
    +--> activeIndex prop to FeatureNav  --> highlights title i
    +--> activeIndex prop to FeaturePanel --> renders FEATURE_LIST[i].img
```

### Glass Surface Fix

```
globals.css .glass-surface
    |
    backdrop-filter: blur(var(--glass-blur))                     -- all browsers
    -webkit-backdrop-filter: blur(var(--glass-blur))             -- Safari (MUST be explicit)
    background: linear-gradient(145deg, oklch(0.20 0 0 / 0.55) 0%, oklch(0.10 0 0 / 0.35) 100%)
    border: 1px solid var(--glass-border)
    border-top-color: var(--glass-border-top)                    -- brighter top edge for depth
    |
    Applied to: FeaturePanel wrapper (and any existing card using .glass-surface)
```

---

## Integration Points

### FadeInWrapper / transform Conflict (Critical)

`FadeInWrapper` applies `.fade-in-section` which starts with `transform: translateY(1rem)`. **A CSS `transform` on an ancestor creates a new containing block and breaks `position: sticky`** — the sticky element's scroll container becomes the transformed ancestor rather than the viewport. The panel will not stick.

Resolution options:

| Option | Approach | Trade-off |
|--------|----------|-----------|
| A — Recommended | Remove `FadeInWrapper` from around `FeaturesSection` in `page.tsx` | Loses fade-in for this section only; section is long enough that it is already in view before user reaches it |
| B | Keep `FadeInWrapper` but apply `opacity`-only fade (remove `translateY` via a modifier class) | Requires new CSS class; more surface area |
| C | Move fade to an inner div that does not contain the sticky column | More complex DOM nesting |

Option A is cleanest. Change in `page.tsx`:
```tsx
// Before (remove the wrapping FadeInWrapper from FeaturesSection only):
<FadeInWrapper>
  <FeaturesSection />
</FadeInWrapper>

// After:
<FeaturesSection />
```

### Internal Component Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `FeaturesSection` ↔ `FeatureNav` | Props: `activeIndex: number`, `onSelect: (i: number) => void` | FeatureNav has no internal state |
| `FeaturesSection` ↔ `FeaturePanel` | Prop: `activeIndex: number` | Panel reads `FEATURE_LIST[activeIndex]` directly — no need to pass the full feature object |
| `FeaturesSection` ↔ `useScrollSpy` | Hook callback: `onActiveChange: (i: number) => void` | Hook owns observer refs; parent owns state |
| `FeaturesSection` ↔ `FadeInWrapper` | Parent/child — remove this relationship | See above |
| `.glass-surface` ↔ Safari | CSS `-webkit-backdrop-filter` | Must be explicit in `globals.css`; Tailwind v4 does not reliably emit it (open bug confirmed 2025) |
| `FeaturePanel` ↔ `next/image` | Component props `src`, `width`, `height`, `alt` change with `activeIndex` | Next.js handles per-src optimization; use `priority` on index 0 |

---

## Build Order

Build in this order. Each step is independently testable before the next depends on it.

| Step | What | File | Depends On | Testable By |
|------|------|------|-----------|-------------|
| 1 | Fix `.glass-surface` — add `-webkit-backdrop-filter`, verify contrast | `globals.css` | Nothing | Visual check in Safari devtools simulator |
| 2 | Create `useScrollSpy` hook — pure hook, no UI | `hooks/useScrollSpy.ts` | Nothing | Console log or unit test |
| 3 | Create `FeaturePanel` — receives `activeIndex`, renders screenshot | `components/features/FeaturePanel.tsx` | `FEATURE_LIST` shape (stable) | Render with hardcoded `activeIndex={0}` |
| 4 | Create `FeatureNav` — receives `activeIndex` + `onSelect`, renders title list | `components/features/FeatureNav.tsx` | Nothing | Render with hardcoded props |
| 5 | Rewrite `FeaturesSection` — add `'use client'`, two-column layout, wire hook + state | `components/sections/FeaturesSection.tsx` | Steps 2, 3, 4 | Scroll through page |
| 6 | Remove `FadeInWrapper` from `FeaturesSection` in `page.tsx` | `app/page.tsx` | Step 5 | Verify sticky panel stays fixed during scroll |
| 7 | QA pass — Safari blur, sticky behavior, click nav, keyboard accessibility on FeatureNav buttons | All | Steps 1–6 | Manual + screenshot |

---

## Anti-Patterns

### Anti-Pattern 1: transform on a Sticky Ancestor

**What people do:** Leave `FadeInWrapper` (which applies `transform: translateY()`) wrapping `FeaturesSection`.

**Why it's wrong:** The CSS spec says a transformed element creates a new containing block. `position: sticky` treats the nearest scrollable ancestor as its scroll container — if that ancestor has a transform, the sticky panel treats it as the container, not the viewport. The panel will not stick at all or will stick to the wrong boundary.

**Do this instead:** Remove `FadeInWrapper` from around `FeaturesSection`. Keep it on all other sections. Verify there is no `transform`, `filter`, `will-change: transform`, or `contain` on any ancestor between the sticky element and `<body>`.

### Anti-Pattern 2: Animating `src` swaps with opacity directly on `<Image>`

**What people do:** Put `transition: opacity 0.3s` on the `<Image>` component and toggle it when `activeIndex` changes. A flash appears because the old and new images race during the transition — `next/image` does not guarantee immediate decode of the new `src`.

**Do this instead:** Either (a) pre-render all six images in the DOM with `opacity: 0 / opacity: 1` toggling — Next.js can decode them all at mount — or (b) accept a direct snap on `activeIndex` change. The screenshots are contained in a fixed-size panel so there is no layout shift either way. For a landing page, a direct swap is acceptable.

### Anti-Pattern 3: Scroll Event Listeners for Active State

**What people do:** Add `window.addEventListener('scroll', handler)` in `useEffect` and compute active feature with `getBoundingClientRect()` on every scroll event.

**Why it's wrong:** Scroll events fire on the main thread at display refresh rate (120 calls/second on 120Hz displays). `getBoundingClientRect()` forces synchronous layout recalculation on each call. Result: visible jank on mid-range hardware.

**Do this instead:** `IntersectionObserver` fires off the main thread and only when intersection changes. It is both more performant and more semantically correct for this use case.

### Anti-Pattern 4: Relying on Tailwind `backdrop-blur-*` for Safari

**What people do:** Use `backdrop-blur-lg` from Tailwind and assume `-webkit-backdrop-filter` is emitted automatically.

**Why it's wrong:** Tailwind v4 has a confirmed open bug (reported August 2025, still open as of March 2026) where `-webkit-backdrop-filter` is not reliably emitted in all build configurations. The `.glass-surface` utility in `globals.css` already applies blur via CSS variables — the fix is to add `-webkit-backdrop-filter: blur(var(--glass-blur))` explicitly in that same block. No Tailwind utility class needed.

### Anti-Pattern 5: Storing Feature Image Paths in content.ts

**What people do:** Move the `img` / `w` / `h` fields from `FEATURE_LIST` into `content.ts` alongside copy.

**Why it's wrong:** `content.ts` is the source of truth for marketing copy. Image paths and dimensions are implementation concerns, not copy. Mixing them makes content edits riskier and adds non-copy fields to the content contract.

**Do this instead:** Keep `FEATURE_LIST` (with image paths) local to `FeaturesSection.tsx` as it is today. `content.ts` exports only copy (`FEATURES.SHOT_EXTRACTION.TITLE`, etc.). `FeaturesSection` merges copy from `content.ts` with image paths from the local array.

---

## Scaling Considerations

This is a static marketing page. Performance considerations are:

| Concern | Approach |
|---------|----------|
| Six feature screenshots loaded at once | Use `priority` on index 0 image; let remaining five lazy-load (default). Alternatively pre-render all six as `opacity: 0` for instant swap. All are `.webp` and already sized correctly in `FEATURE_LIST`. |
| IntersectionObserver leak | `useScrollSpy` must call `observer.disconnect()` in its `useEffect` cleanup function. Already included in the example above. |
| `onActiveChange` identity stability | Wrap `setActiveIndex` or the callback passed to `useScrollSpy` in `useCallback` to avoid re-running the observer `useEffect` on every render. |

---

## Sources

- Direct codebase read: `FeaturesSection.tsx`, `globals.css`, `useFadeIn.ts`, `FadeInWrapper.tsx`, `page.tsx`, `content.ts` — HIGH confidence
- CSS-Tricks: [Sticky Table of Contents with Scrolling Active States](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/) — HIGH confidence (authoritative, verified pattern)
- DEV Community: [Create section navigation with React and IntersectionObserver](https://dev.to/maciekgrzybek/create-section-navigation-with-react-and-intersection-observer-fg0) — MEDIUM confidence (community, consistent with spec)
- Tailwind CSS GitHub issue #18765: [backdrop-blur not working on Safari 18.6](https://github.com/tailwindlabs/tailwindcss/issues/18765) — HIGH confidence (official repo, confirmed open 2025)
- Tailwind CSS docs: [backdrop-filter-blur](https://tailwindcss.com/docs/backdrop-filter-blur) — HIGH confidence (official)
- MDN CSS Containing Block spec: transform creates new containing block — HIGH confidence (spec-level, stable)

---

## Prior Architecture (v1.0 — Full Page)

The section below documents the broader landing page architecture established in v1.0. It remains valid for all sections outside the FeaturesSection redesign.

---

### System Overview (v1.0)

```
BROWSER (Client)
  / (Landing Page)            /admin (Protected Admin View)
  - Hero                       - Password gate (cookie check)
  - Features                   - Waitlist signup table
  - Pricing
  - Social Proof
  - Waitlist Form
       |                              |
       v                              v
conjurestudio.app/api/waitlist    Supabase (direct)
(cross-origin POST, no proxy)     waitlist table / service_role key
                                  server component only, never client
       |
       v
PostHog (client-side JS, custom events)
```

### Component Responsibilities (v1.0)

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `/` root page | Single-page marketing experience | Next.js Server Component |
| `HeroSection` | Headline, subhead, deck output visual, CTA | Static markup + image |
| `FeaturesSection` | Scroll-synced sticky panel (v1.1 redesign) | Client Component (post-v1.1) |
| `PricingSection` | 4-tier table, CTA buttons with env fallback | Client Component (PostHog events) |
| `SocialProofSection` | Testimonial placeholder | Static markup |
| `WaitlistForm` | Email + optional name, POST to external API | Client Component |
| `/admin` route | Password gate + waitlist table | Server Component (Supabase query) |
| `AdminLoginForm` | Password input, sets session cookie | Client Component or Server Action |
| `PostHogProvider` | Wraps app, initializes SDK | Client Component (providers.tsx) |
| `middleware.ts` | Fast-path redirect for unauthenticated `/admin` | Edge middleware (cookie check) |

### Anti-Patterns (v1.0 — Still Relevant)

**Proxy the Waitlist API:** POST directly from the browser; the Conjure endpoint is public and handles CORS. No proxy needed.

**Middleware-Only Admin Auth:** Re-verify the session token in the Server Component before any Supabase query. Middleware is fast-path only. (CVE-2025-29927 context.)

**`SUPABASE_SERVICE_ROLE_KEY` in Client Components:** Never prefix with `NEXT_PUBLIC_`; service_role bypasses all Row Level Security.

### Sources (v1.0)

- CVE-2025-29927 Next.js middleware bypass — Vercel postmortem (official)
- PostHog Next.js docs — https://posthog.com/docs/libraries/next-js (official)
- Supabase service_role with Next.js Server Components — https://supabase.com/docs/guides/getting-started/quickstarts/nextjs (official)

---

*Architecture research for: Conjure Landing Page v1.1 — scroll-synced sticky FeaturesSection + glass surface redesign*
*Researched: 2026-03-12*
