# Stack Research

**Domain:** SaaS marketing landing page (standalone, no user auth, Vercel deployment)
**Researched:** 2026-03-11
**Confidence:** HIGH — all major decisions verified against official docs or current npm/release data

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 6.0.3 | Site framework | Zero JS by default, best-in-class static output for marketing pages, ships pure HTML to crawlers without JS execution dependency. Out-of-box Core Web Vitals on content sites. Native `.astro` component model keeps islands explicit. |
| Tailwind CSS | 4.x | Utility styling | OKLCH color support is first-class (required for brand tokens). CSS-native via Vite plugin — no PostCSS config file needed in v4. @astrojs/tailwind is deprecated for v4; use @tailwindcss/vite directly. |
| TypeScript | 5.x | Type safety | Astro ships with TS support baked in; zero config needed. Use for all .astro frontmatter and any utility files. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion | 12.35.2 | Scroll-triggered and component animations | Use for hero entrance, feature card reveals, and section transitions. Works in Astro with a React island (`client:load`) or vanilla JS (`motion.animate()`). Prefer `motion.animate()` (vanilla) for pure Astro pages to avoid shipping React just for animation. |
| @supabase/supabase-js | 2.x (^2.98) | Admin DB queries on `/admin` route | Server-only; never expose to client. Create with `service_role` secret and disable all auth options (`persistSession: false, autoRefreshToken: false, detectSessionInUrl: false`). Used exclusively in the Astro SSR endpoint for the admin table view. |
| posthog-js | latest | Product analytics | Client-side script injected via Astro component in the base `<Layout>`. Captures `waitlist_form_submitted`, `waitlist_form_error`, `cta_clicked`, `pricing_tier_viewed`. PostHog has official Astro docs and native support. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel CLI | Deployment | `vercel --prod` from repo root. Set `output: 'server'` in astro.config.mjs to enable SSR for `/admin`. |
| Astro Check | Type-checking | `astro check` catches .astro template type errors before CI. Run in pre-push hook. |
| Prettier + prettier-plugin-astro | Code formatting | `prettier-plugin-astro` handles .astro file formatting correctly; plain Prettier ignores frontmatter delimiters. |

---

## Installation

```bash
# Scaffold
npm create astro@latest conjure-landing -- --template minimal --typescript strict

# Tailwind v4 (via Vite plugin — do NOT use @astrojs/tailwind, it is deprecated for v4)
npm install -D @tailwindcss/vite tailwindcss

# Animation
npm install motion

# Supabase (server-side only)
npm install @supabase/supabase-js

# Analytics
npm install posthog-js

# Dev tools
npm install -D prettier prettier-plugin-astro
```

Astro config for Tailwind v4 and SSR:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',        // required for /admin SSR route
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Astro 6 | Next.js 15 App Router | Use Next.js only if the landing page needs personalized server rendering per user (logged-in state, dynamic pricing). For a static marketing page with one SSR admin route, Next.js adds 40-90% more JS payload and Vercel cold start overhead for no benefit. The PROJECT.md note that "the brief specifies Astro" is correct — this is the right call. |
| motion (vanilla animate) | Framer Motion (React) | Use Framer Motion only if you're already shipping a React island for another reason (e.g., a complex interactive pricing calculator). Adding React purely for animation on a static Astro page negates Astro's zero-JS benefit. |
| motion (vanilla animate) | GSAP | Use GSAP for complex scroll-driven timelines with precise sequencing (e.g., award-site-level storytelling). For entrance animations and scroll reveals on a marketing page, Motion's API is simpler, the bundle is smaller, and it has first-class Astro documentation. |
| @supabase/supabase-js (service_role) | Supabase SSR helpers (@supabase/ssr) | Use @supabase/ssr only when you need per-user session cookie management. The admin view has no user sessions — one env var password, one DB query. The base client with auth disabled is the correct, minimal pattern. |
| PostHog (posthog-js) | Plausible / Fathom | Use privacy-first analytics only if you don't need event capture with custom properties. PostHog is already in use on the Conjure app (env var `NEXT_PUBLIC_POSTHOG_KEY` is established) and supports custom events for the required `waitlist_form_submitted` etc. — Plausible cannot do custom event properties out of the box. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @astrojs/tailwind | Deprecated for Tailwind v4. Only works with Tailwind v3. Will cause silent config conflicts if mixed with v4. | @tailwindcss/vite (Vite plugin, not Astro integration) |
| React Hook Form | Overkill for a 2-field waitlist form. React Hook Form requires a React island, which means shipping React runtime. The form is email + optional name — a plain HTML form with a `fetch` submit handler is sufficient. | Native `<form>` + `fetch()` in a `<script>` tag or a minimal Astro component |
| framer-motion package | This is the legacy package name. The library has been renamed and is now published as `motion`. Installing `framer-motion` still works but pins you to the old package with slower release cadence. | `motion` (the renamed package, same team, same API) |
| @astrojs/react (just for animation) | Shipping the full React runtime (130KB+ gzipped) to enable Framer Motion animations on an otherwise static page destroys Astro's performance advantage. | `motion.animate()` (vanilla JS, no React dependency) |
| next-themes or any Next.js-specific package | This is not a Next.js project. Any `next/*` package will fail at build time in Astro. | Astro equivalents or vanilla implementations |
| Prisma | No relational modeling needed. This is a direct read-only query against an existing Supabase table. Prisma requires schema introspection, migration setup, and a connection pooler for serverless — all unnecessary complexity. | `@supabase/supabase-js` query builder directly |

