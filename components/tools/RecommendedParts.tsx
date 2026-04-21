'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { BuyBar } from '@/components/parts/BuyBar'
import { adaptDbPartLinks } from '@/lib/purchase-link-adapter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SpecKey = 'kv' | 'amps' | 'cells' | 'teeth'

interface RecommendedPartsProps {
  specKey: SpecKey
  minValue: number
  maxValue: number
  label: string
  pitchFilter?: string
}

interface PartResult {
  part_id: string
  part_number: string | null
  part_name: string
  part_slug: string | null
  description: string | null
  msrp: number | null
  is_oem: boolean
  part_type: string
  spec_key: string
  spec_value: number
  manufacturer_name: string
  manufacturer_slug: string
  category_name: string
  category_slug: string
  best_link: {
    retailer_slug: string
    retailer_name: string
    url: string
  } | null
}

const SPEC_UNIT: Record<SpecKey, string> = {
  kv: 'kV',
  amps: 'A',
  cells: 'S',
  teeth: 'T',
}

export default function RecommendedParts({ specKey, minValue, maxValue, label, pitchFilter }: RecommendedPartsProps) {
  const [parts, setParts] = useState<PartResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (minValue <= 0 || minValue > maxValue) return

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      const { data, error: rpcError } = await (supabase.rpc as any)('get_parts_by_spec', {
        p_spec_key: specKey,
        p_min_value: minValue,
        p_max_value: maxValue,
        p_pitch_filter: pitchFilter ?? null,
      })

      if (cancelled) return

      if (rpcError) {
        console.error('[RecommendedParts] RPC error', rpcError)
        setError(rpcError.message ?? 'Error loading parts')
        setParts([])
      } else {
        setParts((data ?? []) as PartResult[])
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [specKey, minValue, maxValue, pitchFilter])

  const unit = SPEC_UNIT[specKey]

  if (loading) {
    return (
      <div className="mt-2">
        <div className="mt-6 mb-3 flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">{label}</h3>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-2">
        <div className="mt-4 rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-4">
          <p className="text-sm text-red-400">Could not load parts. Try again.</p>
        </div>
      </div>
    )
  }

  if (parts.length === 0) {
    return (
      <div className="mt-2">
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-5 text-center">
          <p className="text-sm text-slate-500">No matching parts in catalog yet.</p>
          <p className="mt-1 text-xs text-slate-600">
            Coverage is growing — check back as more parts are added.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <div className="mt-6 mb-3 flex items-center gap-3">
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        <span className="text-xs text-slate-600">
          {parts.length} {parts.length === 1 ? 'result' : 'results'}
        </span>
      </div>
      <div className="space-y-2">
        {parts.map((part) => (
          <div
            key={part.part_id}
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
          >
            <div className="shrink-0 w-16 text-center">
              <span className="text-base font-bold text-amber-400">{part.spec_value}</span>
              <span className="block text-xs text-slate-600 mt-0.5">{unit}</span>
            </div>

            <div className="w-px self-stretch bg-slate-700 shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white leading-snug truncate">
                {part.part_name}
              </p>
              <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">{part.manufacturer_name}</span>
                {part.is_oem ? (
                  <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500">
                    OEM
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-500/30 px-1.5 py-0.5 text-xs text-amber-500/80">
                    Aftermarket
                  </span>
                )}
                {part.msrp != null && (
                  <span className="text-xs text-slate-500">${Number(part.msrp).toFixed(0)}</span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1.5">
              {part.best_link && (
                <BuyBar
                  purchaseLinks={adaptDbPartLinks([{
                    retailer_name: part.best_link.retailer_name,
                    retailer_slug: part.best_link.retailer_slug,
                    retailer_type: 'mass_market',
                    url:           part.best_link.url,
                  }])}
                  partName={part.part_name ?? ''}
                  className="mt-2"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
