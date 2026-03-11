# Pitfalls Research

**Domain:** SaaS marketing landing page — separate Vercel project posting to a live API on a different origin
**Researched:** 2026-03-11
**Confidence:** HIGH (all 7 concern areas verified against official docs, CVE reports, and PostHog docs)

---

## Critical Pitfalls

### Pitfall 1: Admin Route Protected Only at Middleware — Not at the Data Layer

**What goes wrong:**
The `/admin` route relies on a middleware check against `ADMIN_PASSWORD`. If auth is enforced only in middleware and not in the route handler / Server Component itself, CVE-2025-29927 (CVSS 9.1, disclosed March 2025) lets an attacker bypass middleware entirely by sending the header `x-middleware-subrequest: middleware` (or any matching path value). The Supabase query runs unauthenticated and the waitlist table is exposed.

**Why it happens:**
Developers treat middleware as the security boundary. It feels clean. But Next.js middleware was designed for edge routing logic, not as a security gate — the CVE proves this. Vercel's edge layer strips the malicious header only for requests hosted on Vercel itself; any other deployment surface is fully exposed.

**How to avoid:**
1. Re-verify the password in the Server Component or route handler, not only in middleware. Middleware is a redirect helper, not an auth wall.
2. Use Next.js 15.2.3 or later (patched version). Confirm `package.json` pins `next` at `>=15.2.3`.
3. The check in the route handler: read `ADMIN_PASSWORD` from `process.env` server-side, compare against a `?password=` query param or `Authorization` header using `crypto.timingSafeEqual` to prevent timing attacks.
4. Never expose the Supabase service-role key to the client bundle — only read from `process.env` server-side.

**Warning signs:**
- `middleware.ts` contains the only password check; the `/admin` page component has no auth guard of its own.
- `ADMIN_PASSWORD` referenced in client-side code or visible in `_next/static` bundle.
- `next` version < 15.2.3 in `package.json`.

**Phase to address:** Foundation / Setup phase (before any admin route is built)

---

### Pitfall 2: CORS Rejection on the Waitlist Form POST

**What goes wrong:**
The landing page (`conjurestudio.app` subdomain or separate domain) sends a cross-origin POST to `https://conjurestudio.app/api/waitlist`. If the Conjure app's API route does not return `Access-Control-Allow-Origin` with the landing page's exact origin, the browser blocks the response. The form silently "submits" but the entry never reaches Supabase. Users see no error unless the UI handles the rejected fetch.

**Why it happens:**
The endpoint was built as an internal API. It works fine from the Conjure app itself (same origin). Adding a second origin (the landing page) requires explicit CORS headers, which developers often only add after the first browser console error in production.

**How to avoid:**
1. In the Conjure app's `app/api/waitlist/route.ts`, add an `OPTIONS` handler that returns `Access-Control-Allow-Origin: https://[landing-page-origin]`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type`.
2. On the POST handler, add the same `Access-Control-Allow-Origin` header to the response.
3. Do not use `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true` — the spec forbids this combination and browsers reject it.
4. Test the form from the actual deployed landing page URL (not localhost) before marking the feature complete. Localhost bypasses CORS in some environments, masking the problem.

**Warning signs:**
- Network tab shows the POST returning 200 in development but blocked with CORS error on staging.
- No `OPTIONS` handler on the `api/waitlist` route.
- The landing page and the Conjure app have different origins but CORS was never discussed in the Conjure app's API implementation.

**Phase to address:** Integration phase — specifically when wiring the waitlist form to the live API

---

### Pitfall 3: Brand Color Fidelity Lost via Hex Approximation

**What goes wrong:**
Tailwind v4 uses OKLCH throughout its default palette and expects custom tokens to be defined with OKLCH values in an `@theme` block. Developers copying colors from screenshots, design tools, or older briefs often paste in hex approximations. For example, the primary mint `oklch(0.92 0.18 142)` maps loosely to `#9aff8f` but the OKLCH value renders brighter and more vivid on wide-gamut displays (P3). Using the hex produces a visually duller result — and violates the explicit project constraint that "no hex approximations from screenshots" are allowed.

Additionally: in Tailwind v4, `@theme` variables become CSS custom properties. If colors are defined as hex inside `@theme`, Tailwind v4 will not convert them to OKLCH — it emits them as-is. The brand specification is not preserved in the stylesheet.

**Why it happens:**
Designers specify OKLCH; developers reach for the nearest hex because it's familiar. Browser DevTools still show hex by default. Figma color pickers export hex. The path of least resistance leads away from OKLCH.

