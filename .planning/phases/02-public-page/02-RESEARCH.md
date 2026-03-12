# Phase 2: Public Page - Research

**Researched:** 2026-03-12
**Domain:** Next.js 16 App Router landing page — section components, Intersection Observer scroll effects, glass/glow UI, pricing toggle, waitlist form, PostHog events
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Visual Design Language**
- Glass cards throughout — semi-transparent dark background (`--glass-bg`), blurred backdrop (`--glass-blur`), subtle white border (`--glass-border`), mint glow on hover (`--glow-hover`)
- Mint (`oklch(0.92 0.18 142)`) used for CTAs and interactive highlights only — buttons, links, hover states, active borders. Not for headings or decorative elements
- Typography: technical + precise — tight tracking, medium weight headings, Geist Mono for labels/numbers/tier names
- Section spacing: generous vertical padding, no explicit dividers, no background alternation between sections

**Hero Layout**
- Screenshot presented inside a minimal browser chrome mockup (dark chrome, traffic light dots, URL bar)
- Desktop: two-column — text (headline + subhead + CTA) on the left, browser mockup on the right
- Mobile (375px): single-column stack in order: Headline → Subhead → CTA → Screenshot (CTA above the fold)
- Hero background: base dark only (`oklch(0.04 0 0)`) — no gradient, no glow bloom behind the screenshot

**Features Section**
- 2-column grid on desktop, 1-column on mobile
- 5th card centered or full-width at the bottom of the grid
- Cards use glass surface style with hover glow

**Pricing Section**
- 4 tier cards in a row on desktop (1-column stack on mobile)
- Director tier highlighted — mint border + "Most popular" badge
- Monthly/Annual toggle switch above the cards — annual view shows per-month price + "billed annually" + annual total
- All 4 tier CTAs use `checkoutUrls` from `env.ts` (falls back to trial signup URL if unset)

**Page Chrome**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HERO-01 | Hero headline + subhead from `HERO` constants | `content.ts` exports confirmed |
| HERO-02 | Primary CTA links to trial signup with label "Start free — no credit card" | `HERO.CTA_URL` and `HERO.CTA_PRIMARY` confirmed in `content.ts` |
| HERO-03 | Hero visual: branded deck screenshot inside browser chrome mockup; `<!-- HERO_SCREENSHOT_REQUIRED -->` placeholder | `next/image` + placeholder comment pattern; asset pending |
| HERO-04 | PostHog `cta_clicked` event on primary CTA click | `posthog.capture()` from `posthog-js/react` in client component |
| HOW-01 | 3-step process section from `HOW_IT_WORKS.STEPS` | Constants confirmed in `content.ts` |
| HOW-02 | Director vocabulary enforced (copy already in constants) | Constants contain approved copy; no copy may be written outside `content.ts` |
| FEAT-01–05 | 5 feature cards from `FEATURES.*` constants | All 5 constants confirmed; 2-col/1-col grid with 5th card centered |
| FEAT-06 | Screenshot placeholders `<!-- SCREENSHOT_REQUIRED: MOMENT_N -->` for Moments 2–5 | HTML comment in `<Image>` fallback element |
| PRICE-01 | 4 tier cards with exact values from `PRICING.TIERS` | Array confirmed in `content.ts` |
| PRICE-02 | Annual pricing displayed as per-month + annual total | `annualMonthly` and `annualPrice` fields exist in each tier |
| PRICE-03 | Paid-tier CTAs use `checkoutUrls` from `env.ts` | Server Component parent must pass as props; `checkoutUrls` is server-only |
| PRICE-04 | Trial block: 7-day trial, no card, "Start free — no credit card" CTA | `PRICING.TRIAL_*` constants confirmed |
| PRICE-05 | PostHog `pricing_tier_viewed` on scroll into pricing, once per page load | Intersection Observer + ref guard pattern |
| PRICE-06 | PostHog `cta_clicked` on each tier CTA | `posthog.capture()` in client component |
| WAIT-01 | Email field (required) + name field (optional) + submit button | Controlled form state in `'use client'` component |
| WAIT-02 | Direct cross-origin POST to `https://conjurestudio.app/api/waitlist` | `fetch()` with `{ email, name? }` body; CORS headers confirmed on server |
| WAIT-03 | Submit button disabled on click to prevent double-submit | `useState` disabled flag set on submit |
| WAIT-04 | Success state on 200 | `response.ok` branch renders success copy from `WAITLIST.SUCCESS_MESSAGE` |
| WAIT-05 | Error state on 4xx/5xx | `!response.ok` branch renders error copy from `WAITLIST.ERROR_MESSAGE` |
| WAIT-06 | PostHog `waitlist_form_submitted` with `{ email_domain, has_name }` | Parse `email.split('@')[1]` — never log full email |
| WAIT-07 | PostHog `waitlist_form_error` with `{ error_type }` | Fire in catch block and `!response.ok` branch |
| SOCIAL-01 | Section rendered with `<!-- TESTIMONIAL_REQUIRED -->` placeholder | `SOCIAL_PROOF.TESTIMONIAL === null` check; render placeholder comment |
| SOCIAL-02 | Layout ready for name, title, agency, result | Placeholder card with named slots |
| FAQ-01 | FAQ with 3 questions from `FAQ.ITEMS` | Constants confirmed |
| FAQ-02 | FAQ near waitlist form | Component ordering in `page.tsx` |
| FAQ-03 | Director vocabulary (copy already in constants) | Constants contain approved copy |
| COPY-01 | Zero banned words in public-facing copy | All copy sourced from `content.ts` — no inline strings in components |
| COPY-02 | Director language in hero/features; Agency CD in pricing/trial | Enforced by `content.ts` constants — verified in copy review |
</phase_requirements>

