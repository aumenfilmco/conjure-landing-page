'use client'
import { useEffect, useState } from 'react'
import { HERO } from '@/lib/content'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel')
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        isScrolled
          ? {
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              borderBottom: '1px solid var(--glass-border)',
            }
          : {}
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo wordmark */}
        <a
          href="/"
          className="font-mono text-foreground font-medium tracking-widest text-sm uppercase"
        >
          Conjure
        </a>

        {/* Primary CTA — same label as hero per CONTEXT.md */}
        <a
          href={HERO.CTA_URL}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {HERO.CTA_PRIMARY}
        </a>
      </div>
    </header>
  )
}
