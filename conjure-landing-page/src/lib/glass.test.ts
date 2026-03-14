import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const css = fs.readFileSync(
  path.resolve(__dirname, '../app/globals.css'),
  'utf-8'
)

describe('globals.css glass-surface', () => {
  // ── GLAS-01: Noise layer must exist ──────────────────────────────────────
  it('GLAS-01: .glass-surface::before block exists with SVG feTurbulence noise', () => {
    expect(css).toContain('.glass-surface::before')
    expect(css).toContain('data:image/svg+xml')
    expect(css).toContain('feTurbulence')
  })

  it('GLAS-01: .glass-surface::before has opacity property (0.03–0.05 range)', () => {
    // The noise layer must have an opacity property to control visibility
    // We assert the property exists somewhere inside the ::before block
    // Acceptable values: 0.03, 0.04, 0.05
    expect(css).toMatch(/\.glass-surface::before[\s\S]*?opacity:\s*0\.0[345]/)
  })

  // ── GLAS-02: Safari -webkit-backdrop-filter must use hardcoded px value ──
  it('GLAS-02: .glass-surface has -webkit-backdrop-filter with literal blur(18px), not var()', () => {
    expect(css).toContain('-webkit-backdrop-filter: blur(18px)')
    expect(css).not.toContain('-webkit-backdrop-filter: blur(var(--glass-blur))')
  })

  // ── GLAS-04: @supports guard must wrap backdrop-filter ───────────────────
  it('GLAS-04: globals.css contains @supports (backdrop-filter: blur(1px)) block', () => {
    expect(css).toContain('@supports (backdrop-filter: blur(1px))')
  })

  it('GLAS-04: base .glass-surface rule (outside @supports) has high-opacity solid background fallback', () => {
    // Outside @supports, glass-surface must provide an opaque fallback
    // so browsers without backdrop-filter still look readable.
    // Assert oklch with opacity >= 0.90
    expect(css).toMatch(/oklch\(0\.1[0-9] 0 0 \/ 0\.9[0-9]\)/)
  })

  // ── GLAS-05: Unprefixed backdrop-filter must be hardcoded, not a var() ───
  it('GLAS-05: .glass-surface has backdrop-filter with hardcoded blur(16px) saturate(180%)', () => {
    expect(css).toContain('backdrop-filter: blur(16px) saturate(180%)')
  })

  it('GLAS-05: .glass-surface border-top-color uses opacity 0.32 (not 0.22)', () => {
    // Extract the .glass-surface block (up through the border-top-color line) to scope the assertion.
    // The hover shadow legitimately uses 0.22 for the rim highlight — the full-file scan is too broad.
    const glassSurfaceBlock = css.match(/\.glass-surface\s*\{[\s\S]*?border-top-color:[^;]+/)?.[0] ?? ''
    expect(glassSurfaceBlock).not.toBe('')   // block must be found
    expect(glassSurfaceBlock).toContain('0.32')
    // Confirm 0.22 does not appear in the border-top-color portion of the block
    expect(glassSurfaceBlock).not.toContain('0.22')
  })
})