---

## Summary

Phase 2 is a pure UI construction phase. All copy, pricing values, and API endpoints are pre-defined in `content.ts` and `env.ts` — no new data decisions are needed. The work is building nine section components (`Header`, `HeroSection`, `HowItWorksSection`, `FeaturesSection`, `PricingSection`, `SocialProofSection`, `FAQSection`, `WaitlistSection`, `Footer`), wiring them into `page.tsx`, and implementing two Intersection Observer behaviors (sticky header glass transition, section fade-in).

The stack is minimal by design: Next.js 16 App Router, Tailwind v4 CSS-first, no external animation library. Component Server/Client split is the primary architectural concern — `checkoutUrls` from `env.ts` is server-only and must be passed as props from `page.tsx` (a Server Component) down to any client pricing component. PostHog events require `'use client'` boundaries at the component level.

The hero screenshot asset is an outstanding dependency. Phase 2 proceeds with a `<!-- HERO_SCREENSHOT_REQUIRED -->` placeholder and `next/image` wired to accept the asset path once delivered.

**Primary recommendation:** Build each section as its own file in `src/components/sections/`, keep Server vs. Client boundary explicit at the section level, and test scroll behaviors with a real browser — Intersection Observer cannot be meaningfully tested with jsdom.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | App Router, Server Components, `next/image` | Already installed; resolves CVE-2025-29927 |
| react | 19.2.3 | Component model, hooks | Already installed |
| tailwindcss | ^4 | Utility CSS, CSS-first config | Already installed; `@theme` block live |
| posthog-js | ^1.360.1 | Analytics events | Already installed; PostHogProvider wraps root |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/image` | (bundled) | Hero and feature screenshot display, WebP optimization, `priority` | All images — enforces WebP, LCP optimization |
| Intersection Observer API | (browser-native) | Sticky header glass transition, section fade-in, pricing_tier_viewed once | No library needed; supported by all modern browsers |
| `posthog-js/react` | (bundled with posthog-js) | `usePostHog()` hook in client components | Any component that fires `posthog.capture()` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Intersection Observer (native) | Framer Motion / Motion | Locked out — no external animation library per CONTEXT.md |
| CSS `transition` for fade-in | GSAP | Out of scope for v1; v2 has CONV-01 |
| Controlled form with `useState` | React Hook Form | No forms library installed; single form, no validation complexity warranting library |

**Installation:** No new packages needed. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx              # Server Component — imports sections, passes checkoutUrls
│   ├── layout.tsx            # Unchanged
│   └── globals.css           # Add .glass-surface utility class here
├── components/
│   ├── providers/
│   │   └── PostHogProvider.tsx   # Unchanged
│   └── sections/
│       ├── Header.tsx            # 'use client' — Intersection Observer for glass
│       ├── HeroSection.tsx       # Server Component (static content + next/image)
│       ├── HowItWorksSection.tsx # Server Component
│       ├── FeaturesSection.tsx   # Server Component (static cards, fade-in via CSS class)
│       ├── PricingSection.tsx    # 'use client' — toggle state + PostHog events
│       ├── SocialProofSection.tsx# Server Component (placeholder)
│       ├── FAQSection.tsx        # Server Component or 'use client' (accordion)
│       ├── WaitlistSection.tsx   # 'use client' — form state + PostHog events
│       └── Footer.tsx            # Server Component
└── lib/
    ├── content.ts            # Unchanged
    └── env.ts                # Unchanged
```

