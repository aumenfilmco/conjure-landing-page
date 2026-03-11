// src/lib/env.ts
// All environment variable accessors for the landing page.
//
// Prefix rules (CRITICAL — see LANDING-PAGE-BRIEF.md Section 7.2):
//   NEXT_PUBLIC_*  — safe to expose to browser, required for client components
//   No prefix      — server-only; never accessed in client components directly
//                    Pass as props from Server Component parents if needed client-side
//
// Server-only vars exposed to client bundle would appear in _next/static — do NOT add
// NEXT_PUBLIC_ to: LEMON_SQUEEZY_*, ADMIN_PASSWORD, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

// ─── PostHog (client-safe) ──────────────────────────────────────────────────
export const posthogKey  = process.env.NEXT_PUBLIC_POSTHOG_KEY  ?? ''
export const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

// ─── Checkout URLs (server-only) ────────────────────────────────────────────
// These vars do NOT have NEXT_PUBLIC_ prefix. They are read in Server Components.
// PricingSection (if a Client Component) must receive these as props from a
// Server Component parent — never import env.ts directly in a 'use client' file.
const FALLBACK_URL = 'https://conjurestudio.app/auth/signup'

export const checkoutUrls = {
  scout:    process.env.LEMON_SQUEEZY_SCOUT_CHECKOUT_URL    || FALLBACK_URL,
  director: process.env.LEMON_SQUEEZY_DIRECTOR_CHECKOUT_URL || FALLBACK_URL,
  producer: process.env.LEMON_SQUEEZY_PRODUCER_CHECKOUT_URL || FALLBACK_URL,
  studio:   process.env.LEMON_SQUEEZY_STUDIO_CHECKOUT_URL   || FALLBACK_URL,
} as const

// ─── Admin (server-only — inventory only, not re-exported) ─────────────────
// Accessed directly in Server Components by reading process.env:
//   process.env.ADMIN_PASSWORD
//   process.env.SUPABASE_URL
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// Do NOT re-export these — they must never enter the client bundle.
