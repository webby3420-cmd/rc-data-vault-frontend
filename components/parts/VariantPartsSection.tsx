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
  fitment_type?: string
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

function ensureAmazonTag(url: string): string {
  if (!url) return url
  const tag = 'rcdatavault-20'
  if (url.includes('tag=')) return url
  return url + (url.includes('?') ? '&' : '?') + `tag=${tag}`
}

function buildPartLinks(purchaseLinks: PurchaseLink[], partName: string, partSlug: string): PurchaseLink[] {
  const encodedName = encodeURIComponent(partName)
  const encodedSlug = encodeURIComponent(partSlug)

  // Categorize existing DB links
  const amazonLinks: PurchaseLink[] = []
  const amainLinks: PurchaseLink[] = []
  const otherLinks: PurchaseLink[] = []

  for (const link of purchaseLinks) {
    if (!link.url) continue
    const slug = (link.retailer_slug ?? '').toLowerCase()
    const url = link.url.toLowerCase()
    if (slug === 'amazon' || url.includes('amazon.com')) {
      amazonLinks.push({ ...link, retailer_name: 'Amazon', url: ensureAmazonTag(link.url) })
    } else if (slug === 'amain' || slug === 'amain-hobbies' || url.includes('amainhobbies.com')) {
      amainLinks.push({ ...link, retailer_name: 'AMain Hobbies' })
    } else {
      otherLinks.push(link)
    }
  }

  // Amazon fallback: search link if no stored URL
  if (amazonLinks.length === 0) {
    amazonLinks.push({
      link_id: `amazon-search-${partSlug}`,
      retailer_name: 'Amazon',
      retailer_slug: 'amazon',
      retailer_type: 'mass_market',
      url: `https://www.amazon.com/s?k=${encodedName}&tag=rcdatavault-20`,
      price_usd: null,
      in_stock: true,
      priority: 1,
    })
  }

  // eBay: always a generated affiliate search link
  const ebayLink: PurchaseLink = {
    link_id: `ebay-search-${partSlug}`,
    retailer_name: 'eBay',
    retailer_slug: 'ebay',
    retailer_type: 'marketplace',
    url: `https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5339148894&toolid=10001&customid=${encodedSlug}&type=2&kw=${encodedName}`,
    price_usd: null,
    in_stock: true,
    priority: 2,
  }

  // Order: Amazon (stored or fallback) → AMain (stored) → eBay (generated) → others
  return [...amazonLinks, ...amainLinks, ebayLink, ...otherLinks]
}

function UpgradeCard({ part, bestLink, price }: { part: Part; bestLink: PurchaseLink | undefined; price: number | null }) {
  const [imgErr, setImgErr] = useState(false)
  const imgSrc = part.thumbnail_url || part.image_url
  const showImg = imgSrc && !imgErr

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        {showImg ? (
          <img src={imgSrc} alt={part.part_name} className="w-12 h-12 object-contain rounded-lg bg-slate-800 flex-shrink-0" loading="lazy" onError={() => setImgErr(true)} />
        ) : null}
        <div className="min-w-0">
          <div className="text-sm font-medium text-white leading-5 truncate">{part.part_name}</div>
          {price != null && <div className="text-xs text-amber-400 mt-0.5">${Number(price).toFixed(2)}</div>}
        </div>
      </div>
      {bestLink?.url && (
        <a href={bestLink.url} target={bestLink.retailer_slug === 'ebay' ? '_self' : '_blank'} rel="noopener noreferrer sponsored" className="flex-shrink-0 inline-flex items-center rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-400">
          Buy
        </a>
      )}
    </div>
  )
}

