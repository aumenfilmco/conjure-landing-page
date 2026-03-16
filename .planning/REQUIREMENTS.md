# Requirements: Conjure Landing Page

**Defined:** 2026-03-11
**Core Value:** Get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Brand tokens defined as OKLCH values in Tailwind v4 `@theme` block (not hex) — primary mint `oklch(0.92 0.18 142)`, background `oklch(0.04 0 0)`, all values from brief Section 1.1
- [x] **FOUND-02**: Geist Sans and Geist Mono loaded via `next/font/google` and applied to base layout
- [x] **FOUND-03**: PostHog initialized in root layout with `capture_pageview: false` (manual page view tracking)
- [x] **FOUND-04**: Environment variables wired: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `LEMON_SQUEEZY_*_CHECKOUT_URL` (×4), `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`
- [x] **FOUND-05**: All approved copy stored in a `content.ts` constants file before any components are written — no hardcoded copy strings in component files
- [x] **FOUND-06**: Checkout URL accessor centralizes the `|| 'https://conjurestudio.app/auth/signup'` fallback for all 4 Lemon Squeezy env vars

### Hero Section

- [x] **HERO-01**: Hero headline and subhead derived from approved copy direction (brief Section 2, Component Assembly / Brand Voice) — no rewriting from scratch
- [x] **HERO-02**: Primary CTA links to `https://conjurestudio.app/auth/signup` with label "Start free — no credit card"
- [x] **HERO-03**: Hero visual shows the branded Google Slides deck output (Moment 1 from brief Section 3) — `<!-- HERO_SCREENSHOT_REQUIRED -->` placeholder until asset delivered
- [x] **HERO-04**: PostHog `cta_clicked` event fires on primary CTA click with `{ cta_label: "Start free — no credit card", section: "hero" }`

### How It Works Section

- [x] **HOW-01**: 3-step process section: Step 1 (Script + characters extracted), Step 2 (Components assembled per shot), Step 3 (Export to Google Slides deck)
- [x] **HOW-02**: Each step uses Director vocabulary (script, shot, board, deck) — no SaaS process language

### Features Section

- [x] **FEAT-01**: Component Assembly feature card — copy from brief Section 2, "User outcome" field verbatim
- [x] **FEAT-02**: Character Extraction feature card — copy from brief Section 2, "User outcome" field verbatim
- [x] **FEAT-03**: Camera Package Presets feature card — copy from brief Section 2, "User outcome" field verbatim
- [x] **FEAT-04**: Character Pose Sheets feature card — copy from brief Section 2, "User outcome" field verbatim
- [x] **FEAT-05**: Google Slides Export feature card — copy from brief Section 2, "User outcome" field verbatim
- [x] **FEAT-06**: Feature visuals use screenshot moments from brief Section 3 (Moments 2–5) — `<!-- SCREENSHOT_REQUIRED: MOMENT_N -->` placeholders until assets delivered

### Pricing Section

- [x] **PRICE-01**: Four tier cards (Scout $39/mo, Director $59/mo, Producer $89/mo, Studio $129/mo) with exact values from brief Section 6.1 — monthly, annual, credits, projects, seats
- [x] **PRICE-02**: Annual pricing displayed as "per month billed annually" with annual total visible
- [x] **PRICE-03**: Paid-tier CTAs link to Lemon Squeezy checkout URLs via env vars, falling back to trial signup URL if unset
- [x] **PRICE-04**: Trial model block: 7-day trial, no card required, CTA "Start free — no credit card" linking to `https://conjurestudio.app/auth/signup`
- [x] **PRICE-05**: PostHog `pricing_tier_viewed` event fires when user scrolls to pricing section, once per page load
- [x] **PRICE-06**: PostHog `cta_clicked` event fires on each tier CTA with `{ cta_label, section: "pricing" }`

### Waitlist Form

- [x] **WAIT-01**: Email field (required) and name field (optional) with submit button labeled per approved copy
- [x] **WAIT-02**: Form POSTs to `https://conjurestudio.app/api/waitlist` with body `{ email, name? }` — direct cross-origin fetch, no server-side proxy
- [x] **WAIT-03**: Submit button disabled immediately on click to prevent double-submit
- [x] **WAIT-04**: Success state shown on 200 response (including duplicate email — server returns 200 for both)
- [x] **WAIT-05**: Error state shown on 4xx/5xx response
- [x] **WAIT-06**: PostHog `waitlist_form_submitted` fires on 200 with `{ email_domain, has_name }` — never capture full email address
- [x] **WAIT-07**: PostHog `waitlist_form_error` fires on 4xx/5xx with `{ error_type }`

