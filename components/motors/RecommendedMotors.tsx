// Server Component — no 'use client'
import { supabase } from '@/lib/supabase/server'
import { mapScaleToMotorTier } from '@/lib/motors/mapScaleToMotorTier'
import { buildEbaySearchUrl } from '@/lib/ebay/buildSearchUrl'
import { MotorRecommendationExplainer } from './MotorRecommendationExplainer'

type MotorRec = {
  part_id:        string
  part_number:    string | null
  part_name:      string
  manufacturer:   string
  msrp:           number | null
  kv_rating:      number
  motor_can_size: string | null
  is_brushless:   boolean
  is_sensored:    boolean
  tier:           string
  score:          number
}

interface Props {
  variantSlug:       string
  manufacturerSlug?: string | null
}

const AMAZON_TAG = 'rcdatavault-20'

function amazonSearchUrl(mfr: string, partNo: string | null): string {
  const q = partNo ? `${mfr} ${partNo}` : mfr
  return `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`
}

export default async function RecommendedMotors({ variantSlug, manufacturerSlug }: Props) {
  try {
    // Two-query pattern — matches RecommendedEscs.tsx / RecommendedServos.tsx
    const { data: v } = await supabase
      .from('variants')
      .select('variant_id')
      .eq('slug', variantSlug)
      .single()

    if (!v?.variant_id) return null

    const { data: specRow } = await supabase
      .from('variant_specs')
      .select('scale, vehicle_class, cell_count_max')
      .eq('variant_id', v.variant_id)
      .maybeSingle()

    const tier = mapScaleToMotorTier(specRow?.scale, specRow?.vehicle_class)
    if (!tier) return null

    const { data, error } = await (supabase.rpc as any)(
      'get_motor_recommendations',
      {
        p_vehicle_scale:        tier.vehicleScale,
        p_use_case:             tier.useCase,
        p_limit:                5,
        p_platform_cells:       specRow?.cell_count_max ?? null,
        p_vehicle_manufacturer: manufacturerSlug ?? null,
      }
    )

    if (error || !data || data.length === 0) return null
    const motors = data as MotorRec[]

    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recommended Motor Upgrades
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {motors.map((m) => {
            const kv     = m.kv_rating != null ? `${m.kv_rating.toLocaleString()} kV` : null
            const canSz  = m.motor_can_size ? `${m.motor_can_size} can` : null

            return (
              <div
                key={m.part_id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                {/* Brand + name */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {m.manufacturer}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-5 text-white line-clamp-2">
                    {m.part_name}
                  </p>
                </div>

                {/* Spec badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {kv && (
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs font-medium text-slate-300">
                      {kv}
                    </span>
                  )}
                  {canSz && (
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-400">
                      {canSz}
                    </span>
                  )}
                  {m.is_brushless && (
                    <span className="inline-flex items-center rounded-full border border-emerald-600/20 bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      Brushless
                    </span>
                  )}
                  {m.is_sensored && (
                    <span className="inline-flex items-center rounded-full border border-sky-600/20 bg-sky-900/30 px-2 py-0.5 text-xs font-medium text-sky-400">
                      Sensored
                    </span>
                  )}
                </div>

                {/* MSRP + buy buttons */}
                <div className="mt-auto flex items-center gap-2">
                  {m.msrp != null && (
                    <span className="text-sm font-semibold text-white">
                      ${m.msrp.toFixed(2)}
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <a
                      href={amazonSearchUrl(m.manufacturer, m.part_number)}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-400"
                    >
                      Amazon
                    </a>
                    <a
                      href={buildEbaySearchUrl({
                        manufacturer: m.manufacturer,
                        name:         m.part_name,
                        part_number:  m.part_number ?? '',
                      }, { customId: m.part_number ?? undefined })}
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
          Motor recommendations are based on RC Data Vault spec data.
          Affiliate links — we may earn a commission at no extra cost to you.
        </p>

        <MotorRecommendationExplainer />
      </section>
    )
  } catch {
    return null
  }
}
