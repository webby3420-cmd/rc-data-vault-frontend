'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SearchHit = {
  variant_id: string
  variant_slug: string
  display_name: string
  manufacturer_slug: string
  family_slug: string
}

type ComparisonModel = {
  variant_id: string
  variant_slug: string
  variant_name: string
  manufacturer_name: string
  manufacturer_slug: string
  family_name: string
  family_slug: string
  canonical_url: string
  msrp_original: number | null
  release_year: number | null
  has_valuation: boolean
  fair_value: number | null
  low_value: number | null
  high_value: number | null
  confidence: string | null
  obs_count: number
  active_listings: number
  sold_30d: number
}

function fmt(n: number | null) {
  if (n == null) return '—'
  return '$' + Math.round(n).toLocaleString('en-US')
}

const CONFIDENCE_CLS: Record<string, string> = {
  reliable: 'bg-emerald-900/40 text-emerald-400',
  moderate: 'bg-amber-900/40 text-amber-400',
  thin: 'bg-slate-800 text-slate-400',
}

export default function ModelComparison() {
  const searchParams = useSearchParams()
  const [slots, setSlots] = useState<(SearchHit | null)[]>([null, null])
  const [addingIdx, setAddingIdx] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [models, setModels] = useState<ComparisonModel[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const telemetryFired = useRef(false)

  // Pre-populate from URL
  useEffect(() => {
    const model = searchParams.get('model')
    if (model && searchParams.get('tool') === 'compare') {
      ;(async () => {
        const { data } = await (supabase.rpc as any)('search_rc', { p_query: model, p_limit: 1 })
        if (data?.[0]) {
          setSlots((prev) => {
            const next = [...prev]
            next[0] = data[0]
            return next
          })
        }
      })()
    }
  }, [searchParams])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2 || addingIdx === null) { setHits([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await (supabase.rpc as any)('search_rc', { p_query: q, p_limit: 5 })
      setHits(Array.isArray(data) ? data : [])
      setSearching(false)
    }, 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, addingIdx])

  // Fetch comparison when >= 2 selected
  useEffect(() => {
    const selectedSlugs = slots.filter(Boolean).map((s) => s!.variant_slug)
    if (selectedSlugs.length < 2) { setModels([]); return }
    telemetryFired.current = false
    setLoading(true)
    ;(async () => {
      const { data } = await (supabase.rpc as any)('get_variant_comparison', {
        p_slugs: selectedSlugs,
      })
      setModels(Array.isArray(data) ? data : [])
      setLoading(false)

      if (data && !telemetryFired.current) {
        telemetryFired.current = true
        ;(supabase.rpc as any)('log_tool_event', {
          p_tool_name: 'comparison',
          p_event_type: 'tool_used',
          p_input_snapshot: { slugs: selectedSlugs },
          p_result_snapshot: { model_count: selectedSlugs.length },
        })
      }
    })()
  }, [slots])

  function selectHit(hit: SearchHit) {
    if (addingIdx === null) return
    setSlots((prev) => {
      const next = [...prev]
      next[addingIdx] = hit
      return next
    })
    setAddingIdx(null)
    setQuery('')
    setHits([])
  }

  function removeSlot(idx: number) {
    setSlots((prev) => {
      const next = [...prev]
      next[idx] = null
      // Compact: remove trailing nulls beyond 2
      while (next.length > 2 && next[next.length - 1] === null) next.pop()
      return next
    })
  }

  function addSlot() {
    if (slots.length >= 3) return
    setSlots((prev) => [...prev, null])
  }

  // Find lowest fair_value for highlighting
  const fairValues = models.filter((m) => m.has_valuation && m.fair_value != null).map((m) => m.fair_value!)
  const minFair = fairValues.length >= 2 ? Math.min(...fairValues) : null

  return (
    <div className="space-y-4">
      {/* Selected chips */}
      <div className="flex flex-wrap gap-2">
        {slots.map((slot, idx) => (
          <div key={idx}>
            {slot ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-white">
                {slot.display_name}
                <button onClick={() => removeSlot(idx)} className="text-slate-500 hover:text-slate-300">✕</button>
              </span>
            ) : (
              <button
                onClick={() => { setAddingIdx(idx); setQuery('') }}
                className="rounded-full border border-dashed border-slate-600 px-3 py-1 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-300 transition"
              >
                + Add model
              </button>
            )}
          </div>
        ))}
        {slots.length < 3 && slots.every(Boolean) && (
          <button
            onClick={addSlot}
            className="rounded-full border border-dashed border-slate-600 px-3 py-1 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-300 transition"
          >
            + Add model
          </button>
        )}
      </div>

      {/* Search input when adding */}
      {addingIdx !== null && (
        <div className="relative max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a model..."
            autoFocus
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-500"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
            </div>
          )}
          {hits.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
              {hits.map((h) => (
                <li key={h.variant_id}>
                  <button
                    type="button"
                    onClick={() => selectHit(h)}
                    className="w-full px-4 py-3 text-left text-sm text-white transition hover:bg-slate-800"
                  >
                    {h.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => { setAddingIdx(null); setQuery(''); setHits([]) }}
            className="mt-2 text-xs text-slate-500 hover:text-slate-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
          Comparing...
        </div>
      )}

      {/* Comparison table */}
      {models.length >= 2 && !loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-3 pr-4 text-left text-xs uppercase tracking-wide text-slate-500"></th>
                {models.map((m) => (
                  <th key={m.variant_slug} className="py-3 px-3 text-left text-xs uppercase tracking-wide text-slate-400 font-medium">
                    <a href={m.canonical_url} className="hover:text-amber-400 transition-colors">
                      {m.variant_name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">Fair Value</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className={`py-2.5 px-3 font-semibold ${m.has_valuation && m.fair_value != null && m.fair_value === minFair ? 'text-emerald-400' : 'text-white'}`}>
                    {m.has_valuation ? fmt(m.fair_value) : <span className="text-slate-500 font-normal">No data</span>}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">Low Value</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className="py-2.5 px-3 text-slate-300">{fmt(m.low_value)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">High Value</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className="py-2.5 px-3 text-slate-300">{fmt(m.high_value)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">Confidence</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className="py-2.5 px-3">
                    {m.confidence ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${CONFIDENCE_CLS[m.confidence] ?? 'bg-slate-800 text-slate-400'}`}>
                        {m.confidence}
                      </span>
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">Sold (30d)</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className="py-2.5 px-3 text-slate-300">{m.sold_30d} listings</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">Active Listings</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className="py-2.5 px-3 text-slate-300">{m.active_listings}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">Original MSRP</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className="py-2.5 px-3 text-slate-300">{m.msrp_original ? fmt(m.msrp_original) : '—'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-slate-500">Release Year</td>
                {models.map((m) => (
                  <td key={m.variant_slug} className="py-2.5 px-3 text-slate-300">{m.release_year ?? '—'}</td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <a
              href="/rc"
              className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Track deals across these models &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
