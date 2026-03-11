# Project Research Summary

**Project:** Conjure Landing Page
**Domain:** B2B SaaS waitlist/trial-acquisition landing page — commercial previs pipeline tool
**Researched:** 2026-03-11
**Confidence:** HIGH

---

## Executive Summary

The Conjure Landing Page is a single-conversion marketing page targeting Commercial Directors and Agency Creative Directors. Its sole job is to move a skeptical, time-poor professional from first scroll to waitlist signup. Research confirms the page should prioritize showing the deliverable (a branded Google Slides deck screenshot) before explaining how the product works — this is the primary differentiator against Boords and Previs Pro, which both lead with interface screenshots. The conversion model is simple: hero → features → how it works → pricing → FAQ → form. Every design, copy, and technical decision should protect this funnel.

**Framework decision — Next.js 15, not Astro:** STACK.md recommends Astro for its zero-JS-by-default output, and this is technically sound for a pure static marketing page. ARCHITECTURE.md recommends Next.js. The synthesis resolves in favor of Next.js 15 for one overriding reason: the developer already knows it at depth (the main Conjure app is Next.js 15), and the admin route requires server-side Supabase queries, cookie-based JWT auth, and middleware patterns the developer has already shipped. Astro's hybrid SSR mode would require learning a second framework's SSR model, adapter configuration, and auth patterns — for the same outcome. The JS payload difference is real but marginal for this use case: the public page will be almost entirely Server Components, with WaitlistForm and PricingSection as the only Client Components. Astro remains the technically superior choice for a pure static site; Next.js is the correct pragmatic choice here given the cross-repo familiarity and admin complexity.

The critical security concern is CVE-2025-29927 (CVSS 9.1, March 2025): Next.js middleware can be bypassed via the `x-middleware-subrequest` header on unpatched versions. This affects the admin route directly. The mitigation is mandatory: re-verify the JWT in the Server Component before any Supabase query, use Next.js >=15.2.3, and treat middleware as a redirect helper only — not a security gate. The second cross-project dependency is CORS: the Conjure app's `/api/waitlist` route must return `Access-Control-Allow-Origin` headers with the landing page's exact origin. This is a prerequisite for the waitlist form to function from any non-localhost URL and must be addressed in the Conjure app repo before the landing page form is wired.

---

## Key Findings

### Recommended Stack

**Next.js 15 App Router** with Tailwind CSS v4, TypeScript 5, and a minimal set of supporting libraries. The stack is deliberately thin: no ORM (direct Supabase queries), no component library beyond shadcn/ui if needed, no React framework just for animation. See `.planning/research/STACK.md` for full installation guide and alternatives considered.

**Core technologies:**
- **Next.js 15 (App Router):** Framework — developer already knows it; server components handle the admin Supabase query; middleware handles fast-path redirect; same patterns as main Conjure app
- **Tailwind CSS v4 (Vite plugin):** Utility styling — OKLCH color support is first-class and required for brand tokens; use `@tailwindcss/vite` directly, NOT the deprecated `@astrojs/tailwind` (irrelevant in Next.js, but the v4 Vite plugin pattern applies)
- **TypeScript 5:** Type safety — strict mode; typed env var accessors in `lib/env.ts`
- **motion (v12.x, vanilla `animate()`):** Scroll-triggered animations — no React island needed; works in `<script>` tags; smaller than GSAP for this use case
- **@supabase/supabase-js (v2.x):** Admin DB queries — server-only, service_role key, auth options disabled; used exclusively in the `/admin` Server Component
- **posthog-js:** Analytics — already in use on the Conjure app; captures `waitlist_form_submitted`, `waitlist_form_error`, `cta_clicked`, `pricing_tier_viewed`; initialize once in root layout

**Critical version requirement:** `next` must be `>=15.2.3` (CVE-2025-29927 patch). Verify `package.json` before shipping the admin route.

### Expected Features

Research confirms 12 features for v1 launch (all P1). See `.planning/research/FEATURES.md` for full prioritization matrix and competitor analysis.

**Must have (table stakes) — all P1:**
- Hero section with output-first media (Google Slides deck screenshot), headline, and primary CTA
- Features section — 5 features, benefit-framed using production vocabulary from brief
- Pricing section — 4 tiers (Scout, Director, Producer, Studio), CTA per tier with env var fallback to trial signup URL
- Waitlist form — email required, name optional, POST to `conjurestudio.app/api/waitlist`, success + error states
- Mobile-responsive layout — tested at 375px, 768px, 1280px
- Brand token fidelity — OKLCH colors, Geist Sans/Mono, zero hex approximations
- PostHog instrumentation — 4 events from PROJECT.md
- Admin view at `/admin` — password-protected, waitlist table, server-side only

