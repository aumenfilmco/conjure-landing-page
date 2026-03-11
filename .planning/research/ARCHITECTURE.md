# Architecture Research

**Domain:** SaaS marketing landing page with admin route
**Researched:** 2026-03-11
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  / (Landing Page)    │    /admin (Protected Admin View)   │  │
│  │  - Hero              │    - Password gate (cookie check)  │  │
│  │  - Features          │    - Waitlist signup table         │  │
│  │  - Pricing           │                                    │  │
│  │  - Social Proof      │                                    │  │
│  │  - Waitlist Form     │                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────┬─────────────────────────┬──────────────────────────┘
             │                         │
             ▼                         ▼
┌────────────────────┐    ┌────────────────────────┐
│  conjurestudio.app │    │   Supabase (direct)    │
│  /api/waitlist     │    │   waitlist table       │
│  (cross-origin     │    │   service_role key     │
│   POST, no proxy)  │    │   server component     │
└────────────────────┘    │   only, never client   │
                          └────────────────────────┘
             │
             ▼
┌────────────────────┐
│  PostHog           │
│  (client-side JS)  │
│  custom events     │
└────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `/` (root page) | Single-page marketing experience — all sections stacked in scroll order | Next.js Server Component or Astro page |
| `HeroSection` | Primary headline, subhead, deck output visual, CTA button | Static markup + image |
| `FeaturesSection` | 5 feature-benefit cards (copy from brief verbatim) | Static markup |
| `PricingSection` | 4-tier table, CTA buttons with env var URL fallback | Client Component (PostHog events on click) |
| `SocialProofSection` | `<!-- TESTIMONIAL_REQUIRED -->` placeholder | Static markup, ships as comment |
| `WaitlistForm` | Email + optional name, POST to external API, success/error state | Client Component |
| `/admin` (route) | Password gate + waitlist table | Server Component (Supabase query) with cookie auth check |
| `AdminLoginForm` | Password input, sets session cookie on success | Client Component or Server Action |
| `PostHogProvider` | Wraps app, initializes SDK, exposes `usePostHog` hook | Client Component (providers.tsx) |
| `middleware.ts` | Redirects unauthenticated requests to `/admin` → `/admin/login` | Edge middleware (cookie check only) |

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout — PostHogProvider wrapper
│   ├── page.tsx             # Landing page (single scroll)
│   ├── admin/
│   │   ├── page.tsx         # Waitlist table (Server Component, Supabase query)
│   │   └── login/
│   │       └── page.tsx     # Password form
│   └── api/
│       └── admin-auth/
│           └── route.ts     # POST: verify ADMIN_PASSWORD, set cookie
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── PricingSection.tsx
│   │   └── SocialProofSection.tsx
│   ├── forms/
│   │   └── WaitlistForm.tsx  # 'use client' — fetch to external API
│   └── providers/
│       └── PostHogProvider.tsx  # 'use client' — PHProvider init
├── lib/
│   ├── supabase-admin.ts    # createClient with service_role key (server-only)
│   └── env.ts               # typed env var accessors with fallback logic
└── middleware.ts             # /admin route guard (cookie presence check)
```

### Structure Rationale

- **`components/sections/`:** All marketing sections are pure presentational components. Isolating them makes copy edits, section reordering, and responsive tweaks surgical.
- **`components/forms/`:** `WaitlistForm` is the only client-interactive component on the public page. Isolating it prevents `'use client'` from bubbling up to parent sections unnecessarily.
- **`lib/supabase-admin.ts`:** The service_role client must never reach the browser. A dedicated file makes it easy to audit that it is only imported from Server Components and API routes.
- **`lib/env.ts`:** Centralizes the Lemon Squeezy fallback logic — one place to change when checkout URLs are configured. Avoids scattered inline ternaries.
- **`middleware.ts`:** Handles fast cookie-presence redirect. Does NOT verify the cookie cryptographically — that happens in the `/admin` Server Component itself (defense in depth against CVE-2025-29927).

## Architectural Patterns

### Pattern 1: Cross-Origin Form POST (No Proxy)

**What:** `WaitlistForm` sends `fetch('https://conjurestudio.app/api/waitlist', { method: 'POST', ... })` directly from the browser. No Next.js API route in the middle.
**When to use:** When the target endpoint is already public, handles CORS, and you control neither server (different Vercel project).
**Trade-offs:** Zero infrastructure overhead; error handling depends entirely on what the external API returns. Duplicate submissions are the external API's problem (it returns 200 on duplicate, which is correct here).

**Example:**
```typescript
// components/forms/WaitlistForm.tsx
'use client'
async function handleSubmit(email: string, name?: string) {
  const res = await fetch('https://conjurestudio.app/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })
  if (!res.ok) throw new Error('Submission failed')
  posthog.capture('waitlist_form_submitted', { email_domain: email.split('@')[1] })
}
```

### Pattern 2: Cookie-Based Admin Password Gate (No OAuth)

**What:** A Server Action or API route at `/api/admin-auth` checks `req.body.password === process.env.ADMIN_PASSWORD`, then sets a signed session cookie (`iron-session` or `jose`). Middleware reads cookie presence to redirect. The `/admin` Server Component re-verifies the cookie cryptographically before rendering Supabase data.
**When to use:** Single-user internal tool with no external identity provider. Simple, zero-dependency auth.
**Trade-offs:** Password is shared (no per-user sessions). Anyone with the env var can reset it. Acceptable for an internal admin view on a marketing page.

**Example:**
```typescript
// app/api/admin-auth/route.ts  (Server Action alternative also viable)
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = await new SignJWT({}).setExpirationTime('7d')
    .sign(new TextEncoder().encode(process.env.ADMIN_JWT_SECRET))
  cookies().set('admin_session', token, { httpOnly: true, secure: true, sameSite: 'lax' })
  return Response.json({ ok: true })
}
```

```typescript
// app/admin/page.tsx — re-verify before touching Supabase
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export default async function AdminPage() {
  const token = cookies().get('admin_session')?.value
  if (!token) redirect('/admin/login')
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.ADMIN_JWT_SECRET))
  } catch {
    redirect('/admin/login')
  }
  // safe to query Supabase now
  const { data } = await supabaseAdmin.from('waitlist').select('*').order('created_at', { ascending: false })
  // render table...
}
```

### Pattern 3: Env Var Fallback for Checkout URLs

**What:** A typed accessor in `lib/env.ts` returns the Lemon Squeezy URL if set, or falls back to `https://conjurestudio.app/auth/signup`. Pricing section imports from this file — never reads `process.env` directly.
**When to use:** Whenever a feature is gated on configuration that may not be present during development.
**Trade-offs:** One extra indirection, but guarantees consistent fallback behavior and makes it obvious when/where to switch.