### Pattern 1: Server Component passes checkoutUrls as props

**What:** `page.tsx` (Server Component) imports `checkoutUrls` from `env.ts` and passes as props to `PricingSection`. `PricingSection` is a Client Component because it manages toggle state and fires PostHog events.

**When to use:** Any server-only env var that must render in a client component.

**Example:**
```typescript
// src/app/page.tsx — Server Component
import { checkoutUrls } from '@/lib/env'
import { PricingSection } from '@/components/sections/PricingSection'

export default function Home() {
  return (
    <main>
      {/* ... other sections ... */}
      <PricingSection checkoutUrls={checkoutUrls} />
    </main>
  )
}
```

```typescript
// src/components/sections/PricingSection.tsx
'use client'
import type { CheckoutUrls } from '@/lib/env' // type export if needed
```

### Pattern 2: Intersection Observer for sticky header

**What:** Header watches a sentinel element (bottom of hero) to toggle glass surface class. Using a boolean ref prevents class thrashing.

**When to use:** Any scroll-triggered state change that should happen once per scroll direction crossing.

**Example:**
```typescript
// src/components/sections/Header.tsx
'use client'
import { useEffect, useRef, useState } from 'react'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    const sentinel = document.getElementById('hero-sentinel')
    if (sentinel) observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className="fixed top-0 w-full z-50 transition-all duration-300"
      style={isScrolled ? {
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: `blur(var(--glass-blur))`,
        borderBottom: '1px solid var(--glass-border)',
      } : {}}
    >
      {/* logo + CTA */}
    </header>
  )
}
```

The sentinel `<div id="hero-sentinel" />` sits at the bottom of `HeroSection`.

### Pattern 3: Section fade-in on scroll

**What:** Each section gets an `opacity-0` + `translate-y-4` initial state. An Intersection Observer adds a CSS class that transitions to `opacity-100` + `translate-y-0`. No JS animation library.

**When to use:** All content sections below the hero.

**Example:**
```typescript
// Can be a custom hook used per-section
'use client'
import { useEffect, useRef } from 'react'

export function useFadeIn() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('fade-in-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}
```

CSS in `globals.css`:
```css
.fade-in-section {
  opacity: 0;
  transform: translateY(1rem);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-in-visible {
  opacity: 1;
  transform: translateY(0);
}
```

> Note: Sections using `useFadeIn()` must be `'use client'` or receive the ref from a client wrapper. Static sections can apply the CSS class and rely on CSS alone with a `:is(.fade-in-visible)` toggled by a thin wrapper. Keep Server Component sections wrapped in a single thin `'use client'` fade wrapper rather than converting all sections to client components.

