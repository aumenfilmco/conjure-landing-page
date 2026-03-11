import { describe, it, expect } from 'vitest'

// These tests will FAIL until Plan 02 creates src/lib/content.ts
// That is correct — these are the RED tests for the TDD cycle.

describe('content.ts — copy constants', () => {
  it('HERO.CTA_PRIMARY is the approved CTA label', async () => {
    const { HERO } = await import('./content')
    expect(HERO.CTA_PRIMARY).toBe('Start free — no credit card')
  })

  it('HERO.CTA_URL points to trial signup', async () => {
    const { HERO } = await import('./content')
    expect(HERO.CTA_URL).toBe('https://conjurestudio.app/auth/signup')
  })

  it('top-level exports are all defined', async () => {
    const content = await import('./content')
    expect(content.HERO).toBeDefined()
    expect(content.FEATURES).toBeDefined()
    expect(content.PRICING).toBeDefined()
    expect(content.WAITLIST).toBeDefined()
    expect(content.FAQ).toBeDefined()
  })

  it('PRICING.TIERS has 4 entries', async () => {
    const { PRICING } = await import('./content')
    expect(PRICING.TIERS).toHaveLength(4)
  })

  it('PRICING.TIERS[0].id is scout', async () => {
    const { PRICING } = await import('./content')
    expect(PRICING.TIERS[0].id).toBe('scout')
  })
})
