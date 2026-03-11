# Feature Research

**Domain:** SaaS marketing landing page — creative-professional tool (commercial previs pipeline)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Context

Conjure is a commercial previs pipeline tool targeting Commercial Directors (users) and Agency Creative Directors (buyers). The page goal is: get a visiting Director or Agency CD from landing to trial signup in one scroll — by showing them the output (a branded Google Slides deck) before explaining how it works. This is a waitlist/trial-acquisition page, not a full marketing site.

Target audience is professionals, not consumers. They are skeptical, time-poor, and have seen dozens of creative tools. They will leave the page if they don't immediately understand the concrete deliverable and why it beats their current process.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features visitors assume exist on any credible SaaS landing page. Missing these causes immediate bounce or distrust.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section — headline, subhead, primary CTA | First screen must communicate product value and direct action in under 3 seconds | LOW | Brief mandates: show the Google Slides deck output first; the deliverable is the hook. Do not lead with process. |
| Features section — benefit-driven, not spec-driven | Visitors won't decode feature lists; they need to see how each capability maps to a pain they recognize | LOW | 5 features defined in PROJECT.md: Component Assembly, Character Extraction, Camera Package Presets, Character Pose Sheets, Google Slides Export. Each needs a stated pain → outcome framing. |
| Pricing section with clear tier structure | Professionals need to qualify budget before committing — missing pricing is a trust signal failure | MEDIUM | 4 tiers (Scout, Director, Producer, Studio). Paid-tier CTAs fall back to trial signup URL until Lemon Squeezy is configured. |
| Primary CTA — singular conversion goal | Every page section must re-offer the same action; multiple competing CTAs dilute conversion | LOW | CTA is trial signup / waitlist join. Do not add secondary CTAs for social links, blog, demos, etc. in v1. |
| Waitlist / signup form — email required, name optional | The conversion event. Must be minimal friction. One form field (email) outperforms two fields by 20–40%. | LOW | POST to `conjurestudio.app/api/waitlist`. Name is optional per PROJECT.md. Error and success states required. |
| Mobile-responsive layout | 60%+ of landing page traffic arrives mobile even in B2B. Broken mobile = immediate bounce. | MEDIUM | Required by PROJECT.md. Every section must be tested at 375px, 768px, 1280px. |
| Page speed under 2 seconds | Slow-loading pages signal product quality. B2B professionals are unforgiving. | MEDIUM | Astro (or chosen framework) ships nearly zero JS by default — advantage here. No heavy client-side bundles in v1. |
| Consistent brand tokens throughout | Professional creative buyers will notice inconsistent color or typography immediately — it implies sloppy product | LOW | All colors from OKLCH table in brief. Geist Sans/Mono only. Zero deviation from brand spec. |
| Social proof section | Without third-party validation, any claim on the page is self-serving; even a placeholder signals intent to show proof | LOW | PROJECT.md specifies `<!-- TESTIMONIAL_REQUIRED -->` placeholder. Section should scaffold the visual container so content can drop in without layout changes. |
| Analytics instrumentation | Cannot improve what isn't measured; even at launch this is mandatory | LOW | PostHog events: `waitlist_form_submitted`, `waitlist_form_error`, `cta_clicked`, `pricing_tier_viewed`. |

### Differentiators (Competitive Advantage)