### Pattern 4: Glass surface via inline style

**What:** No `.glass-surface` utility class exists yet. Apply via inline `style` prop or add a utility class to `globals.css`. Inline style works now; utility class is DRY for many cards.

**Recommendation:** Add a `.glass-surface` utility class to `globals.css` in Wave 1 (globals.css task) so all card components use a single class name.

**Example (add to globals.css):**
```css
.glass-surface {
  background-color: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
}
.glass-surface:hover {
  box-shadow: var(--glow-hover);
}
```

### Pattern 5: Pricing toggle (monthly/annual)

**What:** `useState<'monthly' | 'annual'>` in `PricingSection`. Toggle renders a switch (a styled `<button>` or `<input type="checkbox">`). Price display derives from current state + tier data from `PRICING.TIERS`.

**When to use:** Any binary display toggle without routing.

**Example:**
```typescript
const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

const displayPrice = (tier: typeof PRICING.TIERS[number]) =>
  billing === 'monthly' ? tier.monthlyPrice : tier.annualMonthly
```

### Pattern 6: PostHog events in client components

**What:** Use `posthog.capture()` directly (posthog is the singleton initialized in PostHogProvider). No `usePostHog()` hook needed unless you want the React context version.

**When to use:** All `cta_clicked`, `pricing_tier_viewed`, `waitlist_form_submitted`, `waitlist_form_error` events.

**Example:**
```typescript
'use client'
import posthog from 'posthog-js'

// CTA click
<a
  href={HERO.CTA_URL}
  onClick={() => posthog.capture('cta_clicked', {
    cta_label: HERO.CTA_PRIMARY,
    section: 'hero',
  })}
>
  {HERO.CTA_PRIMARY}
</a>

// Pricing tier viewed — once per page load using a ref guard
const pricingViewedRef = useRef(false)
// In IntersectionObserver callback:
if (!pricingViewedRef.current) {
  posthog.capture('pricing_tier_viewed')
  pricingViewedRef.current = true
}
```

### Pattern 7: Waitlist form state machine

**What:** `useState<'idle' | 'submitting' | 'success' | 'error'>` controls all form states. Submit disables button immediately, fires fetch, transitions to success or error.

**Example:**
```typescript
'use client'
import { useState } from 'react'
import posthog from 'posthog-js'
import { WAITLIST } from '@/lib/content'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('submitting')
    try {
      const res = await fetch(WAITLIST.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...(name ? { name } : {}) }),
      })
      if (res.ok) {
        setFormState('success')
        posthog.capture('waitlist_form_submitted', {
          email_domain: email.split('@')[1],
          has_name: Boolean(name),
        })
      } else {
        const data = await res.json().catch(() => ({}))
        setFormState('error')
        posthog.capture('waitlist_form_error', {
          error_type: data.error ?? `http_${res.status}`,
        })
      }
    } catch (err) {
      setFormState('error')
      posthog.capture('waitlist_form_error', { error_type: 'network' })
    }
  }

  // Render based on formState
}
```

### Pattern 8: Browser chrome mockup

**What:** A small purely-CSS component wrapping `next/image`. No library. Three colored dots (red/yellow/green circles), a dark URL bar, dark background frame.

**Example structure:**
```tsx
<div className="browser-chrome">
  {/* Traffic lights */}
  <div className="chrome-bar">
    <span className="dot red" />
    <span className="dot yellow" />
    <span className="dot green" />
    <div className="url-bar">conjurestudio.app</div>
  </div>
  {/* Screenshot */}
  <div className="chrome-body">
    <Image src="/hero-screenshot.png" alt="..." priority />
    {/* <!-- HERO_SCREENSHOT_REQUIRED --> */}
  </div>
</div>
```

CSS uses `--color-secondary` (`oklch(0.17 0 0)`) for the chrome background, tiny circles for dots.

### Anti-Patterns to Avoid

