'use client'
import { useState } from 'react'
import posthog from 'posthog-js'
import { WAITLIST } from '@/lib/content'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')

    try {
      const res = await fetch(WAITLIST.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...(name ? { name } : {}) }),
      })

      if (res.ok) {
        setFormState('success')
        posthog.capture('waitlist_form_submitted', {
          email_domain: email.split('@')[1],
          has_name: Boolean(name),
        })
      } else {
        const data = await res.json().catch(() => ({}))
        setFormState('error')
        posthog.capture('waitlist_form_error', {
          error_type: (data as { error?: string }).error ?? `http_${res.status}`,
        })
      }
    } catch {
      setFormState('error')
      posthog.capture('waitlist_form_error', { error_type: 'network' })
    }
  }

  return (
    <section className="py-24 px-6 max-w-lg mx-auto text-center" id="waitlist">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl mb-4">
        {WAITLIST.HEADING}
      </h2>
      <p className="text-muted-foreground text-base mb-10">
        {WAITLIST.SUBHEAD}
      </p>

      {formState === 'success' ? (
        <div className="glass-surface rounded-xl p-8">
          <p className="text-foreground text-base">{WAITLIST.SUCCESS_MESSAGE}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-surface rounded-xl p-8 flex flex-col gap-4">
          <input
            type="text"
            placeholder={WAITLIST.NAME_PLACEHOLDER}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:border-ring"
          />
          <input
            type="email"
            placeholder={WAITLIST.EMAIL_PLACEHOLDER}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:border-ring"
          />
          {formState === 'error' && (
            <p className="text-destructive text-sm text-left">{WAITLIST.ERROR_MESSAGE}</p>
          )}
          <button
            type="submit"
            disabled={formState !== 'idle'}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {WAITLIST.SUBMIT_LABEL}
          </button>
        </form>
      )}
    </section>
  )
}
