# Feature Research

**Domain:** SaaS marketing landing page — v1.1 visual polish milestone (scroll-synced sticky panel + glass surface redesign)
**Researched:** 2026-03-12
**Confidence:** HIGH

## Context

This file covers two overlapping scopes:

1. **Original v1 landing page features** — retained from prior research (2026-03-11) for continuity
2. **v1.1 milestone features** — scroll-synced sticky panel (Stripe/Linear pattern) and `.glass-surface` redesign added below

The existing codebase has a working Next.js 15 landing page with: static feature card grid (6 features), a `.glass-surface` utility class (currently broken — blur is invisible on the dark background), a hero section, pricing section, FAQ, social proof placeholder, and waitlist form.

---

## Part 1 — v1 Landing Page Features (Prior Research, Retained)

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section — headline, subhead, primary CTA | First screen must communicate product value and direct action in under 3 seconds | LOW | Brief mandates: show the Google Slides deck output first; the deliverable is the hook. |
| Features section — benefit-driven, not spec-driven | Visitors won't decode feature lists; they need to see pain → outcome framing | LOW | 5 features defined in PROJECT.md. Each needs a stated pain → outcome framing. |
| Pricing section with clear tier structure | Professionals need to qualify budget before committing | MEDIUM | 4 tiers (Scout, Director, Producer, Studio). Paid-tier CTAs fall back to trial signup URL until Lemon Squeezy is configured. |
| Waitlist / signup form — email required, name optional | The conversion event. Minimal friction required. | LOW | POST to `conjurestudio.app/api/waitlist`. Error and success states required. |
| Mobile-responsive layout | 60%+ of B2B landing page traffic arrives mobile. Broken mobile = immediate bounce. | MEDIUM | Required by PROJECT.md. Must test at 375px, 768px, 1280px. |
| Brand token fidelity | Creative buyers will notice inconsistent color or type immediately — signals sloppy product | LOW | All colors from OKLCH table in brief. Geist Sans/Mono only. |
| Social proof section | Without third-party validation, all claims are self-serving | LOW | Ships as `<!-- TESTIMONIAL_REQUIRED -->` placeholder. |
| Analytics instrumentation | Cannot improve what isn't measured | LOW | 4 PostHog events from PROJECT.md. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Output-first hero — show the Google Slides deck before explaining how it works | Directors and Agency CDs are deliverable-oriented; competitors lead with interface screenshots | LOW | Content decision, not technical. Requires high-quality deck screenshot asset. |
| "How it works" — 3-step process section | Removes "sounds complicated" objection for borderline visitors | LOW | Not originally in PROJECT.md — added to MVP. Script → Session → Deck. |
| Outcome-language copy | Production-world vocabulary signals the product was built by people who understand the job | LOW | Already constrained by PROJECT.md ICP avoid list. |
| FAQ section | Removes last-friction objections before form; well-placed FAQ near CTA is a proven conversion lever | LOW | 3–5 questions targeting: no-drawing objection, data/privacy, difference from hiring an artist, trial scope. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full site navigation header | Feels "complete," professional | Navigation links are exit paths. Every external link reduces conversion. | Anchor links to page sections only. |
| Popup / exit-intent modal | Captures emails from abandoning visitors | Annoys professional audiences; associates tool with low-quality | FAQ section + sticky CTA handles objection-removal. |
| Animated / autoplay background video | Impressive for a film-industry tool | 3–6x page load penalty; kills mobile performance | Static hero screenshot + optional user-initiated video below the fold. |
| Multiple competing CTAs | Broader reach | Dilutes primary conversion goal | One CTA throughout. Research shows single-CTA pages outperform multi-CTA by 20–50%. |
| Live signup counter | FOMO / social proof | Displays "0" embarrassingly at launch; requires real-time Supabase | Add only after 500+ confirmed signups. |

---

## Part 2 — v1.1 Visual Polish Milestone Features

This milestone replaces the static feature card grid with a scroll-synced sticky panel layout and fixes `.glass-surface` so it reads as actual glass. Two independent sub-problems.

---

### Sub-Problem A: Scroll-Synced Sticky Panel (Stripe/Linear Pattern)

#### What "Stripe/Linear pattern" means

The Stripe and Linear homepages use a two-column layout where one column scrolls (feature text steps) while the opposite column stays sticky (a mockup frame with changing content). As the user scrolls down the text column, the sticky column's content — screenshot, illustration, or video — swaps to match the current feature step. The sticky column uses CSS `position: sticky` with a defined `top` offset; the content swap is driven by JavaScript detecting which text step is currently in the viewport.