**Example:**
```typescript
// lib/env.ts
export const checkoutUrls = {
  scout:    process.env.LEMON_SQUEEZY_SCOUT_CHECKOUT_URL    || 'https://conjurestudio.app/auth/signup',
  director: process.env.LEMON_SQUEEZY_DIRECTOR_CHECKOUT_URL || 'https://conjurestudio.app/auth/signup',
  producer: process.env.LEMON_SQUEEZY_PRODUCER_CHECKOUT_URL || 'https://conjurestudio.app/auth/signup',
  studio:   process.env.LEMON_SQUEEZY_STUDIO_CHECKOUT_URL   || 'https://conjurestudio.app/auth/signup',
}
```

## Data Flow

### Waitlist Form Submission

```
User fills form (email, name?)
    ↓
WaitlistForm.tsx (client) validates input
    ↓
fetch POST → https://conjurestudio.app/api/waitlist
    ↓                              ↓
200 OK (success/duplicate)    4xx/5xx (error)
    ↓                              ↓
Success state + PostHog        Error state + PostHog
posthog.capture(               posthog.capture(
  'waitlist_form_submitted')     'waitlist_form_error')
```

### Admin View

```
Request → /admin
    ↓
middleware.ts (edge)
    → cookie absent? → redirect /admin/login
    → cookie present? → pass through (does NOT verify, only checks presence)
    ↓
app/admin/page.tsx (Server Component)
    → jwtVerify(cookie) — cryptographic check (defense in depth)
    → fail? → redirect /admin/login
    → pass? → supabaseAdmin.from('waitlist').select(*)
    ↓
Render table (Server Component, no client JS needed)
```