Features that move a credible-but-generic landing page to a converting one. These are specific to Conjure's audience and positioning.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Output-first hero — show the Google Slides deck before explaining how it works | Commercial Directors and Agency CDs are deliverable-oriented. A screenshot of the actual output (branded storyboard deck in Google Slides) communicates the entire value prop without a single word of explanation. Competitors (Boords, Previs Pro) lead with interface screenshots, not the finished artifact. | LOW | This is a content decision, not a technical one. Requires one high-quality deck screenshot as hero media. Priority: source this asset early. |
| "How it works" — 3-step process section | Professionals need to understand the operational model before they'll trial anything. Script → session → branded deck in an afternoon is a simple, strong story. 3 steps maximum. No more. | LOW | Not in PROJECT.md requirements — add it. Converts skeptical "sounds complicated" visitors into form completions. |
| Outcome-language copy throughout | The ICP avoid list bans all generic SaaS language. Copy that uses production-world vocabulary ("scout," "camera package," "character pose sheet," "director's cut") signals that the product was built by people who understand the job — which is the core trust signal for this audience. | LOW | Already constrained by PROJECT.md. Research confirms copy differentiation is a top conversion lever for niche B2B tools. |
| FAQ section — 3 to 5 questions | Research shows FAQ near the form CTA removes the last friction for skeptical visitors. Key questions for this audience: "Do I need to know how to draw?", "What happens to my script?", "How is this different from hiring a storyboard artist?", "What's included in the free trial?" | LOW | Not in PROJECT.md requirements — add it. Directly reduces waitlist abandonment by preempting the most common objections. |
| Success state after form submission | After joining the waitlist, a confirmation state (inline or redirect) that (a) confirms the signup worked and (b) gives a next action (e.g., "Check your email — we'll be in touch when your trial opens") prevents "did that work?" anxiety and improves trust | LOW | Required for error/success handling. The messaging content is the differentiator — make it feel like a conversation, not an autoresponder. |
| Sticky / always-visible CTA | For a long-scroll page (hero → features → how it works → pricing → social proof → FAQ), visitors who are ready to convert mid-scroll should not have to scroll back to the form | LOW-MEDIUM | Sticky header CTA button or sticky CTA bar at bottom. Implement with minimal JS. Do not implement as a floating modal or popup (anti-feature — see below). |
| Anchor navigation | For professionals who know what they're looking for, allowing direct jumps to Pricing or Features reduces frustration. Small conversion lift, low cost. | LOW | In-page anchor links only — no full navigation menu (removes exit paths from the page). |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look like improvements but reduce conversion or add scope that doesn't serve the page goal.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full site navigation header | Feels "complete," professional | Navigation links are exit paths. Every link away from the page reduces conversion. Dedicated landing pages remove nav menus entirely — research confirms this is a primary conversion lever. | Anchor links to page sections only. No external links except the trial CTA. |
| Popup / exit-intent modal | Captures emails from abandoning visitors | Research: popovers annoy professional audiences. Creative-industry ICPs associate popups with low-quality tools. Breaks brand perception for Conjure. | Well-placed sticky CTA + compelling FAQ section removes the need for interruption tactics. |
| Animated / autoplay background video | Visually impressive, communicates "motion" for a film-industry tool | Performance penalty is severe. Autoplay video raises load time by 3–6x on average, which kills mobile performance and increases bounce rate. | Static hero media (high-quality deck screenshot) + optional 90-second explainer video embedded below the fold, user-initiated. |
| Multiple conversion goals | Tempting to add "watch demo," "book a call," "download one-pager," "follow on X" | Each competing CTA draws attention away from the primary goal (waitlist signup). Research consistently shows single-CTA pages outperform multi-CTA pages by 20–50%. | One CTA. Everything else defers to v1.1 when the paid tier is live and a separate demo/sales flow may be warranted. |
| Competitor comparison table | Obvious differentiator question — "how are you different from Boords?" | PROJECT.md explicitly out-of-scopes named competitor comparisons in top-of-funnel copy. Named comparisons in a hero context introduce doubt and prime visitors to research alternatives. | Frame against the manual workflow (hired storyboard artist, shot lists on paper) not named competitors. |
| Referral / waitlist gamification (position tracking, share-for-priority) | Robinhood-style waitlists show viral growth potential | Appropriate for consumer products. Completely wrong tone for a creative professional B2B tool. Directors and Agency CDs will not share a referral link for queue position. Signals "startup growth hack" over "professional tool." | Simple confirmation messaging that conveys exclusivity of early access without gamification mechanics. |
| Blog / content section | SEO value, thought leadership | Zero SEO value on a single-page waitlist site that isn't indexed for content yet. Scope creep with no conversion upside in v1. | Defer to when the main Conjure app site has a content strategy. |
| Live signup counter ("X people on the waitlist") | Social proof signal, creates FOMO | Requires real-time or near-real-time data from Supabase on a public-facing page. Adds complexity for marginal conversion benefit. Also displays "0" embarrassingly at launch before momentum builds. | Static proof: "Early access open to directors and agency CDs." Add counter only after 500+ signups are confirmed. |
| Chat widget / live chat | Reduces friction for questions | Requires staffing or a bot. Adds 50–100ms to page load (third-party script). No conversational content strategy exists yet. FAQ section serves the same objection-handling function. | FAQ section. |

---

## Feature Dependencies

