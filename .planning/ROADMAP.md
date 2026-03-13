# Roadmap: Conjure Landing Page

## Overview

Four phases take the project from a blank Next.js scaffold to a launch-ready marketing page. Foundation locks brand tokens and infrastructure first so no component ever touches a hex approximation or undefined env var. The public page phase builds everything a Director or Agency CD sees — hero through FAQ — and wires the live waitlist form. The admin route ships as a focused security phase because CVE-2025-29927 demands deliberate mitigation, not a retrofit. QA closes the loop with Lighthouse, physical device testing, and a banned-word audit before the domain goes live.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Brand tokens, env vars, PostHog init, and copy constants before any component is written
- [ ] **Phase 2: Public Page** - All visitor-facing sections rendered, waitlist form wired to live API, PostHog events firing
- [ ] **Phase 3: Admin Route** - Password-protected `/admin` with defense-in-depth auth and Supabase waitlist table
- [ ] **Phase 4: QA and Launch** - Lighthouse LCP, physical device testing, banned-word audit, CORS verification, and deploy

**Milestone v1.1: Visual Polish**

- [x] **Phase 5: Glass and Sticky Prerequisites** - `.glass-surface` structurally fixed and visible in Safari; `FadeInWrapper` removed so `position: sticky` can work (completed 2026-03-13)
- [x] **Phase 6: Scroll Panel** - `FeaturesSection` rewritten as two-column sticky layout with `IntersectionObserver` scroll sync, screenshot crossfade, and mobile fallback (completed 2026-03-13)
- [ ] **Phase 7: Cross-Browser QA** - Glass and sticky behavior verified in Safari desktop, physical iOS, and fallback browsers; WCAG AA contrast confirmed

## Phase Details

### Phase 1: Foundation
**Goal**: The project scaffold is deployed and every downstream component can pull brand tokens, env vars, copy strings, and analytics from locked, tested sources — no configuration drift possible
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06
**Success Criteria** (what must be TRUE):
  1. A Vercel deployment exists and returns a page with the correct dark background (`oklch(0.04 0 0)`) and Geist Sans body text — no hex fallbacks in the stylesheet
  2. Visiting the deployed URL triggers a PostHog `$pageview` and the browser Network tab shows no PostHog initialization errors
  3. `src/lib/content.ts` contains all approved copy strings and `src/lib/env.ts` returns the trial signup URL fallback when Lemon Squeezy env vars are absent
  4. Running `grep -r "#" src/styles` returns zero results (no hex colors in the design system)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold repo, install dependencies, create Vitest test infrastructure with RED stubs
- [x] 01-02-PLAN.md — Write globals.css (OKLCH tokens), lib/env.ts (accessor + fallback), lib/content.ts (all brief copy)
- [x] 01-03-PLAN.md — Root layout with Geist fonts + PostHogProvider, skeleton page, Vercel deploy

### Phase 2: Public Page
**Goal**: A visiting Director or Agency CD can scroll from hero to waitlist form, see the branded Google Slides deck output, understand what Conjure does, review pricing, and submit their email — all in one session
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HOW-01, HOW-02, FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05, FEAT-06, PRICE-01, PRICE-02, PRICE-03, PRICE-04, PRICE-05, PRICE-06, WAIT-01, WAIT-02, WAIT-03, WAIT-04, WAIT-05, WAIT-06, WAIT-07, SOCIAL-01, SOCIAL-02, FAQ-01, FAQ-02, FAQ-03, COPY-01, COPY-02
**Success Criteria** (what must be TRUE):
  1. The hero renders the branded Google Slides deck screenshot (or its `<!-- HERO_SCREENSHOT_REQUIRED -->` placeholder) above the fold, with headline and "Start free — no credit card" CTA visible without scrolling on a 375px viewport
  2. Submitting a valid email in the waitlist form shows a success state; submitting with a network error shows an error state; the submit button is disabled immediately on click
  3. PostHog receives `cta_clicked`, `pricing_tier_viewed`, `waitlist_form_submitted`, and `waitlist_form_error` events with the correct properties — confirmed via PostHog Live Events
  4. Scrolling the full page reveals Hero, How It Works (3 steps), 5 Feature cards, 4 Pricing tier cards, Social proof placeholder, FAQ (3+ questions), and Waitlist form — in that order — with no banned words in any visible copy
  5. The layout has no horizontal scroll and all CTAs are fully visible and tappable on a physical iOS Safari device at 375px
