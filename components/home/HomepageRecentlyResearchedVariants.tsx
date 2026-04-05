"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getRecentlyViewed, type ViewedItem } from '@/lib/recentlyViewed'

export function HomepageRecentlyResearchedVariants() {
  const [items, setItems] = useState<ViewedItem[]>([])

  useEffect(() => {
    const data = getRecentlyViewed()
    setItems(data.slice(0, 6))
  }, [])

  if (items.length < 2) return null

  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Recently researched
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Link
              key={item.canonicalPath}
              href={item.canonicalPath}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600"
            >
              <div className="text-xs text-slate-500 uppercase">
                {item.manufacturerName}
              </div>
              <div className="text-sm text-white mt-1">
                {item.fullName}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