This is distinct from:
- CSS scroll-driven animations (which tie values directly to scroll position / timeline — better for parallax)
- Full-page pin/scrub effects (GSAP ScrollTrigger pattern — heavier, more complex, not needed here)
- Tabbed interfaces (user-initiated, not scroll-driven)

#### Table Stakes for this pattern

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Sticky browser mockup frame (left or right panel) | Visitors have seen this pattern on Stripe, Vercel, Linear — missing it makes the section feel dated compared to modern SaaS peers | MEDIUM | Pure CSS `position: sticky` with `top` offset. Must define a scroll container (parent element) with enough height for the sticky to work. The sticky element stays within its parent boundaries — the parent must be taller than the viewport height. |
| Per-feature screenshots that swap without layout shift | The visual panel must change to match the current feature description — no cumulative layout shift (CLS) | MEDIUM | Best implementation: all screenshots pre-loaded, active one set to `opacity: 1`, inactive to `opacity: 0`, with `transition: opacity 300ms ease`. This avoids layout shift entirely. Do not unmount/mount images on swap. |
| Active step highlighting in text column | Users need a visual signal for which feature step is "current" — otherwise the scroll sync feels disconnected | LOW | Active step gets a distinct text color or left-border accent. Inactive steps are muted (`text-muted-foreground`). Simple CSS class swap. |
| Smooth opacity crossfade on screenshot swap | Abrupt hard-cuts feel cheap; crossfade reinforces the "polished" impression | LOW | `transition: opacity 200–300ms ease` on each screenshot. Stack all screenshots absolutely positioned in the same container. |
| Accessible at keyboard/no-scroll | Sticky scroll patterns that only work via mouse scroll are inaccessible | LOW | Ensure each feature's text is fully readable even without the screenshot. The screenshot is an enhancement, not load-bearing content. Alt text on all images. |

#### Differentiators for this pattern

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Browser mockup chrome (title bar, traffic lights, URL bar) | Frames the screenshots as product UI in context — makes raw screenshots feel like a real product demo rather than isolated images | MEDIUM | Build in pure HTML/CSS — no library needed. DaisyUI `mockup-browser` component or a hand-rolled equivalent. The chrome adds ~40px height overhead — account for this in the sticky panel sizing. |
| IntersectionObserver-based step detection (not scroll events) | `scroll` event listeners fire continuously and degrade performance; IntersectionObserver fires only when element crosses threshold — no jank | LOW | Use `react-intersection-observer` (`useInView` hook) or native `IntersectionObserver` in a `useEffect`. Configure `rootMargin: "-40% 0px -40% 0px"` (center 20% of viewport triggers swap) for reliable mid-scroll detection. No GSAP or heavy animation library needed. |
| Scrollama / scrollytelling library as an alternative | If IntersectionObserver implementation becomes complex, Scrollama.js (`react-scrollama` package) is a lightweight wrapper that handles step triggers cleanly | LOW-MEDIUM | `react-scrollama` is available on npm and has Next.js examples. However, it adds a dependency. For 6 feature steps, native IntersectionObserver is sufficient — avoid the dependency unless the native approach proves unreliable. |

#### Anti-Features for this pattern

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| GSAP ScrollTrigger for the pin/scrub effect | Visually impressive; used by agencies for heavy marketing sites | Adds 50KB+ bundle weight. The pin/scrub effect is excessive for a 6-step feature section. Conjure's page goal is conversion speed, not showcase animations. | Pure CSS `position: sticky` + IntersectionObserver. Zero extra dependencies. |
| Scroll-driven CSS `animation-timeline: scroll()` | Modern, no-JS solution | Browser support is incomplete as of early 2026 (Safari has partial support). Cannot safely use for production content that must work in Safari. | IntersectionObserver with opacity transitions. Works in all browsers. |
| `react-scrollama` or `react-sticky-box` dependency | Simplified API | 6-step feature scroll does not require a library. These packages add maintenance burden and may lag on Next.js major version updates. The native pattern is 30–50 lines of code. | Native IntersectionObserver in a `'use client'` component. |
| Auto-play video in the sticky panel | More dynamic than screenshots | Same performance penalty as hero video. Loads 6 videos into the DOM on page load. | Static screenshots. If video is desired, load it lazily only for the active step on user interaction. |
| Horizontal scroll layout (steps scroll horizontally) | "Novel" interaction | Kills mobile. Horizontal scroll on mobile is universally problematic for feature sections. Stripe and Linear use vertical scroll on desktop, stacked cards on mobile. | Vertical sticky scroll on desktop. Stacked cards (the current pattern) on mobile. |