### PostHog Event Flow

```
PHProvider (providers.tsx, 'use client')
    ↓ initializes posthog-js with NEXT_PUBLIC_POSTHOG_KEY
    ↓ wraps app/layout.tsx
    ↓
Components call posthog.capture() directly:
  - WaitlistForm   → waitlist_form_submitted, waitlist_form_error
  - PricingSection → pricing_tier_viewed (Intersection Observer or hover)
  - CTA buttons    → cta_clicked (with { location: 'hero' | 'pricing' })
```

### Environment Variable Flow

```
Vercel project env vars
    ↓
lib/env.ts (server + client safe accessors)
    ↓
PricingSection imports checkoutUrls (NEXT_PUBLIC_ vars only, or passed as props from Server Component)
```

Note: Checkout URLs must use `NEXT_PUBLIC_` prefix if read in Client Components, or be passed as props from a Server Component parent. If PricingSection is a Client Component (for PostHog events), use `NEXT_PUBLIC_LEMON_SQUEEZY_*_CHECKOUT_URL`.

## Build Order (Phase Dependencies)

Build in this order — each layer depends on the one before:

1. **Foundation** (no dependencies): Brand tokens (`globals.css` with OKLCH custom properties), `lib/env.ts` (checkout URL fallbacks), `PostHogProvider` setup.
2. **Static sections** (depend on brand tokens): `HeroSection`, `FeaturesSection`, `SocialProofSection` — pure markup, no interactivity.
3. **Interactive public components** (depend on PostHog init): `WaitlistForm` (cross-origin fetch + events), `PricingSection` (CTA buttons + `pricing_tier_viewed` event).
4. **Admin route** (depends on Supabase client, cookie auth): `lib/supabase-admin.ts`, `/api/admin-auth`, `/admin/login`, `/admin/page`.
5. **Middleware** (depends on cookie strategy being decided): `middleware.ts` — wire last, after cookie name/format is settled.
6. **Responsive polish and copy audit**: Final pass — no new dependencies.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–10k visitors/mo | Static export or edge SSR — current architecture handles this with zero changes |
| 10k–500k visitors/mo | Enable Next.js ISR or move to Astro static build; the external waitlist API is the only stateful component and it scales independently |
| 500k+ visitors/mo | Irrelevant for a marketing page — if traffic is this high, revenue justifies a redesign |

This is a marketing page. Scaling complexity is a non-concern. Optimize for load time (Core Web Vitals) over architectural flexibility.

## Anti-Patterns

### Anti-Pattern 1: Proxy the Waitlist API Through the Landing Page

**What people do:** Create a Next.js API route at `/api/waitlist` that forwards to the Conjure app.
**Why it's wrong:** Adds latency, adds an extra failure point, requires maintaining a second server-side request. The Conjure endpoint is public and handles CORS — there is nothing to hide.
**Do this instead:** POST directly from the browser to `https://conjurestudio.app/api/waitlist`.

### Anti-Pattern 2: Middleware-Only Admin Auth

**What people do:** Check the session cookie only in `middleware.ts` and render the admin page unconditionally if middleware passes.
**Why it's wrong:** CVE-2025-29927 (March 2025, CVSS 9.1) demonstrated that the `x-middleware-subrequest` header can bypass middleware entirely on unpatched Next.js. Even on patched versions, defense in depth is correct practice.
**Do this instead:** Re-verify the session token in the Server Component (or Server Action) before any Supabase query executes. Middleware is fast-path rejection only.

### Anti-Pattern 3: Reading `SUPABASE_SERVICE_ROLE_KEY` in Client Components

**What people do:** Import the Supabase admin client into a component that also has `'use client'`, or prefix the service_role key with `NEXT_PUBLIC_`.
**Why it's wrong:** The service_role key bypasses Row Level Security entirely. Exposing it client-side grants any browser visitor full read/write access to the database.
**Do this instead:** The Supabase admin client lives only in `lib/supabase-admin.ts`, imported only from Server Components and API routes. No `NEXT_PUBLIC_` prefix on the service_role key.