### Social Proof Section

- [x] **SOCIAL-01**: Social proof section implemented with `<!-- TESTIMONIAL_REQUIRED -->` HTML comment marking the insertion point — section is rendered with placeholder layout
- [x] **SOCIAL-02**: Section layout ready for: name, title, agency, and specific result (one testimonial format)

### FAQ Section

- [x] **FAQ-01**: FAQ section with 3–5 questions targeting Director/CD objections — at minimum: "Do I need to know how to draw?", "What happens to my script?", "How is this different from just using Midjourney?"
- [x] **FAQ-02**: FAQ placed near the waitlist form (above or below) to preempt last-moment objections
- [x] **FAQ-03**: FAQ answers use Director vocabulary and tone-of-voice rules — no banned words

### Admin View

- [x] **ADMIN-01**: `/admin` route protected by password check against `ADMIN_PASSWORD` env var — verified in the Server Component (not middleware-only, due to CVE-2025-29927)
- [x] **ADMIN-02**: Unauthenticated requests to `/admin` redirect to `/admin/login`
- [x] **ADMIN-03**: Login page: single password field, submits to set a session cookie, redirects to `/admin` on success
- [x] **ADMIN-04**: Admin page queries Supabase `waitlist` table directly using service role key — displays signups as a table: name (or "—"), email, created_at timestamp
- [x] **ADMIN-05**: Table sorted by most recent first; shows total signup count

### Copy Compliance

- [x] **COPY-01**: Zero instances of banned words anywhere in public-facing copy: "AI-powered", "platform", "solution", "leverage", "seamless", "intuitive", "workflow automation", "generative AI", "storyboard software", "asset management", "collaboration hub", "template", "streamline"
- [x] **COPY-02**: Hero and features copy speaks Director language first (shot, board, lens, continuity) — Agency CD language (deck, turnaround, team) appears in pricing/trial sections only

### Performance and Responsive

- [ ] **PERF-01**: Largest Contentful Paint (LCP) ≤ 2.5s on mobile — hero screenshot served as `next/image` with `priority` prop
- [x] **PERF-02**: All screenshot assets delivered as WebP (brief Section 3 asset format requirement)
- [x] **PERF-03**: Layout renders correctly on mobile (375px) and desktop (1440px) — tested on physical iOS Safari device before launch

## v1.1 Requirements — Visual Polish

**Milestone goal:** Replace static FeaturesSection card grid with scroll-synced sticky panel; fix structurally broken `.glass-surface` utility.

### Glass Surface

- [x] **GLAS-01**: Noise or grain texture added behind `.glass-surface` cards at the section level so `backdrop-filter: blur()` has visual pixels to process on the dark background
- [x] **GLAS-02**: `.glass-surface` utility patched with hardcoded `-webkit-backdrop-filter: blur(18px)` — CSS variables silently rejected by Safari on the webkit-prefixed property
- [x] **GLAS-03**: `Header.tsx` glass effect patched with same hardcoded webkit blur (same bug present in existing code)
- [x] **GLAS-04**: `@supports (backdrop-filter: blur(1px))` fallback block provides solid background for browsers without backdrop-filter support
- [x] **GLAS-05**: `.glass-surface` CSS tuned — `blur(16px) saturate(180%)`, border-top opacity `0.32`, inner and outer box shadows

### Features Layout

- [x] **FLYT-01**: `FadeInWrapper` removed from around `FeaturesSection` in `page.tsx` — `transform: translateY()` on ancestor creates new containing block that silently breaks `position: sticky`
- [x] **FLYT-02**: `FeaturesSection` renders two-column layout: scrolling feature step rows (left), sticky browser-mockup panel fixed to right while scrolling through the section
- [x] **FLYT-03**: `IntersectionObserver` detects which feature step is in viewport center and updates `activeIndex` (0–5) — guard against initial mount fire, `observer.disconnect()` cleanup on unmount
- [x] **FLYT-04**: Screenshot inside mockup crossfades to match active feature — all 6 images pre-rendered in DOM with `opacity` toggling (no src swap, no flash)
- [x] **FLYT-05**: Active feature step row visually highlighted with mint accent color; inactive steps muted
- [x] **FLYT-06**: Browser mockup chrome (title bar, traffic lights, URL bar) wraps the screenshot area in the sticky panel
- [x] **FLYT-07**: On mobile (below `md` breakpoint), layout collapses to stacked single-column — feature description above screenshot, no sticky panel

## v2 Requirements

### Enhanced Conversion

