# Conjure Landing Page

## What This Is

A standalone marketing landing page for Conjure — a commercial previs pipeline that takes a script to a branded storyboard deck in an afternoon. The page targets Commercial Directors (users) and Agency Creative Directors (buyers), drives trial signups via a waitlist form wired to the live Conjure API, and communicates the product's value through a scroll-synced features panel, frosted glass UI, and pricing section. Hosted at `conjurestudio.app` as a separate Vercel project from the main app.

## Core Value

Get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works.

## Requirements

### Validated

- ✓ Hero section with primary headline, subhead, and trial CTA — v1.1
- ✓ Features section with 5 feature-benefit translations — v1.1 (scroll-synced sticky panel with crossfade)
- ✓ Pricing section with 4 tiers (Scout, Director, Producer, Studio) plus trial model — v1.1
- ✓ Waitlist form (email required, name optional) POSTing to `conjurestudio.app/api/waitlist` — v1.1
- ✓ Admin view at `/admin` — password-protected with JWT auth and CVE-2025-29927 mitigation — v1.1
- ✓ PostHog analytics events — v1.1
- ✓ Social proof section with `TESTIMONIAL_REQUIRED` placeholder — v1.1
- ✓ Brand token fidelity — OKLCH values, Geist Sans/Mono typography — v1.1
- ✓ Copy adheres to tone-of-voice rules (zero banned words confirmed) — v1.1
- ✓ Responsive layout (mobile + desktop) — v1.1
- ✓ Glass-surface frosted glass utility with Safari/WebKit compatibility — v1.1
- ✓ Scroll-synced sticky panel for Features section — v1.1
- ✓ Cross-browser QA (Safari desktop, iOS Safari, Chrome) — v1.1
- ✓ WCAG AA contrast on glass surfaces — v1.1

### Active

(None — next milestone requirements TBD via `/gsd:new-milestone`)

### Out of Scope

- Real-time collaboration features — not in product yet
- Named competitor comparisons in top-of-funnel copy
- Lemon Squeezy checkout URLs — not yet configured; paid-tier CTAs fall back to trial signup URL
- Testimonial content — outstanding content dependency; page ships with placeholder

## Context

Shipped v1.1 with 2,388 LOC TypeScript across 140 files.
Tech stack: Next.js 16, Tailwind v4 (CSS-first), Supabase, Vercel, PostHog.
77 passing tests (Vitest). Hero image optimized to 64KB WebP.
Known gap: LCP 3.6s on Vercel hobby tier (TTFB bottleneck, not code-level).
Pricing section currently hidden during early waitlist period (code intact, rendering commented out).

## Constraints

- **Brand**: All colors from OKLCH token table — no hex approximations
- **Copy**: Zero words from ICP avoid list
- **API**: Waitlist endpoint on Conjure app — cross-origin POST
- **Admin auth**: Password-protected via `ADMIN_PASSWORD` env var
- **Checkout URLs**: Wired as env vars with trial signup fallback
- **Deployment**: Separate Vercel project under `conjurestudio.app` domain

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 App Router (not Astro) | Developer expertise; admin route requires server-side auth | ✓ Good |
| Waitlist backend on Conjure app | Endpoint already live and writing to Supabase | ✓ Good |
| Admin view on landing page repo | Self-contained, password protected via env var | ✓ Good |
| Paid-tier CTAs fall back to trial signup | Lemon Squeezy not configured yet | ✓ Good |
| Hero leads with deck output (Moment 1) | Brief specifies deliverable as hook | ✓ Good |
| CVE-2025-29927 defense-in-depth | Re-verify JWT in Server Component body, not middleware only | ✓ Good |
| SVG feTurbulence noise for glass | Gives backdrop-filter pixel variance on dark background | ✓ Good |
| Tailwind v4 CSS-first (no config file) | create-next-app shipped it; OKLCH tokens in @theme block | ✓ Good |
| PERF-01 LCP accepted as gap | Vercel hobby tier TTFB is bottleneck, not code | ⚠️ Revisit (upgrade tier) |
| Pricing hidden for early waitlist | Don't show pricing before product-market fit signal | — Pending |

---
*Last updated: 2026-03-18 after v1.1 milestone*
