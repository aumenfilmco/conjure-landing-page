# Requirements: Conjure Landing Page

**Defined:** 2026-03-11
**Core Value:** Get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Brand tokens defined as OKLCH values in Tailwind v4 `@theme` block (not hex) — primary mint `oklch(0.92 0.18 142)`, background `oklch(0.04 0 0)`, all values from brief Section 1.1
- [ ] **FOUND-02**: Geist Sans and Geist Mono loaded via `next/font/google` and applied to base layout
- [ ] **FOUND-03**: PostHog initialized in root layout with `capture_pageview: false` (manual page view tracking)
- [ ] **FOUND-04**: Environment variables wired: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `LEMON_SQUEEZY_*_CHECKOUT_URL` (×4), `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`
- [ ] **FOUND-05**: All approved copy stored in a `content.ts` constants file before any components are written — no hardcoded copy strings in component files
- [ ] **FOUND-06**: Checkout URL accessor centralizes the `|| 'https://conjurestudio.app/auth/signup'` fallback for all 4 Lemon Squeezy env vars

### Hero Section

- [ ] **HERO-01**: Hero headline and subhead derived from approved copy direction (brief Section 2, Component Assembly / Brand Voice) — no rewriting from scratch
- [ ] **HERO-02**: Primary CTA links to `https://conjurestudio.app/auth/signup` with label "Start free — no credit card"
- [ ] **HERO-03**: Hero visual shows the branded Google Slides deck output (Moment 1 from brief Section 3) — `<!-- HERO_SCREENSHOT_REQUIRED -->` placeholder until asset delivered
- [ ] **HERO-04**: PostHog `cta_clicked` event fires on primary CTA click with `{ cta_label: "Start free — no credit card", section: "hero" }`

### How It Works Section

- [ ] **HOW-01**: 3-step process section: Step 1 (Script + characters extracted), Step 2 (Components assembled per shot), Step 3 (Export to Google Slides deck)
- [ ] **HOW-02**: Each step uses Director vocabulary (script, shot, board, deck) — no SaaS process language

### Features Section

- [ ] **FEAT-01**: Component Assembly feature card — copy from brief Section 2, "User outcome" field verbatim
- [ ] **FEAT-02**: Character Extraction feature card — copy from brief Section 2, "User outcome" field verbatim
- [ ] **FEAT-03**: Camera Package Presets feature card — copy from brief Section 2, "User outcome" field verbatim
- [ ] **FEAT-04**: Character Pose Sheets feature card — copy from brief Section 2, "User outcome" field verbatim
- [ ] **FEAT-05**: Google Slides Export feature card — copy from brief Section 2, "User outcome" field verbatim
- [ ] **FEAT-06**: Feature visuals use screenshot moments from brief Section 3 (Moments 2–5) — `<!-- SCREENSHOT_REQUIRED: MOMENT_N -->` placeholders until assets delivered

### Pricing Section

- [ ] **PRICE-01**: Four tier cards (Scout $39/mo, Director $59/mo, Producer $89/mo, Studio $129/mo) with exact values from brief Section 6.1 — monthly, annual, credits, projects, seats
- [ ] **PRICE-02**: Annual pricing displayed as "per month billed annually" with annual total visible
- [ ] **PRICE-03**: Paid-tier CTAs link to Lemon Squeezy checkout URLs via env vars, falling back to trial signup URL if unset
- [ ] **PRICE-04**: Trial model block: 7-day trial, no card required, CTA "Start free — no credit card" linking to `https://conjurestudio.app/auth/signup`
- [ ] **PRICE-05**: PostHog `pricing_tier_viewed` event fires when user scrolls to pricing section, once per page load
- [ ] **PRICE-06**: PostHog `cta_clicked` event fires on each tier CTA with `{ cta_label, section: "pricing" }`

### Waitlist Form