### Anti-Pattern 4: Inline `process.env` for Checkout URL Fallbacks

**What people do:** Scatter `process.env.LEMON_SQUEEZY_SCOUT_CHECKOUT_URL || 'https://...'` across multiple pricing components.
**Why it's wrong:** When URLs are eventually configured, the fallback logic must be updated in multiple places. It also mixes infrastructure concerns with rendering logic.
**Do this instead:** Centralize in `lib/env.ts`. Components import `checkoutUrls.scout` — they don't know about fallback logic.

### Anti-Pattern 5: Making `PricingSection` a Full Server Component

**What people do:** Render pricing as a pure Server Component to keep it simple.
**Why it's wrong:** PostHog event capture (`pricing_tier_viewed`, `cta_clicked`) requires browser APIs. You cannot call `posthog.capture()` from a Server Component.
**Do this instead:** Either mark `PricingSection` as `'use client'` (simplest), or split into a Server Component shell that passes checkout URLs as props to a thin Client Component for the interactive button layer.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| `conjurestudio.app/api/waitlist` | Browser `fetch` POST, cross-origin | CORS must be enabled on the Conjure app side (verify before shipping); endpoint returns 200 on success and on duplicate |
| Supabase | `@supabase/supabase-js` `createClient` with service_role key, server-only | Use `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). Only needed for `/admin` route |
| PostHog | `posthog-js` initialized in `PHProvider`, `usePostHog` hook or direct `posthog.capture()` in client components | Use `NEXT_PUBLIC_POSTHOG_KEY`. Disable `capture_pageview: false` in init; use `PostHogPageView` component for SPA-style page view tracking |
| Lemon Squeezy | No SDK — URLs only. Pricing CTAs link to checkout URLs via `lib/env.ts` | Falls back to Conjure signup URL until configured. No webhook or API integration needed on the landing page |
| Vercel | Deployment target — separate project from Conjure app | Env vars set in Vercel dashboard; `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `SUPABASE_*` are server-only (no `NEXT_PUBLIC_` prefix) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `PostHogProvider` ↔ marketing sections | Provider wraps layout; sections call `posthog.capture()` directly | No prop drilling needed |
| `WaitlistForm` ↔ external API | Direct `fetch` — no shared state, no global store | Keep form state local (`useState`) |
| `/admin/page` ↔ Supabase | Direct import of `supabaseAdmin` — no abstraction layer needed | Single query, single table; no caching needed |
| `middleware.ts` ↔ `/admin/page` | Cookie `admin_session` is the contract | Cookie name must match in middleware check and Server Component verification |
| `lib/env.ts` ↔ `PricingSection` | Import of `checkoutUrls` object | If `PricingSection` is a Client Component, env vars must use `NEXT_PUBLIC_` prefix or be passed as Server Component props |

## Sources

- [Next.js vs Astro for marketing sites — Makers Den, 2025](https://makersden.io/blog/nextjs-vs-astro-in-2025-which-framework-best-for-your-marketing-website) — MEDIUM confidence (WebSearch)
- [CVE-2025-29927 Next.js middleware bypass — Vercel postmortem](https://vercel.com/blog/postmortem-on-next-js-middleware-bypass) — HIGH confidence (official)
- [CVE-2025-29927 — Datadog Security Labs analysis](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/) — HIGH confidence (official vendor)
- [PostHog Next.js docs](https://posthog.com/docs/libraries/next-js) — HIGH confidence (official)
- [PostHog Astro docs](https://posthog.com/docs/libraries/astro) — HIGH confidence (official)
- [Password protecting Next.js routes — Alex Chan](https://www.alexchantastic.com/password-protecting-next) — MEDIUM confidence (community, verified pattern)
- [Supabase service_role with Next.js server components — Supabase docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — HIGH confidence (official)

---
*Architecture research for: Conjure Landing Page (SaaS marketing landing page + admin)*
*Researched: 2026-03-11*