```
[Hero section — output-first media]
    └──requires──> [High-quality deck screenshot asset] (content dependency, not technical)

[Waitlist form — email capture]
    └──requires──> [Success/error state handling]
    └──requires──> [Analytics instrumentation] (cta_clicked fires before form, form events fire on submit)

[Pricing section]
    └──requires──> [CTA per tier] ──fallback──> [Trial signup URL until Lemon Squeezy configured]

[Social proof section]
    └──requires──> [Testimonial content] (outstanding content dependency — ships as placeholder)

[Sticky CTA]
    └──enhances──> [Every section below the fold]
    └──requires──> [Primary CTA defined in hero] (same action, same URL)

[FAQ section]
    └──enhances──> [Waitlist form conversion] (placed directly above or below the form)

[Admin view at /admin]
    └──requires──> [Supabase read-only connection string]
    └──requires──> [ADMIN_PASSWORD env var]
    └──independent of all public page sections]

[PostHog analytics]
    └──requires──> [NEXT_PUBLIC_POSTHOG_KEY env var]
    └──enhances──> [All CTA and form interactions]
```

### Dependency Notes

- **Hero requires deck screenshot:** The output-first hero is the primary differentiator — sourcing this asset is the first content task. Without it, the hero defaults to a generic illustration or text-only layout, which loses the conversion advantage.
- **Pricing CTA requires fallback URL:** Lemon Squeezy checkout URLs are not yet configured (v1.3). All paid-tier CTAs must wire to env vars with graceful fallback to `https://conjurestudio.app/auth/signup`.
- **FAQ enhances form:** Place the FAQ section in the page flow immediately before or after the final form CTA. Research shows FAQ-adjacent form placements improve conversion by removing last-moment objections.
- **Admin view is independent:** The `/admin` route is a separate page — it shares the framework and Supabase connection but has no dependencies on the public landing page sections. It can be built in any phase without blocking the public page.

---

## MVP Definition

### Launch With (v1)

Minimum viable page — what's needed to drive trial signups and validate that the positioning resonates.

- [ ] Hero section — output-first, primary CTA, headline + subhead — *without this, there is no page*
- [ ] Features section — 5 features, benefit-framed, from approved copy — *establishes credibility and product scope*
- [ ] How it works — 3-step process (Script → Session → Deck) — *removes "sounds complicated" objection for borderline visitors*
- [ ] Pricing section — 4 tiers, correct values from POSITIONING.md, CTA per tier with fallback URL — *professionals need to see pricing to qualify*
- [ ] Waitlist form — email required, name optional, POST to live API, success + error states — *the conversion event*
- [ ] Social proof section — scaffolded with `<!-- TESTIMONIAL_REQUIRED -->` placeholder — *signals intent; swaps content without layout change*
- [ ] FAQ section — 3 to 5 questions targeting: no-drawing objection, data/privacy, difference from hiring an artist, free trial scope — *removes last-friction objections before form*
- [ ] Sticky CTA in header or footer bar — *captures converts who are ready mid-scroll*
- [ ] PostHog instrumentation — 4 events from PROJECT.md — *day-1 data*
- [ ] Admin view at `/admin` — password-protected, signup table — *operational, not visitor-facing*
- [ ] Responsive layout (375px, 768px, 1280px) — *non-negotiable for traffic quality*
- [ ] Brand token fidelity — OKLCH colors, Geist Sans/Mono — *trust signal for design-literate audience*

### Add After Validation (v1.x)

Features to add once conversion baseline is established and product moves to paid tiers.

- [ ] Testimonial content — swap `<!-- TESTIMONIAL_REQUIRED -->` placeholder with real quotes — *trigger: content becomes available*
- [ ] Lemon Squeezy checkout URL wiring — replace fallback CTAs with live checkout — *trigger: v1.3 billing setup complete*
- [ ] Live signup counter — "X directors on the waitlist" — *trigger: 500+ confirmed signups, so the number is credible*
- [ ] Embedded demo / explainer video — 90 seconds, below the fold, user-initiated — *trigger: video asset is produced*

### Future Consideration (v2+)

Defer until product-market fit is established and a full marketing site strategy is warranted.

