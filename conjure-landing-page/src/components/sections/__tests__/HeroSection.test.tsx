import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HERO } from '@/lib/content'

// Mock posthog-js
vi.mock('posthog-js', () => ({
  default: { capture: vi.fn() },
}))

// Import posthog after mock
import posthog from 'posthog-js'

// Import component — does not exist yet (RED)
import { HeroSection } from '@/components/sections/HeroSection'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('HeroSection', () => {
  it('renders HERO.HEADLINE', () => {
    render(<HeroSection />)
    expect(screen.getByText(HERO.HEADLINE)).toBeInTheDocument()
  })

  it('renders HERO.SUBHEAD', () => {
    render(<HeroSection />)
    expect(screen.getByText(HERO.SUBHEAD)).toBeInTheDocument()
  })

  it('CTA link has correct href and label', () => {
    render(<HeroSection />)
    const cta = screen.getByRole('link', { name: HERO.CTA_PRIMARY })
    expect(cta).toHaveAttribute('href', HERO.CTA_URL)
  })

  it('fires posthog cta_clicked on CTA click', () => {
    render(<HeroSection />)
    const cta = screen.getByRole('link', { name: HERO.CTA_PRIMARY })
    fireEvent.click(cta)
    expect(posthog.capture).toHaveBeenCalledWith('cta_clicked', {
      cta_label: HERO.CTA_PRIMARY,
      section: 'hero',
    })
  })

  it('contains HERO_SCREENSHOT_REQUIRED placeholder or screenshot image', () => {
    const { container } = render(<HeroSection />)
    const hasComment = container.innerHTML.includes('HERO_SCREENSHOT_REQUIRED')
    const hasImg = container.querySelector('img') !== null
    expect(hasComment || hasImg).toBe(true)
  })
})
