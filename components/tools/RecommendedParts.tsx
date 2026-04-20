'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

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

export default function RecommendedParts({ specKey, minValue, maxValue, label }: RecommendedPartsProps) {
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
  }, [specKey, minValue, maxValue])

  if (loading) {
    return (
      <div className="space-y-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="mt-4 text-sm text-red-400">Could not load parts. Try again.</div>
  }

  if (parts.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 px-4 py-5 text-sm text-slate-500">
        No parts found for this spec range.
      </div>
    )
  }

  const unit = SPEC_UNIT[specKey]

  return (
    <>
      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
        <span className="ml-2 font-normal normal-case text-slate-600">
          ({parts.length} found)
        </span>
      </h3>
      <div className="mt-4 space-y-2">
        {parts.map((part) => (
          <div
            key={part.part_id}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-white truncate">
                  {part.part_name}
                </span>
                {part.is_oem ? (
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                    OEM
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                    Aftermarket
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                <span>{part.manufacturer_name}</span>
                <span>·</span>
                <span className="font-medium text-slate-400">
                  {part.spec_value}
                  {unit}
                </span>
                {part.msrp != null && (
                  <>
                    <span>·</span>
                    <span>${Number(part.msrp).toFixed(0)}</span>
                  </>
                )}
              </div>
            </div>
            {part.best_link && (
              <a
                href={part.best_link.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Buy
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
