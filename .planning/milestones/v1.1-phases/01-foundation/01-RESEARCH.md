# Phase 1: Foundation - Research

**Researched:** 2026-03-11
**Domain:** Next.js 15 App Router scaffold — brand tokens, font loading, PostHog init, env var structure, copy constants
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Brand tokens defined as OKLCH values in Tailwind v4 `@theme` block (not hex) — primary mint `oklch(0.92 0.18 142)`, background `oklch(0.04 0 0)`, all values from brief Section 1.1 | Tailwind v4 CSS-first `@theme` pattern documented; OKLCH pitfall verified against official changelog |
| FOUND-02 | Geist Sans and Geist Mono loaded via `next/font/google` and applied to base layout | `next/font/google` pattern documented; Geist is available via Google Fonts integration |
| FOUND-03 | PostHog initialized in root layout with `capture_pageview: false` (manual page view tracking) | PostHog Next.js docs confirm PHProvider pattern; `capture_pageview: false` is the correct init option |
| FOUND-04 | Environment variables wired: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `LEMON_SQUEEZY_*_CHECKOUT_URL` (×4), `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` | Documented in ARCHITECTURE.md; env var prefix rules (`NEXT_PUBLIC_` vs. server-only) are critical |
| FOUND-05 | All approved copy stored in a `content.ts` constants file before any components are written — no hardcoded copy strings in component files | Anti-pattern documented in PITFALLS.md; this is a project-enforced constraint |
| FOUND-06 | Checkout URL accessor centralizes the `‖ 'https://conjurestudio.app/auth/signup'` fallback for all 4 Lemon Squeezy env vars | Verified pattern in ARCHITECTURE.md Pattern 3; prevents `href="undefined"` pitfall |
</phase_requirements>

---

## Summary

Phase 1 establishes the configuration substrate that every downstream component depends on. It has no dependencies of its own — it produces the locked sources (brand tokens, env var accessors, copy constants, analytics init) that all later phases consume. Building this first eliminates the two most persistent rework causes: hex color drift (which cascades through every UI component) and copy drift (which requires a full-page audit to undo).

The framework decision is already locked: Next.js 15 App Router. The STACK.md research originally recommended Astro for a marketing page, but the project decision overrides this in favor of Next.js due to developer familiarity and the admin route's reliance on Next.js-native server component + cookie auth patterns already in use on the Conjure app. This phase research does not revisit that decision.

Phase 1 produces no visible UI. Its output is a deployed skeleton at a Vercel URL — a dark-background page proving that fonts load, the brand palette renders, PostHog receives a pageview, and env var accessors export correct values. All six FOUND requirements are verifiable from this skeleton before any section components are built.

