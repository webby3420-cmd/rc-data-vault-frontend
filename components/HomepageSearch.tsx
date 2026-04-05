'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  variant_id: string
  full_name: string
  manufacturer_name: string
  canonical_path: string
  price_mid: number | null
}

function formatPrice(value: number | null): string {
  if (value == null) return ''
  return '$' + Math.round(value).toLocaleString('en-US')
}

export default function HomepageSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const json = await res.json()
        setResults(json.results ?? [])
        setOpen(true)
      } catch {
        setResults([])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery('')
    router.push(result.canonical_path)
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl text-left">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search any RC vehicle — e.g. Traxxas X-Maxx, ARRMA Kraton…"
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3.5 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          autoComplete="off"
          spellCheck={false}
        />
        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
          {results.map((r) => (
            <li key={r.variant_id}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-800"
              >
                <div>
                  <div className="text-sm font-medium text-white">{r.full_name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{r.manufacturer_name}</div>
                </div>
                {r.price_mid != null && (
                  <div className="ml-4 flex-shrink-0 text-sm font-semibold text-amber-400">
                    ~{formatPrice(r.price_mid)}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-400 shadow-xl">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