- **Importing `env.ts` in a `'use client'` component:** `checkoutUrls` and `SUPABASE_*` vars will leak into client bundle. Always pass from Server Component parent as props.
- **Hardcoding copy strings in components:** Every user-visible string must come from `content.ts`. Banned words will appear in component files if copy is written inline.
- **Using `animation: none` or no transition on glass cards:** Hover glow requires `transition: box-shadow 200ms ease` on the card element or the glow appears instantaneously jarring.
- **Applying mint color to headings:** Mint (`text-primary`) is for CTAs and interactive elements only. Headings use `text-foreground` (`oklch(0.98 0 0)`).
- **Calling `new IntersectionObserver` in Server Component body:** Server Components run on the server — no browser APIs. Intersection Observer code must be in `'use client'` components inside `useEffect`.
- **Multiple PostHog inits:** `PostHogProvider` already calls `posthog.init()`. Never call it again in section components.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Manual `<img>` with WebP URLs | `next/image` with `priority` on hero | Automatic WebP conversion, LCP optimization, lazy loading, prevents CLS |
| Font loading | `@import` Google Fonts in CSS | Already done via `next/font/google` in layout.tsx | Preloading, no FOUT, no external network request after build |
| Animation on scroll | Custom requestAnimationFrame loop | Intersection Observer + CSS transition | Browser-native, performant, no library budget |
| CSS variables for glass | Inline rgba strings per component | `var(--glass-bg)`, `var(--glass-border)` from globals.css | Single source; brief-compliant values already defined |

**Key insight:** The entire design system is already wired. Phase 2 is assembly, not invention.

---

## Common Pitfalls

### Pitfall 1: Server/Client boundary with `checkoutUrls`

**What goes wrong:** Developer writes `PricingSection` as a client component and imports `env.ts` directly. Next.js bundles `process.env.LEMON_SQUEEZY_*` into the client bundle — values are either undefined (Vercel strips server-only vars) or exposed.

**Why it happens:** `env.ts` has no `'server-only'` guard import — it doesn't throw at build time.

**How to avoid:** `page.tsx` is a Server Component. Import `checkoutUrls` there and pass as a prop to `<PricingSection checkoutUrls={checkoutUrls} />`.

**Warning signs:** TypeScript won't catch this. Watch for `checkoutUrls` imported directly in any `'use client'` file.

### Pitfall 2: `next/image` missing `priority` on hero image

**What goes wrong:** LCP fires on the hero screenshot. Without `priority`, Next.js lazy-loads it, degrading LCP score (PERF-01 requires ≤2.5s).

**Why it happens:** `priority` is opt-in, not default.

