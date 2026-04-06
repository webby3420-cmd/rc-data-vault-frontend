'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function BfcacheReload() {
  const pathname = usePathname()

  useEffect(() => {
    // Only apply bfcache reload fix on variant/family/manufacturer pages.
    // The homepage does not need this and reloading it on bfcache restore
    // causes an infinite reload loop in Chrome.
    if (!pathname.startsWith('/rc/')) return

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload()
      }
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [pathname])

  return null
}
