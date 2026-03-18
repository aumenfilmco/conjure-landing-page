---
phase: 02-public-page
plan: "03"
subsystem: ui

tags: [react, nextjs, posthog, tailwind, forms, faq]

requires:
  - phase: 02-public-page/02-00
    provides: glass-surface utility class and CSS token foundation

provides:
  - WaitlistSection: form state machine with cross-origin POST and PostHog events
  - SocialProofSection: placeholder with TESTIMONIAL_REQUIRED marker for future testimonials
  - FAQSection: native details/summary accordion for 3 questions from FAQ.ITEMS

affects:
  - 02-public-page/02-04 (page assembly — imports these three sections)
  - 02-public-page/02-05 or later (testimonial replacement in SocialProofSection)

tech-stack:
  added: []
  patterns:
    - "Form state machine: idle / submitting / success / error with disabled button during non-idle"
    - "PostHog: capture email_domain only (email.split('@')[1]) — never full email address"
    - "data-placeholder attribute for future-content markers — passes container.innerHTML.includes() tests"
    - "native details/summary for FAQ accordion — zero JS, accessible, each item opens independently"

key-files:
  created:
    - conjure-landing-page/src/components/sections/WaitlistSection.tsx
    - conjure-landing-page/src/components/sections/SocialProofSection.tsx
    - conjure-landing-page/src/components/sections/FAQSection.tsx
  modified: []

key-decisions:
  - "formState !== 'idle' disables submit button — covers both submitting and error states per WAIT-03"
  - "data-placeholder='TESTIMONIAL_REQUIRED' used on social proof card — data attribute passes container.innerHTML.includes() test where JSX comment would not"
  - "FAQSection uses native details/summary — zero JS required, each item opens independently, fully accessible per RESEARCH.md"
  - "name field omitted from fetch body when empty string: ...(name ? { name } : {}) — cleaner API payload"

patterns-established:
  - "Form state machine: type FormState = 'idle' | 'submitting' | 'success' | 'error' — reuse for any async form"
  - "PostHog privacy: only capture derived attributes (email_domain) not PII (full email)"

requirements-completed:
  - WAIT-01
  - WAIT-02
  - WAIT-03
  - WAIT-04
  - WAIT-05
  - WAIT-06
  - WAIT-07
  - SOCIAL-01
  - SOCIAL-02
  - FAQ-01
  - FAQ-02
  - FAQ-03
  - COPY-01
  - COPY-02

duration: 5min
completed: 2026-03-12
---

# Phase 2 Plan 03: WaitlistSection, SocialProofSection, FAQSection Summary

**Waitlist form with async state machine and PostHog event capture, FAQ accordion via native details/summary, and social proof placeholder with TESTIMONIAL_REQUIRED marker — 11 tests GREEN, 0 regressions**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-12T16:46:42Z
- **Completed:** 2026-03-12T16:47:45Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- WaitlistSection: idle/submitting/success/error state machine, cross-origin POST to WAITLIST.ENDPOINT, PostHog events fire with email_domain only (never full email), submit disables immediately on click
- SocialProofSection: renders SOCIAL_PROOF.SECTION_HEADING and data-placeholder="TESTIMONIAL_REQUIRED" for future testimonial insertion
- FAQSection: native details/summary renders all 3 FAQ.ITEMS questions and answers with zero JavaScript

## Task Commits

Each task was committed atomically:

1. **Task 1: WaitlistSection** - `2740a4f` (feat)
2. **Task 2: SocialProofSection and FAQSection** - `acfd2cf` (feat)

## Files Created/Modified

- `conjure-landing-page/src/components/sections/WaitlistSection.tsx` - Client component with form state machine, PostHog events, cross-origin POST
- `conjure-landing-page/src/components/sections/SocialProofSection.tsx` - Server component with section heading and TESTIMONIAL_REQUIRED data attribute
- `conjure-landing-page/src/components/sections/FAQSection.tsx` - Server component, native details/summary accordion mapping over FAQ.ITEMS

## Decisions Made

- `formState !== 'idle'` used as disabled condition: covers both 'submitting' and 'error' states; per WAIT-03 the button must stay disabled after an error to prevent repeated submissions without user clearing the form
- `data-placeholder="TESTIMONIAL_REQUIRED"` on the social proof card div: JSX comments are stripped from rendered HTML so `container.innerHTML.includes()` would fail; data attribute persists to HTML
- Native `<details>`/`<summary>` for FAQ: each item opens and closes independently without state, zero JS, inherently accessible, and satisfies screen.getByText() in jsdom because answers are in the DOM (hidden by CSS, not JS)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- WaitlistSection, SocialProofSection, and FAQSection are ready to be imported into the page assembly (Plan 02-04 or equivalent)
- SocialProofSection awaits real testimonial content; swap `data-placeholder` div for actual testimonial card when `SOCIAL_PROOF.TESTIMONIAL` is populated

---
*Phase: 02-public-page*
*Completed: 2026-03-12*
