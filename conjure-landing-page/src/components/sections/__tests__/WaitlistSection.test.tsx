import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WAITLIST } from '@/lib/content'

vi.mock('posthog-js', () => ({
  default: { capture: vi.fn() },
}))

import posthog from 'posthog-js'
import { WaitlistSection } from '@/components/sections/WaitlistSection'

beforeEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('WaitlistSection — form fields', () => {
  it('renders email input as required', () => {
    render(<WaitlistSection />)
    const emailInput = screen.getByPlaceholderText(WAITLIST.EMAIL_PLACEHOLDER)
    expect(emailInput).toBeRequired()
  })

  it('renders name input as not required', () => {
    render(<WaitlistSection />)
    const nameInput = screen.getByPlaceholderText(WAITLIST.NAME_PLACEHOLDER)
    expect(nameInput).not.toBeRequired()
  })

  it('submit button has correct label', () => {
    render(<WaitlistSection />)
    expect(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL })).toBeInTheDocument()
  })
})

describe('WaitlistSection — submit states', () => {
  it('disables submit button while submitting', async () => {
    let resolveFetch!: (v: Response) => void
    const fetchPromise = new Promise<Response>((res) => { resolveFetch = res })
    vi.spyOn(global, 'fetch').mockReturnValueOnce(fetchPromise)

    render(<WaitlistSection />)
    fireEvent.change(screen.getByPlaceholderText(WAITLIST.EMAIL_PLACEHOLDER), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL })).toBeDisabled()
    })

    resolveFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }))
  })

  it('shows success message on 200 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    render(<WaitlistSection />)
    fireEvent.change(screen.getByPlaceholderText(WAITLIST.EMAIL_PLACEHOLDER), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL }))
    await waitFor(() => expect(screen.getByText(WAITLIST.SUCCESS_MESSAGE)).toBeInTheDocument())
  })

  it('shows error message on 4xx response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'bad request' }), { status: 400 })
    )
    render(<WaitlistSection />)
    fireEvent.change(screen.getByPlaceholderText(WAITLIST.EMAIL_PLACEHOLDER), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL }))
    await waitFor(() => expect(screen.getByText(WAITLIST.ERROR_MESSAGE)).toBeInTheDocument())
  })

  it('fires waitlist_form_submitted with email_domain and has_name on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    render(<WaitlistSection />)
    fireEvent.change(screen.getByPlaceholderText(WAITLIST.EMAIL_PLACEHOLDER), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL }))
    await waitFor(() =>
      expect(posthog.capture).toHaveBeenCalledWith('waitlist_form_submitted', {
        email_domain: 'example.com',
        has_name: false,
      })
    )
  })

  it('fires waitlist_form_error with error_type on network error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('network'))
    render(<WaitlistSection />)
    fireEvent.change(screen.getByPlaceholderText(WAITLIST.EMAIL_PLACEHOLDER), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL }))
    await waitFor(() =>
      expect(posthog.capture).toHaveBeenCalledWith('waitlist_form_error', { error_type: 'network' })
    )
  })

  it('calls fetch with WAITLIST.ENDPOINT', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    render(<WaitlistSection />)
    fireEvent.change(screen.getByPlaceholderText(WAITLIST.EMAIL_PLACEHOLDER), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: WAITLIST.SUBMIT_LABEL }))
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(WAITLIST.ENDPOINT, expect.any(Object)))
  })
})
