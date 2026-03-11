// src/components/providers/PostHogProvider.tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // posthog-js handles multiple init() calls gracefully — subsequent calls
    // with the same key are no-ops. useEffect [] ensures single init per mount.
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host:          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      capture_pageview:  false,  // manual $pageview — do NOT set true
      capture_pageleave: true,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