- [ ] Blog / content section — *requires content strategy and SEO investment not relevant to a waitlist page*
- [ ] Case study pages — *requires completed client engagements to document*
- [ ] Animated onboarding or interactive product tour — *appropriate for a full marketing site, not a single-page waitlist*
- [ ] Multi-language support — *no evidence of non-English-speaking ICP at this stage*

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero — output-first with deck screenshot | HIGH | LOW (technical) / HIGH (asset dependency) | P1 |
| Waitlist form with success/error states | HIGH | LOW | P1 |
| Features section — 5 features, benefit-framed | HIGH | LOW | P1 |
| Pricing section — 4 tiers with fallback CTAs | HIGH | MEDIUM | P1 |
| Responsive layout | HIGH | MEDIUM | P1 |
| Brand token fidelity | HIGH | LOW | P1 |
| PostHog analytics | MEDIUM | LOW | P1 |
| How it works — 3-step process | HIGH | LOW | P1 |
| FAQ section — 3 to 5 questions | MEDIUM | LOW | P1 |
| Social proof section (placeholder) | MEDIUM | LOW | P1 |
| Sticky CTA | MEDIUM | LOW-MEDIUM | P1 |
| Admin view at /admin | MEDIUM | MEDIUM | P1 |
| Testimonial content (real) | HIGH | LOW (technical) / HIGH (content) | P2 |
| Lemon Squeezy checkout URL wiring | HIGH | LOW | P2 |
| Live signup counter | LOW-MEDIUM | MEDIUM | P2 |
| Embedded demo video | MEDIUM | LOW (technical) / HIGH (asset) | P2 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Competitors analyzed: Boords, Previs Pro, Storyboarder.ai, LTX Studio. All target adjacent audiences (film/TV production) but not the specific Commercial Director + Agency CD ICP.

| Feature | Boords | Previs Pro | Our Approach |
|---------|--------|------------|--------------|
| Hero media | Interface screenshot | 3D scene screenshot | Actual output artifact (branded Google Slides deck) — shows the deliverable, not the tool |
| Pricing transparency | Visible on landing | Visible on landing | Visible on landing — 4 tiers, values from POSITIONING.md |
| Copy tone | Generic SaaS ("collaborate," "streamline") | Technical spec language | Production-world vocabulary — no banned terms from ICP avoid list |
| Social proof | Testimonials + logos | Not prominent | Scaffolded placeholder ready for real testimonials |
| How it works | Missing from homepage | Missing from homepage | 3-step section explaining Script → Session → Deck |
| Trial model | Free tier | Free edition (v3.1) | Trial via waitlist — exclusivity framing, not freemium |

**Key competitive insight:** Boords and Previs Pro both lead with interface screenshots. Neither shows the finished deliverable. This is the primary visual differentiator for Conjure's hero section — show the Google Slides deck output before anything else.

---

## Sources

- [51 High-Converting SaaS Landing Pages Experts Love 2025 — KlientBoost](https://www.klientboost.com/landing-pages/saas-landing-page/)
- [27 best SaaS landing page examples — Unbounce](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/)
- [SaaS Landing Page Best Practices — Heyflow](https://heyflow.com/blog/saas-landing-page-best-practices/)
- [High-Performing B2B SaaS Landing Page Best Practices — Flow Agency](https://www.flow-agency.com/blog/b2b-saas-landing-page-best-practices/)
- [Best Landing Pages for Lead Generation — B2B Analysis of 2,000 Companies](https://www.getpassionfruit.com/blog/best-landing-page-analysis-of-2-000-b2b-saas-companies)
- [Waitlist Landing Page Best Practices — Magic UI](https://magicui.design/blog/waitlist-landing-page)
- [How to Create a High Converting Waitlist Landing Page — Moosend](https://moosend.com/blog/waitlist-landing-page/)
- [B2B Conversion Rate Optimization 2025 Strategies — Unbounce](https://unbounce.com/conversion-rate-optimization/b2b-conversion-rates/)
- [18 B2B SaaS Landing Page Best Practices — SaaS Hero](https://www.saashero.net/design/saas-landing-page-best-practices/)
- [Best Storyboard Software for Filmmaking 2025 — Filmustage](https://filmustage.com/blog/the-best-storyboard-software-for-filmmaking-in-2025-with-real-world-picks/)
- [8 Best Platforms for AI-Driven Pre-Production 2025 — Shai Creative](https://shaicreative.ai/8-best-platforms-for-ai-driven-pre-production-in-film-2025/)

---
*Feature research for: SaaS marketing landing page — Conjure commercial previs pipeline*
*Researched: 2026-03-11*
