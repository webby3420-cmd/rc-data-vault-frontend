'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PriceAlertSignup from '@/components/PriceAlertSignup'

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

type Assessment = {
  variant_id: string
  variant_slug: string
  variant_name: string
  manufacturer_slug: string
  family_slug: string
  has_valuation: boolean
  fair_value: number | null
  low_value: number | null
  high_value: number | null
  confidence: string | null
  obs_count: number
  input_price: number
  pct_from_fair: number | null
  deal_classification: string
  context_label: string
}

const CLASS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  strong_buy:   { bg: 'bg-emerald-900/40 border-emerald-700', text: 'text-emerald-400', label: 'Strong Buy' },
  good_deal:    { bg: 'bg-amber-900/40 border-amber-700',     text: 'text-amber-400',   label: 'Good Deal' },
  fair:         { bg: 'bg-slate-800 border-slate-600',         text: 'text-slate-300',   label: 'Fair Market Price' },
  above_market: { bg: 'bg-orange-900/40 border-orange-700',    text: 'text-orange-400',  label: 'Above Market' },
  overpriced:   { bg: 'bg-red-900/40 border-red-700',          text: 'text-red-400',     label: 'Overpriced' },
  unknown:      { bg: 'bg-slate-800 border-slate-600',         text: 'text-slate-400',   label: 'No Valuation Data' },
}

function fmt(n: number | null) {
  if (n == null) return '—'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export default function DealValueCalculator() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SearchHit | null>(null)
  const [price, setPrice] = useState('')
  const [result, setResult] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const telemetryFired = useRef(false)

  // Pre-populate from URL
  useEffect(() => {
    const model = searchParams.get('model')
    if (model && searchParams.get('tool') === 'deal') {
      ;(async () => {
        const { data } = await (supabase.rpc as any)('search_rc', { p_query: model, p_limit: 1 })
        if (data?.[0]) {
          setSelected(data[0])
          setQuery(data[0].display_name)
        }
      })()
    }
  }, [searchParams])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2 || selected) { setHits([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await (supabase.rpc as any)('search_rc', { p_query: q, p_limit: 5 })
      setHits(Array.isArray(data) ? data : [])
      setSearching(false)
    }, 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, selected])

  // Auto-fetch assessment
  useEffect(() => {
    if (!selected || !price) { setResult(null); return }
    const p = parseFloat(price)
    if (isNaN(p) || p < 1) { setResult(null); return }
    telemetryFired.current = false
    setLoading(true)
    ;(async () => {
      const { data } = await (supabase.rpc as any)('get_deal_value_assessment', {
        p_variant_slug: selected.variant_slug,
        p_price: p,
      })
      setResult(data ?? null)
      setLoading(false)

      // Telemetry fire-and-forget
      if (data && !telemetryFired.current) {
        telemetryFired.current = true
        ;(supabase.rpc as any)('log_tool_event', {
          p_tool_name: 'deal_calculator',
          p_event_type: 'tool_used',
          p_variant_slug: selected.variant_slug,
          p_input_snapshot: { price: p },
          p_result_snapshot: {
            deal_classification: data.deal_classification,
            pct_from_fair: data.pct_from_fair,
            fair_value: data.fair_value,
          },
        })
      }
    })()
  }, [selected, price])

  function selectHit(hit: SearchHit) {
    setSelected(hit)
    setQuery(hit.display_name)
    setHits([])
  }

  function clearSelection() {
    setSelected(null)
    setQuery('')
    setPrice('')
    setResult(null)
    setShowAlert(false)
  }

  const style = result ? CLASS_STYLE[result.deal_classification] ?? CLASS_STYLE.unknown : null

  return (
    <div className="space-y-4">
      {/* Model search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (selected) clearSelection() }}
          placeholder="Search for a model (e.g. Traxxas X-Maxx)"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-500"
        />
        {selected && (
          <button onClick={clearSelection} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm">
            ✕
          </button>
        )}
        {hits.length > 0 && !selected && (
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
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
          </div>
        )}
      </div>

      {/* Price input */}
      {selected && (
        <div className="relative max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-500">$</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            placeholder="Listing price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-8 pr-4 text-sm text-white outline-none transition focus:border-amber-500"
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
          Analyzing...
        </div>
      )}

      {/* Result */}
      {result && style && !loading && (
        <div className={`rounded-xl border ${style.bg} p-5 space-y-3`}>
          <div className={`text-2xl font-bold ${style.text}`}>{style.label}</div>

          {result.has_valuation && result.pct_from_fair != null ? (
            <div className="space-y-1">
              <p className="text-sm text-slate-300">
                {result.pct_from_fair < 0
                  ? `This listing is ${Math.abs(Math.round(result.pct_from_fair))}% below market value`
                  : result.pct_from_fair > 0
                    ? `${Math.round(result.pct_from_fair)}% above fair value`
                    : 'This is right at market value'}
              </p>
              <p className="text-sm text-slate-400">
                Fair market value: {fmt(result.fair_value)}
              </p>
              <p className="text-sm text-slate-500">
                Range: {fmt(result.low_value)} – {fmt(result.high_value)}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-slate-400">
                We don&apos;t have enough sold data for this model yet.
              </p>
              {result.obs_count > 0 && (
                <p className="text-xs text-slate-500">{result.obs_count} sold listings analyzed</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {result.confidence && (
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400 capitalize">
                {result.confidence}
              </span>
            )}
            {result.obs_count > 0 && (
              <span className="text-xs text-slate-500">Based on {result.obs_count} sold listings</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {result.has_valuation && (
              <a
                href={`/rc/${result.manufacturer_slug}/${result.family_slug}/${result.variant_slug}`}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                View full market data &rarr;
              </a>
            )}
            <button
              onClick={() => setShowAlert(!showAlert)}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              {result.has_valuation ? 'Track deals like this \u2192' : 'Get alerted when listings appear \u2192'}
            </button>
          </div>

          {showAlert && (
            <div className="pt-2">
              <PriceAlertSignup
                variantId={result.variant_id}
                variantSlug={result.variant_slug}
                modelName={result.variant_name}
                mfrSlug={result.manufacturer_slug}
                familySlug={result.family_slug}
                signupSource="deal_calculator"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
