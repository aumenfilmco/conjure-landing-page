# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — Visual Polish

**Shipped:** 2026-03-18
**Phases:** 7 | **Plans:** 20

### What Was Built
- Full marketing landing page: hero with browser mockup, scroll-synced features panel, pricing cards, FAQ, waitlist form
- Admin route with JWT auth, Supabase waitlist backend, CVE-2025-29927 defense-in-depth
- Glass-surface frosted glass utility with SVG noise texture and Safari `-webkit-backdrop-filter` fix
- IntersectionObserver scroll-spy for sticky features panel with crossfade screenshots
- 77 passing tests, cross-browser QA (Safari desktop, iOS Safari, Chrome)

### What Worked
- TDD (RED-first) approach caught real bugs before they shipped — particularly the `role=switch` vs `role=button` and IntersectionObserver count assertions
- Parallel phase execution (5 and 6 independent, 7 depends on both) saved time
- CSS-first Tailwind v4 with OKLCH tokens — no hex approximations, brand fidelity maintained throughout
- Separating glass prerequisites (Phase 5) from scroll panel (Phase 6) kept changes focused

### What Was Inefficient
- STATE.md accumulated too many per-decision entries — became noisy; decisions belong in PROJECT.md Key Decisions table
- Phase 2 had 6 plans which was slightly over-split — could have been 4-5 waves
- PERF-01 LCP investigation consumed time when the bottleneck (Vercel hobby TTFB) was not code-fixable

### Patterns Established
- `data-placeholder` attribute pattern for required content placeholders (testable in DOM, unlike JSX comments)
- SVG feTurbulence noise for glass effect on dark backgrounds
- `@supports (backdrop-filter: blur(1px))` progressive enhancement with solid fallback
- Hardcoded px values for webkit inline styles (CSS var() inside blur() broken in all browsers)

### Key Lessons
- Safari rejects CSS custom properties in `-webkit-backdrop-filter` — always hardcode vendor-prefixed values
- `transform` on an ancestor breaks `position: sticky` — identify and remove containing-block ancestors before writing sticky layout
- Cross-origin waitlist POST requires `www.` subdomain on target (non-www 307-redirects before CORS)
- Vercel hobby tier cold start TTFB dominates LCP — code optimization has diminishing returns below ~3.5s

### Cost Observations
- Model mix: balanced profile (opus for planning, sonnet for execution)
- Timeline: 7 days from scaffold to shipped
- Notable: 109 commits for 2,388 LOC — high commit granularity from atomic plan execution

---

## Cross-Milestone Trends

| Metric | v1.1 |
|--------|------|
| Phases | 7 |
| Plans | 20 |
| Days | 7 |
| LOC | 2,388 |
| Tests | 77 |
| Commits | 109 |
