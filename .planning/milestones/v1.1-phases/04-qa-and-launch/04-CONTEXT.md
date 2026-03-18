# Phase 4: QA and Launch - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Final QA pass before the landing page is considered launch-ready: Lighthouse LCP check on mobile, physical iOS Safari device test, banned-word grep across all copy, and CORS verification for the waitlist form. This phase also includes the CORS fix in the Conjure app repo (conjurestudio.app/api/waitlist). No new features — only verification and the one external dependency fix.

</domain>

<decisions>
## Implementation Decisions

### CORS and waitlist integration
- CORS is NOT yet configured on conjurestudio.app/api/waitlist — this is a launch blocker
- Fix lives in the Conjure app repo (user owns it) — add `Access-Control-Allow-Origin: https://conjurestudio.ai` to the waitlist route response headers
- Allowed origin: `conjurestudio.ai` only (no localhost, no wildcard)
- Verification method: `curl -X POST https://conjurestudio.app/api/waitlist -H "Origin: https://conjurestudio.ai"` — check for `Access-Control-Allow-Origin` in response headers
- This is a prerequisite step before the landing page can be declared launch-ready

### Lighthouse approach
- Manual run via PageSpeed Insights (pagespeed.web.dev) — no @lhci/cli tooling needed
- Target: LCP ≤ 2.5s on mobile
- If LCP ≥ 2.5s: treat as a launch blocker — investigate root cause (image size, TTFB) and fix before shipping
- The hero image already has `priority` prop and is `.webp` — expectation is this passes, but must be confirmed

### Physical device testing
- Physical iPhone available — use it directly
- Scope: full criterion 3 pass — horizontal scroll check, tap all CTAs to confirm reachable, scroll full page for layout breakage
- Admin route: basic sanity check only (confirm /admin/login doesn't break on mobile — not polished, just not broken)
- Admin is desktop-only utility; mobile polish is out of scope

### Banned-word grep
- Target: all `.tsx` and `.ts` files in `conjure-landing-page/src/` (not content.ts only)
- Catches any banned words that slipped into component files directly
- Zero matches required before launch

### Claude's Discretion
- Order of the QA checklist steps within the plan
- Whether CORS fix and landing page QA are in the same plan or separate plans

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/content.ts`: Single source of truth for all copy — primary target for banned-word audit; all marketing copy should originate here
- Hero image: `public/hero-screenshot.webp` (WebP ✓, `priority` prop already set in HeroSection)
- Feature images: All `public/feature-*.webp` (WebP ✓)
- PNG files in `/public` (`Conjure-Export.png`, etc.) are originals, not referenced in production components

### Established Patterns
- All vitest tests run with `npm test` inside `conjure-landing-page/` — existing test suite must stay green
- Deployment: Vercel, already live at `conjurestudio.ai` (deployed Phase 1)

### Integration Points
- CORS fix is in a different repo (conjurestudio.app) — plan must include a step for that external change
- Waitlist form posts to `https://conjurestudio.app/api/waitlist` — CORS header must be present before curl verification passes

</code_context>

<specifics>
## Specific Ideas

- CORS verification command: `curl -I -X OPTIONS https://conjurestudio.app/api/waitlist -H "Origin: https://conjurestudio.ai" -H "Access-Control-Request-Method: POST"` — check for `Access-Control-Allow-Origin: https://conjurestudio.ai` in response
- Banned-word list from ROADMAP.md: "AI-powered", "platform", "solution", "leverage", "seamless", "intuitive", "workflow automation", "generative AI", "storyboard software", "asset management", "collaboration hub", "template", "streamline"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-qa-and-launch*
*Context gathered: 2026-03-15*
