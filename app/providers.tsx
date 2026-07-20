'use client'

import { PostHogProvider } from 'posthog-js/react'
import type { ReactNode } from 'react'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

export function Providers({ children }: { children: ReactNode }) {
  if (!posthogKey) {
    return <>{children}</>
  }

  return (
    <PostHogProvider
      apiKey={posthogKey}
      options={{ api_host: posthogHost, defaults: '2025-05-24' }}
    >
      {children}
    </PostHogProvider>
  )
}
