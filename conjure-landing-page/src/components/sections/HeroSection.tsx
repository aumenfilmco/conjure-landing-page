'use client'

import Image from 'next/image'
import posthog from 'posthog-js'
import { HERO } from '@/lib/content'

export function HeroSection() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column: headline + subhead + CTA */}
        <div className="flex flex-col gap-8">
          <h1 className="text-foreground font-sans font-medium tracking-tight text-4xl lg:text-5xl">
            {HERO.HEADLINE}
          </h1>
          <p className="text-muted-foreground text-lg">
            {HERO.SUBHEAD}
          </p>
          <a
            href={HERO.CTA_URL}
            onClick={() =>
              posthog.capture('cta_clicked', {
                cta_label: HERO.CTA_PRIMARY,
                section: 'hero',
              })
            }
            className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity self-start"
          >
            {HERO.CTA_PRIMARY}
          </a>
        </div>

        {/* Right column: browser chrome mockup */}
        <div className="rounded-lg overflow-hidden border border-border">
          {/* Chrome bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-secondary">
            <span className="w-3 h-3 rounded-full bg-destructive opacity-70" />
            <span className="w-3 h-3 rounded-full bg-[oklch(0.75_0.15_82)] opacity-70" />
            <span className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_145)] opacity-70" />
            <div className="ml-3 flex-1 bg-background rounded px-3 py-1 text-xs font-mono text-muted-foreground">
              conjurestudio.app
            </div>
          </div>
          {/* Screenshot body */}
          <div className="relative bg-secondary">
            <Image
              src="/hero-screenshot.webp"
              alt="Conjure storyboard deck — beach proposal, golden hour, branded Google Slides export"
              width={2984}
              height={1865}
              priority
              className="w-full h-auto rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* Sentinel element for Header Intersection Observer (Wave 3 dependency) */}
      <div id="hero-sentinel" aria-hidden="true" />
    </section>
  )
}