#### Feature Dependencies for scroll panel

```
[Scroll-synced sticky panel]
    └──requires──> ['use client' directive on FeaturesSection component]
                       (currently a Server Component — must convert)
    └──requires──> [Parent container height > viewport height]
                       (CSS sticky only works if parent scrolls past the sticky element)
    └──requires──> [All 6 feature screenshots loaded and sized correctly]
                       (pre-load all; do not mount/unmount on swap)
    └──requires──> [IntersectionObserver setup with correct rootMargin]
                       (rootMargin of "-40% 0px -40% 0px" targets viewport center)
    └──requires──> [Active index state in React]
                       (useState to track current step; triggers screenshot opacity swap)

[Browser mockup chrome]
    └──enhances──> [Sticky panel — screenshot area]
    └──requires──> [Fixed aspect ratio for screenshot container]
                       (mockup chrome must have a defined inner content area)

[Mobile fallback — stacked cards]
    └──requires──> [Responsive CSS: sticky layout hidden on mobile, stacked layout shown]
                       (md:flex on the two-column layout; mobile uses existing or simplified card grid)
    └──conflicts──> [Sticky behavior on mobile]
                       (never apply sticky scroll sync below md breakpoint)
```

#### MVP Definition for scroll panel

Launch with (v1.1):
- [ ] `FeaturesSection` converted to `'use client'` — required for IntersectionObserver
- [ ] Two-column layout: text steps (left or right) / sticky mockup panel (opposite side)
- [ ] 6 step containers with IntersectionObserver refs, each updating `activeIndex` state
- [ ] 6 screenshots pre-loaded, crossfade on active index change (opacity transition, not mount/unmount)
- [ ] Browser mockup chrome wrapping the screenshot area
- [ ] Active step text highlighting (accent color on active, muted on inactive)
- [ ] Mobile fallback: single-column stacked layout (hide two-column, show card list below `md`)

Defer:
- [ ] Step progress indicator (numbered dots or line) — adds visual noise; reconsider after user testing
- [ ] Keyboard navigation between steps — nice-to-have, not blocking for v1.1

---

### Sub-Problem B: Glass Surface Redesign

#### Why `.glass-surface` is currently broken

The root cause is structural, not a CSS value tweak: `backdrop-filter: blur()` only blurs the pixels **directly behind** the element. The current Conjure landing page has a near-solid dark background (`oklch(0.04 0 0)` — essentially pure black). There is almost nothing visually varied behind the glass cards, so the blur filter has nothing interesting to work with. The result is a flat, dark rectangle with a thin border — indistinguishable from a regular card.

Three related issues in the current implementation:
1. **Background too opaque and dark** — `oklch(0.14 0 0 / 0.45)` on a near-black page background produces near-black
2. **No rich visual content behind the glass** — the `body::before` ambient glow orbs exist, but they are too subtle and too far from the card positions to contribute meaningfully to the blur
3. **Blur alone on a dark monochrome background produces nothing** — the blur averages dark pixels and returns dark pixels

#### Table Stakes for glass surface redesign

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Visible frosted-glass appearance | The `.glass-surface` class name promises a glass effect; cards must actually look different from regular dark cards | MEDIUM | Requires rich visual content behind the element. This is the core structural requirement — no CSS tweak alone fixes it. |
| Readable text contrast on glass | WCAG AA minimum (4.5:1 for body text) must be maintained over the semi-transparent background | LOW | Text must be `oklch(0.98 0 0)` (near-white). The glass background must not reduce contrast below threshold. |
| Consistent appearance across Safari and Chrome | `backdrop-filter` on Safari requires `-webkit-backdrop-filter` prefix (required through Safari 17; unprefixed works in Safari 18+) | LOW | Always ship both. Include `@supports (backdrop-filter: blur(1px))` fallback for browsers without support. |
| No performance degradation | `backdrop-filter` is GPU-intensive; applying to many large elements simultaneously causes frame drops | LOW | Keep blur at 12–20px (sweet spot). Do not apply to elements that cover large areas simultaneously. 6 small cards is acceptable. |

