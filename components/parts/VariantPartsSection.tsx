'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PurchaseLink = {
  link_id: string
  retailer_name: string
  retailer_slug: string
  retailer_type: string
  url: string
  price_usd: number | null
  in_stock: boolean
  priority: number
}

type Part = {
  part_id: string
  part_name: string
  part_slug: string
  part_number: string | null
  part_type: 'oem_replacement' | 'aftermarket_upgrade' | 'universal_fitment'
  is_oem: boolean
  is_collectible: boolean
  part_era: 'modern' | 'vintage' | null
  manufacturer: string | null
  aftermarket_brand: string | null
  msrp: number | null
  best_price: number | null
  link_count: number
  description: string | null
  spec_notes: string | null
  image_url: string | null
  thumbnail_url: string | null
  purchase_links: PurchaseLink[]
}

type Category = {
  category_name: string
  category_slug: string
  sort_order: string
  part_count: number
  parts: Part[]
}

type PartsData = {
  total_parts: number
  parts_with_links: number
  has_vintage: boolean
  categories: Category[]
}

function fmt(n: number | null) {
  if (n == null) return null
  return '$' + Math.round(n).toLocaleString('en-US')
}

const CATEGORY_ICON: Record<string, string> = {
  motors: '\u26A1',
  escs: '\uD83C\uDFDB\uFE0F',
  chassis: '\uD83D\uDD29',
  shocks: '\uD83D\uDEE0\uFE0F',
  'suspension-arms': '\u2195\uFE0F',
  driveshafts: '\uD83D\uDD04',
  differentials: '\u2699\uFE0F',
  tires: '\uD83D\uDD18',
  wheels: '\u2B55',
  batteries: '\uD83D\uDD0B',
  servos: '\uD83C\uDFAE',
  bearings: '\uD83D\uDD35',
  'gear-sets': '\u2699\uFE0F',
  'body-exterior': '\uD83D\uDE97',
  radio: '\uD83D\uDCE1',
  'screws-fasteners': '\uD83D\uDD29',
  'tools-accessories': '\uD83E\uDDF0',
  'axles-hubs': '\u2699\uFE0F',
  'wheel-accessories': '\u2B55',
}

const TYPE_BADGE: Record<string, { cls: string; label: string }> = {
  oem: { cls: 'bg-blue-900/40 text-blue-300', label: 'OEM' },
  aftermarket_upgrade: { cls: 'bg-purple-900/40 text-purple-300', label: 'Upgrade' },
  universal_fitment: { cls: 'bg-slate-800 text-slate-400', label: 'Universal' },
}

function PartTypeBadge({ part }: { part: Part }) {
  if (part.is_oem) {
    const b = TYPE_BADGE.oem
    return <span className={`${b.cls} text-xs px-2 py-0.5 rounded`}>{b.label}</span>
  }
  const b = TYPE_BADGE[part.part_type] ?? TYPE_BADGE.universal_fitment
  return <span className={`${b.cls} text-xs px-2 py-0.5 rounded`}>{b.label}</span>
}

function PartCard({ part, categorySlug }: { part: Part; categorySlug: string }) {
  const priceDisplay = fmt(part.best_price)
  const msrpDisplay = !priceDisplay && part.msrp ? `MSRP ${fmt(part.msrp)}` : null
  const brand = part.manufacturer || part.aftermarket_brand
  const links = part.purchase_links.slice(0, 3)
  const imgSrc = part.thumbnail_url || part.image_url

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 space-y-2">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-slate-800 flex items-center justify-center">
          {imgSrc ? (
            <img src={imgSrc} alt={part.part_name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="text-lg">{CATEGORY_ICON[categorySlug] ?? '\uD83D\uDD27'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-white">{part.part_name}</span>
          {priceDisplay ? (
            <span className="flex-shrink-0 text-sm font-semibold text-amber-400">{priceDisplay}</span>
          ) : msrpDisplay ? (
            <span className="flex-shrink-0 text-xs text-slate-500">{msrpDisplay}</span>
          ) : null}
        </div>
      </div>

      {/* Middle row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <PartTypeBadge part={part} />
        {brand && <span className="text-xs text-slate-500 ml-1">{brand}</span>}
        {part.part_number && (
          <span className="text-xs text-slate-600 ml-auto">#{part.part_number}</span>
        )}
      </div>

      {/* Description */}
      {part.description && (
        <p className="text-xs text-slate-500 line-clamp-2">{part.description}</p>
      )}

      {/* Buy links */}
      {links.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {links.map((link, i) => (
            <a
              key={link.link_id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                i === 0
                  ? 'bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400'
                  : 'border border-slate-600 text-slate-300 hover:border-amber-500 hover:text-amber-400'
              }`}
            >
              {link.retailer_name}
              {link.price_usd != null && ` $${Math.round(link.price_usd)}`}
              {' \u2192'}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-600 pt-1">No buy links yet</p>
      )}
    </div>
  )
}

interface VariantPartsSectionProps {
  variantSlug: string
  variantName: string
}

export default function VariantPartsSection({ variantSlug, variantName }: VariantPartsSectionProps) {
  const [data, setData] = useState<PartsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: result } = await (supabase.rpc as any)(
        'get_variant_parts',
        { p_variant_slug: variantSlug }
      )
      setData(result ?? null)
      setLoading(false)
    })()
  }, [variantSlug])

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-64 rounded bg-slate-800" />
        <div className="h-4 w-48 rounded bg-slate-800" />
        <div className="h-24 rounded bg-slate-800" />
      </div>
    )
  }

  if (!data || data.total_parts === 0) return null

  const sortedCategories = [...data.categories].sort((a, b) =>
    a.sort_order.localeCompare(b.sort_order)
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Parts &amp; Upgrades for {variantName}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {data.total_parts} parts from {data.parts_with_links} sources
        </p>
      </div>

      {sortedCategories.map((cat) => {
        const hasVintage = cat.parts.some((p) => p.part_era === 'vintage' || p.is_collectible)

        return (
          <div key={cat.category_slug}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-medium text-white">{cat.category_name}</h3>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                {cat.part_count}
              </span>
            </div>

            {hasVintage && data.has_vintage && (
              <p className="mb-3 text-xs text-amber-500/70">
                These are vintage/collectible parts. Values vary significantly.
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {cat.parts.map((part) => (
                <PartCard key={part.part_id} part={part} categorySlug={cat.category_slug} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
