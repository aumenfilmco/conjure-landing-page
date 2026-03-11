import { describe, it, expect, beforeEach } from 'vitest'

// These tests will FAIL until Plan 02 creates src/lib/env.ts
// That is correct — these are the RED tests for the TDD cycle.

describe('env.ts — checkout URL fallback', () => {
  const FALLBACK = 'https://conjurestudio.app/auth/signup'

  beforeEach(() => {
    // Ensure Lemon Squeezy vars are unset for fallback tests
    delete process.env.LEMON_SQUEEZY_SCOUT_CHECKOUT_URL
    delete process.env.LEMON_SQUEEZY_DIRECTOR_CHECKOUT_URL
    delete process.env.LEMON_SQUEEZY_PRODUCER_CHECKOUT_URL
    delete process.env.LEMON_SQUEEZY_STUDIO_CHECKOUT_URL
  })

  it('scout returns fallback when env var is absent', async () => {
    const { checkoutUrls } = await import('./env')
    expect(checkoutUrls.scout).toBe(FALLBACK)
  })

  it('director returns fallback when env var is absent', async () => {
    const { checkoutUrls } = await import('./env')
    expect(checkoutUrls.director).toBe(FALLBACK)
  })

  it('producer returns fallback when env var is absent', async () => {
    const { checkoutUrls } = await import('./env')
    expect(checkoutUrls.producer).toBe(FALLBACK)
  })

  it('studio returns fallback when env var is absent', async () => {
    const { checkoutUrls } = await import('./env')
    expect(checkoutUrls.studio).toBe(FALLBACK)
  })

  it('posthogKey export is a string', async () => {
    const { posthogKey } = await import('./env')
    expect(typeof posthogKey).toBe('string')
  })
})
