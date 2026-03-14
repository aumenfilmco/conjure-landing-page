'use client'

import Image from 'next/image'
import posthog from 'posthog-js'
import { HERO } from '@/lib/content'

// ─── Floating icon SVGs ───────────────────────────────────────────────────────

const ScriptIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const PinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const SlidesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
)

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

// ─── Icon data ────────────────────────────────────────────────────────────────

const LEFT_ITEMS = [
  { label: 'Script',     Icon: ScriptIcon, bg: 'oklch(0.18 0.06 260 / 0.9)', color: 'oklch(0.72 0.10 260)' },
  { label: 'Characters', Icon: PersonIcon, bg: 'oklch(0.18 0.07 30  / 0.9)', color: 'oklch(0.72 0.14 30)'  },
  { label: 'Locations',  Icon: PinIcon,    bg: 'oklch(0.18 0.06 200 / 0.9)', color: 'oklch(0.72 0.10 200)' },
] as const

const RIGHT_ITEMS = [
  { label: 'Slides',  Icon: SlidesIcon, bg: 'oklch(0.18 0.08 55  / 0.9)', color: 'oklch(0.78 0.14 55)'  },
  { label: 'Camera',  Icon: CameraIcon, bg: 'oklch(0.18 0.06 220 / 0.9)', color: 'oklch(0.72 0.10 220)' },
  { label: 'Export',  Icon: CheckIcon,  bg: 'oklch(0.18 0.10 142 / 0.9)', color: 'oklch(0.92 0.18 142)' },
] as const

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section className="pt-36 pb-20 px-6 relative overflow-hidden">

      {/* Centered text block */}
      <div className="max-w-3xl mx-auto text-center mb-14">

        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 text-sm text-muted-foreground mb-8 backdrop-blur-sm">
          <span className="text-primary text-xs">✦</span>
          <span>{HERO.BADGE}</span>
        </div>

        {/* Headline */}
        <h1 className="text-foreground font-sans font-medium tracking-tight text-4xl lg:text-[3.25rem] leading-[1.1] mb-6">
          <span className="block">Direct the shot.</span>
          <span className="block">Not the prompt.</span>
        </h1>

        {/* Subhead */}
        <p className="text-muted-foreground text-lg lg:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          {HERO.SUBHEAD}
        </p>

        {/* Single CTA */}
        <a
          href={HERO.CTA_WAITLIST_URL}
          onClick={() =>
            posthog.capture('cta_clicked', {
              cta_label: HERO.CTA_WAITLIST,
              section: 'hero',
            })
          }
          className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-base font-semibold hover:opacity-90 transition-opacity"
        >
          {HERO.CTA_WAITLIST}
          <ArrowIcon />
        </a>
      </div>

      {/* Mockup stage with floating icon rails */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-stretch">

          {/* Left rail */}
          <div className="hidden lg:flex flex-col justify-around w-32 flex-shrink-0 py-6">
            {LEFT_ITEMS.map(({ label, Icon, bg, color }) => (
              <div key={label} className="flex items-center">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10"
                  style={{ background: bg, color }}
                  title={label}
                >
                  <Icon />
                </div>
                {/* Connecting line — fades toward mockup */}
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(to right, oklch(0.27 0 0), oklch(0.27 0 0 / 0.3))' }}
                />
              </div>
            ))}
          </div>

          {/* Browser chrome mockup */}
          <div className="flex-1 relative min-w-0">
            {/* Ambient glow */}
            <div
              className="absolute inset-0 -z-10 blur-3xl scale-90"
              style={{ background: 'radial-gradient(ellipse at center, oklch(0.92 0.18 142 / 0.18) 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <div className="rounded-xl overflow-hidden border border-border">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary">
                <span className="w-3 h-3 rounded-full bg-destructive opacity-70" />
                <span className="w-3 h-3 rounded-full bg-[oklch(0.75_0.15_82)] opacity-70" />
                <span className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_145)] opacity-70" />
                <div className="ml-3 flex-1 bg-background rounded px-3 py-1 text-xs font-mono text-muted-foreground">
                  conjurestudio.app
                </div>
              </div>
              {/* Screenshot */}
              <div className="relative bg-secondary">
                <Image
                  src="/hero-screenshot.webp"
                  alt="Conjure storyboard deck — beach proposal, golden hour, branded Google Slides export"
                  width={2984}
                  height={1865}
                  priority
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="hidden lg:flex flex-col justify-around w-32 flex-shrink-0 py-6">
            {RIGHT_ITEMS.map(({ label, Icon, bg, color }) => (
              <div key={label} className="flex items-center">
                {/* Connecting line — fades toward mockup */}
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(to left, oklch(0.27 0 0), oklch(0.27 0 0 / 0.3))' }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10"
                  style={{ background: bg, color }}
                  title={label}
                >
                  <Icon />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Sentinel for header glass effect */}
      <div id="hero-sentinel" aria-hidden="true" />
    </section>
  )
}
