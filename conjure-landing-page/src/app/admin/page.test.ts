import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// These tests will FAIL until Plan 02 creates src/app/admin/page.tsx and proxy.ts
// That is correct — these are the RED tests for the TDD cycle.

describe('admin/page.tsx — ADMIN-02, ADMIN-04, ADMIN-05', () => {
  const adminPagePath = path.resolve(__dirname, 'page.tsx')
  // proxy.ts is at conjure-landing-page/ root: four levels up from src/app/admin/
  const proxyPath = path.resolve(__dirname, '../../../../proxy.ts')

  it('ADMIN-02: admin/page.tsx re-verifies session via decrypt() — CVE-2025-29927 mitigation', () => {
    // Will throw ENOENT in RED state because admin/page.tsx does not exist yet
    const source = fs.readFileSync(adminPagePath, 'utf-8')
    expect(source).toContain('await decrypt(')
    expect(source).toContain("redirect('/admin/login')")
  })

  it('ADMIN-04/05: admin/page.tsx queries waitlist table ordered newest-first', () => {
    const source = fs.readFileSync(adminPagePath, 'utf-8')
    expect(source).toContain("from('waitlist')")
    expect(source).toContain('ascending: false')
  })

  it('ADMIN-05: admin/page.tsx shows total signup count', () => {
    const source = fs.readFileSync(adminPagePath, 'utf-8')
    expect(source).toContain('.length')
  })

  it('ADMIN-02: proxy.ts redirects /admin requests without valid session cookie', () => {
    // Will throw ENOENT in RED state because proxy.ts does not exist yet
    const source = fs.readFileSync(proxyPath, 'utf-8')
    expect(source).toContain("startsWith('/admin')")
    expect(source).toContain('admin_session')
    expect(source).toContain('redirect')
  })
})