**Should have (differentiators) — also P1:**
- "How it works" — 3-step process section (Script → Session → Deck); not in PROJECT.md but research confirms it removes the primary skeptic objection
- FAQ section — 3–5 questions targeting the no-drawing objection, data/privacy, hired-artist comparison, trial scope; converts borderline visitors immediately before the form
- Social proof section — scaffolded with `TESTIMONIAL_REQUIRED` placeholder; real content drops in without layout changes
- Sticky CTA — header bar or bottom bar; minimal JS; no popups

**Defer (v1.x, post-validation):**
- Real testimonial content — swap in when available
- Lemon Squeezy checkout URL wiring — replace fallback CTAs when billing is configured (v1.3)
- Live signup counter — add after 500+ confirmed signups to avoid embarrassing "0" at launch
- Embedded demo/explainer video — add when video asset is produced

**Anti-features to avoid (documented in research):** Full site navigation (exit paths), popup/exit-intent modals (wrong tone for this ICP), autoplay background video (performance), multiple competing CTAs, named competitor comparison table, waitlist gamification (referral mechanics are consumer patterns, wrong for directors and agency CDs).

### Architecture Approach

Single-page marketing experience backed by a protected admin route, both deployed as a standalone Vercel project separate from the Conjure app. The public page is almost entirely Server Components — only WaitlistForm and PricingSection require `'use client'` (for fetch and PostHog events respectively). The admin route uses double-verification: middleware for fast-path redirect (cookie presence only), Server Component for cryptographic JWT verification before any Supabase query runs. The waitlist form POSTs directly from the browser to the Conjure app's endpoint with no proxy — this is correct and requires CORS headers on the Conjure app side. See `.planning/research/ARCHITECTURE.md` for full component diagram, data flow, and code patterns.

**Major components:**
1. `app/page.tsx` — Root landing page, Server Component shell, stacks all marketing sections
2. `WaitlistForm` (`'use client'`) — Cross-origin POST to `conjurestudio.app/api/waitlist`; form state, success/error states, PostHog events
3. `PricingSection` (`'use client'`) — 4-tier table, env var checkout URLs via `lib/env.ts`, PostHog `pricing_tier_viewed` event
4. `app/admin/page.tsx` — Server Component; JWT verify → Supabase query → render table
5. `middleware.ts` — Edge; cookie presence check only; redirects to `/admin/login`; NOT the security boundary
6. `lib/supabase-admin.ts` — Service_role client; server-only; never imported in client components
7. `lib/env.ts` — Typed env var accessors; checkout URL fallback logic centralized here
8. `PostHogProvider` (`'use client'`) — Wraps `app/layout.tsx`; single init with guard

**Cross-repo dependency:** CORS headers must be configured on `conjurestudio.app/api/waitlist` before the form can be wired. This is a Conjure app task, not a landing page task.

### Critical Pitfalls

Research identified 7 pitfalls. Top 5 in priority order:

1. **Admin middleware-only auth (CVE-2025-29927, CVSS 9.1)** — The `/admin` route MUST re-verify the JWT in the Server Component body, not only in middleware. Middleware is a redirect helper. An attacker can bypass it with the `x-middleware-subrequest` header on unpatched Next.js. Mitigation: pin `next>=15.2.3`; use `jwtVerify` (jose) inside `app/admin/page.tsx` before any Supabase call; use `crypto.timingSafeEqual` for password comparison in the auth route.

2. **CORS rejection on waitlist form POST** — The form POSTs cross-origin to `conjurestudio.app/api/waitlist`. If CORS headers are absent, the browser blocks the response and submissions silently fail. Mitigation: add `OPTIONS` handler + `Access-Control-Allow-Origin: [exact landing page origin]` header to the Conjure app's route. Test from the deployed URL, not localhost — localhost can mask CORS failures.

