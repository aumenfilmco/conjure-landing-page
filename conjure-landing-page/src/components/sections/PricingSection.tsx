'use client'
import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { PRICING } from '@/lib/content'

// checkoutUrls type mirrors what env.ts exports — passed as prop from Server Component
type CheckoutUrls = {
  scout: string
  director: string
  producer: string
  studio: string
}

interface PricingSectionProps {
  checkoutUrls: CheckoutUrls
}

export function PricingSection({ checkoutUrls }: PricingSectionProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const sectionRef = useRef<HTMLElement>(null)
  const viewedRef = useRef(false)

  // PRICE-05: fire pricing_tier_viewed once per page load on scroll into view
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          posthog.capture('pricing_tier_viewed')
          viewedRef.current = true
          observer.unobserve(el) // belt + suspenders
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const tierCheckoutUrl = (id: string) =>
    checkoutUrls[id as keyof CheckoutUrls] ?? PRICING.TRIAL_URL

  return (
    <section ref={sectionRef} className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl text-center mb-4">
        Simple pricing
      </h2>

      {/* Monthly/Annual toggle — PRICE-02 */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm ${billing === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={billing === 'annual'}
          aria-label={billing === 'monthly' ? 'Switch to Annual' : 'Switch to Monthly'}
          onClick={() => setBilling((b) => (b === 'monthly' ? 'annual' : 'monthly'))}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'background 200ms',
            background: billing === 'annual' ? 'oklch(0.92 0.18 142)' : 'oklch(0.17 0 0)',
            border: billing === 'annual' ? 'none' : '1px solid oklch(0.27 0 0)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: billing === 'annual' ? '22px' : '2px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              transition: 'left 200ms',
              background: billing === 'annual' ? 'oklch(0.10 0 0)' : 'oklch(0.95 0 0)',
            }}
          />
          <span className="sr-only">
            {billing === 'annual' ? 'Annual billing active' : 'Monthly billing active'}
          </span>
        </button>
        <span className={`text-sm ${billing === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Annual
        </span>
      </div>

      {/* 4 Tier cards — PRICE-01, PRICE-03 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {PRICING.TIERS.map((tier) => {
          const isDirector = tier.id === 'director'
          const displayPrice = billing === 'monthly' ? tier.monthlyPrice : tier.annualMonthly

          return (
            <div key={tier.id} className="relative pt-3">
              {/* Most popular badge — outside glass card so overflow:hidden doesn't clip it */}
              {isDirector && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-mono px-3 py-0.5 rounded-full z-10">
                  Most popular
                </span>
              )}
            <div
              className={`glass-surface rounded-xl p-6 flex flex-col gap-4${
                isDirector ? ' border-primary' : ''
              }`}
              style={isDirector ? { borderColor: 'var(--color-primary)', borderWidth: '2px' } : {}}
            >

              {/* Tier name */}
              <h3 className="font-mono text-sm tracking-widest text-muted-foreground uppercase">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-foreground text-4xl font-sans font-medium">
                  ${displayPrice}
                </span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>

              {/* Annual total (annual view only) */}
              {billing === 'annual' && (
                <p className="text-muted-foreground text-xs">
                  billed ${tier.annualPrice}/yr
                </p>
              )}

              {/* Tier details */}
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>{tier.credits} credits/mo</li>
                <li>{tier.projects} projects</li>
                <li>{tier.seats === 1 ? '1 seat' : `${'seatsLabel' in tier ? tier.seatsLabel : tier.seats} seats`}</li>
              </ul>

              {/* CTA — PRICE-03, PRICE-06 */}
              <a
                href="#waitlist"
                onClick={() =>
                  posthog.capture('cta_clicked', {
                    cta_label: `Join waitlist — ${tier.name}`,
                    section: 'pricing',
                  })
                }
                className="mt-auto inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Join the waitlist
              </a>
            </div>
            </div>
          )
        })}
      </div>

      {/* Trial block — PRICE-04 */}
      <div className="glass-surface rounded-xl p-8 text-center max-w-md mx-auto flex flex-col gap-4">
        <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase">
          {PRICING.TRIAL_DURATION}
        </p>
        <p className="text-foreground text-lg font-sans font-medium">
          Try Conjure free
        </p>
        <p className="text-muted-foreground text-sm">{PRICING.TRIAL_NOTE}</p>
        <a
          href={PRICING.TRIAL_URL}
          onClick={() =>
            posthog.capture('cta_clicked', {
              cta_label: PRICING.TRIAL_CTA,
              section: 'pricing',
            })
          }
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {PRICING.TRIAL_CTA}
        </a>
      </div>
    </section>
  )
}
