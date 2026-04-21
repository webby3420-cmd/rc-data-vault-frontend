'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { trackSearchEvent, logSearchPerformed, logSearchClick, logZeroResults } from '@/lib/telemetry/search'
import ZeroResultRecovery, { type ZeroResultSuggestion } from '@/components/search/ZeroResultRecovery'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  const [suggestions, setSuggestions] = useState<ZeroResultSuggestion[]>([])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const lastResolvedQueryRef = useRef('')
  const zeroResultTrackedForQueryRef = useRef<string | null>(null)
  const searchRequestIdRef = useRef('')
  const searchStartRef = useRef(0)

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
      lastResolvedQueryRef.current = ''
      zeroResultTrackedForQueryRef.current = null
      return
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      searchStartRef.current = Date.now()
      searchRequestIdRef.current = crypto.randomUUID()
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const json = await res.json()
        const nextResults = Array.isArray(json.results) ? json.results : []
        setResults(nextResults)
        setOpen(true)
        lastResolvedQueryRef.current = q

        if (nextResults.length === 0) {
          const { data } = await (supabase.rpc as any)('get_zero_result_suggestions', { p_query: q })
          setSuggestions(Array.isArray(data) ? data : [])
        } else {
          setSuggestions([])
        }

        const latencyMs = Date.now() - searchStartRef.current
        const telemetryParams = {
          query_raw: q,
          results_count: nextResults.length,
          search_request_id: searchRequestIdRef.current,
          search_latency_ms: latencyMs,
          page_type: 'homepage',
        }
        logSearchPerformed(telemetryParams)
        if (nextResults.length === 0) {
          logZeroResults(telemetryParams)
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return
        setResults([])
        setOpen(true)
      } finally {
        if (abortRef.current === controller) abortRef.current = null
        setLoading(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [query])

  function handleSubmit() {
    const q = query.trim()
    if (q.length < 2) return

    const resolvedQuery = lastResolvedQueryRef.current === q
    const firstResult = results[0] ?? null

    trackSearchEvent({
      type: 'search_submit',
      query: q,
      query_length: q.length,
      source: 'homepage',
      had_prefetched_results: resolvedQuery,
      results_count: resolvedQuery ? results.length : 0,
      pathname: window.location.pathname,
    })

    if (firstResult) {
      handleSelect(firstResult, 0)
      return
    }

    setOpen(true)
  }

  function handleSelect(result: SearchResult, index: number) {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    const q = query.trim()

    trackSearchEvent({
      type: 'search_result_click',
      query: q,
      query_length: q.length,
      source: 'homepage',
      result_rank: index + 1,
      results_count: results.length,
      variant_id: result.variant_id,
      canonical_path: result.canonical_path,
      pathname: window.location.pathname,
    })

    logSearchClick({
      search_request_id: searchRequestIdRef.current,
      query_raw: q,
      results_count: results.length,
      result_variant_id: result.variant_id,
      result_slug: result.canonical_path,
      result_rank: index + 1,
      result_type: 'variant',
      page_type: 'homepage',
    })

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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Search any RC vehicle — e.g. Traxxas X-Maxx, ARRMA Kraton…"
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3.5 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search RC vehicles"
        />

        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
              setOpen(false)
              lastResolvedQueryRef.current = ''
              zeroResultTrackedForQueryRef.current = null
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
          {results.map((r, index) => (
            <li key={r.variant_id}>
              <button
                type="button"
                onClick={() => handleSelect(r, index)}
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
        <div className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 px-4 py-4 shadow-xl">
          <ZeroResultRecovery query={query} suggestions={suggestions ?? []} />
        </div>
      )}
    </div>
  )
}
