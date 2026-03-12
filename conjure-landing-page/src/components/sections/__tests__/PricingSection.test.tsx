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
    const toggle = screen.getByRole('button', { name: /annual/i })
    fireEvent.click(toggle)
    expect(screen.getByText(/\$32/)).toBeInTheDocument()
    expect(screen.getByText(/\$49/)).toBeInTheDocument()
  })

  it('Director tier has Most popular badge', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    expect(screen.getByText(/most popular/i)).toBeInTheDocument()
  })

  it('tier CTA hrefs match checkoutUrls prop', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('https://example.com/director')
  })

  it('fires cta_clicked on tier CTA click', () => {
    render(<PricingSection checkoutUrls={mockCheckoutUrls} />)
    const directorLink = screen.getByRole('link', { name: /start.*director/i })
    fireEvent.click(directorLink)
    expect(posthog.capture).toHaveBeenCalledWith('cta_clicked', expect.objectContaining({ section: 'pricing' }))
  })
})
