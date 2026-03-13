'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { FEATURES } from '@/lib/content'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureItem {
  key: string
  TITLE: string
  OUTCOME: string
  img: string
  w: number
  h: number
}

interface FeatureRowProps {
  feature: FeatureItem
  index: number
  activeIndex: number
  onActivate: (index: number) => void
}

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURE_LIST: FeatureItem[] = [
  { key: 'shot_extraction',        TITLE: FEATURES.SHOT_EXTRACTION.TITLE,        OUTCOME: FEATURES.SHOT_EXTRACTION.OUTCOME,        img: '/feature-shot-extraction.webp',       w: 1200, h: 450 },
  { key: 'character_intelligence', TITLE: FEATURES.CHARACTER_INTELLIGENCE.TITLE,  OUTCOME: FEATURES.CHARACTER_INTELLIGENCE.OUTCOME,  img: '/feature-character-extraction.webp',  w: 800,  h: 600 },
  { key: 'location_intelligence',  TITLE: FEATURES.LOCATION_INTELLIGENCE.TITLE,   OUTCOME: FEATURES.LOCATION_INTELLIGENCE.OUTCOME,   img: '/feature-location-extraction.webp',   w: 800,  h: 600 },
  { key: 'component_assembly',     TITLE: FEATURES.COMPONENT_ASSEMBLY.TITLE,      OUTCOME: FEATURES.COMPONENT_ASSEMBLY.OUTCOME,      img: '/feature-components.webp',            w: 800,  h: 600 },
  { key: 'camera_presets',         TITLE: FEATURES.CAMERA_PRESETS.TITLE,          OUTCOME: FEATURES.CAMERA_PRESETS.OUTCOME,          img: '/feature-camera-package.webp',        w: 800,  h: 600 },
  { key: 'slides_export',          TITLE: FEATURES.SLIDES_EXPORT.TITLE,           OUTCOME: FEATURES.SLIDES_EXPORT.OUTCOME,           img: '/feature-slides-export.webp',         w: 1200, h: 450 },
]

// ─── BrowserMockup ────────────────────────────────────────────────────────────

function BrowserMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 h-8 bg-[oklch(0.12_0_0)] border-b border-border">
        {/* Traffic lights */}
        <span data-testid="traffic-light" className="w-3 h-3 rounded-full bg-[#FF5F56]" aria-hidden="true" />
        <span data-testid="traffic-light" className="w-3 h-3 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
        <span data-testid="traffic-light" className="w-3 h-3 rounded-full bg-[#27C93F]" aria-hidden="true" />
        {/* URL bar */}
        <div className="flex-1 mx-3 h-5 rounded bg-[oklch(0.18_0_0)] flex items-center px-2">
          <span className="text-[10px] text-muted-foreground font-mono truncate">conjurestudio.app</span>
        </div>
      </div>
      {/* Screenshot area */}
      <div className="relative bg-background">{children}</div>
    </div>
  )
}

// ─── FeatureRow ───────────────────────────────────────────────────────────────
// Uses native IntersectionObserver (one instance per row) for scroll-spy.
// react-intersection-observer pools observers by options key, so it would create
// only 1 native IO instance for all 6 rows — tests require exactly 6.

function FeatureRow({ feature, index, activeIndex, onActivate }: FeatureRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rowRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onActivate(index)
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [index, onActivate])

  const isActive = activeIndex === index

  return (
    <div
      ref={rowRef}
      data-testid="feature-row"
      className={isActive ? 'text-primary' : 'text-muted-foreground'}
    >
      <h3 className={`font-sans font-medium text-xl mb-3 ${isActive ? 'text-foreground' : ''}`}>
        {feature.TITLE}
      </h3>
      <p className="text-sm leading-relaxed">{feature.OUTCOME}</p>
    </div>
  )
}

// ─── FeaturesSection ──────────────────────────────────────────────────────────

interface FeaturesSectionProps {
  initialActiveIndex?: number
}

export function FeaturesSection({ initialActiveIndex = 0 }: FeaturesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex)

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl text-center mb-16">
        What you get
      </h2>

      {/* Desktop: two-column grid — hidden on mobile */}
      {/* NOTE: no overflow-hidden here — would break position:sticky on right panel */}
      <div data-testid="features-desktop-grid" className="hidden md:grid md:grid-cols-2 md:gap-16 md:items-start">
        {/* Left: scrollable feature rows */}
        <div className="flex flex-col gap-24">
          {FEATURE_LIST.map((feature, i) => (
            <FeatureRow
              key={feature.key}
              feature={feature}
              index={i}
              activeIndex={activeIndex}
              onActivate={setActiveIndex}
            />
          ))}
        </div>

        {/* Right: sticky browser mockup panel */}
        <div className="sticky top-24 z-10">
          <BrowserMockup>
            {/* Crossfade image stack — all 6 images always in DOM */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-b-lg">
              {FEATURE_LIST.map((feature, i) => (
                <div
                  key={feature.key}
                  data-testid="feature-image-wrapper"
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    i === activeIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={feature.img}
                    alt={feature.TITLE}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          </BrowserMockup>
        </div>
      </div>

      {/* Mobile: stacked single-column */}
      <div data-testid="features-mobile-stack" className="md:hidden flex flex-col gap-16">
        {FEATURE_LIST.map((feature) => (
          <div key={feature.key} className="flex flex-col gap-6">
            <div>
              <h3 className="text-foreground font-sans font-medium text-lg mb-2">{feature.TITLE}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.OUTCOME}</p>
            </div>
            {/* aria-hidden: desktop panel images are the primary accessible image set */}
            <div aria-hidden="true">
              <Image
                src={feature.img}
                alt=""
                width={feature.w}
                height={feature.h}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
