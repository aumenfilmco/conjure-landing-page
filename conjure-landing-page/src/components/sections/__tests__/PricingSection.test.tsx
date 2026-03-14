import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PRICING } from '@/lib/content'

vi.mock('posthog-js', () => ({
  default: { capture: vi.fn() },
}))

import posthog from 'posthog-js'
import { PricingSection } from '@/components/sections/PricingSection'

// Mock IntersectionObserver (jsdom does not implement it)
const mockObserver = { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }
vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver))

const mockCheckoutUrls = {
  scout:    'https://example.com/scout',
  director: 'https://example.com/director',
  producer: 'https://example.com/producer',
  studio:   'https://example.com/studio',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PricingSection', () => {
  it('renders all 4 tier names', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    expect(screen.getByText('Scout')).toBeInTheDocument()
    expect(screen.getByText('Director')).toBeInTheDocument()
    expect(screen.getByText('Producer')).toBeInTheDocument()
    expect(screen.getByText('Studio')).toBeInTheDocument()
  })

  it('shows monthly prices by default', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    expect(screen.getByText(/\$39/)).toBeInTheDocument()
    expect(screen.getByText(/\$59/)).toBeInTheDocument()
  })

  it('shows annual monthly prices after clicking annual toggle', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    const toggle = screen.getByRole('switch', { name: /annual/i })
    fireEvent.click(toggle)
    expect(screen.getByText(/\$32/)).toBeInTheDocument()
    expect(screen.getByText(/\$49/)).toBeInTheDocument()
  })

  it('Director tier has Most popular badge', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    expect(screen.getByText(/most popular/i)).toBeInTheDocument()
  })

  it('tier CTA hrefs all point to waitlist', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    const links = screen.getAllByRole('link')
    const tierLinks = links.filter((l) => l.getAttribute('href') === '#waitlist')
    expect(tierLinks.length).toBeGreaterThan(0)
  })

  it('fires cta_clicked on tier CTA click', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    const waitlistLinks = screen.getAllByRole('link', { name: /join the waitlist/i })
    fireEvent.click(waitlistLinks[0])
    expect(posthog.capture).toHaveBeenCalledWith('cta_clicked', expect.objectContaining({ section: 'pricing' }))
  })
})
