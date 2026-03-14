'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { HERO } from '@/lib/content'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        isScrolled
          ? {
              backgroundColor: 'oklch(0.14 0 0 / 0.45)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(18px) saturate(180%)',
              borderBottom: '1px solid oklch(0.98 0 0 / 0.12)',
            }
          : {}
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-3 md:py-4 flex items-center justify-center md:justify-between">
        {/* Logo */}
        <a href="/">
          <Image
            src="/conjure-wordmark.png"
            alt="Conjure"
            width={795}
            height={150}
            className="h-6 w-auto"
          />
        </a>

        {/* Primary CTA — same label as hero per CONTEXT.md */}
        <a
          href={HERO.CTA_URL}
          className="hidden md:inline-flex bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {HERO.CTA_PRIMARY}
        </a>
      </div>
    </header>
  )
}