**How to avoid:**
1. Define every brand color token directly in OKLCH inside `@theme` in `globals.css` — copy values verbatim from `LANDING-PAGE-BRIEF.md` Section 1.
2. Do not accept hex values in any brand token definition. Review `globals.css` before marking UI work complete.
3. Use the `oklch()` CSS function directly: `--color-mint: oklch(0.92 0.18 142);`
4. Verify on a wide-gamut display (or Chrome DevTools color picker showing P3 gamut) that the rendered mint is visually distinct from a hex approximation.

**Warning signs:**
- Any `#` character in the `@theme` block for brand colors.
- Color values copied from a screenshot rather than from the brief document.
- `tailwind.config.js` still present and defining colors (v4 uses CSS-first, not config-first).

**Phase to address:** Design tokens / CSS foundation phase — must be locked before any component work

---

### Pitfall 4: Copy Drift During Implementation

**What goes wrong:**
Approved copy from `LANDING-PAGE-BRIEF.md` Section 2 (Feature-to-Benefit Translations) and the tone-of-voice rules in Section 4 gets paraphrased during implementation. Banned words ("AI-powered," "platform," "seamless," "intuitive," "workflow automation," "generative AI," "storyboard software," "template," "streamline") reappear because they are natural developer shorthand. Feature names get truncated. Pricing copy gets rounded or approximated.

**Why it happens:**
Developers type component copy from memory or paraphrase when wiring props. The brief is in a separate document. Under time pressure, "close enough" becomes the default.

**How to avoid:**
1. Treat approved copy as a source file: copy strings verbatim from `LANDING-PAGE-BRIEF.md` into a `content.ts` or `copy.ts` constants file at the start of the project. All components reference this file — they never contain inline string literals for user-facing copy.
2. Add a banned-word grep check as a pre-commit hook or CI step: `grep -rn "AI-powered\|platform\|seamless\|intuitive\|workflow automation\|generative AI\|storyboard software\|template\|streamline" src/`.
3. Copy review pass before deployment: load the live page and compare every visible string against the brief.

**Warning signs:**
- JSX files contain multi-word marketing strings as inline literals rather than referencing a constants file.
- Grep for any banned word returns hits in `.tsx` or `.astro` files.
- Pricing numbers in components differ from `POSITIONING.md` Section 4.2.

**Phase to address:** All content phases — establish the constants file in the foundation phase; enforce the grep check throughout

---

### Pitfall 5: PostHog Fires Duplicate Events or Fires Before Initialization

**What goes wrong:**
Two failure modes are common:

1. **Double initialization**: In Astro (or any framework with partial hydration), PostHog's snippet is included in both a layout-level `<script>` and a component-level `<script>`. It initializes twice. Every event fires twice.
2. **Missing `is:inline` in Astro**: Without the `is:inline` directive on the PostHog `<script>` tag, Astro processes it as a module, breaking the `window.posthog` global and causing TypeScript errors at build time.
3. **Events captured before `posthog.init()` completes**: Calling `posthog.capture()` synchronously on page load before init resolves drops the event silently.

**Why it happens:**
PostHog's own documentation shows a snippet that works in plain HTML. Frameworks add processing layers the snippet wasn't designed for. The initialization problem is silent — no errors, just missing data in the PostHog dashboard.

**How to avoid:**
1. Place the PostHog initialization snippet once, in the root layout, with `is:inline` (Astro) or as a `Script` component with `strategy="afterInteractive"` (Next.js).
2. Guard initialization: `if (!window.posthog) { posthog.init(...) }` prevents double-init on client-side navigation.
3. For Astro with `ClientRouter` (view transitions), add a listener: fire `posthog.capture('$pageview')` on `document.addEventListener('astro:page-load', ...)` — not on every component mount.
4. Capture custom events (`waitlist_form_submitted`, `cta_clicked`, etc.) only inside user interaction handlers (onClick, onSubmit) — never on module-level load.
5. Verify event deduplication in the PostHog dashboard after first deploy: check that each form submission shows exactly one `waitlist_form_submitted` event per distinct_id.

**Warning signs:**
- PostHog event count is 2x the number of actual interactions.
- `window.posthog` is undefined in browser console after page load.
- TypeScript build error: `Property 'posthog' does not exist on type 'Window & typeof globalThis'`.
- `posthog.capture()` calls at module scope (outside event handlers).

**Phase to address:** Analytics integration phase

---

### Pitfall 6: Mobile Dark Theme — Contrast and Viewport Breakdowns

