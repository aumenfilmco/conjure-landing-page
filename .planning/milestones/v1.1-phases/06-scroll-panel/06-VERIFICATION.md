---
phase: 06-scroll-panel
verified: 2026-03-17T09:23:00Z
status: human_needed
score: 7/7 must-haves verified
re_verification: false
human_verification:
  - test: "Desktop sticky panel — right column stays fixed while left scrolls"
    expected: "Scrolling through FeaturesSection on desktop (1280px+), the right browser-mockup panel remains pinned in the viewport while the left feature rows scroll past it. The panel does not scroll away, collapse, or jump."
    why_human: "jsdom has no scroll geometry; IntersectionObserver is mocked in unit tests. Sticky layout correctness requires a real browser viewport."
  - test: "Screenshot crossfade — smooth opacity transition, no flash"
    expected: "As each feature row enters the viewport center zone, the screenshot inside the browser mockup crossfades smoothly to the matching image. No white flash, no blank frame, no layout shift between the 6 transitions."
    why_human: "CSS opacity transitions and visual timing cannot be asserted in Vitest. Requires real browser rendering."
  - test: "Active row highlight — mint accent updates on scroll without interaction"
    expected: "The feature row entering the viewport center zone shows mint/primary text color. All other rows remain muted. The highlight updates automatically as you scroll — no clicks required."
    why_human: "IntersectionObserver is stubbed in unit tests. Real IO callback triggering requires a live browser scroll environment."
  - test: "Mobile single-column layout at 375px"
    expected: "At 375px viewport (DevTools device emulator or physical phone), the two-column layout is replaced by a stacked single-column view. Each feature shows description above screenshot. No sticky panel. No horizontal scroll."
    why_human: "Responsive CSS breakpoints require a real or accurately simulated viewport. jsdom renders all elements regardless of md:hidden."
---

# Phase 6: Scroll Panel Verification Report

**Phase Goal:** FeaturesSection rewritten as two-column sticky layout with IntersectionObserver scroll sync, screenshot crossfade, and mobile fallback
**Verified:** 2026-03-17T09:23:00Z
**Status:** human_needed — all automated checks passed; 4 visual behaviors require browser confirmation
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | FeaturesSection is a `'use client'` component | VERIFIED | Line 1 of FeaturesSection.tsx: `'use client'` |
| 2  | Two-column sticky desktop grid renders with `data-testid="features-desktop-grid"` and a `sticky` right column | VERIFIED | Lines 134, 150 of FeaturesSection.tsx; FLYT-02 test passes |
| 3  | IntersectionObserver instantiated once per feature row (6 rows + 1 section = 7 total) | VERIFIED | Lines 65-79, 110-118; FLYT-03 test asserts 7 calls and passes |
| 4  | All 6 images pre-rendered in DOM; active index controls opacity-100/opacity-0 | VERIFIED | Lines 156-173; FLYT-04 test passes with `initialActiveIndex=3` |
| 5  | Active feature row has `text-primary` class; inactive rows have `text-muted-foreground` | VERIFIED | Line 88; FLYT-05 test passes with `initialActiveIndex=2` |
| 6  | Browser mockup chrome: 3 traffic-light dots (`data-testid="traffic-light"`) and URL bar with "conjurestudio.app" | VERIFIED | Lines 43-48; FLYT-06 test passes |
| 7  | Mobile fallback container with `data-testid="features-mobile-stack"` and all 6 titles rendered in it | VERIFIED | Lines 180-199; FLYT-07 test passes |

**Score:** 7/7 truths verified (automated)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `conjure-landing-page/src/components/sections/FeaturesSection.tsx` | `'use client'` component with sticky layout, scroll-spy, crossfade, browser chrome, mobile fallback | VERIFIED | 202 lines; substantive implementation; exports `FeaturesSection`; wired in `page.tsx` |
| `conjure-landing-page/src/components/sections/__tests__/FeaturesSection.test.tsx` | 6 passing tests covering FLYT-02 through FLYT-07 | VERIFIED | 109 lines; all 6 tests pass (confirmed by live test run) |
| `conjure-landing-page/package.json` | `react-intersection-observer` in `dependencies` at `^10.0.3` | VERIFIED | Confirmed present in `dependencies` (not devDependencies) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `FeaturesSection.tsx` | `react-intersection-observer` | Import in component | DEVIATION — INTENTIONAL | Component does NOT import `useInView`; uses native `new IntersectionObserver()` in `useEffect` instead. Documented deviation: `react-intersection-observer` v10 pools observers by options key, which would produce 1 IO instance instead of 6 required by FLYT-03 test. Package still installed and available. Tests pass. |
| `FeaturesSection.tsx` sticky panel | `activeIndex` state | `opacity-100`/`opacity-0` class toggle on `feature-image-wrapper` divs | VERIFIED | Lines 160-162: ternary on `i === activeIndex` applies opacity classes |
| Each `FeatureRow` | `setActiveIndex` (via `handleActivate`) | `useEffect` + `new IntersectionObserver` `onChange` callback | VERIFIED | Lines 65-79: `onActivate(index)` called in IO callback when `entry.isIntersecting`; `handleActivate` at line 121 calls `setMockupVisible(true)` then `setActiveIndex(index)` |
| `page.tsx` | `FeaturesSection` | `import { FeaturesSection } from '@/components/sections/FeaturesSection'` | VERIFIED | Line 7 and line 27 of page.tsx; `<FeaturesSection />` with no props — matches `initialActiveIndex = 0` default |