**How to avoid:** Hero `<Image>` always gets `priority` prop. Feature section images do NOT (they're below fold, benefit from lazy loading).

### Pitfall 3: Intersection Observer not cleaned up

**What goes wrong:** Observer fires after component unmounts (in dev StrictMode double-render), causing state updates on unmounted components or duplicate PostHog events.

**Why it happens:** `useEffect` without cleanup.

**How to avoid:** Always `return () => observer.disconnect()` from the `useEffect` that creates the observer.

### Pitfall 4: `pricing_tier_viewed` fires multiple times

**What goes wrong:** Every time user scrolls past pricing section, the event fires again.

**Why it happens:** Intersection Observer fires on every crossing (entering AND re-entering). PRICE-05 says "once per page load."

**How to avoid:** Use `useRef<boolean>(false)` as a guard. Set to `true` after first fire. Do not use `observer.unobserve()` alone — scroll up + scroll down triggers again.

```typescript
const pricingViewedRef = useRef(false)
// In observer callback:
if (entry.isIntersecting && !pricingViewedRef.current) {
  posthog.capture('pricing_tier_viewed')
  pricingViewedRef.current = true
  observer.unobserve(entry.target) // belt + suspenders
}
```

### Pitfall 5: `backdrop-filter` requires a non-transparent background

**What goes wrong:** `backdrop-filter: blur()` has no visible effect if the element has `background: transparent` or no background at all.

**Why it happens:** The blur is composited behind the element's own background. With full transparency there's nothing to blur through.

**How to avoid:** `--glass-bg` is `oklch(0.12 0 0 / 0.3)` — it provides the 30% opacity background that makes the blur visible. Always set both `background-color` and `backdrop-filter` together. Check in Safari (backdrop-filter rendering differs from Chrome).

### Pitfall 6: Double-submit on waitlist form

**What goes wrong:** User clicks submit, slow network, clicks again. Two POST requests. Two PostHog events. Duplicate or race condition.

**Why it happens:** Button not disabled immediately.

**How to avoid:** `setFormState('submitting')` is the first line of `handleSubmit`. Button renders `disabled={formState !== 'idle'}`.

### Pitfall 7: Annual pricing math confusion

**What goes wrong:** Annual toggle shows wrong number. `annualMonthly` is the per-month amount when billed annually; `annualPrice` is the full-year total.

**Why it happens:** Both fields exist; wrong one shown in wrong place.

**How to avoid:** Annual card displays `${tier.annualMonthly}/mo` as the headline price, then `billed ${tier.annualPrice}/yr` as secondary text. Monthly card displays `${tier.monthlyPrice}/mo`.

---

## Code Examples

### Glass card with hover glow (globals.css utility class)

```css
/* Add to globals.css — referenced by all card components */
.glass-surface {
  background-color: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  transition: box-shadow 200ms ease;
}
.glass-surface:hover {
  box-shadow: var(--glow-hover);
}
```

### Tailwind v4 utility classes in use

```tsx
// Heading — tight tracking, medium weight, foreground color
<h2 className="text-foreground font-sans font-medium tracking-tight text-3xl">

// Label / tier name — Geist Mono
<span className="font-mono text-sm tracking-widest text-muted-foreground uppercase">

// CTA button — primary color background
<a className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">

// Muted subtext
<p className="text-muted-foreground text-base">
```

Note: Tailwind v4 maps `bg-primary` to `--color-primary` from the `@theme` block in `globals.css`. No `tailwind.config.ts` needed.

### Section fade-in pattern (globals.css + hook)

```css
/* globals.css */
.fade-in-section {
  opacity: 0;
  transform: translateY(1rem);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-in-section.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```typescript
// src/hooks/useFadeIn.ts
'use client'
import { useEffect, useRef } from 'react'

export function useFadeIn<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}
```

### `next/image` for hero screenshot

```tsx
import Image from 'next/image'

{/* With asset — use when file delivered to public/ */}
<Image
  src="/hero-screenshot.webp"
  alt="Conjure storyboard deck — beach proposal, golden hour"
  width={1200}
  height={800}
  priority
  className="rounded-sm"
/>

{/* Placeholder comment until asset delivered */}
{/* <!-- HERO_SCREENSHOT_REQUIRED --> */}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind config.ts + plugin | `@theme` block in CSS, no config file | Tailwind v4 (2025) | No config to import; tokens as CSS vars directly |
| ScrollMagic / AOS library | Intersection Observer API (native) | ~2020 broad browser support | Zero JS bundle cost for scroll effects |
| `styled-components` glass effects | CSS custom properties + `backdrop-filter` | CSS variables widely supported since 2018 | Single source of truth in globals.css |
| `process.env.NEXT_PUBLIC_*` pattern | Still current — Next.js App Router | — | Server-only vars must not have NEXT_PUBLIC_ prefix |

**Deprecated/outdated:**
- `pages/` directory routing: This project uses App Router (`app/`). Do not create route files in `pages/`.
- `getServerSideProps` / `getStaticProps`: App Router uses `async` Server Components instead. Not applicable here (landing page is fully static content + client-side form).

---

## Open Questions

1. **Hero screenshot asset path**
   - What we know: Asset is a PNG from CleanShot on user's desktop (beach proposal storyboard)
   - What's unclear: Final filename, exact pixel dimensions, whether it's been converted to WebP
   - Recommendation: Plan includes a Wave 0 task to deliver asset to `public/hero-screenshot.webp`; component uses placeholder comment until then