**What goes wrong:**
Design-forward dark UIs built desktop-first commonly fail mobile in these specific ways:

1. **OKLCH wide-gamut colors look washed out on OLED phones**: Some Android OLED displays render wide-gamut OKLCH colors differently than macOS monitors. The primary mint at `oklch(0.92 0.18 142)` may appear nearly white on some screens, losing contrast against light text.
2. **Hero screenshot asset overflows on small viewports**: A Google Slides deck screenshot displayed at desktop scale does not scale down cleanly. Without `width={X} height={Y}` set on the `<Image>` component and `object-contain` CSS, the image either clips or forces horizontal scroll.
3. **Sticky CTAs or fixed elements obscure content on iOS Safari**: iOS Safari's dynamic toolbar eats viewport height. Elements positioned using `100vh` get clipped. Use `100dvh` (dynamic viewport height) in 2025.
4. **Text contrast on dark backgrounds**: Using `oklch(0.92 0.18 142)` as body text color on a near-black background may fail WCAG AA (4.5:1 minimum). Reserve the mint for accent elements and CTAs, not body copy.

**Why it happens:**
Desktop previews look correct in Chrome. Mobile testing is deferred. iOS Safari behaves differently from Chrome mobile, particularly around viewport units and color rendering.

**How to avoid:**
1. Test on a physical iOS device before marking any section complete — not just Chrome DevTools mobile simulation.
2. Define a max-width on screenshot assets and use `overflow: hidden` on their containers.
3. Replace `100vh` with `100dvh` for any full-screen section.
4. Run WCAG contrast check on all text/background OKLCH pairs: the primary mint `oklch(0.92 0.18 142)` should not be used as body text on `oklch(0.10 0.01 0)` — verify ratio.

**Warning signs:**
- Hero section requires horizontal scroll on iPhone 14 screen width (390px).
- Fixed/sticky nav obscures the first CTA on iOS.
- Only tested in Chrome DevTools responsive mode, never on a physical device.

**Phase to address:** Responsive polish phase (or QA gate within each UI phase)

---

### Pitfall 7: LCP Fails Due to Unoptimized Screenshot Assets

**What goes wrong:**
The brief specifies "show the deliverable first" — which means the Google Slides deck screenshot is the hero image. An unoptimized PNG or JPEG at full resolution will be the LCP element. A 2MB screenshot image on a mobile connection can take 4+ seconds to load, failing Google's 2.5-second LCP threshold. This directly impacts SEO and conversion since Directors hitting the page on mobile leave before the image renders.

**Why it happens:**
Designers export full-resolution screenshots (2880×1800 or similar) from macOS. Developers drop them into `/public` without processing. They look fine on a fast connection.