#### Differentiators for glass surface

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Background noise / grain texture behind glass cards | Grain texture is the best substitute for "content to blur" when the page background itself is minimal. A subtle SVG noise filter or CSS grain pattern placed behind the glass cards gives the blur filter something to work with — producing a visible frosted effect even on dark monochrome pages. | MEDIUM | Apply a noise layer to the section background, not to the card itself. Approaches: CSS `filter: url('#noise')` SVG filter, or a semi-transparent noise PNG/SVG tiled as `background-image`. Keep the noise subtle enough to not interfere with readability. |
| `backdrop-filter: blur() saturate()` combination | Adding `saturate(180%)` alongside the blur enhances perceived glass depth — the effect amplifies color variation in whatever is behind the glass, making even subtle backgrounds appear richer | LOW | `backdrop-filter: blur(16px) saturate(180%)`. Saturate alone does nothing on truly monochrome backgrounds — it amplifies variation, not creates it. Must be paired with the noise/gradient background approach. |
| Section-level glow gradient behind glass cards | A stronger, more localized radial gradient in the features section background (not the global body gradient) gives the blur filter visible color to average — resulting in a warm greenish tint in the glass, reinforcing the primary mint brand color | LOW-MEDIUM | Section-level `background` with a radial gradient centered near the card cluster. Can be a CSS `::before` pseudo-element on the `<section>`. This is additive to the existing `body::before` glow. |
| Inner highlight border (top-edge lighter border) | The current `.glass-surface` definition already has `border-top-color: oklch(0.98 0 0 / 0.22)`. This is the strongest visual cue of the three glass signals (blur, translucency, edge highlight). Increase this to `0.30–0.40` opacity for the redesign. | LOW | Already in the codebase. Just increase top border opacity. High ROI for low effort. |
| Box shadow with inner glow | A subtle inner shadow `inset 0 1px 0 oklch(0.98 0 0 / 0.10)` combined with an outer shadow `0 4px 24px oklch(0 0 0 / 0.40)` adds depth and separates the card from the background visually even when blur is minimal | LOW | Not in current implementation. Easy to add. Do not use the existing `--glow-hover` (mint glow) on resting state — reserve it for hover. |

#### Anti-Features for glass surface

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Increasing blur radius to 40px+ | "More blur = more glass effect" | False. `backdrop-filter: blur(40px)` on a near-black background blurs nothing into nothing. Performance also degrades exponentially above 20px. | Fix the background content first. Keep blur at 12–20px. |
| White/light glass cards on a dark background | High contrast, visible | This is frosted-glass on a light background — a different design language. Conjure's design system is dark with dark cards; white glass would break brand token fidelity. | Use the dark glass formula: semi-transparent dark card (`oklch(0.14 0 0 / 0.45)`) over a richly textured dark background. |
| CSS `backdrop-filter: brightness(0.8)` for "dark glass" | Creates a darkening effect | Just makes the blur result darker — still blurs nothing when nothing interesting is behind it. | Use `saturate()` not `brightness()` unless you specifically want a darker result. |
| Replacing `.glass-surface` with a purely opaque redesign | "Just make it look nice" | Abandons the visual language the design brief calls for. The glass surface is a deliberate brand token (space-grade aesthetic, per the brief). | Fix the structural issue (background content) rather than abandoning the effect. |
| `will-change: backdrop-filter` | Supposed performance optimization | Can trigger layer promotion and increase memory usage. Not recommended for `backdrop-filter` specifically. | Let the browser decide. Use `transform: translateZ(0)` only if profiling shows compositing issues. |

#### Feature Dependencies for glass surface

```
[Visible glass effect on .glass-surface cards]
    └──requires──> [Visual content behind the card element]
                       (the blur filter can only process pixels that exist behind the element)
    └──requires──> [Section-level background with noise or gradient variation]
                       OR
                   [Global body::before glow strengthened near features section position]

[backdrop-filter browser support]
    └──requires──> [-webkit-backdrop-filter on all .glass-surface declarations]
    └──requires──> [@supports fallback for unsupported browsers]
                       (fallback: semi-opaque solid background, no blur)

[Text readability on glass]
    └──requires──> [Foreground text at oklch(0.98 0 0) on glass background that stays dark enough]
                   (contrast ratio must stay above 4.5:1 as background lightens with blur effect)
```

#### MVP Definition for glass surface