2. **FAQ expand behavior (Claude's Discretion)**
   - What we know: 3 questions in `FAQ.ITEMS`; placement near waitlist
   - What's unclear: Accordion (one open at a time) vs. static expand (multiple open) vs. all-expanded static list
   - Recommendation: Static expand (`<details>`/`<summary>` HTML elements) — zero JS, accessible, no state management. Each question open individually via native behavior

3. **Social proof placeholder layout (Claude's Discretion)**
   - What we know: `SOCIAL_PROOF.TESTIMONIAL === null`; section renders placeholder
   - What's unclear: How prominent to make the "coming soon" state — full card with placeholder text or just the HTML comment
   - Recommendation: Render a single glass card with `<!-- TESTIMONIAL_REQUIRED -->` comment inside; externally it renders as a placeholder card without visible text, but the HTML comment marks insertion point per SOCIAL-01

4. **`useFadeIn` hook placement**
   - What we know: Server Component sections can't use hooks directly
   - What's unclear: Whether to wrap each section in a thin `'use client'` fade wrapper or convert sections to client components
   - Recommendation: Add a generic `FadeInSection` client wrapper component that wraps any Server Component's output. Sections stay as Server Components; only the wrapper is a client boundary.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + @testing-library/react 16.3.2 |
| Config file | `conjure-landing-page/vitest.config.ts` |
| Quick run command | `cd conjure-landing-page && npm run test` |
| Full suite command | `cd conjure-landing-page && npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Headline and subhead rendered from `HERO` constants | unit | `npm run test -- src/components/sections/HeroSection.test.tsx` | ❌ Wave 0 |
| HERO-02 | CTA href = `HERO.CTA_URL`, label = `HERO.CTA_PRIMARY` | unit | `npm run test -- src/components/sections/HeroSection.test.tsx` | ❌ Wave 0 |
| HERO-03 | Placeholder comment present when no screenshot | unit | `npm run test -- src/components/sections/HeroSection.test.tsx` | ❌ Wave 0 |
| HERO-04 | `posthog.capture` called on CTA click | unit | `npm run test -- src/components/sections/HeroSection.test.tsx` | ❌ Wave 0 |
| PRICE-01 | All 4 tier names rendered | unit | `npm run test -- src/components/sections/PricingSection.test.tsx` | ❌ Wave 0 |
| PRICE-02 | Annual toggle shows `annualMonthly` price | unit | `npm run test -- src/components/sections/PricingSection.test.tsx` | ❌ Wave 0 |
| PRICE-03 | Tier CTA hrefs match checkoutUrls prop | unit | `npm run test -- src/components/sections/PricingSection.test.tsx` | ❌ Wave 0 |
| PRICE-05 | `pricing_tier_viewed` fires once per load | unit | `npm run test -- src/components/sections/PricingSection.test.tsx` | ❌ Wave 0 |
| WAIT-01 | Email field required, name optional | unit | `npm run test -- src/components/sections/WaitlistSection.test.tsx` | ❌ Wave 0 |
| WAIT-02 | Fetch called with correct URL and body | unit | `npm run test -- src/components/sections/WaitlistSection.test.tsx` | ❌ Wave 0 |
| WAIT-03 | Submit button disabled on submit | unit | `npm run test -- src/components/sections/WaitlistSection.test.tsx` | ❌ Wave 0 |
| WAIT-04 | Success message shown on 200 | unit | `npm run test -- src/components/sections/WaitlistSection.test.tsx` | ❌ Wave 0 |
| WAIT-05 | Error message shown on 4xx | unit | `npm run test -- src/components/sections/WaitlistSection.test.tsx` | ❌ Wave 0 |
| WAIT-06 | `waitlist_form_submitted` fires with `email_domain`, `has_name` | unit | `npm run test -- src/components/sections/WaitlistSection.test.tsx` | ❌ Wave 0 |
| WAIT-07 | `waitlist_form_error` fires on network error | unit | `npm run test -- src/components/sections/WaitlistSection.test.tsx` | ❌ Wave 0 |
| COPY-01 | No banned words in content.ts | unit | `npm run test -- src/lib/content.test.ts` | ❌ Wave 0 (add banned word assertions to existing file) |
| FAQ-01 | 3 FAQ items rendered | unit | `npm run test -- src/components/sections/FAQSection.test.tsx` | ❌ Wave 0 |
| SOCIAL-01 | Placeholder comment in DOM | unit | `npm run test -- src/components/sections/SocialProofSection.test.tsx` | ❌ Wave 0 |
| Header scroll glass | Intersection Observer scroll behavior | manual/browser | N/A — Intersection Observer not testable in jsdom | manual only |
| Section fade-in | CSS transition on scroll | manual/browser | N/A — Intersection Observer not testable in jsdom | manual only |
| PERF-01 | LCP ≤ 2.5s on mobile | manual | Lighthouse CLI or Vercel Analytics | manual only |

**Intersection Observer note:** jsdom does not implement `IntersectionObserver`. Tests for Header glass transition and section fade-in must be verified manually in a browser (or with Playwright/e2e, which is out of scope for this phase). Unit tests cover the component render output and PostHog event calls; scroll behavior is a manual QA item.

### Sampling Rate

- **Per task commit:** `cd conjure-landing-page && npm run test`
- **Per wave merge:** `cd conjure-landing-page && npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/sections/HeroSection.test.tsx` — covers HERO-01, HERO-02, HERO-03, HERO-04
- [ ] `src/components/sections/PricingSection.test.tsx` — covers PRICE-01, PRICE-02, PRICE-03, PRICE-05, PRICE-06
- [ ] `src/components/sections/WaitlistSection.test.tsx` — covers WAIT-01 through WAIT-07
- [ ] `src/components/sections/FAQSection.test.tsx` — covers FAQ-01
- [ ] `src/components/sections/SocialProofSection.test.tsx` — covers SOCIAL-01
- [ ] `src/lib/content.test.ts` (existing) — add banned-word assertions for COPY-01

Framework, vitest config, and `src/test/setup.ts` already exist. No framework install needed.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection: `conjure-landing-page/src/lib/content.ts` — all copy constants verified present
- Direct code inspection: `conjure-landing-page/src/lib/env.ts` — `checkoutUrls` is server-only confirmed
- Direct code inspection: `conjure-landing-page/src/app/globals.css` — glass vars (`--glass-bg`, `--glass-border`, `--glass-blur`) and glow vars (`--glow-hover`) confirmed present
- Direct code inspection: `conjure-landing-page/package.json` — dependency versions confirmed
- Direct code inspection: `conjure-landing-page/vitest.config.ts` — test config confirmed
- MDN Web Docs (knowledge): Intersection Observer API — browser-native, cleanup pattern with `disconnect()`
- Next.js documentation (knowledge): `next/image` `priority` prop behavior, Server vs. Client Component rules
- Tailwind v4 (knowledge, confirmed by Phase 1 decisions): CSS-first, `@theme` block, no config file

### Secondary (MEDIUM confidence)

- Phase 1 STATE.md decisions: Tailwind v4 CSS-first confirmed by Phase 1 execution (deletion check passed)
- Phase 1 STATE.md decisions: Next.js 16.1.6 confirmed as installed version (exceeds CVE-2025-29927 floor)

### Tertiary (LOW confidence)

None — all critical claims sourced from code inspection or confirmed Phase 1 decisions.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in package.json
- Architecture: HIGH — Server/Client split confirmed from env.ts code; pattern is standard Next.js App Router
- Pitfalls: HIGH — sourced from code inspection (env.ts server-only comment is explicit) and known browser API behavior
- Test framework: HIGH — vitest.config.ts and setup.ts confirmed present

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable stack; no fast-moving dependencies)
