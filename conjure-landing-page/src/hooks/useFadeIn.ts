'use client'
import { useEffect, useRef } from 'react'

/**
 * useFadeIn — attaches IntersectionObserver to ref element.
 * Adds 'visible' class when element enters viewport (threshold 0.1).
 * Element must have .fade-in-section class in globals.css for the transition to work.
 * Cleans up observer on unmount.
 */
export function useFadeIn<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
