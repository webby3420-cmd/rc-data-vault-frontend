"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'

type ViewedItem = {
  canonicalPath: string
  fullName: string
  manufacturerName: string
}

const STORAGE_KEY = 'rcdv_recently_viewed'
const MAX_ITEMS = 6

type Props = {
  canonicalPath: string
  fullName: string
  manufacturerName: string
}

export function RecentlyViewedVariants({ canonicalPath, fullName, manufacturerName }: Props) {
  const [items, setItems] = useState<ViewedItem[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const existing: ViewedItem[] = raw ? JSON.parse(raw) : []

      const next: ViewedItem = { canonicalPath, fullName, manufacturerName }
      const merged = [next, ...existing.filter(i => i.canonicalPath !== canonicalPath)].slice(0, MAX_ITEMS)

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      setItems(merged)
    } catch {}
  }, [canonicalPath, fullName, manufacturerName])

  const visible = items.filter(i => i.canonicalPath !== canonicalPath).slice(0, 4)

  if (!visible.length) return null

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-4 text-base font-semibold text-white">Recently viewed</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map(item => (
          <Link
            key={item.canonicalPath}
            href={item.canonicalPath}
            className="rounded-xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-600"
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
    </section>
  )
}
