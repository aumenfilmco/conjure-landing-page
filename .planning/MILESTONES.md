# Milestones

## v1.1 Visual Polish (Shipped: 2026-03-18)

**Phases completed:** 7 phases, 20 plans, 3 tasks

**Key accomplishments:**
- Full landing page: hero with browser mockup, features, pricing, FAQ, and waitlist sections
- Scroll-synced sticky panel with IntersectionObserver crossfade for Features section
- Glass-surface frosted glass utility with Safari/WebKit `-webkit-backdrop-filter` compatibility
- Admin route with jose JWT auth, Supabase waitlist backend, CVE-2025-29927 defense-in-depth
- Cross-browser QA verified on Safari desktop, physical iOS Safari, and Chrome
- 77 passing tests, Lighthouse-optimized hero (64KB WebP), WCAG AA contrast confirmed

**Stats:** 109 commits, 140 files, 2,388 LOC TypeScript | 7 days (2026-03-11 → 2026-03-17)

**Known gaps:**
- PERF-01: LCP 3.6s (target ≤ 2.5s) — Vercel hobby tier TTFB bottleneck, not code-level

---

