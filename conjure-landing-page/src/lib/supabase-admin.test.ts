import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// These tests will FAIL until Plan 02 creates src/lib/supabase-admin.ts
// That is correct — these are the RED tests for the TDD cycle.

describe('supabase-admin.ts — ADMIN-04', () => {
  const supabaseAdminPath = path.resolve(__dirname, 'supabase-admin.ts')

  it('ADMIN-04: supabase-admin.ts contains import "server-only" at top', () => {
    // Will throw ENOENT in RED state because supabase-admin.ts does not exist yet
    const source = fs.readFileSync(supabaseAdminPath, 'utf-8')
    expect(source).toContain("import 'server-only'")
  })

  it('ADMIN-04: supabase-admin.ts disables Supabase auth persistence', () => {
    const source = fs.readFileSync(supabaseAdminPath, 'utf-8')
    expect(source).toContain('persistSession: false')
    expect(source).toContain('autoRefreshToken: false')
  })

  it('ADMIN-04: supabase-admin.ts does not export SUPABASE_SERVICE_ROLE_KEY as a string literal', () => {
    const source = fs.readFileSync(supabaseAdminPath, 'utf-8')
    expect(source).not.toMatch(/export.*SUPABASE_SERVICE_ROLE_KEY/)
  })
})
