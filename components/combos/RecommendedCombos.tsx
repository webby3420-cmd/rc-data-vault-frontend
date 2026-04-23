// Server Component — no 'use client'
import { supabase } from '@/lib/supabase/server'
import { mapScaleToMotorTier } from '@/lib/motors/mapScaleToMotorTier'
import { buildEbaySearchUrl } from '@/lib/ebay/buildSearchUrl'

type ComboRec = {
  combo_part_id:      string
  part_number:        string | null
  part_name:          string
  manufacturer:       string
  msrp:               number | null
  cells_min:          number | null
  cells_max:          number | null
  motor_kv:           number | null
  esc_amps:           number | null
  use_case:           string | null
  platform_tier:      string | null
  esc_component_id:   string | null
  esc_component_name: string | null
  motor_component_id: string | null
  trust_tier:         'catalog' | 'salvaged' | 'unknown'
  ecosystem_tier:     'native' | 'preferred' | 'excluded' | 'neutral'
  ecosystem_mode:     'hard' | 'soft'
  bucket:             'same_s' | 'next_s_up' | 'other'
  score:              number
  decision_role:      'oem' | 'best_upgrade' | 'specialty' | 'performance' | null
  role_reason:        string | null
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

const ROLE_ORDER = ['oem', 'best_upgrade', 'performance', 'specialty'] as const
type DecisionRole = NonNullable<ComboRec['decision_role']>

const ROLE_LABELS: Record<DecisionRole, string> = {
  oem:          'Closest to Stock',
  best_upgrade: 'Best Upgrade',
  performance:  'More Power',
  specialty:    'Specialty',
}

const ROLE_CLASSES: Record<DecisionRole, string> = {
  oem:          'border-emerald-600/30 bg-emerald-900/40 text-emerald-300',
  best_upgrade: 'border-sky-600/30 bg-sky-900/40 text-sky-300',
  performance:  'border-amber-600/30 bg-amber-900/40 text-amber-300',
  specialty:    'border-slate-500/30 bg-slate-800/70 text-slate-300',
}

function ComboCard({ c, isSoftMode, subdued }: {
  c:          ComboRec
  isSoftMode: boolean
  subdued?:   boolean
}) {
  const role         = c.decision_role
  const roleLabel    = role ? ROLE_LABELS[role]  : null
  const roleClasses  = role ? ROLE_CLASSES[role] : null
  const cellsLabel   =
    c.cells_min != null && c.cells_max != null
      ? `${c.cells_min}–${c.cells_max}S`
      : null
  const kvLabel      = c.motor_kv != null ? `${c.motor_kv.toLocaleString()} Kv` : null
  const ampsLabel    = c.esc_amps != null ? `${c.esc_amps}A` : null
  const showCrossEco = isSoftMode && c.ecosystem_tier === 'excluded'

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 ${subdued ? 'opacity-90' : ''}`}
    >
      {roleLabel && roleClasses && (
        <span
          className={`absolute right-3 top-3 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleClasses}`}
        >
          {roleLabel}
        </span>
      )}

      <div className={roleLabel ? 'pr-24' : ''}>
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {c.manufacturer}
          </p>
          {showCrossEco && (
            <span className="inline-flex items-center rounded-full border border-rose-700/40 bg-rose-950/40 px-1.5 py-0 text-[10px] font-medium text-rose-300">
              Cross-ecosystem option
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm font-semibold leading-5 text-white line-clamp-2">
          {c.part_name}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {cellsLabel && (
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs font-medium text-slate-300">
            {cellsLabel}
          </span>
        )}
        {kvLabel && (
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-400">
            {kvLabel}
          </span>
        )}
        {ampsLabel && (
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-400">
            {ampsLabel}
          </span>
        )}
      </div>

      {c.esc_component_name && (
        <p className="text-[10px] leading-snug text-slate-500">
          ESC: {c.esc_component_name}
        </p>
      )}

      {roleLabel && c.role_reason && (
        <p className="text-[11px] italic leading-snug text-slate-400">
          {c.role_reason}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2">
        {c.msrp != null && (
          <span className="text-sm font-semibold text-white">
            ${Number(c.msrp).toFixed(2)}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <a
            href={amazonSearchUrl(c.manufacturer, c.part_number)}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Amazon
          </a>
          <a
            href={buildEbaySearchUrl({
              manufacturer: c.manufacturer,
              name:         c.part_name,
              part_number:  c.part_number ?? '',
            }, { customId: c.part_number ?? undefined })}
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
}

export default async function RecommendedCombos({ variantSlug, manufacturerSlug }: Props) {
  try {
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
      'get_combo_recommendations',
      {
        p_vehicle_scale:        tier.vehicleScale,
        p_use_case:             tier.useCase,
        p_platform_cells:       specRow?.cell_count_max ?? null,
        p_vehicle_manufacturer: manufacturerSlug ?? null,
        p_limit:                6,
      }
    )

    if (error || !data) return null
    const combos = data as ComboRec[]

    const isSoftMode = combos[0]?.ecosystem_mode === 'soft'

    // Split primary (role-assigned) from secondary (unroled)
    const primary = combos
      .filter((c) => c.decision_role != null)
      .sort(
        (a, b) =>
          ROLE_ORDER.indexOf(a.decision_role as DecisionRole) -
          ROLE_ORDER.indexOf(b.decision_role as DecisionRole),
      )

    const secondary = combos.filter((c) => c.decision_role == null)

    if (primary.length === 0 && secondary.length === 0) return null

    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recommended Power Systems
        </h2>

        {isSoftMode && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
            Showing broader compatible options due to limited native upgrade data
          </div>
        )}

        {primary.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {primary.map((c) => (
              <ComboCard key={c.combo_part_id} c={c} isSoftMode={isSoftMode} />
            ))}
          </div>
        )}

        {secondary.length > 0 && (
          <details className="mt-6 group">
            <summary className="cursor-pointer list-none text-sm font-medium text-slate-400 transition hover:text-slate-200">
              <span className="mr-1 inline-block transition group-open:rotate-90">›</span>
              More power system options
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {secondary.map((c) => (
                <ComboCard key={c.combo_part_id} c={c} isSoftMode={isSoftMode} subdued />
              ))}
            </div>
          </details>
        )}

        <p className="mt-3 text-[10px] leading-snug text-slate-600">
          Combo recommendations use RC Data Vault catalog + ecosystem scoring.
          Affiliate links — we may earn a commission at no extra cost to you.
        </p>
      </section>
    )
  } catch {
    return null
  }
}