function PartCard({ part, categorySlug }: { part: Part; categorySlug: string }) {
  const priceDisplay = fmt(part.best_price)
  const msrpDisplay = !priceDisplay && part.msrp ? `MSRP ${fmt(part.msrp)}` : null
  const brand = part.manufacturer || part.aftermarket_brand
  const links = buildPartLinks(part.purchase_links ?? [], part.part_name, part.part_slug).slice(0, 4)
  const imgSrc = part.thumbnail_url || part.image_url
  const [imgError, setImgError] = useState(false)
  const showImg = imgSrc && !imgError

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-slate-800 flex items-center justify-center">
          {showImg ? (
            <img src={imgSrc} alt={part.part_name} className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
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

      <div className="flex flex-wrap items-center gap-1.5">
        <PartTypeBadge part={part} />
        {brand && <span className="text-xs text-slate-500 ml-1">{brand}</span>}
        {part.part_number && (
          <span className="text-xs text-slate-600 ml-auto">#{part.part_number}</span>
        )}
      </div>

      {part.description && (
        <p className="text-xs text-slate-500 line-clamp-2">{part.description}</p>
      )}

      {links.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {links.map((link, i) => (
            <a
              key={link.link_id}
              href={link.url}
              target={link.retailer_slug === 'ebay' ? '_self' : '_blank'}
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

// ─── Type group helpers ──────────────────────────────────────────────

type TypeGroup = {
  key: string
  label: string
  parts: Part[]
}

function getPartTypeKey(part: Part): string {
  if (part.is_oem || part.part_type === 'oem_replacement') return 'oem'
  if (part.part_type === 'aftermarket_upgrade') return 'upgrade'
  return 'universal'
}

function groupByPartType(categories: Category[]): TypeGroup[] {
  const allParts = categories.flatMap((c) => c.parts)
  const groups: Record<string, Part[]> = { oem: [], upgrade: [], universal: [] }

  for (const part of allParts) {
    groups[getPartTypeKey(part)].push(part)
  }

  // Sort parts alphabetically within each group
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.part_name.localeCompare(b.part_name))
  }

  const result: TypeGroup[] = []
  if (groups.oem.length > 0) result.push({ key: 'oem', label: 'OEM Replacement', parts: groups.oem })
  if (groups.upgrade.length > 0) result.push({ key: 'upgrade', label: 'Aftermarket Upgrades', parts: groups.upgrade })
  if (groups.universal.length > 0) result.push({ key: 'universal', label: 'Universal', parts: groups.universal })
  return result
}

function getSupportLabel(total: number): string {
  if (total > 50) return 'Broad ecosystem support'
  if (total > 20) return 'Solid parts availability'
  if (total > 5) return 'Core parts covered'
  return 'Limited parts coverage'
}

// ─── Top upgrades selection ──────────────────────────────────────────

function selectTopUpgrades(categories: Category[]): Part[] {
  const allParts = categories.flatMap((c) => c.parts)
  const upgrades = allParts.filter(
    (p) => p.part_type === 'aftermarket_upgrade' && p.purchase_links && p.purchase_links.length > 0
  )

  if (upgrades.length < 3) return []

  const scored = upgrades.map((p) => {
    let score = 0
    const nameLower = p.part_name.toLowerCase()

    if (/\b(esc|speed control|mamba|ezrun|hobbywing|castle)\b/.test(nameLower)) score += 40
    if (/\b(motor|kv|brushless)\b/.test(nameLower)) score += 35
    if (/\b(combo|system|kit)\b/.test(nameLower)) score += 20
    if (/\b(tire|tyre|wheel)\b/.test(nameLower)) score += 25
    if (/\b(shock|damper|suspension|spring)\b/.test(nameLower)) score += 20
    if (/\b(diff|differential|gear|drivetrain|driveshaft|cvd)\b/.test(nameLower)) score += 20
    if (/\b(servo|steering|receiver)\b/.test(nameLower)) score += 15
    if (/\b(chassis|brace|skid|armor)\b/.test(nameLower)) score += 10
    if (/\b(arm|link|knuckle|hub)\b/.test(nameLower)) score += 8

    score += Math.min(p.purchase_links.length * 10, 20)

    const price = p.purchase_links[0]?.price_usd ?? p.msrp ?? 0
    if (price >= 200) score += 15
    else if (price >= 100) score += 10
    else if (price >= 50) score += 5

    if (/\b(castle|hobbywing|vitavon|m2c|hot racing|scorched)\b/.test(nameLower)) score += 15

    return { part: p, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const results: Part[] = []
  const seen = new Set<string>()

  for (const { part } of scored) {
    const key = part.part_name.toLowerCase().split(' ').slice(0, 3).join(' ')
    if (!seen.has(key)) {
      seen.add(key)
      results.push(part)
    }
    if (results.length >= 5) break
  }

  return results
}

// ─── Collapsible category section ───────────────────────────────────

const PREVIEW_LIMIT = 5

function CategorySection({ category, defaultOpen }: { category: Category; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [showAll, setShowAll] = useState(category.parts.length <= PREVIEW_LIMIT)
  const visibleParts = showAll ? category.parts : category.parts.slice(0, PREVIEW_LIMIT)
  const icon = CATEGORY_ICON[category.category_slug] ?? '\uD83D\uDD27'

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="text-base font-medium text-white">{category.category_name}</h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            {category.parts.length}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div>
          <div className="grid gap-3 md:grid-cols-2 mt-2">
            {visibleParts.map((part) => (
              <PartCard key={part.part_id} part={part} categorySlug={category.category_slug} />
            ))}
          </div>
          {!showAll && category.parts.length > PREVIEW_LIMIT && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Show all {category.parts.length} →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────

interface VariantPartsSectionProps {
  variantSlug: string
  variantName: string
}

export default function VariantPartsSection({ variantSlug, variantName }: VariantPartsSectionProps) {
  const [data, setData] = useState<PartsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sectionOpen, setSectionOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: result, error } = await (supabase.rpc as any)(
          'get_variant_parts',
          { p_variant_slug: variantSlug }
        )
        if (error) {
          console.error('[VariantPartsSection] RPC error:', error)
          setLoading(false)
          return
        }
        // RPC returns JSONB — supabase-js may wrap scalar in array
        const raw = Array.isArray(result) ? result[0] : result
        const d = (raw && typeof raw === 'object' && 'categories' in raw) ? raw as PartsData : null
        setData(d)
        if (d && d.categories) {
          setSectionOpen(d.total_parts <= 20 && d.categories.length <= 3)
        }
      } catch (err) {
        console.error('[VariantPartsSection] fetch error:', err)
      } finally {
        setLoading(false)
      }
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

  if (!data || data.total_parts === 0 || !data.categories) return null

  const typeGroups = groupByPartType(data.categories)
  const oemCount = typeGroups.find((g) => g.key === 'oem')?.parts.length ?? 0
  const upgradeCount = typeGroups.find((g) => g.key === 'upgrade')?.parts.length ?? 0
  const universalCount = typeGroups.find((g) => g.key === 'universal')?.parts.length ?? 0
  const supportLabel = getSupportLabel(data.total_parts)
  const topUpgrades = selectTopUpgrades(data.categories)

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
      {/* Summary bar — always visible */}
      <button
        onClick={() => setSectionOpen(!sectionOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Parts Intelligence &amp; Fitment</h2>
            <span className="text-xs text-slate-500">{supportLabel}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>{data.total_parts} parts across {typeGroups.length} categories</span>
            {oemCount > 0 && <span className="text-blue-400">OEM: {oemCount}</span>}
            {upgradeCount > 0 && <span className="text-purple-400">Upgrades: {upgradeCount}</span>}
            {universalCount > 0 && <span className="text-slate-400">Universal: {universalCount}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className="text-xs text-slate-500">
            {sectionOpen ? 'Show less' : `Show all ${data.total_parts}`}
          </span>
          <svg
            className={`h-4 w-4 text-slate-500 transition-transform ${sectionOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Top upgrades — always visible when present */}
      {topUpgrades.length > 0 && (
        <div className="px-6 pb-4 border-t border-slate-800 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Top Upgrades for This Model
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topUpgrades.map((part) => {
              const orderedLinks = buildPartLinks(part.purchase_links ?? [], part.part_name, part.part_slug)
              const bestLink = orderedLinks[0]
              const price = bestLink?.price_usd ?? part.msrp
              return (
                <UpgradeCard key={part.part_id} part={part} bestLink={bestLink} price={price} />
              )
            })}
          </div>
        </div>
      )}

      {/* Expanded content — grouped by category */}
      {sectionOpen && (
        <div className="px-6 pb-6 space-y-6 border-t border-slate-800 pt-4">
          {data.categories.map((cat) => (
            <CategorySection
              key={cat.category_slug}
              category={cat}
              defaultOpen={data.total_parts <= 20}
            />
          ))}
        </div>
      )}
    </div>
  )
}
