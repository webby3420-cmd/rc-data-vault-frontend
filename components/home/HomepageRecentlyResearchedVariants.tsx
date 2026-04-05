'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getRecentlyViewed, type RecentlyViewedItem } from '@/lib/recentlyViewed'

export function HomepageRecentlyResearchedVariants() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    setItems(getRecentlyViewed().slice(0, 4))
  }, [])

  if (!items.length) return null

  return (
    <section className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-base font-semibold text-white">Recently researched</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(item => (
            <Link
              key={item.canonicalPath}
              href={item.canonicalPath}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4 transition hover:border-slate-500"
            >
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.manufacturerName}
              </div>
              <div className="mt-1 text-sm font-medium text-white leading-5">
                {item.fullName}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