**Note on key link deviation:** Plan 06-02 specified `useInView` from `react-intersection-observer` as the scroll-spy mechanism. The implementation substituted native `IntersectionObserver` in `useEffect`. This was a correct engineering decision (documented in SUMMARY 06-02) and all tests pass. The `react-intersection-observer` package remains installed and available for future use.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FLYT-02 | 06-01, 06-02 | Two-column layout: scrolling feature rows (left), sticky browser-mockup panel (right) | SATISFIED | `data-testid="features-desktop-grid"` with `md:grid-cols-2`; sticky right column; FLYT-02 test passes |
| FLYT-03 | 06-01, 06-02 | IntersectionObserver detects viewport-center feature and updates `activeIndex` | SATISFIED | Native IO in `useEffect` per `FeatureRow` + 1 section-level IO; FLYT-03 test (7 calls) passes |
| FLYT-04 | 06-01, 06-02 | Screenshot crossfades to match active feature — all 6 images pre-rendered, opacity toggling, no src swap | SATISFIED | Lines 156-173: stacked `absolute inset-0` divs with opacity ternary; FLYT-04 test passes |
| FLYT-05 | 06-01, 06-02 | Active feature row highlighted with mint accent; inactive rows muted | SATISFIED | Line 88: `text-primary` / `text-muted-foreground` conditional class; FLYT-05 test passes |
| FLYT-06 | 06-01, 06-02 | Browser mockup chrome: title bar, traffic lights, URL bar | SATISFIED | `BrowserMockup` sub-component lines 37-55; 3 `data-testid="traffic-light"` spans; "conjurestudio.app" text; FLYT-06 test passes |
| FLYT-07 | 06-01, 06-02 | Mobile collapse: stacked single-column, no sticky panel, at `md` breakpoint | SATISFIED | Lines 180-199: `data-testid="features-mobile-stack"` with `md:hidden`; all 6 titles rendered; FLYT-07 test passes |

All 6 requirement IDs claimed in both PLAN files are satisfied. REQUIREMENTS.md traceability table marks FLYT-02 through FLYT-07 as Phase 6 / Complete.

No orphaned requirements: the phase declared FLYT-02–07 and all 6 are accounted for.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `FeaturesSection.tsx` | 39 | `overflow-hidden` on `BrowserMockup` outer div | INFO | Scoped to the visual chrome wrapper only — not on the section or grid container. Does not affect `position: sticky` on the right column. Intentional (rounded chrome clipping). |

No blockers. No stubs. No TODO/FIXME/placeholder comments found in the implementation file.

---

### Human Verification Required

#### 1. Desktop Sticky Panel

**Test:** Open `http://localhost:3000` on a desktop browser at 1280px+ width. Scroll through the Features section ("What you get").
**Expected:** The right browser-mockup panel stays fixed in the viewport while the left column of feature rows scrolls past it. The panel does not scroll away, bounce, or collapse.
**Why human:** jsdom has no scroll geometry; sticky positioning cannot be exercised in unit tests.

#### 2. Screenshot Crossfade

**Test:** On desktop, scroll slowly through all 6 feature rows in the Features section.
**Expected:** The screenshot inside the browser mockup panel crossfades smoothly to match the feature row entering the viewport center (approx. 40% from top and bottom edges). No white flash, no blank frame, no layout shift between transitions.
**Why human:** CSS opacity transitions and visual timing are not assertable in Vitest.

#### 3. Active Row Highlight on Scroll

**Test:** On desktop, scroll through the Features section without clicking.
**Expected:** The feature row entering the viewport center zone turns mint/bright (primary color). All other rows remain muted/dimmed. The active state updates automatically as each row enters the zone — no interaction required.
**Why human:** IntersectionObserver is stubbed in unit tests; real IO callback behavior requires a live browser scroll.

#### 4. Mobile Single-Column Layout (375px)

**Test:** In DevTools device emulator (or physical phone), set viewport to 375px. Navigate to the Features section.
**Expected:** Two-column layout is hidden. Each feature displays as a stacked card: description text on top, screenshot image below. No sticky panel. No horizontal scroll bar.
**Why human:** Responsive CSS breakpoints (`md:hidden`, `hidden md:grid`) require real viewport rendering.

---

### Gaps Summary

No automated gaps. All 7 must-have truths are verified by code inspection and a live test run (6/6 tests pass). The only open items are the 4 visual/behavioral checks above that require a real browser.

The phase's UAT document (`06-UAT.md`) records all 5 manual test scenarios as `pass` — this was human-approved during plan execution (Task 3 checkpoint). The VERIFICATION status of `human_needed` reflects that this verifier cannot independently confirm the visual outcomes programmatically; it defers to the existing UAT sign-off.

**Pre-existing TypeScript errors** (not introduced by Phase 6):
- `Header.test.tsx` lines 40, 52, 72: `WebkitBackdropFilter` property type errors — carried over from Phase 5. No impact on FeaturesSection or any Phase 6 artifact.

---

## Commit Verification

All three phase commits confirmed in git history:

| Commit | Description |
|--------|-------------|
| `e65d32c` | chore(06-01): install react-intersection-observer ^10.0.3 |
| `82d2bfc` | test(06-01): add RED failing tests for FLYT-02 through FLYT-07 |
| `274599b` | feat(06-02): rewrite FeaturesSection as scroll-synced sticky layout |

---

_Verified: 2026-03-17T09:23:00Z_
_Verifier: Claude (gsd-verifier)_
