import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const source = fs.readFileSync(
  path.resolve(__dirname, './page.tsx'),
  'utf-8'
)

describe('page.tsx — FLYT-01: FeaturesSection must not be wrapped in FadeInWrapper', () => {
  it('FLYT-01: FeaturesSection is NOT immediately inside a FadeInWrapper', () => {
    // Assert the pattern <FadeInWrapper ...>...<FeaturesSection does NOT exist
    // Whitespace-flexible: allows up to 50 chars between opening tag and FeaturesSection
    expect(source).not.toMatch(/<FadeInWrapper[^>]*>[\s\S]{0,50}<FeaturesSection/)
  })
})