- [ ] **WAIT-01**: Email field (required) and name field (optional) with submit button labeled per approved copy
- [ ] **WAIT-02**: Form POSTs to `https://conjurestudio.app/api/waitlist` with body `{ email, name? }` — direct cross-origin fetch, no server-side proxy
- [ ] **WAIT-03**: Submit button disabled immediately on click to prevent double-submit
- [ ] **WAIT-04**: Success state shown on 200 response (including duplicate email — server returns 200 for both)
- [ ] **WAIT-05**: Error state shown on 4xx/5xx response
- [ ] **WAIT-06**: PostHog `waitlist_form_submitted` fires on 200 with `{ email_domain, has_name }` — never capture full email address
- [ ] **WAIT-07**: PostHog `waitlist_form_error` fires on 4xx/5xx with `{ error_type }`

### Social Proof Section

- [ ] **SOCIAL-01**: Social proof section implemented with `<!-- TESTIMONIAL_REQUIRED -->` HTML comment marking the insertion point — section is rendered with placeholder layout
- [ ] **SOCIAL-02**: Section layout ready for: name, title, agency, and specific result (one testimonial format)

### FAQ Section

- [ ] **FAQ-01**: FAQ section with 3–5 questions targeting Director/CD objections — at minimum: "Do I need to know how to draw?", "What happens to my script?", "How is this different from just using Midjourney?"
- [ ] **FAQ-02**: FAQ placed near the waitlist form (above or below) to preempt last-moment objections
- [ ] **FAQ-03**: FAQ answers use Director vocabulary and tone-of-voice rules — no banned words

### Admin View

- [ ] **ADMIN-01**: `/admin` route protected by password check against `ADMIN_PASSWORD` env var — verified in the Server Component (not middleware-only, due to CVE-2025-29927)
- [ ] **ADMIN-02**: Unauthenticated requests to `/admin` redirect to `/admin/login`
- [ ] **ADMIN-03**: Login page: single password field, submits to set a session cookie, redirects to `/admin` on success
- [ ] **ADMIN-04**: Admin page queries Supabase `waitlist` table directly using service role key — displays signups as a table: name (or "—"), email, created_at timestamp
- [ ] **ADMIN-05**: Table sorted by most recent first; shows total signup count

### Copy Compliance

- [ ] **COPY-01**: Zero instances of banned words anywhere in public-facing copy: "AI-powered", "platform", "solution", "leverage", "seamless", "intuitive", "workflow automation", "generative AI", "storyboard software", "asset management", "collaboration hub", "template", "streamline"
- [ ] **COPY-02**: Hero and features copy speaks Director language first (shot, board, lens, continuity) — Agency CD language (deck, turnaround, team) appears in pricing/trial sections only

### Performance and Responsive

- [ ] **PERF-01**: Largest Contentful Paint (LCP) ≤ 2.5s on mobile — hero screenshot served as `next/image` with `priority` prop
- [ ] **PERF-02**: All screenshot assets delivered as WebP (brief Section 3 asset format requirement)
- [ ] **PERF-03**: Layout renders correctly on mobile (375px) and desktop (1440px) — tested on physical iOS Safari device before launch

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
| FOUND-01 through FOUND-06 | Phase 1 | Pending |
| HERO-01 through HERO-04 | Phase 2 | Pending |
| HOW-01 through HOW-02 | Phase 2 | Pending |
| FEAT-01 through FEAT-06 | Phase 2 | Pending |
| PRICE-01 through PRICE-06 | Phase 2 | Pending |
| WAIT-01 through WAIT-07 | Phase 2 | Pending |
| SOCIAL-01 through SOCIAL-02 | Phase 2 | Pending |
| FAQ-01 through FAQ-03 | Phase 2 | Pending |
| ADMIN-01 through ADMIN-05 | Phase 3 | Pending |
| COPY-01 through COPY-02 | Phase 2 | Pending |
| PERF-01 through PERF-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after initial definition*