**How to avoid:**
1. Use Next.js `<Image>` component (or Astro's `<Image>` equivalent) — automatic WebP/AVIF conversion, responsive `srcset`, and lazy loading by default.
2. For the hero image specifically: set `priority` (Next.js) or `loading="eager"` + `fetchpriority="high"` — the LCP element must not lazy-load.
3. Export screenshots at 2x max width of their display container (e.g., if displayed at 800px wide, export at 1600px), not at Retina screen resolution.
4. Target < 200KB for the hero screenshot after compression.

**Warning signs:**
- `/public` contains `.png` files over 500KB.
- Hero image uses a plain `<img>` tag instead of the framework's Image component.
- Lighthouse LCP score is red (>4s) on the performance audit.
- Hero `<Image>` component has no `priority` prop.

**Phase to address:** Initial hero section build; image optimization must be applied on first implementation, not as a later polish pass

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode checkout URLs as `#` until Lemon Squeezy is configured | Unblocks UI build | CTAs are non-functional in production; easy to miss before launch | Acceptable if env var fallback to `https://conjurestudio.app/auth/signup` is wired from day one |
| Inline copy strings in JSX instead of a `content.ts` constants file | Faster first pass | Copy drift, banned words reappear, pricing values drift; very hard to audit | Never acceptable — the brief explicitly forbids copy changes |
| Skip `priority` on hero image and add it "later" | Builds faster | LCP failure; hero is always the LCP element, this is not optional | Never acceptable for the primary hero image |
| Use hex colors while building and "convert later" | Easier to eyeball | Brand violation; conversion is easily forgotten; OKLCH rendering is different, not equivalent | Never acceptable — conversion is not a safe approximation |
| Protect `/admin` in middleware only | Simpler code | CVE-2025-29927 bypass; Supabase table exposed | Never acceptable — double-check must exist at the route handler level |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `POST https://conjurestudio.app/api/waitlist` | No CORS headers on the Conjure app endpoint; works in dev (same origin), breaks from landing page domain | Add `OPTIONS` handler + `Access-Control-Allow-Origin` header to the Conjure app's `api/waitlist` route before first landing page deploy |
| PostHog (Astro) | Missing `is:inline` on the script tag; PostHog processes as module; `window.posthog` undefined | Always use `is:inline` for the initialization snippet; use `is:inline` attribute, not module syntax |
| PostHog (Next.js) | Placing `posthog.init()` in a `useEffect` inside multiple components; initializes on every component mount | Single init in root layout with a guard: `if (!window.posthog.__loaded) { posthog.init(...) }` |
| Supabase (admin view) | Importing the service-role key in a component that ships to the client bundle | Only read `SUPABASE_SERVICE_ROLE_KEY` inside a Server Component or API route — never in client components |
| Lemon Squeezy checkout URLs | Hardcoded `undefined` or empty string when env var is not set; `href` renders as `href="undefined"` | Always provide a fallback: `process.env.LEMON_SQUEEZY_DIRECTOR_URL ?? 'https://conjurestudio.app/auth/signup'` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full-resolution screenshot as hero | Lighthouse LCP > 4s; slow First Contentful Paint on mobile | Use framework Image component with `priority`, export at 2x display width | Immediately on any mobile connection; always affects LCP |
| Multiple web fonts (Geist Sans + Geist Mono) loaded without display swap | FOUT (flash of invisible text); layout shift on load | `font-display: swap` in `@font-face`; preload the primary weight | Every page load until fonts cache |
| `<Image>` without explicit `width` and `height` | CLS (Cumulative Layout Shift) as image loads; content jumps | Always pass explicit dimensions or use `fill` with a sized container | Every page load |
| Unguarded admin Supabase query (no pagination) | If waitlist grows to thousands of rows, admin page loads slowly | Add `LIMIT 500` or paginate from the start | At ~1,000 signups |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Middleware-only auth on `/admin` | CVE-2025-29927 header bypass exposes Supabase waitlist data to anyone | Re-check `ADMIN_PASSWORD` inside the Server Component/route handler, not only in `middleware.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` in client-accessible env var (missing `NEXT_PUBLIC_` prefix check is not enough — bundler leaks are subtle) | Supabase RLS bypassed; full DB write access | Audit with `NEXT_PUBLIC_` prefix search; service role key must only appear in server contexts |
| `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true` | Browser blocks the request (spec violation); or if allowed, credential leakage | Never combine wildcard origin with credentials header; use explicit landing page origin |
| Password comparison using `===` instead of `crypto.timingSafeEqual` | Timing attack allows password enumeration | Use Node.js `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` |
| `ADMIN_PASSWORD` logged in server console or error messages | Credential exposure in Vercel log drain | Never log env vars; ensure error handlers don't include `process.env` in output |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Waitlist form shows no loading state during POST | Director clicks submit, nothing happens visually; they click again, duplicate submission | Disable the submit button + show spinner immediately on submit; re-enable only on error |
| Form error message exposes API internals ("500 Internal Server Error") | Confuses non-technical users; exposes implementation details | Show "Something went wrong — try again" for 5xx; "You're already on the list" for duplicate email (the API returns 200 for duplicates, so handle this client-side) |
| Pricing CTA falls back to trial URL but button still says "Start [Tier] Plan" | User clicks "Start Director Plan", lands on generic signup; expectation mismatch | When using fallback URL, update button text to "Join Waitlist" or "Get Early Access" |
| Social proof section with raw `<!-- TESTIMONIAL_REQUIRED -->` HTML comment visible in rendered output | Comment appears as text in some Astro/JSX configurations | Ensure comment is inside a conditional: `{false && <TestimonialSection />}` or use a proper TODO block |
| Banned words in copy make the page sound generic/corporate | ICPs (Directors, Agency CDs) feel like they're reading standard SaaS copy; stops scroll | Grep audit before every deploy; constants file enforced |

---

## "Looks Done But Isn't" Checklist

- [ ] **Waitlist form:** Verify the POST reaches `conjurestudio.app/api/waitlist` from the *deployed* landing page domain — not just from localhost. Check Supabase for the test row.
- [ ] **Admin route:** Verify the password check exists in the Server Component body, not only in `middleware.ts`. Test by sending `x-middleware-subrequest: middleware` header manually.
- [ ] **Brand colors:** Grep for `#` in the `@theme` block. Zero results expected for brand tokens.
- [ ] **Banned copy words:** Grep output is empty for all 10 banned terms across all source files.
- [ ] **PostHog events:** Open PostHog Live Events dashboard, submit the waitlist form once. Confirm exactly one `waitlist_form_submitted` event appears.
- [ ] **Hero image:** Run Lighthouse on the deployed page. LCP must be < 2.5s on mobile simulation.
- [ ] **Mobile layout:** Load on a physical iPhone (Safari, not Chrome) at 390px viewport. No horizontal scroll. No clipped CTAs behind Safari toolbar.
- [ ] **Checkout URL fallback:** Confirm env vars are unset in a branch deploy and all pricing CTAs still link to `https://conjurestudio.app/auth/signup` — not `href="undefined"`.
- [ ] **Supabase key scope:** Confirm `SUPABASE_SERVICE_ROLE_KEY` does not appear in `NEXT_PUBLIC_` form or in any client bundle (search `_next/static` in browser DevTools).

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CORS failure discovered post-launch | LOW | Add CORS headers to Conjure app `api/waitlist` route; redeploy Conjure app; no landing page change needed |
| Admin bypass discovered | MEDIUM | Hotfix: add server-side password check; rotate `ADMIN_PASSWORD`; audit Supabase logs for unauthorized access |
| Brand colors are hex approximations | MEDIUM | Replace hex with OKLCH values in `@theme`; rebuild; redeploy. Visual regression on all color-bearing components. |
| Copy drift discovered before launch | LOW | Update `content.ts` constants; components inherit the fix automatically if constants file pattern was followed |
| Duplicate PostHog events in data | MEDIUM | Remove double-init; historical data is already double-counted and cannot be corrected retroactively; add event deduplication filter in PostHog dashboard |
| Hero LCP failure | LOW | Add `priority` prop to hero `<Image>`; compress source file; redeploy |
| `href="undefined"` on pricing CTAs | LOW | Add env var fallback string; redeploy |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-----------------|--------------|
| Admin middleware-only auth (CVE-2025-29927) | Foundation / Admin route phase | Manual: send `x-middleware-subrequest` header, confirm 401 returned from route handler |
| CORS on waitlist form POST | Integration / Form wiring phase | Test POST from deployed landing page URL; check Supabase for entry |
| Brand color hex approximation | Design tokens / CSS foundation phase | Grep for `#` in `@theme`; visual check on wide-gamut display |
| Copy drift and banned words | All phases (enforce from start) | Pre-deploy grep audit across all source files |
| PostHog duplicate events | Analytics integration phase | PostHog Live Events: 1 event per form submission |
| Mobile dark theme breakdowns | Responsive polish phase (QA gate each phase) | Physical iPhone Safari test; no horizontal scroll |
| Hero LCP failure | Initial hero section build | Lighthouse mobile LCP < 2.5s on deployed URL |
| Checkout URL `undefined` | Pricing section phase | Test with env vars unset on branch deploy |
| Supabase key scope leak | Admin route phase | `NEXT_PUBLIC_` search; bundle audit |

---

## Sources

- Next.js CVE-2025-29927 middleware bypass: [ProjectDiscovery analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass), [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/)
- Tailwind v4 OKLCH and `@theme`: [Tailwind CSS v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4), [Tailwind CSS Colors docs](https://tailwindcss.com/docs/customizing-colors)
- Tailwind v4 hex fallback discussion: [GitHub Discussion #16392](https://github.com/tailwindlabs/tailwindcss/discussions/16392)
- PostHog SPA tracking and duplicate events: [PostHog SPA pageviews tutorial](https://posthog.com/tutorials/single-page-app-pageviews), [Avoiding duplicate events](https://posthog.com/questions/avoiding-duplicate-events), [Idempotency issue #17211](https://github.com/PostHog/posthog/issues/17211)
- PostHog Astro integration pitfalls: [PostHog Astro docs](https://posthog.com/docs/libraries/astro), [posthog-js Astro issue #627](https://github.com/PostHog/posthog-js/issues/627)
- CORS on Vercel: [Vercel CORS guide](https://vercel.com/kb/guide/how-to-enable-cors)
- Core Web Vitals and LCP: [Next.js image optimization](https://nextjs.org/docs/14/app/building-your-application/optimizing/images), [Vercel Core Web Vitals guide](https://vercel.com/kb/guide/optimizing-core-web-vitals-in-2024)

---

*Pitfalls research for: Conjure Landing Page — SaaS marketing page with cross-origin form, admin route, and design-forward dark theme*
*Researched: 2026-03-11*