3. **Brand color fidelity via hex approximation** — Tailwind v4 uses OKLCH natively. Developers defaulting to hex (#9aff8f instead of `oklch(0.92 0.18 142)`) get a visually duller result on wide-gamut displays and violate the brief's explicit constraint. Mitigation: define all brand tokens in `@theme` as `oklch()` values copied verbatim from the brief; grep for `#` in `@theme` before each phase is marked complete.

4. **Hero image LCP failure** — The deck screenshot is the LCP element. An unoptimized PNG at full resolution will fail the 2.5-second LCP threshold on mobile. Mitigation: use Next.js `<Image>` with `priority` prop; export at 2x display width (not Retina); target <200KB after compression. This must be applied on first implementation — not as a later polish pass.

5. **Copy drift and banned words** — Approved copy gets paraphrased during implementation; banned words ("AI-powered," "platform," "seamless," "intuitive," "workflow automation," etc.) reappear. Mitigation: create `src/lib/copy.ts` constants file at project start; wire all user-facing strings from this file; add banned-word grep as pre-commit hook.

---

## Implications for Roadmap

Research suggests 4 phases based on build-order dependencies identified in ARCHITECTURE.md.

### Phase 1: Foundation and Design System
**Rationale:** Brand tokens, env var structure, and PostHog initialization have zero dependencies and are required by every subsequent component. Locking these first eliminates the risk of hex-color drift and copy drift propagating through all later work.
**Delivers:** Deployed skeleton — Vercel project configured, `globals.css` with OKLCH brand tokens, `lib/env.ts` with checkout URL fallbacks, `app/layout.tsx` with PostHogProvider, Geist font loading, brand-consistent base scaffold
**Addresses:** Brand token fidelity (all P1 table stakes), analytics instrumentation
**Avoids:** Hex approximation pitfall (lock OKLCH tokens before any component work), PostHog double-init pitfall (single init in layout), checkout URL `undefined` pitfall (centralized in `lib/env.ts` from day one)
**Research flag:** Standard patterns — skip phase research. Next.js layout + Tailwind v4 setup is well-documented.

### Phase 2: Public Page — Static Sections and Waitlist Form
**Rationale:** Static sections (Hero, Features, How It Works, Social Proof, FAQ) have no interactivity dependencies and can be built before the admin route. The waitlist form is the conversion event and must be wired to the live API — but this requires the CORS prerequisite to be completed in the Conjure app repo first.
**Delivers:** Full public-facing page — all 8 visible sections rendered, waitlist form wired to live API with success/error states, responsive at 375/768/1280px, PostHog events firing on CTAs and form
**Addresses:** Hero (output-first deck screenshot), Features section, How It Works, Pricing with fallback CTAs, Social Proof placeholder, FAQ, Waitlist form, Sticky CTA, Responsive layout
**Uses:** Next.js Server Components for static sections, `'use client'` for WaitlistForm and PricingSection, motion vanilla animations for scroll reveals, Next.js `<Image>` with `priority` for hero
**Avoids:** LCP failure (priority prop + compressed asset on first implementation), copy drift (constants file from Phase 1)
**Cross-repo prerequisite:** CORS headers on `conjurestudio.app/api/waitlist` must be confirmed before the form is marked complete
**Content prerequisite:** Hero deck screenshot asset (branded Google Slides deck) is the critical path content dependency — this is the most important asset to source. Without it, the hero defaults to a placeholder and loses its primary conversion advantage.
**Research flag:** Standard patterns for sections. Form integration needs verification against the live API response shape.

### Phase 3: Admin Route
**Rationale:** The admin route is fully independent of the public page sections and can be built in any order, but it carries the highest security risk. Building it as a focused phase ensures CVE-2025-29927 mitigations are applied deliberately, not retrofitted.
**Delivers:** Password-protected `/admin` with JWT auth, Supabase waitlist table view, login form, defense-in-depth auth (middleware fast-path + Server Component re-verify)
**Addresses:** Admin view requirement (P1)
**Implements:** `middleware.ts`, `app/api/admin-auth/route.ts`, `app/admin/login/page.tsx`, `app/admin/page.tsx`, `lib/supabase-admin.ts`
**Avoids:** CVE-2025-29927 (jwt verify in Server Component, not middleware-only); service_role key scope leak (server-only import, no `NEXT_PUBLIC_` prefix); timing attack on password comparison (`crypto.timingSafeEqual`)
**Research flag:** Standard patterns — the auth pattern (jose JWT + httpOnly cookie) is well-documented. Skip phase research.

### Phase 4: QA, Performance, and Launch Validation
**Rationale:** Responsive and performance work deferred to a final phase to avoid constant re-testing as sections are built. The "looks done but isn't" checklist from PITFALLS.md provides the exit criteria.
**Delivers:** Lighthouse LCP <2.5s on mobile, WCAG contrast checks on all OKLCH pairs, physical iPhone Safari test (no horizontal scroll, no clipped CTAs), PostHog event deduplication confirmation, banned-word grep clean, CORS verified from deployed URL, admin bypass test
**Avoids:** Mobile dark theme breakdowns (iOS Safari `100dvh`, OKLCH on OLED), PostHog duplicate events, CORS failures masked by localhost testing
**Research flag:** Standard QA patterns. No research needed.

### Phase Ordering Rationale

- Foundation must come first: every component references brand tokens and env var accessors — building sections before locking these causes rework
- Static sections before admin: the admin route is independent but higher risk; completing the public page first lets it be used for content review while admin is hardened
- QA as a discrete final phase: responsive testing and performance audits are most useful when the page is complete, not done section-by-section (which creates re-test overhead)
- CORS and the deck screenshot are external prerequisites for Phase 2 — these should be tracked as blockers before Phase 2 begins

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Form Integration):** The Conjure app's `/api/waitlist` response shape (success, duplicate, error codes) needs to be confirmed from the actual route implementation before the form's success/error logic is designed. This is a code-read task, not external research.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js 15 + Tailwind v4 setup is official-docs-documented; no research needed
- **Phase 3 (Admin Route):** Cookie-based JWT auth with jose is a well-established Next.js pattern; CVE mitigations are documented by Vercel
- **Phase 4 (QA):** Standard Lighthouse + physical device testing

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All major decisions verified against official docs or current npm data; framework conflict resolved with clear rationale |
| Features | HIGH | Research grounded in 11 external sources including Unbounce, KlientBoost, and direct competitor analysis; feature list aligns with PROJECT.md |
| Architecture | HIGH | CVE sourced from official Vercel postmortem and Datadog Security Labs; Supabase and PostHog patterns from official docs |
| Pitfalls | HIGH | All 7 pitfalls verified against official docs, CVE reports, PostHog issue tracker |

