# Phase 2: Public Page - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all visitor-facing sections as a single-scroll landing page: Hero → How It Works → Features → Pricing → Social Proof → FAQ → Waitlist Form, plus a minimal header and footer. Admin route is out of scope (Phase 3). Page replaces the Phase 1 skeleton in `page.tsx`.

</domain>

<decisions>
## Implementation Decisions

### Visual Design Language
- Glass cards throughout — semi-transparent dark background (`--glass-bg`), blurred backdrop (`--glass-blur`), subtle white border (`--glass-border`), mint glow on hover (`--glow-hover`)
- Mint (`oklch(0.92 0.18 142)`) used for CTAs and interactive highlights only — buttons, links, hover states, active borders. Not for headings or decorative elements
- Typography: technical + precise — tight tracking, medium weight headings, Geist Mono for labels/numbers/tier names
- Section spacing: generous vertical padding, no explicit dividers, no background alternation between sections

### Hero Layout
- Screenshot presented inside a minimal browser chrome mockup (dark chrome, traffic light dots, URL bar)
- Desktop: two-column — text (headline + subhead + CTA) on the left, browser mockup on the right
- Mobile (375px): single-column stack in order: Headline → Subhead → CTA → Screenshot (CTA above the fold)
- Hero background: base dark only (`oklch(0.04 0 0)`) — no gradient, no glow bloom behind the screenshot

### Features Section
- 2-column grid on desktop, 1-column on mobile
- 5th card centered or full-width at the bottom of the grid
- Cards use glass surface style with hover glow

### Pricing Section
- 4 tier cards in a row on desktop (1-column stack on mobile)
- Director tier highlighted — mint border + "Most popular" badge
- Monthly/Annual toggle switch above the cards — annual view shows per-month price + "billed annually" + annual total
- All 4 tier CTAs use `checkoutUrls` from `env.ts` (falls back to trial signup URL if unset)

### Page Chrome
- Minimal sticky header: Conjure logo left, single "Start free" CTA right
- Header starts transparent over hero, transitions to glass surface style (`--glass-bg`, `--glass-blur`) once user scrolls past the hero (Intersection Observer)
- Fade-in on scroll for section entry — Intersection Observer, no external animation library
- Minimal footer: © Aumen Film Co · conjurestudio.app link

### Claude's Discretion
- Exact header height and logo treatment
- Specific card corner radius and border width values
- FAQ accordion vs static expand behavior
- How It Works step illustration/icon treatment
- Social proof placeholder layout specifics
- Waitlist form visual weight and background treatment

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/content.ts` — all approved copy constants (HERO, FEATURES, PRICING, WAITLIST, FAQ, HOW_IT_WORKS, SOCIAL_PROOF) — import these, never hardcode copy in components
- `src/lib/env.ts` — `posthogKey`, `posthogHost`, `checkoutUrls` (with fallback logic already wired)
- `src/components/providers/PostHogProvider.tsx` — PostHog already initialized; use `posthog.capture()` calls in client components

### Established Patterns
- Tailwind v4 CSS-first: no `tailwind.config.ts` — all design tokens via CSS variables in `globals.css @theme` block
- Token names: `bg-background`, `text-foreground`, `bg-card`, `text-primary`, `border-border` etc. — use these utility class names directly
- Glass surface: apply `--glass-bg`, `--glass-border`, `--glass-blur` as inline styles or custom CSS — no utility class exists yet, will need to add to globals.css or use inline
- Glow effects: `--glow-hover`, `--glow-focus`, `--glow-subtle` — apply via `box-shadow` on hover

### Integration Points
- `src/app/page.tsx` — Phase 2 replaces the entire `<main>` contents with actual section components
- `src/app/layout.tsx` — PostHogProvider and font variables already on `<html>` — no changes needed
- All PostHog events (cta_clicked, pricing_tier_viewed, waitlist_form_submitted, waitlist_form_error) fired from client components using `posthog.capture()`

</code_context>

<specifics>
## Specific Ideas

- Hero screenshot asset: the beach proposal storyboard (8-shot board, golden hour, "If It's Not a Hess..") — file is available on the user's desktop as a PNG from CleanShot
- The browser chrome mockup wrapping the screenshot should be minimal dark — not a full browser UI, just enough chrome to communicate "this is a software interface"
- "Start free — no credit card" is the exact CTA label for all primary CTAs (hero, pricing trial block, sticky header)
- Waitlist API response shape confirmed: `{ ok: true }` on 200; `{ error: "..." }` on 400/500. CORS headers already added to the Conjure app repo (conjurestudio.app/api/waitlist) — allows conjurestudio.ai origin

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-public-page*
*Context gathered: 2026-03-12*
