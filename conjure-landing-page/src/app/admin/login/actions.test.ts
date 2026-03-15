import { describe, it, expect, vi, beforeEach } from 'vitest'

// These tests will FAIL until Plan 02 creates src/app/admin/login/actions.ts
// That is correct — these are the RED tests for the TDD cycle.

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/session', () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
}))

describe('admin/login/actions.ts — ADMIN-03', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_PASSWORD = 'test-password'
  })

  it('ADMIN-03: login() with correct password calls createSession and redirects to /admin', async () => {
    const { redirect } = await import('next/navigation')
    const { createSession } = await import('@/lib/session')
    // Will throw MODULE_NOT_FOUND in RED state because actions.ts does not exist yet
    const { login } = await import('@/app/admin/login/actions')

    const formData = new FormData()
    formData.append('password', 'test-password')

    await login(undefined, formData)

    expect(createSession).toHaveBeenCalledTimes(1)
    // redirect may throw NEXT_REDIRECT internally in real Next.js — mocked here to be a no-op
    expect(redirect).toHaveBeenCalledWith('/admin')
  })

  it('ADMIN-03: login() with wrong password returns error state, never calls createSession', async () => {
    const { createSession } = await import('@/lib/session')
    // Will throw MODULE_NOT_FOUND in RED state because actions.ts does not exist yet
    const { login } = await import('@/app/admin/login/actions')

    const formData = new FormData()
    formData.append('password', 'wrong-password')

    const result = await login(undefined, formData)

    expect(result).toHaveProperty('error')
    expect(createSession).not.toHaveBeenCalled()
  })
})