**Overall confidence:** HIGH

### Gaps to Address

- **Conjure app CORS status:** Unknown whether `conjurestudio.app/api/waitlist` currently has CORS headers configured. Must be verified against the Conjure app source before Phase 2 form wiring. This is a cross-repo dependency that cannot be resolved from the landing page repo alone.
- **Waitlist API response shape:** The exact response body, status codes for duplicate submissions, and error formats from the live `/api/waitlist` endpoint should be confirmed by reading the Conjure app route before designing the form's error/success state logic.
- **Hero screenshot asset:** The branded Google Slides deck screenshot is not a technical gap but a content prerequisite. Without it, the output-first hero — the primary conversion differentiator — cannot be implemented. Sourcing this asset is the first task of Phase 2 and should begin immediately.
- **ADMIN_JWT_SECRET rotation policy:** No decision has been documented on how often the admin JWT secret is rotated or how the landing page's admin session is invalidated. This is low urgency (single-user internal tool) but should be noted before the admin route ships.

---

## Sources

### Primary (HIGH confidence)
- Vercel postmortem on CVE-2025-29927 — https://vercel.com/blog/postmortem-on-next-js-middleware-bypass
- Datadog Security Labs CVE-2025-29927 analysis — https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/
- Tailwind CSS Astro install guide (v4 pattern, @astrojs/tailwind deprecation) — https://tailwindcss.com/docs/guides/astro
- PostHog Next.js docs — https://posthog.com/docs/libraries/next-js
- PostHog Astro docs — https://posthog.com/docs/libraries/astro
- Supabase service_role admin pattern — https://supabase.com/docs/guides/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa
- @supabase/supabase-js v2.98 on npm — https://www.npmjs.com/package/@supabase/supabase-js
- Tailwind CSS v4.0 release post (OKLCH, `@theme`) — https://tailwindcss.com/blog/tailwindcss-v4
- Astro 6.0 release blog — https://astro.build/blog/astro-6/

### Secondary (MEDIUM confidence)
- Next.js vs Astro for marketing sites 2025 — https://makersden.io/blog/nextjs-vs-astro-marketing-website
- Motion + Astro integration guide — https://developers.netlify.com/guides/motion-animation-library-with-astro/
- 51 High-Converting SaaS Landing Pages — https://www.klientboost.com/landing-pages/saas-landing-page/
- B2B SaaS Landing Page Best Practices — https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/
- Waitlist Landing Page Best Practices — https://magicui.design/blog/waitlist-landing-page
- Password protecting Next.js routes — https://www.alexchantastic.com/password-protecting-next

### Tertiary (MEDIUM-LOW confidence)
- GSAP vs Motion comparison (authored by Motion team, acknowledged bias) — https://motion.dev/docs/gsap-vs-motion
- Best Storyboard Software 2025 (competitor landscape) — https://filmustage.com/blog/the-best-storyboard-software-for-filmmaking-in-2025-with-real-world-picks/

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
