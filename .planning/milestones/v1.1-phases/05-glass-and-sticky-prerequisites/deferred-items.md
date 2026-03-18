# Deferred Items — Phase 05

## Pre-existing Test Failure (Out of Scope for 05-02)

**File:** `conjure-landing-page/src/components/sections/__tests__/PricingSection.test.tsx`
**Test:** "shows annual monthly prices after clicking annual toggle"
**Error:** `Unable to find an accessible element with the role "button" and name /annual/i`

**Root cause:** The working tree has uncommitted modifications to `PricingSection.tsx` and `PricingSection.test.tsx` (visible in initial git status). The `PricingSection.tsx` aria-label is `'Switch to Annual'` (contains "Annual"), but the rendered DOM is not exposing the expected button role in the test environment. This pre-existed Phase 05-02 work.

**Confirmed:** Running the test against the committed state (before 05-02 commits) also fails — this is a working-tree issue unrelated to glass/FadeInWrapper changes.

**Recommended action:** Review uncommitted changes to PricingSection.tsx and PricingSection.test.tsx together, reconcile aria-label pattern with the test query, and commit as a separate fix before Phase 7 QA.
