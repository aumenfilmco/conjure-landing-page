'use client'
import { useFadeIn } from '@/hooks/useFadeIn'

export function FadeInWrapper({ children }: { children: React.ReactNode }) {
  const ref = useFadeIn<HTMLDivElement>()
  return (
    <div ref={ref} className="fade-in-section">
      {children}
    </div>
  )
}
