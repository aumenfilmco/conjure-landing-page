# Roadmap: Conjure Landing Page

## Overview

Four phases take the project from a blank Next.js scaffold to a launch-ready marketing page. Foundation locks brand tokens and infrastructure first so no component ever touches a hex approximation or undefined env var. The public page phase builds everything a Director or Agency CD sees — hero through FAQ — and wires the live waitlist form. The admin route ships as a focused security phase because CVE-2025-29927 demands deliberate mitigation, not a retrofit. QA closes the loop with Lighthouse, physical device testing, and a banned-word audit before the domain goes live.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Brand tokens, env vars, PostHog init, and copy constants before any component is written
- [ ] **Phase 2: Public Page** - All visitor-facing sections rendered, waitlist form wired to live API, PostHog events firing
- [ ] **Phase 3: Admin Route** - Password-protected `/admin` with defense-in-depth auth and Supabase waitlist table
- [ ] **Phase 4: QA and Launch** - Lighthouse LCP, physical device testing, banned-word audit, CORS verification, and deploy

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
**Plans**: TBD

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
**Plans**: TBD

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

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Public Page | 0/TBD | Not started | - |
| 3. Admin Route | 0/TBD | Not started | - |
| 4. QA and Launch | 0/TBD | Not started | - |