Launch with (v1.1):
- [ ] Noise/grain texture added to the features section background (not global) — gives the blur filter visual content to work with
- [ ] `.glass-surface` adjusted: `backdrop-filter: blur(16px) saturate(180%)` with `-webkit-` prefix
- [ ] Background opacity on `.glass-surface` increased slightly to `oklch(0.18 0 0 / 0.55)` to improve readability
- [ ] Top border opacity increased from `0.22` to `0.32` for stronger edge highlight
- [ ] Inner + outer box shadow added to resting state (inset top highlight + bottom shadow)
- [ ] `@supports` fallback: `background: oklch(0.14 0 0 / 0.85)` for browsers without `backdrop-filter`
- [ ] Safari `-webkit-backdrop-filter` parity confirmed

Defer:
- [ ] Section-level radial gradient localized to the features section area — add if noise texture alone is insufficient
- [ ] Hover glow: already exists as `--glow-hover`; no changes needed

---

## Unified Feature Prioritization Matrix (v1.1 Milestone)

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Sticky two-column layout (CSS position:sticky) | HIGH | LOW | P1 |
| IntersectionObserver active step detection | HIGH | MEDIUM | P1 |
| Screenshot crossfade on active step change | HIGH | LOW | P1 |
| Active step text highlighting | MEDIUM | LOW | P1 |
| Convert FeaturesSection to 'use client' | HIGH | LOW | P1 — blocker for all scroll sync |
| Mobile fallback (stacked cards) | HIGH | LOW | P1 |
| Browser mockup chrome | MEDIUM | MEDIUM | P1 |
| Noise/grain texture behind glass cards | HIGH | MEDIUM | P1 — fixes root cause of broken glass |
| Glass surface CSS tuning (blur+saturate, borders, shadows) | MEDIUM | LOW | P1 |
| Safari `-webkit-backdrop-filter` parity | HIGH | LOW | P1 |
| `@supports` fallback for no-backdrop-filter browsers | MEDIUM | LOW | P1 |
| Step progress indicator (dots/line) | LOW | MEDIUM | P3 |
| Keyboard navigation between steps | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for v1.1 launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Dependencies on Existing Code

| Existing Component | Change Required | Impact |
|--------------------|-----------------|--------|
| `FeaturesSection.tsx` | Full rewrite — currently a Server Component returning a `<ul>` grid. Needs to become a `'use client'` component with two-column layout, sticky panel, and IntersectionObserver hooks. | HIGH — this is the primary deliverable |
| `globals.css` `.glass-surface` | Tune CSS values (blur+saturate, border-top opacity, box-shadow). Add `@supports` fallback. | LOW — no structural changes to the rest of the page |
| `globals.css` `body::before` | Optionally add a section-level background for the features section. Consider adding a localized radial gradient or noise texture. | LOW-MEDIUM — additive, does not break existing glow |
| `content.ts` `FEATURES` object | No change required — copy and keys are already correct | NONE |
| Feature screenshot `.webp` files | All 6 already in `/public` and sized. No new assets needed. | NONE |
| Page layout / `page.tsx` | No change required — `<FeaturesSection />` call signature stays the same | NONE |

---

## Sources

- [Aceternity UI — Sticky Scroll Reveal component pattern](https://ui.aceternity.com/components/sticky-scroll-reveal)
- [Pudding.cool — Easier scrollytelling with position:sticky](https://pudding.cool/process/scrollytelling-sticky/)
- [Cruip — How to Create a Sticky On Scroll Effect with JavaScript](https://cruip.com/how-to-create-a-sticky-on-scroll-effect-with-javascript/)
- [Josh W. Comeau — Next-level frosted glass with backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/)
- [Glassmorphism Design Trend: Complete Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [Nielsen Norman Group — Glassmorphism](https://www.nngroup.com/articles/glassmorphism/)
- [MDN — backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)
- [react-intersection-observer — GitHub: thebuilder/react-intersection-observer](https://github.com/thebuilder/react-intersection-observer)
- [Builder.io — React Intersection Observer: A Practical Guide](https://www.builder.io/blog/react-intersection-observer)
- [GitHub — russellsamora/scrollama](https://github.com/russellsamora/scrollama)
- [DaisyUI — mockup-browser component](https://daisyui.com/components/mockup-browser/)
- [Chrome for Developers — Scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)

---
*Feature research for: Conjure Landing Page — v1.1 visual polish milestone (scroll-synced sticky panel + glass surface redesign)*
*Researched: 2026-03-12*
