import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SOCIAL_PROOF, FAQ } from '@/lib/content'

import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { FAQSection } from '@/components/sections/FAQSection'

describe('SocialProofSection', () => {
  it('renders section heading', () => {
    render(<SocialProofSection />)
    expect(screen.getByText(SOCIAL_PROOF.SECTION_HEADING)).toBeInTheDocument()
  })

  it('contains TESTIMONIAL_REQUIRED placeholder marker in HTML', () => {
    const { container } = render(<SocialProofSection />)
    expect(container.innerHTML).toContain('TESTIMONIAL_REQUIRED')
  })
})

describe('FAQSection', () => {
  it('renders all FAQ questions', () => {
    render(<FAQSection />)
    FAQ.ITEMS.forEach(({ question }) => {
      expect(screen.getByText(question)).toBeInTheDocument()
    })
  })

  it('renders FAQ answers', () => {
    render(<FAQSection />)
    FAQ.ITEMS.forEach(({ answer }) => {
      expect(screen.getByText(answer)).toBeInTheDocument()
    })
  })
})