**Primary recommendation:** Scaffold with `create-next-app`, install Tailwind v4 via `@tailwindcss/postcss` (the Next.js integration path, not `@tailwindcss/vite`), define all OKLCH tokens in `globals.css` `@theme`, load fonts via `next/font/google`, wire `PostHogProvider` in root layout, write `lib/env.ts` with fallback accessors, and create `lib/content.ts` with approved copy strings — in that order. Deploy to Vercel to verify the skeleton before Phase 2 starts.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | >=15.2.3 | Framework | Locked decision; version floor enforced by CVE-2025-29927 patch |
| tailwindcss | 4.x | Utility styling | OKLCH color support is first-class; CSS-first, no config file needed |
| @tailwindcss/postcss | 4.x | Next.js Tailwind integration | The correct integration for Next.js; NOT `@tailwindcss/vite` (that's for Vite-based frameworks) |
| typescript | 5.x | Type safety | Strict mode; typed env var accessors prevent silent undefined values |
| posthog-js | latest | Analytics | Already in use on Conjure app; required for all 4 analytics events |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font/google | (bundled with next) | Self-hosted font loading | Use for Geist Sans and Geist Mono — avoids third-party Google Fonts requests, improves LCP |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tailwindcss/postcss | @tailwindcss/vite | `@tailwindcss/vite` is for Vite-based projects (Astro, Remix with Vite). Next.js uses PostCSS pipeline. Using the wrong plugin causes silent build failures. |
| next/font/google | Direct Google Fonts `<link>` | Direct link creates third-party DNS lookup and render-blocking request. `next/font/google` self-hosts fonts at build time — zero external request at runtime. |

**Installation:**
```bash
# Scaffold (greenfield — run from parent directory)
npx create-next-app@latest conjure-landing-page \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias

# Verify Next.js version meets CVE floor
# If create-next-app installed < 15.2.3, pin it:
npm install next@latest

# Tailwind v4 (create-next-app may install v3 — upgrade to v4)
npm install -D tailwindcss@latest @tailwindcss/postcss@latest

# PostHog
npm install posthog-js
```

> **Note:** `create-next-app --tailwind` installs Tailwind v3 by default (as of early 2026). After scaffolding, upgrade Tailwind to v4 and remove `tailwind.config.ts` — v4 uses CSS-first configuration, not a config file.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout — PostHogProvider wrapper, Geist font vars
│   ├── page.tsx             # Landing page (single scroll, Server Component)
│   ├── globals.css          # @theme block with OKLCH brand tokens, Tailwind import
│   ├── admin/               # Phase 3 — not built in Phase 1
│   └── api/                 # Phase 3 — not built in Phase 1
├── components/
│   └── providers/
│       └── PostHogProvider.tsx  # 'use client' — PHProvider wrapper
├── lib/
│   ├── env.ts               # Typed env var accessors with checkout URL fallback logic
│   └── content.ts           # All approved copy strings — single source of truth
└── middleware.ts             # Phase 3 — not built in Phase 1
```

### Pattern 1: Tailwind v4 OKLCH Brand Tokens in `@theme`

**What:** All brand colors defined in the `@theme` CSS block as `oklch()` values. Tailwind v4 registers these as CSS custom properties and makes them available as utility classes (`bg-mint`, `text-background`, etc.).

**When to use:** On first-touch of `globals.css`. Define all tokens before writing any component.

**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand palette — all values from LANDING-PAGE-BRIEF.md Section 1.1 */
  /* Primary */
  --color-mint:        oklch(0.92 0.18 142);   /* primary accent, CTAs */
  --color-background:  oklch(0.04 0 0);        /* near-black base */
  --color-surface:     oklch(0.10 0.01 0);     /* card/section backgrounds */
  --color-text:        oklch(0.96 0 0);        /* primary body text */
  --color-text-muted:  oklch(0.60 0 0);        /* secondary text */
  --color-border:      oklch(0.20 0.01 0);     /* dividers, card borders */

  /* Typography scale — extend if brief specifies additional sizes */
  --font-sans: 'Geist Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
}
```

> **Critical:** Do NOT define any brand token with a `#` hex value inside `@theme`. Tailwind v4 does not auto-convert hex to OKLCH. Hex in `@theme` emits as-is and will look duller on wide-gamut (P3) displays.

### Pattern 2: Geist Font Loading via `next/font/google`

**What:** Import Geist Sans and Geist Mono using `next/font/google` in `layout.tsx`. Apply CSS variable output to the `<html>` element so Tailwind utility classes can reference them.

**When to use:** In `app/layout.tsx` only — single initialization.

**Example:**
```typescript
// src/app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-text font-sans antialiased">
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
```

> **Note:** The CSS variable names (`--font-geist-sans`) must match the `@theme` `--font-sans` mapping if using Tailwind v4's font utilities. In `@theme`, write `--font-sans: var(--font-geist-sans), ui-sans-serif, ...;` to connect the two systems.

### Pattern 3: PostHog PHProvider in Root Layout

**What:** A `'use client'` wrapper component that initializes PostHog once at app startup. Wraps children in root layout. Uses `capture_pageview: false` to prevent automatic pageview events — the project uses manual pageview tracking.

**When to use:** In `app/layout.tsx` — wraps the entire app. Never initialize PostHog in individual components.

**Example:**
```typescript
// src/components/providers/PostHogProvider.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      capture_pageview: false,   // manual pageview tracking only
      capture_pageleave: true,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

> **Note:** The `useEffect` with empty dependency array ensures `posthog.init()` runs exactly once per client mount. Calling `posthog.init()` in module scope (outside a hook) causes double-initialization in React Strict Mode.

### Pattern 4: Typed Env Var Accessor with Checkout URL Fallback

**What:** `lib/env.ts` exports typed accessors for all environment variables. Checkout URL accessors embed the `|| 'https://conjurestudio.app/auth/signup'` fallback. Components import from this file — they never read `process.env` directly.

**When to use:** Any time an env var is needed anywhere in the codebase.

**Example:**
```typescript
// src/lib/env.ts

// --- PostHog (client-safe, NEXT_PUBLIC_ prefix) ---
export const posthogKey  = process.env.NEXT_PUBLIC_POSTHOG_KEY  ?? ''
export const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

// --- Checkout URLs (server-only or passed as props to client components) ---
// These vars do NOT have NEXT_PUBLIC_ — they are server-side only.
// Pass as props from Server Components to any Client Component that needs them.
const FALLBACK_URL = 'https://conjurestudio.app/auth/signup'

export const checkoutUrls = {
  scout:    process.env.LEMON_SQUEEZY_SCOUT_CHECKOUT_URL    || FALLBACK_URL,
  director: process.env.LEMON_SQUEEZY_DIRECTOR_CHECKOUT_URL || FALLBACK_URL,
  producer: process.env.LEMON_SQUEEZY_PRODUCER_CHECKOUT_URL || FALLBACK_URL,
  studio:   process.env.LEMON_SQUEEZY_STUDIO_CHECKOUT_URL   || FALLBACK_URL,
} as const

// --- Admin (server-only — never export with NEXT_PUBLIC_ prefix) ---
// These are accessed directly in Server Components; do not re-export.
// Documented here for inventory completeness:
// process.env.ADMIN_PASSWORD
// process.env.ADMIN_JWT_SECRET
// process.env.SUPABASE_URL
// process.env.SUPABASE_SERVICE_ROLE_KEY
```

> **Critical env var prefix rule:** `LEMON_SQUEEZY_*_CHECKOUT_URL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL` must NOT have the `NEXT_PUBLIC_` prefix. They are server-only. If `PricingSection` is a Client Component, checkout URLs must be passed as props from its Server Component parent — not imported directly from `lib/env.ts` in the client bundle.

### Pattern 5: Copy Constants File

**What:** `lib/content.ts` exports all approved user-facing copy strings as typed constants. Component files import from here — they contain zero inline marketing copy literals.

**When to use:** Created in Phase 1, before any component is written. All subsequent phases import from here.

**Example:**
```typescript
// src/lib/content.ts
// All copy sourced verbatim from LANDING-PAGE-BRIEF.md
// DO NOT paraphrase. DO NOT add banned words.
// Banned: AI-powered, platform, solution, leverage, seamless, intuitive,
//         workflow automation, generative AI, storyboard software, asset
//         management, collaboration hub, template, streamline

export const HERO = {
  HEADLINE: '',         // Fill from brief Section 2 — copy locked before Phase 2
  SUBHEAD:  '',         // Fill from brief Section 2
  CTA_PRIMARY: 'Start free — no credit card',
  CTA_URL: 'https://conjurestudio.app/auth/signup',
} as const

export const FEATURES = {
  COMPONENT_ASSEMBLY: {
    TITLE: '',          // Fill from brief Section 2
    OUTCOME: '',        // "User outcome" field verbatim
  },
  CHARACTER_EXTRACTION: {
    TITLE: '',
    OUTCOME: '',
  },
  CAMERA_PRESETS: {
    TITLE: '',
    OUTCOME: '',
  },
  POSE_SHEETS: {
    TITLE: '',
    OUTCOME: '',
  },
  SLIDES_EXPORT: {
    TITLE: '',
    OUTCOME: '',
  },
} as const

export const PRICING = {
  TIERS: [
    { id: 'scout',    name: 'Scout',    monthly: 39,  annual: null },
    { id: 'director', name: 'Director', monthly: 59,  annual: null },
    { id: 'producer', name: 'Producer', monthly: 89,  annual: null },
    { id: 'studio',   name: 'Studio',   monthly: 129, annual: null },
  ],
  TRIAL_CTA: 'Start free — no credit card',
  TRIAL_URL: 'https://conjurestudio.app/auth/signup',
} as const

export const WAITLIST = {
  SUBMIT_LABEL: '',     // Fill from brief approved copy
  SUCCESS_MESSAGE: '',
  ERROR_MESSAGE: '',
} as const

export const FAQ = {
  ITEMS: [
    { question: 'Do I need to know how to draw?', answer: '' },
    { question: 'What happens to my script?',     answer: '' },
    { question: 'How is this different from just using Midjourney?', answer: '' },
  ],
} as const
```

> **Note on empty strings:** Phase 1 stubs out the structure with empty strings. Phase 2 fills in the actual copy values from `LANDING-PAGE-BRIEF.md` before any component renders them. This guarantees the constants file exists and the import chain is wired before copy is needed.

### Anti-Patterns to Avoid

- **Hex in `@theme`:** Any `#rrggbb` value in the `@theme` block violates FOUND-01 and produces a dull visual result on P3 displays. Tailwind v4 does not convert hex to OKLCH automatically.
- **Inline copy in JSX:** Any marketing string typed directly into a `.tsx` file (not imported from `content.ts`) is a copy drift risk. Ban from Phase 1 onward.
- **`process.env` in Client Components:** Checkout URL reads in Client Components expose server-only vars to the bundle if they lack the `NEXT_PUBLIC_` prefix — or expose billing infrastructure if they have it. Always pass as props from Server Component parent.
- **Multiple PostHog inits:** Initializing PostHog in individual components causes duplicate events. Single init in `PostHogProvider` only.
- **Keeping `tailwind.config.ts` from scaffold:** `create-next-app` generates a `tailwind.config.ts` configured for v3. Delete it when upgrading to v4 — the CSS `@theme` block replaces it entirely. A config file co-existing with `@theme` causes conflicts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosted web fonts | Manual `@font-face` + copying font files | `next/font/google` | Auto-subsets, zero external DNS, prevents layout shift with automatic size-adjust |
| Analytics initialization guard | Custom singleton pattern | `posthog-js` + React `useEffect` | posthog-js has built-in queue; events captured before init are replayed automatically |
| Env var validation | Custom env schema checker at startup | TypeScript typed accessors in `lib/env.ts` | This is a simple marketing page; Zod or t3-env would be over-engineering for 7 env vars |

**Key insight:** Phase 1 is pure configuration. The only "hand-rolled" items are the `lib/env.ts` accessors and `lib/content.ts` structure — both are intentionally thin, typed TypeScript files, not complex abstractions.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 Upgrade Not Completed After Scaffold

**What goes wrong:** `create-next-app --tailwind` installs Tailwind v3 with a `tailwind.config.ts`. Developers start adding utility classes and the project appears to work. Later, OKLCH tokens defined in `@theme` don't work because v3 doesn't support `@theme`.

**Why it happens:** The scaffold silently pins Tailwind v3.

**How to avoid:** After scaffolding, run `npm install -D tailwindcss@latest @tailwindcss/postcss@latest`. Delete `tailwind.config.ts`. Verify `@theme {}` resolves in `globals.css` by adding a test class and checking the browser.

**Warning signs:** `tailwind.config.ts` still present in the repo; `@theme` block has no effect in the browser; colors are still controlled by the config file.

### Pitfall 2: OKLCH Hex Approximation on Brand Tokens

**What goes wrong:** Brand primary mint `oklch(0.92 0.18 142)` gets approximated as `#9aff8f` (or any hex). On wide-gamut displays the rendered color is visibly duller. Violates FOUND-01 explicitly.

**Why it happens:** Design tools export hex. Browser DevTools show hex. Path of least resistance.

**How to avoid:** Copy OKLCH values verbatim from `LANDING-PAGE-BRIEF.md` Section 1.1 into `globals.css`. Run `grep '#' src/app/globals.css` — expect zero hits in the `@theme` block.

**Warning signs:** Any `#` character inside the `@theme {}` block for brand colors.

### Pitfall 3: `NEXT_PUBLIC_` Prefix on Server-Only Vars

**What goes wrong:** Developer prefixes `SUPABASE_SERVICE_ROLE_KEY` or `ADMIN_PASSWORD` with `NEXT_PUBLIC_` to make them accessible in a component. The key is now embedded in the public JavaScript bundle. Anyone can read it from `_next/static`.

**Why it happens:** "It's not working in the client" is solved by adding the prefix without considering exposure.

**How to avoid:** Checkout URLs, Supabase service role key, admin password, and JWT secret are all server-only. Pass checkout URLs as props from Server Component parents to Client Components. Never prefix sensitive keys.

**Warning signs:** `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` in `.env.local`; `NEXT_PUBLIC_ADMIN_PASSWORD`.

### Pitfall 4: PostHog Double-Init in React Strict Mode

**What goes wrong:** In development with React Strict Mode, effects run twice. If `posthog.init()` is called without a guard, PostHog initializes twice per page load. Every event fires twice, corrupting analytics data retroactively (historical double-counts cannot be corrected).

**Why it happens:** React Strict Mode is enabled by default in `create-next-app`. Developers don't notice the double-init until they check the PostHog dashboard.

**How to avoid:** posthog-js 1.x handles multiple `init()` calls gracefully — subsequent calls with the same key are no-ops. However, wrapping in a single `useEffect` with `[]` deps in the `PostHogProvider` component is the safe pattern. Do not place `posthog.init()` in component render bodies.

**Warning signs:** PostHog Live Events dashboard shows 2× the expected events immediately after the page loads; events are attributed to the same `distinct_id`.

### Pitfall 5: `content.ts` Created After First Components

**What goes wrong:** Phase 2 components are built before `content.ts` exists. Copy gets typed inline "for now." It never gets moved. By Phase 4, inline strings are scattered across 6 component files, making the banned-word audit difficult.

**Why it happens:** `content.ts` feels premature when there are no components yet.

**How to avoid:** Create the stubbed `content.ts` structure in Phase 1 as part of the foundation. Phase 2 fills in the values — it does not create the file.

**Warning signs:** Phase 2 begins and `src/lib/content.ts` does not exist.

---

## Code Examples

Verified patterns from official sources:

### Tailwind v4 `@theme` with OKLCH (CSS-First)
```css
/* Source: https://tailwindcss.com/blog/tailwindcss-v4 */
@import "tailwindcss";

@theme {
  --color-mint:       oklch(0.92 0.18 142);
  --color-background: oklch(0.04 0 0);
}
/* Usage in components: className="bg-background text-mint" */
```

### Geist via `next/font/google`
```typescript
/* Source: https://nextjs.org/docs/app/building-your-application/optimizing/fonts */
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' })
```

### PostHog Next.js App Router init
```typescript
/* Source: https://posthog.com/docs/libraries/next-js */
// PHProvider wraps layout; capture_pageview: false for manual SPA tracking
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  capture_pageview: false,
})
```

### Env var accessor with fallback
```typescript
/* Source: ARCHITECTURE.md Pattern 3 — project-specific pattern */
const FALLBACK = 'https://conjurestudio.app/auth/signup'
export const checkoutUrls = {
  scout:    process.env.LEMON_SQUEEZY_SCOUT_CHECKOUT_URL    || FALLBACK,
  director: process.env.LEMON_SQUEEZY_DIRECTOR_CHECKOUT_URL || FALLBACK,
  producer: process.env.LEMON_SQUEEZY_PRODUCER_CHECKOUT_URL || FALLBACK,
  studio:   process.env.LEMON_SQUEEZY_STUDIO_CHECKOUT_URL   || FALLBACK,
} as const
```

### Verifying OKLCH token coverage
```bash
# Run after globals.css is written — expect 0 results inside @theme block
grep -n '#' src/app/globals.css
# Run after any Phase 2 work — expect 0 results across all source files
grep -rn 'AI-powered\|platform\|seamless\|intuitive\|workflow automation' src/
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for color/font customization | CSS-first `@theme` block in `globals.css` | Tailwind v4 (2025) | No config file needed; colors are CSS custom properties; OKLCH is first-class |
| `@astrojs/tailwind` integration | `@tailwindcss/postcss` (Next.js) or `@tailwindcss/vite` (Vite/Astro) | Tailwind v4 (2025) | `@astrojs/tailwind` deprecated for v4 — silently broken if used |
| `_app.tsx` providers | `app/layout.tsx` with Server + Client Component nesting | Next.js 13 App Router | PostHogProvider is a Client Component that wraps children in a Server Component layout |

**Deprecated/outdated:**
- `tailwind.config.ts` color extension: Replaced by `@theme {}` in CSS. Delete after scaffold.
- `@astrojs/tailwind`: Not relevant (this is Next.js), but mentioned because STACK.md references Astro; the Astro integration docs are not applicable here.
- `framer-motion` (old package name): Now published as `motion`. Not needed in Phase 1, but relevant for Phase 2 scroll animations.

---

## Open Questions

1. **OKLCH token table completeness**
   - What we know: PRIMARY MINT and BACKGROUND are confirmed (`oklch(0.92 0.18 142)` and `oklch(0.04 0 0)`). Additional tokens (surface, text-muted, border) are estimated from typical dark-background design systems.
   - What's unclear: The exact values for ALL tokens in `LANDING-PAGE-BRIEF.md` Section 1.1 — the brief is not present in the repo as a file.
   - Recommendation: Phase 1 Wave 0 task should read the brief document and extract ALL OKLCH values before writing a single token in `globals.css`. Do not approximate from the hex equivalents.

2. **Full approved copy for `content.ts`**
   - What we know: Some approved copy strings are known from PROJECT.md and REQUIREMENTS.md (e.g., `'Start free — no credit card'` for the primary CTA, FAQ question phrasing).
   - What's unclear: Feature benefit copy ("User outcome" fields for all 5 features), exact headline/subhead, waitlist form labels, FAQ answers — all live in `LANDING-PAGE-BRIEF.md` Section 2 and Section 4.
   - Recommendation: The planner should include a Wave 0 task to open `LANDING-PAGE-BRIEF.md` and transcribe the full copy block before stubbing `content.ts`. If the brief is not accessible from the repo, flag as a blocker.

3. **Next.js version from `create-next-app`**
   - What we know: The CVE floor is `next >= 15.2.3`.
   - What's unclear: Whether `create-next-app@latest` as of 2026-03-11 scaffolds a version above or below this floor.
   - Recommendation: After scaffolding, explicitly run `npm install next@latest` and verify the installed version in `package.json` before the phase is marked done.

---

## Validation Architecture

`nyquist_validation: true` is set in `.planning/config.json` — this section is included.

### Test Framework

Phase 1 is a greenfield scaffold with no application logic. There is no behavior to unit-test in Phase 1 — the deliverables are configuration files, CSS, and a deployed skeleton. Standard testing for Next.js (Vitest or Jest + Testing Library) would be installed during Phase 1 so Phase 2 tests have a home, but no Phase 1 requirements have meaningful automated test coverage.

| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react (recommended for Next.js App Router; lighter than Jest) |
| Config file | `vitest.config.ts` — does not exist yet, created in Wave 0 |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | OKLCH tokens present in `globals.css` `@theme` block, no hex | Manual inspection + grep | `grep -n '#' src/app/globals.css` — expect 0 in `@theme` | ❌ grep command, no test file |
| FOUND-02 | Geist Sans and Geist Mono variables applied to `<html>` element | Manual — browser inspection | N/A — visual verification in browser | manual-only |
| FOUND-03 | PostHog initialized with `capture_pageview: false` | Unit — test PostHogProvider | `npx vitest run src/components/providers/PostHogProvider.test.tsx` | ❌ Wave 0 |
| FOUND-04 | All 9 env vars documented; typed accessors export without throwing | Unit — test env.ts | `npx vitest run src/lib/env.test.ts` | ❌ Wave 0 |
| FOUND-05 | `content.ts` exists, all exports are non-undefined typed constants | Unit — import and check | `npx vitest run src/lib/content.test.ts` | ❌ Wave 0 |
| FOUND-06 | Checkout URL accessor returns fallback when env var unset | Unit — test env.ts checkoutUrls | `npx vitest run src/lib/env.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `grep -n '#' src/app/globals.css` (FOUND-01 guard)
- **Per wave merge:** `npx vitest run` (when test files exist)
- **Phase gate:** All grep checks clean + deployed Vercel URL loads with correct font, dark background, and PostHog event in dashboard

### Wave 0 Gaps

- [ ] `src/lib/env.test.ts` — covers FOUND-04 and FOUND-06; tests that `checkoutUrls.scout` returns fallback when env var absent
- [ ] `src/lib/content.test.ts` — covers FOUND-05; verifies all exports are defined strings (not empty or undefined)
- [ ] `vitest.config.ts` — framework setup for all future phases
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom`

*(FOUND-01 and FOUND-02 are grep/manual verification, not unit tests. FOUND-03 PostHogProvider test is desirable but low-value given the component is a thin wrapper — treat as optional.)*

---

## Sources

### Primary (HIGH confidence)
- Tailwind CSS v4 release post and `@theme` docs — https://tailwindcss.com/blog/tailwindcss-v4 — verified OKLCH `@theme` syntax, PostCSS plugin for Next.js
- PostHog Next.js docs — https://posthog.com/docs/libraries/next-js — verified PHProvider pattern and `capture_pageview: false` option
- Next.js font optimization docs — https://nextjs.org/docs/app/building-your-application/optimizing/fonts — verified `next/font/google` Geist import
- CVE-2025-29927 Vercel postmortem — https://vercel.com/blog/postmortem-on-next-js-middleware-bypass — version floor `>=15.2.3` confirmed
- `.planning/research/ARCHITECTURE.md` — env.ts pattern, component structure, env var prefix rules (project-level, HIGH confidence)
- `.planning/research/PITFALLS.md` — OKLCH pitfall, PostHog double-init, env prefix rules (project-level, HIGH confidence)
- `.planning/research/STACK.md` — library versions and integration notes (project-level, HIGH confidence)

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md` — framework decision rationale, phase ordering (project-level synthesis document)

### Tertiary (LOW confidence)
- Estimated `surface`, `text-muted`, `border` OKLCH values — inferred from dark-background design system conventions; NOT from brief. Must be replaced with brief values before Phase 1 is complete.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against official docs; version floor from official CVE report
- Architecture: HIGH — patterns sourced from project's own ARCHITECTURE.md which was researched against official docs
- Pitfalls: HIGH — OKLCH pitfall, PostHog pitfall, and env prefix pitfall all sourced from official docs or CVE reports in PITFALLS.md
- OKLCH token values (partial): MEDIUM — primary mint and background confirmed from PROJECT.md and REQUIREMENTS.md; full token table requires reading the brief directly

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable stack; Tailwind v4 and Next.js 15 are not in rapid flux)
