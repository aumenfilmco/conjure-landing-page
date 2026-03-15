import { describe, it, expect, beforeAll } from 'vitest'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// These tests will FAIL until Plan 02 creates src/lib/session.ts
// That is correct — these are the RED tests for the TDD cycle.

describe('session.ts — ADMIN-01', () => {
  it('ADMIN-01: session.ts exports encrypt, decrypt, createSession, deleteSession', async () => {
    // Will throw MODULE_NOT_FOUND in RED state because session.ts does not exist yet
    const mod = await import('@/lib/session')
    expect(typeof mod.encrypt).toBe('function')
    expect(typeof mod.decrypt).toBe('function')
    expect(typeof mod.createSession).toBe('function')
    expect(typeof mod.deleteSession).toBe('function')
  })

  it('ADMIN-01: decrypt(undefined) returns null', async () => {
    const { decrypt } = await import('@/lib/session')
    const result = await decrypt(undefined as unknown as string)
    expect(result).toBeNull()
  })

  describe('ADMIN-01: decrypt(validToken) returns payload', () => {
    beforeAll(() => {
      process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-bytes-long'
    })

    it('ADMIN-01: encrypt then decrypt roundtrip returns { authenticated: true }', async () => {
      const { encrypt, decrypt } = await import('@/lib/session')
      const token = await encrypt({ authenticated: true })
      const payload = await decrypt(token)
      expect(payload).toMatchObject({ authenticated: true })
    })
  })
})
