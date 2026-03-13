import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

// Mock posthog-js (used transitively by content.ts → no direct usage here,
// but other components in the tree may pull it in)
vi.mock('posthog-js', () => ({
  default: { capture: vi.fn(), init: vi.fn() },
}))

// Mock next/image — jsdom cannot load images
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { alt, src, ...rest } = props
    return <img alt={alt as string} src={src as string} {...rest} />
  },
}))

import { Header } from '@/components/sections/Header'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  // Reset scrollY after each test
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
})

describe('Header — GLAS-03: hardcoded webkit backdrop-filter value', () => {
  it('GLAS-03: when scrolled, WebkitBackdropFilter is the literal hardcoded value', async () => {
    render(<Header />)

    // Simulate scrolling past the 20px threshold
    Object.defineProperty(window, 'scrollY', { value: 25, writable: true })
    window.dispatchEvent(new Event('scroll'))

    const header = document.querySelector('header')!
    await waitFor(() => {
      expect(header.style.WebkitBackdropFilter).toBe('blur(18px) saturate(180%)')
    })
  })

  it('GLAS-03: when scrolled, WebkitBackdropFilter is NOT a CSS variable reference', async () => {
    render(<Header />)

    Object.defineProperty(window, 'scrollY', { value: 25, writable: true })
    window.dispatchEvent(new Event('scroll'))

    const header = document.querySelector('header')!
    await waitFor(() => {
      expect(header.style.WebkitBackdropFilter).not.toContain('var(')
    })
  })

  it('GLAS-03: when scrolled, backdropFilter is the hardcoded blur(16px) saturate(180%) value', async () => {
    render(<Header />)

    Object.defineProperty(window, 'scrollY', { value: 25, writable: true })
    window.dispatchEvent(new Event('scroll'))

    const header = document.querySelector('header')!
    await waitFor(() => {
      expect(header.style.backdropFilter).toBe('blur(16px) saturate(180%)')
    })
  })

  it('GLAS-03: when NOT scrolled, header has no inline backdrop styles', () => {
    render(<Header />)
    // scrollY remains 0 — no scroll event fired
    const header = document.querySelector('header')!
    expect(header.style.WebkitBackdropFilter).toBeFalsy()
    expect(header.style.backdropFilter).toBeFalsy()
  })
})
