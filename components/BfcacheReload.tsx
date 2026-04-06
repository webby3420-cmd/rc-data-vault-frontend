'use client'

import { useEffect } from 'react'

export default function BfcacheReload() {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return
      // Only reload on RC content pages — never on homepage or other routes
      if (!window.location.pathname.startsWith('/rc/')) return
      window.location.reload()
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  return null
}