---

## Stack Patterns by Variant

**For the admin route (`/admin`):**
- Set `output: 'server'` in `astro.config.mjs` (enables SSR for all routes)
- Or use hybrid mode: `output: 'hybrid'` with `export const prerender = false` on the admin page only (keeps all other pages as static HTML)
- Hybrid mode is preferred — it prebuilds 100% of the marketing pages as static HTML while enabling SSR only where needed
- Password check: compare `Astro.request.headers.get('x-admin-password')` (or a cookie set by a login form) against `import.meta.env.ADMIN_PASSWORD`

**For PostHog in Astro:**
- Create `src/components/PostHog.astro` with the inline script snippet (not the npm package initialization) for automatic pageview tracking
- Include `PostHog.astro` in the base layout `<head>`
- For custom events (form submit, CTA click), call `window.posthog.capture('event_name', { properties })` from client `<script>` tags — no React needed
- Guard against `ClientRouter` re-initialization if you use Astro's View Transitions

**For Motion animations in Astro (no React):**
- Import from `'motion'` in a client `<script>` tag inside `.astro` files
- Use `inView()` for scroll-triggered entrance animations (hero, feature cards)
- Use `animate()` for explicit triggered animations (button hover, form success state)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| astro@6.x | @tailwindcss/vite@4.x | Use Vite plugin, not @astrojs/tailwind. Confirmed via Tailwind official docs and Astro 5.2+ release notes. |
| astro@6.x | @astrojs/vercel | Use `@astrojs/vercel/serverless` adapter for SSR admin route. |
| motion@12.x | Astro (no React) | Vanilla `motion.animate()` and `inView()` work in Astro `<script>` tags without React. Confirmed via Netlify official guide. |
| @supabase/supabase-js@2.x | Node.js 20+ | v2.79.0+ dropped Node 18 support. Vercel Fluid compute defaults to Node 20 — no issue. |
| posthog-js | Astro (no framework) | Works via inline script snippet in `<head>`; no framework integration needed. Official PostHog Astro docs confirm this pattern. |

---

## Sources

- Astro 6.0 release blog — https://astro.build/blog/astro-6/ (HIGH confidence)
- Astro GitHub releases (v6.0.3 confirmed) — https://github.com/withastro/astro/releases (HIGH confidence)
- Tailwind CSS Astro install guide — https://tailwindcss.com/docs/guides/astro (@astrojs/tailwind deprecation for v4 confirmed) (HIGH confidence)
- PostHog Astro tutorial — https://posthog.com/tutorials/astro-analytics (HIGH confidence — official PostHog docs)
- Supabase service_role admin pattern — https://supabase.com/docs/guides/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa (HIGH confidence — official Supabase docs)
- Motion npm package (v12.35.2 confirmed) — https://www.npmjs.com/package/motion (HIGH confidence)
- Motion + Astro integration guide — https://developers.netlify.com/guides/motion-animation-library-with-astro/ (MEDIUM confidence — Netlify official guide, not Motion's own docs)
- Astro vs Next.js 2026 comparison — https://makersden.io/blog/nextjs-vs-astro-marketing-website (MEDIUM confidence — third-party, consistent with official performance claims)
- GSAP vs Motion comparison — https://motion.dev/docs/gsap-vs-motion (MEDIUM confidence — authored by Motion team, inherent bias acknowledged)
- @supabase/supabase-js v2.98 on npm — https://www.npmjs.com/package/@supabase/supabase-js (HIGH confidence)

---
*Stack research for: Conjure Landing Page — SaaS marketing landing page*
*Researched: 2026-03-11*
