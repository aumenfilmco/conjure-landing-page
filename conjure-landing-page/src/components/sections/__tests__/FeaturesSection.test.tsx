import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeaturesSection } from '../FeaturesSection'

// ─── IntersectionObserver stub ───────────────────────────────────────────────
// Required so the component can import react-intersection-observer without
// jsdom throwing "IntersectionObserver is not defined"
const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}))

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
  mockIntersectionObserver.mockClear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── FLYT-02: Two-column desktop grid with sticky panel ──────────────────────
describe('FLYT-02: Desktop two-column sticky layout', () => {
  it('renders a sticky panel element in the right column', () => {
    const { container } = render(<FeaturesSection />)
    // Expect a sticky element — Wave 1 will add a right-column sticky image panel
    const stickyEl = container.querySelector('[class*="sticky"]')
    expect(stickyEl).not.toBeNull()
  })
})

// ─── FLYT-03: IntersectionObserver called once per feature row ───────────────
describe('FLYT-03: Scroll spy via IntersectionObserver', () => {
  it('instantiates IntersectionObserver exactly 6 times on mount (one per feature row)', () => {
    render(<FeaturesSection />)
    // Wave 1 will call new IntersectionObserver() for each of the 6 feature rows
    expect(mockIntersectionObserver).toHaveBeenCalledTimes(6)
  })
})

// ─── FLYT-04: All 6 images present, active image has opacity-100 ─────────────
describe('FLYT-04: Image panel — all images in DOM, active index controls opacity', () => {
  it('renders all 6 feature images and applies opacity-100 to the active index', () => {
    const { container } = render(<FeaturesSection initialActiveIndex={3} />)
    const images = screen.getAllByRole('img')
    // All 6 images must be in the DOM simultaneously (stacked in the sticky panel)
    expect(images).toHaveLength(6)
    // Image at index 3 must have opacity-100
    const imageWrappers = container.querySelectorAll('[data-testid="feature-image-wrapper"]')
    expect(imageWrappers[3].className).toMatch(/opacity-100/)
    // Image at index 0 must have opacity-0 when it is not active
    expect(imageWrappers[0].className).toMatch(/opacity-0/)
  })
})

// ─── FLYT-05: Active feature row highlighted with text-primary ───────────────
describe('FLYT-05: Active feature row text highlighting', () => {
  it('applies text-primary to active row and text-muted-foreground to all others', () => {
    render(<FeaturesSection initialActiveIndex={2} />)
    const featureRows = screen.getAllByTestId('feature-row')
    // Exactly 6 rows
    expect(featureRows).toHaveLength(6)
    // Active row (index 2) must have text-primary class
    expect(featureRows[2].className).toContain('text-primary')
    // All other rows must have text-muted-foreground class
    const otherIndexes = [0, 1, 3, 4, 5]
    for (const i of otherIndexes) {
      expect(featureRows[i].className).toContain('text-muted-foreground')
    }
  })
})

// ─── FLYT-06: Browser mockup chrome (traffic lights + URL bar) ───────────────
describe('FLYT-06: Browser mockup chrome', () => {
  it('renders three traffic light dots and a URL bar containing conjurestudio.app', () => {
    render(<FeaturesSection />)
    // Three traffic light elements
    const trafficLights = screen.getAllByTestId('traffic-light')
    expect(trafficLights).toHaveLength(3)
    // URL bar text
    expect(screen.getByText(/conjurestudio\.app/)).toBeInTheDocument()
  })
})

// ─── FLYT-07: Mobile layout stack ────────────────────────────────────────────
describe('FLYT-07: Mobile layout — stacked feature cards', () => {
  it('renders a mobile container with all 6 feature titles inside it', () => {
    const { container } = render(<FeaturesSection />)
    // A mobile-only container (md:hidden) must exist
    const mobileStack = container.querySelector('[data-testid="features-mobile-stack"]')
    expect(mobileStack).not.toBeNull()
    // All 6 feature titles must be rendered within the mobile container
    const featureTitles = [
      'Shot Extraction',
      'Character Intelligence',
      'Location Intelligence',
      'Component Assembly',
      'Camera Package Presets',
      'One-Click Deck Export',
    ]
    for (const title of featureTitles) {
      expect(mobileStack!.textContent).toContain(title)
    }
  })
})
