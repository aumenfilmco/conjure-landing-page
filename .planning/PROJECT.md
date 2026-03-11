# Conjure Landing Page

## What This Is

A standalone marketing landing page for Conjure — a commercial previs pipeline that takes a script to a branded storyboard deck in an afternoon. The page targets Commercial Directors (users) and Agency Creative Directors (buyers), drives trial signups via a waitlist form wired to the live Conjure API, and communicates the product's value through approved feature-benefit copy and a pricing section. Hosted at `conjurestudio.app` as a separate Vercel project from the main app.

## Core Value

Get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Hero section with primary headline, subhead, and trial CTA
- [ ] Features section with 5 feature-benefit translations (Component Assembly, Character Extraction, Camera Package Presets, Character Pose Sheets, Google Slides Export)
- [ ] Pricing section with 4 tiers (Scout, Director, Producer, Studio) plus trial model
- [ ] Waitlist form (email required, name optional) POSTing to `conjurestudio.app/api/waitlist`
- [ ] Admin view at `/admin` — password-protected route showing signup table (name, email, timestamp) via direct Supabase query
- [ ] PostHog analytics events (waitlist_form_submitted, waitlist_form_error, cta_clicked, pricing_tier_viewed)
- [ ] Social proof section with `<!-- TESTIMONIAL_REQUIRED -->` placeholder
- [ ] Brand token fidelity — all colors from OKLCH values in brief, Geist Sans/Mono typography
- [ ] Copy adheres to tone-of-voice rules (no "AI-powered", "platform", "seamless", "intuitive", etc.)
- [ ] Responsive layout (mobile + desktop)

### Out of Scope

- Real-time collaboration features — not in product yet, cannot be implied in copy
- Named competitor comparisons (Boords, Katalist) in top-of-funnel copy — use manual workflow framing instead
- Lemon Squeezy checkout URLs — not yet configured (v1.3 billing setup); paid-tier CTAs fall back to trial signup URL until set
- Testimonial content — outstanding content dependency; page ships with placeholder comment

## Context

- The Conjure app is live at `conjurestudio.app` (Next.js 15, Supabase, Vercel Pro)
- Waitlist API endpoint is live: `POST https://conjurestudio.app/api/waitlist` — no auth required, accepts `{email, name?}`, returns 200 on success or duplicate
- Supabase stores waitlist entries; admin view queries this DB directly using a read-only connection
- Brand tokens are locked — all color values defined in OKLCH in `LANDING-PAGE-BRIEF.md` Section 1; primary mint is `oklch(0.92 0.18 142)` / `#9aff8f`
- Brief specifies the landing page as an "Astro repo" (Section 7.3), but tech stack is a v1 implementation decision
- Copy source: `LANDING-PAGE-BRIEF.md` Section 2 (Feature-to-Benefit Translations) and Section 4 (Tone of Voice) — use approved copy direction verbatim, not rewritten
- Pricing values are final from `POSITIONING.md` Section 4.2 — do not approximate
- PostHog key: `NEXT_PUBLIC_POSTHOG_KEY` env var (or equivalent for chosen framework)

## Constraints

- **Brand**: All colors must come from the OKLCH token table in the brief — no hex approximations from screenshots
- **Copy**: Zero words from either ICP avoid list — "AI-powered," "platform," "solution," "seamless," "intuitive," "workflow automation," "generative AI," "storyboard software," "template," "streamline" are all banned
- **API**: Waitlist endpoint is on the Conjure app — landing page makes cross-origin POST, no server-side proxy needed (public endpoint, no auth)
- **Admin auth**: Password-protected via env var `ADMIN_PASSWORD` — hardcoded password, no OAuth
- **Checkout URLs**: Wire as env vars (`LEMON_SQUEEZY_*_CHECKOUT_URL`); fall back to `https://conjurestudio.app/auth/signup` until set
- **Deployment**: Separate Vercel project from the Conjure app; lives under `conjurestudio.app` domain (subdomain vs. path TBD at deployment)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Waitlist backend stays on Conjure app | Endpoint already live and writing to Supabase — no new infrastructure needed | — Pending |
| Admin view on landing page repo | Self-contained, no extra services, password protected via env var | — Pending |
| Paid-tier CTAs fall back to trial signup | Lemon Squeezy not configured yet; conversion still possible via trial | — Pending |
| Hero leads with deck output (Moment 1) | Brief specifies: the deliverable is the hook — show the Google Slides deck first | — Pending |

---
*Last updated: 2026-03-11 after initialization*