**Plans**: 6 plans

Plans:
- [ ] 02-00-PLAN.md — Wave 0: globals.css utility classes (.glass-surface, .fade-in-section) + RED test stubs for all sections
- [ ] 02-01-PLAN.md — Wave 1: HeroSection, HowItWorksSection, FeaturesSection (static upper sections)
- [ ] 02-02-PLAN.md — Wave 2A: PricingSection (billing toggle, 4 tiers, Director highlight, PostHog events)
- [ ] 02-03-PLAN.md — Wave 2B: WaitlistSection, SocialProofSection, FAQSection (parallel with 02-02)
- [ ] 02-04-PLAN.md — Wave 3: Header, Footer, useFadeIn hook, page.tsx assembly with checkoutUrls prop wiring
- [ ] 02-05-PLAN.md — Wave 4: Hero screenshot asset delivery + next/image priority wiring + visual verification

### Phase 3: Admin Route
**Goal**: The landing page owner can log in at `/admin` with a password, view all waitlist signups sorted newest-first, and trust that the route cannot be accessed by bypassing middleware
**Depends on**: Phase 2
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05
**Success Criteria** (what must be TRUE):
  1. Visiting `/admin` without a valid session cookie redirects to `/admin/login` — confirmed both in-browser and via `curl -H "x-middleware-subrequest: middleware" /admin` (CVE-2025-29927 bypass attempt returns redirect, not data)
  2. Submitting the correct password at `/admin/login` redirects to `/admin` and displays the waitlist table (name or "—", email, timestamp) sorted newest-first with total count shown
  3. Submitting an incorrect password at `/admin/login` shows an error and does not set a session cookie
  4. The `SUPABASE_SERVICE_ROLE_KEY` is not accessible in any client-side bundle — confirmed via browser DevTools network search
**Plans**: TBD

### Phase 4: QA and Launch
**Goal**: The page passes Lighthouse LCP on mobile, renders correctly on a physical iPhone, contains zero banned words, and is cleared for the production domain
**Depends on**: Phase 3
**Requirements**: PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. Lighthouse mobile audit on the deployed URL shows LCP ≤ 2.5s and the hero image is flagged as the LCP element with `priority` prop confirmed in source
  2. All screenshot assets are confirmed as WebP in the Network tab (no PNG or JPEG in production)
  3. The page renders with no horizontal scroll, no clipped CTAs, and no layout breakage on a physical iOS Safari device at 375px
  4. Running a banned-word grep against all public-facing copy files returns zero matches for: "AI-powered", "platform", "solution", "leverage", "seamless", "intuitive", "workflow automation", "generative AI", "storyboard software", "asset management", "collaboration hub", "template", "streamline"
  5. The waitlist form POST to `conjurestudio.app/api/waitlist` succeeds from the production domain (not localhost) — confirming CORS headers are live on the Conjure app
**Plans**: TBD

---

## Milestone v1.1: Visual Polish

**Goal**: Replace the static FeaturesSection card grid with a scroll-synced sticky panel (browser mockup + swapping screenshots) and fix `.glass-surface` so cards read as actual glass against the dark background.

**Requirements:** GLAS-01, GLAS-02, GLAS-03, GLAS-04, GLAS-05, FLYT-01, FLYT-02, FLYT-03, FLYT-04, FLYT-05, FLYT-06, FLYT-07

**Coverage:** 12/12 v1.1 requirements mapped ✓

**Parallel tracks:** Phase 5 (glass + sticky prerequisites) and Phase 6 (scroll panel components) are independent workstreams that can run in parallel. Phase 7 requires both to complete.

