'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PriceAlertSignup from '@/components/PriceAlertSignup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UPGRADE_CATEGORIES = [
  { slug: 'motors', name: 'Motors', icon: '\u26A1' },
  { slug: 'escs', name: 'ESC', icon: '\uD83C\uDFDB\uFE0F' },
  { slug: 'chassis', name: 'Chassis', icon: '\uD83D\uDD29' },
  { slug: 'shocks', name: 'Shocks', icon: '\uD83D\uDEE0\uFE0F' },
  { slug: 'suspension-arms', name: 'Suspension Arms', icon: '\u2195\uFE0F' },
  { slug: 'driveshafts', name: 'Driveshafts/CVDs', icon: '\uD83D\uDD04' },
  { slug: 'differentials', name: 'Differentials', icon: '\u2699\uFE0F' },
  { slug: 'tires', name: 'Tires', icon: '\uD83D\uDD18' },
  { slug: 'wheels', name: 'Wheels', icon: '\u2B55' },
  { slug: 'batteries', name: 'Battery Pack', icon: '\uD83D\uDD0B' },
  { slug: 'servos', name: 'Servo', icon: '\uD83C\uDFAE' },
  { slug: 'bearings', name: 'Bearing Kit', icon: '\uD83D\uDD35' },
]

const CONDITIONS = [
  { value: 'new', label: 'New / Unrun', desc: 'Never run' },
  { value: 'excellent', label: 'Excellent', desc: 'Minimal use, no wear' },
  { value: 'good', label: 'Good', desc: 'Normal wear, functional' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear' },
  { value: 'poor', label: 'Poor', desc: 'Needs repair' },
] as const

type ConditionValue = (typeof CONDITIONS)[number]['value']

type SearchHit = {
  variant_id: string
  variant_slug: string
  display_name: string
  manufacturer_slug: string
  family_slug: string
}

function fmt(n: number | null) {
  if (n == null) return '—'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export default function VehicleEvaluator() {
  const searchParams = useSearchParams()
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [condition, setCondition] = useState<ConditionValue>('good')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-populate from URL
  useEffect(() => {
    const model = searchParams.get('model')
    if (model) {
      ;(async () => {
        const { data } = await (supabase.rpc as any)('search_rc', { p_query: model, p_limit: 1 })
        if (data?.[0]) {
          setSelectedSlug(data[0].variant_slug)
          setSelectedName(data[0].display_name)
        }
      })()
    }
  }, [searchParams])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = searchQuery.trim()
    if (q.length < 2 || selectedSlug) { setSearchResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await (supabase.rpc as any)('search_rc', { p_query: q, p_limit: 6 })
      setSearchResults(Array.isArray(data) ? data : [])
      setSearching(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery, selectedSlug])

  function selectModel(hit: SearchHit) {
    setSelectedSlug(hit.variant_slug)
    setSelectedName(hit.display_name)
    setSearchQuery('')
    setSearchResults([])
    setResult(null)
    setError(null)
  }

  function clearModel() {
    setSelectedSlug(null)
    setSelectedName('')
    setSearchQuery('')
    setResult(null)
    setError(null)
  }

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  async function evaluate() {
    if (!selectedSlug) return
    setLoading(true)
    setError(null)
    setResult(null)
    const { data, error: rpcError } = await (supabase.rpc as any)('get_variant_adjusted_value', {
      p_variant_slug: selectedSlug,
      p_condition: condition,
      p_category_slugs: selectedCategories,
    })
    setLoading(false)
    if (rpcError || data?.error) {
      setError(data?.error ?? rpcError?.message ?? 'Something went wrong')
      return
    }
    setResult(data)
  }

  const conditionLabel = CONDITIONS.find((c) => c.value === condition)?.label ?? condition

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <a href="/tools" className="hover:text-slate-300 transition-colors">Tools</a>
        <span>/</span>
        <span className="text-slate-300">Vehicle Evaluator</span>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Vehicle Evaluator</h1>
          <p className="mt-1 text-sm text-slate-400">Estimate what your RC is worth based on its condition and upgrades installed.</p>
        </div>

        {/* Section 1: Model Search */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-200">1. Select your model</h2>
          {selectedSlug ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-amber-400">{selectedName}</span>
              <button onClick={clearModel} className="text-xs text-slate-500 hover:text-slate-300">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a model (e.g. Traxxas X-Maxx)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-500"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
                </div>
              )}
              {searchResults.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
                  {searchResults.map((h) => (
                    <li key={h.variant_id}>
                      <button type="button" onClick={() => selectModel(h)} className="w-full px-4 py-3 text-left text-sm text-white transition hover:bg-slate-800">
                        {h.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Condition */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-200">2. Condition</h2>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setCondition(c.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  condition === c.value
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="font-medium">{c.label}</div>
                <div className="text-xs opacity-70">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Upgrades */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-200">3. Upgrades installed</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {UPGRADE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.slug)
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="mr-1.5">{cat.icon}</span>
                  {cat.name}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">{selectedCategories.length} upgrade categories selected</p>
        </div>

        {/* Section 4: Evaluate Button */}
        <button
          onClick={evaluate}
          disabled={!selectedSlug || loading}
          className="inline-flex items-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-800 border-t-transparent" />
              Evaluating...
            </>
          ) : (
            'Evaluate'
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">No valuation data available for this model yet.</p>
          </div>
        )}

        {/* Section 5: Result */}
        {result && !error && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5">
              <h3 className="text-lg font-semibold text-white">{result.variant_name} — Adjusted Valuation</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Adjusted Value</div>
                  <div className="text-2xl font-bold text-amber-400">{fmt(result.adjusted_mid)}</div>
                  <div className="mt-1 text-sm text-slate-400">Range: {fmt(result.adjusted_low)} – {fmt(result.adjusted_high)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Base Market Value</div>
                  <div className="text-lg font-semibold text-white">{fmt(result.base_fair_value)}</div>
                  <div className="mt-1 text-sm text-slate-400">Condition: {conditionLabel}</div>
                  {result.confidence && (
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      result.confidence === 'reliable' ? 'text-green-400 bg-green-900/30' : 'text-amber-400 bg-amber-900/30'
                    }`}>
                      {result.confidence}
                    </span>
                  )}
                </div>
              </div>

              {/* Delta banner */}
              {result.delta_vs_stock_pct != null && (
                <div className={`rounded-lg px-4 py-2.5 text-sm ${
                  result.delta_vs_stock_pct > 0
                    ? 'bg-emerald-900/30 border border-emerald-800 text-emerald-400'
                    : result.delta_vs_stock_pct < 0
                      ? 'bg-amber-900/30 border border-amber-800 text-amber-400'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}>
                  {result.delta_vs_stock_pct > 0
                    ? `\u2191 ${Math.round(result.delta_vs_stock_pct)}% above base market value from upgrades and condition`
                    : result.delta_vs_stock_pct < 0
                      ? `\u2193 ${Math.abs(Math.round(result.delta_vs_stock_pct))}% below base market value (condition adjustment)`
                      : 'At base market value'}
                </div>
              )}

              {/* Upgrades breakdown */}
              {result.upgrades_applied?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Upgrades breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="py-2 text-left text-xs text-slate-500">Category</th>
                          <th className="py-2 text-left text-xs text-slate-500">Adjustment Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {result.upgrades_applied.map((u: any) => (
                          <tr key={u.category_slug}>
                            <td className="py-2 text-slate-300">{u.category_name}</td>
                            <td className="py-2 text-slate-400">+{u.min_percent}% – +{u.max_percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Total upgrade adjustment: +{result.upgrade_adjustment_pct}%
                  </p>
                  {result.upgrade_cap_applied && (
                    <p className="mt-1 text-xs text-amber-500">Upgrade adjustment capped at 35%</p>
                  )}
                </div>
              )}
            </div>

            {/* Alert CTA */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Get notified when similar builds sell</p>
              <PriceAlertSignup
                variantId={result.variant_slug}
                variantSlug={result.variant_slug}
                modelName={result.variant_name}
                mfrSlug={result.manufacturer}
                signupSource="vehicle_evaluator"
              />
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-slate-600">
              Adjusted valuations are estimates based on market data and heuristic upgrade values. Actual resale prices vary by buyer, condition, and market timing.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
