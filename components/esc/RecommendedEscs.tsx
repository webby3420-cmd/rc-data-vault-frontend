// Server Component — no 'use client'
import { supabase } from '@/lib/supabase/server'
import { mapScaleToEscTier } from '@/lib/esc/mapScaleToEscTier'

type EscRec = {
  part_id: string
  part_number: string
  part_name: string
  manufacturer: string
  msrp: number | null
  amps: number | null
  cells_min: number | null
  cells_max: number | null
  waterproof: string | null
  smart_telemetry: string | null
  connector: string | null
  score: number
}

interface Props {
  variantSlug: string
}

function makeSearchUrl(channel: 'amazon' | 'ebay', mfr: string, partNo: string) {
  const q = encodeURIComponent(`${mfr} ${partNo}`)
  if (channel === 'amazon') {
    return `https://www.amazon.com/s?k=${q}&tag=rcdatavault-20`
  }
  return (
    `https://www.ebay.com/sch/i.html?_nkw=${q}&_sacat=0&LH_BIN=1` +
    `&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339148896` +
    `&toolid=10001&mkevt=1`
  )
}

export default async function RecommendedEscs({ variantSlug }: Props) {
  try {
    // Two-query pattern — matches RecommendedServos.tsx
    const { data: v } = await supabase
      .from('variants')
      .select('variant_id')
      .eq('slug', variantSlug)
      .single()

    if (!v?.variant_id) return null

    const { data: specRow } = await supabase
      .from('variant_specs')
      .select('scale, vehicle_class')
      .eq('variant_id', v.variant_id)
      .maybeSingle()

    const tier = mapScaleToEscTier(specRow?.scale, specRow?.vehicle_class)
    if (!tier) return null

    const { data, error } = await (supabase.rpc as any)(
      'get_esc_recommendations',
      {
        p_vehicle_scale: tier.vehicleScale,
        p_use_case:      tier.useCase,
        p_limit:         4,
      }
    )

    if (error || !data || data.length === 0) return null
    const escs = data as EscRec[]

    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recommended ESC Upgrades
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {escs.map((e) => {
            const cellRange =
              e.cells_min != null && e.cells_max != null
                ? `${e.cells_min}–${e.cells_max}S`
                : null
            const isWP    = e.waterproof      === 'true'
            const isSmart = e.smart_telemetry === 'true'

            return (
              <div
                key={e.part_id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                {/* Brand + name */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {e.manufacturer}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-5 text-white line-clamp-2">
                    {e.part_name}
                  </p>
                </div>

                {/* Spec badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {e.amps != null && (
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs font-medium text-slate-300">
                      {e.amps}A
                    </span>
                  )}
                  {cellRange && (
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-400">
                      {cellRange}
                    </span>
                  )}
                  {isWP && (
                    <span className="inline-flex items-center rounded-full border border-cyan-600/20 bg-cyan-900/30 px-2 py-0.5 text-xs font-medium text-cyan-400">
                      WP
                    </span>
                  )}
                  {isSmart && (
                    <span className="inline-flex items-center rounded-full border border-violet-600/20 bg-violet-900/30 px-2 py-0.5 text-xs font-medium text-violet-400">
                      Smart
                    </span>
                  )}
                </div>

                {/* MSRP + buy buttons */}
                <div className="mt-auto flex items-center gap-2">
                  {e.msrp != null && (
                    <span className="text-sm font-semibold text-white">
                      ${e.msrp.toFixed(2)}
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <a
                      href={makeSearchUrl('amazon', e.manufacturer, e.part_number)}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-400"
                    >
                      Amazon
                    </a>
                    <a
                      href={makeSearchUrl('ebay', e.manufacturer, e.part_number)}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                    >
                      eBay
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-3 text-[10px] leading-snug text-slate-600">
          ESC recommendations are based on RC Data Vault spec data.
          Affiliate links — we may earn a commission at no extra cost to you.
        </p>
      </section>
    )
  } catch {
    return null
  }
}