- **CONV-01**: Animated scroll reveal on feature cards (Motion library)
- **CONV-02**: Video demo in hero (brief Section 3 specifies MP4/WebM option, 60fps, ≤10s loop)
- **CONV-03**: Sticky CTA bar appearing after hero scrolls out of view
- **CONV-04**: Live signup counter (once sufficient signups exist — not at launch)

### Extended Content

- **CONT-01**: "How we compare" page for prospects evaluating vs. Boords/Katalist (sales enablement, not top-of-funnel)
- **CONT-02**: Built-in Guided Tutorial feature card (brief Section 2 — currently targeted at Agency CD, defer to v2 when CD-layer copy is prioritized)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-seat / real-time collaboration claims | Product doesn't support concurrent editing yet — cannot be implied in copy |
| Named competitor comparisons in public copy | Top-of-funnel copy uses manual workflow framing, not Boords/Katalist naming |
| Lemon Squeezy checkout flow | URLs not yet configured; CTA fallback to trial signup is the v1 behavior |
| Blog / content pages | Not in brief; separate content strategy decision |
| i18n / localization | English-only for v1 |
| Dark/light mode toggle | Brand is dark-only — near-black background is the identity, not a preference |

## Cross-Repo Dependency

⚠️ **CORS prerequisite:** The Conjure app (`conjurestudio.app`) must add the landing page's origin to `Access-Control-Allow-Origin` on the `/api/waitlist` route before the waitlist form can be integration-tested. This is a change to the Conjure app repo, not the landing page. Must be resolved before Phase 2 (form integration) executes.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| HERO-01 | Phase 2 | Complete |
| HERO-02 | Phase 2 | Complete |
| HERO-03 | Phase 2 | Complete |
| HERO-04 | Phase 2 | Complete |
| HOW-01 | Phase 2 | Complete |
| HOW-02 | Phase 2 | Complete |
| FEAT-01 | Phase 2 | Complete |
| FEAT-02 | Phase 2 | Complete |
| FEAT-03 | Phase 2 | Complete |
| FEAT-04 | Phase 2 | Complete |
| FEAT-05 | Phase 2 | Complete |
| FEAT-06 | Phase 2 | Complete |
| PRICE-01 | Phase 2 | Complete |
| PRICE-02 | Phase 2 | Complete |
| PRICE-03 | Phase 2 | Complete |
| PRICE-04 | Phase 2 | Complete |
| PRICE-05 | Phase 2 | Complete |
| PRICE-06 | Phase 2 | Complete |
| WAIT-01 | Phase 2 | Complete |
| WAIT-02 | Phase 2 | Complete |
| WAIT-03 | Phase 2 | Complete |
| WAIT-04 | Phase 2 | Complete |
| WAIT-05 | Phase 2 | Complete |
| WAIT-06 | Phase 2 | Complete |
| WAIT-07 | Phase 2 | Complete |
| SOCIAL-01 | Phase 2 | Complete |
| SOCIAL-02 | Phase 2 | Complete |
| FAQ-01 | Phase 2 | Complete |
| FAQ-02 | Phase 2 | Complete |
| FAQ-03 | Phase 2 | Complete |
| ADMIN-01 | Phase 3 | Complete |
| ADMIN-02 | Phase 3 | Complete |
| ADMIN-03 | Phase 3 | Complete |
| ADMIN-04 | Phase 3 | Complete |
| ADMIN-05 | Phase 3 | Complete |
| COPY-01 | Phase 2 | Complete |
| COPY-02 | Phase 2 | Complete |
| PERF-01 | Phase 4 | Pending |
| PERF-02 | Phase 4 | Complete |
| PERF-03 | Phase 4 | Complete |
| GLAS-01 | Phase 5 | Complete |
| GLAS-02 | Phase 5 | Complete |
| GLAS-03 | Phase 5 | Complete |
| GLAS-04 | Phase 5 | Complete |
| GLAS-05 | Phase 5 | Complete |
| FLYT-01 | Phase 5 | Complete |
| FLYT-02 | Phase 6 | Complete |
| FLYT-03 | Phase 6 | Complete |
| FLYT-04 | Phase 6 | Complete |
| FLYT-05 | Phase 6 | Complete |
| FLYT-06 | Phase 6 | Complete |
| FLYT-07 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 46 total (40 content + 6 foundation — all individual rows counted above)
- Mapped to phases: 46 ✓
- v1.1 requirements: 12 total (GLAS-01–05, FLYT-01–07)
- Mapped to phases: 12 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-12 — v1.1 traceability added (GLAS-01–05 → Phase 5, FLYT-01 → Phase 5, FLYT-02–07 → Phase 6)*
