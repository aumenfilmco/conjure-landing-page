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

// ─── COPY-01: Banned-word compliance ──────────────────────────────────────────
import { HERO, HOW_IT_WORKS, FEATURES, PRICING, WAITLIST, FAQ, SOCIAL_PROOF } from './content'

const BANNED_WORDS = [
  'AI-powered',
  'platform',
  'solution',
  'leverage',
  'seamless',
  'intuitive',
  'workflow automation',
  'generative AI',
  'storyboard software',
  'asset management',
  'collaboration hub',
  'template',
  'streamline',
] as const

function extractAllStrings(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj]
  if (Array.isArray(obj)) return obj.flatMap(extractAllStrings)
  if (obj !== null && typeof obj === 'object') return Object.values(obj).flatMap(extractAllStrings)
  return []
}

const allCopyStrings = extractAllStrings({
  HERO,
  HOW_IT_WORKS,
  FEATURES,
  PRICING,
  WAITLIST,
  FAQ,
  SOCIAL_PROOF,
})

describe('COPY-01 — banned-word compliance', () => {
  BANNED_WORDS.forEach((word) => {
    it(`no copy contains "${word}"`, () => {
      const lowWord = word.toLowerCase()
      const violations = allCopyStrings.filter((s) =>
        s.toLowerCase().includes(lowWord)
      )
      expect(violations).toHaveLength(0)
    })
  })
})