### Phase 5: Glass and Sticky Prerequisites
**Goal**: The `.glass-surface` utility renders visible frosted glass in Safari and Chrome; the structural ancestor that blocks `position: sticky` is removed
**Depends on**: Phase 2 (existing codebase)
**Requirements**: GLAS-01, GLAS-02, GLAS-03, GLAS-04, GLAS-05, FLYT-01
**Success Criteria** (what must be TRUE):
  1. In Safari desktop, `.glass-surface` cards show a visible blur/frosted effect against the dark background — the card is visually distinct from a flat dark rectangle
  2. In Chrome, `.glass-surface` shows the same frosted glass appearance — `blur(16px) saturate(180%)` rendering, distinct border-top, and inner shadow visible
  3. The Header glass effect in Safari matches the card glass effect — no divergence between the two safari blur renders
  4. In a browser without `backdrop-filter` support (or with the feature disabled), `.glass-surface` cards render a legible solid fallback background rather than a transparent overlay
  5. `FadeInWrapper` is no longer wrapping `FeaturesSection` in `page.tsx` — no `transform` ancestor exists between `FeaturesSection` and the scroll container
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Wave 1: Write failing tests (RED) for GLAS-01–05 and FLYT-01
- [ ] 05-02-PLAN.md — Wave 2: Implement CSS/JSX fixes — noise layer, @supports, webkit hardcode, FadeInWrapper removal

### Phase 6: Scroll Panel
**Goal**: A visitor scrolling the Features section sees a sticky browser-mockup panel on the right whose screenshot crossfades to match the feature row currently in the viewport center; on mobile the layout collapses to a readable single-column
**Depends on**: Phase 5 (FadeInWrapper removed, glass fixed so intermediate testing is accurate)
**Requirements**: FLYT-02, FLYT-03, FLYT-04, FLYT-05, FLYT-06, FLYT-07
**Success Criteria** (what must be TRUE):
  1. Scrolling through the Features section on desktop: the right panel stays fixed in view while the left column scrolls, and the displayed screenshot changes to match whichever feature row is centered in the viewport
  2. The screenshot swap is a crossfade (opacity transition) with no visible flash, blank frame, or layout shift — all 6 images are pre-rendered in the DOM at all times
  3. The active feature row is visually highlighted with the mint accent color; the other rows are muted — the active state updates without user interaction as they scroll
  4. The right panel is framed in browser mockup chrome (title bar, traffic lights, URL bar) and the screenshot sits inside that chrome without overflow
  5. On a 375px viewport, the two-column layout is gone — each feature appears as a stacked description-above-screenshot card with no sticky panel
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Wave 1: Install react-intersection-observer + RED failing tests for FLYT-02 through FLYT-07
- [ ] 06-02-PLAN.md — Wave 2: Rewrite FeaturesSection as sticky scroll-synced layout with useInView, crossfade, browser mockup chrome, and mobile collapse

### Phase 7: Cross-Browser QA
**Goal**: The glass effect and scroll panel are confirmed working on the browsers and devices where the bugs are most likely to surface — no regressions ship to production
**Depends on**: Phase 5 and Phase 6
**Requirements**: (none — verification phase; covers all GLAS-01–05 and FLYT-01–07 requirements from production angle)
**Success Criteria** (what must be TRUE):
  1. On a physical iOS Safari device: the glass effect is visible, the sticky panel sticks correctly (no jump or collapse), and the mobile fallback layout renders as stacked single-column without horizontal scroll
  2. In Safari desktop: the `-webkit-backdrop-filter` fix is confirmed — blur is visible and consistent with Chrome rendering
  3. Fast-scroll through the Features section does not produce a stuck or incorrect active feature state — the correct feature highlights within one scroll-stop
  4. All `.glass-surface` text passes WCAG AA contrast ratio (4.5:1) against the frosted background — confirmed with a contrast checker on the rendered page
**Plans**: TBD

## Progress

**Execution Order:**
Phases 1–4 execute in numeric order. Phases 5 and 6 (v1.1) can run in parallel. Phase 7 requires 5 and 6.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-11 |
| 2. Public Page | 5/6 | In Progress|  |
| 3. Admin Route | 0/TBD | Not started | - |
| 4. QA and Launch | 0/TBD | Not started | - |
| 5. Glass and Sticky Prerequisites | 2/2 | Complete   | 2026-03-13 |
| 6. Scroll Panel | 2/2 | Complete   | 2026-03-13 |
| 7. Cross-Browser QA | 0/TBD | Not started | - |

