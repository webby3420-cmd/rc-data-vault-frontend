'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Zap,
  Battery,
  Settings2,
  Activity,
  Wrench,
  Layers,
  Disc,
  Circle,
  Car,
  Radio,
  Package,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
  priority?: number
  display_priority?: number
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

// Category → Lucide icon. Keyed by both category_name and category_slug for safety.
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // by category_name
  'Motors': Zap,
  'Batteries': Battery,
  'ESC / Speed Control': Settings2,
  'ESCs': Settings2,
  'Servos': Activity,
  'Suspension Arms': Wrench,
  'Shocks & Dampers': Layers,
  'Shocks': Layers,
  'Driveshafts & CVDs': Disc,
  'Driveshafts': Disc,
  'Differentials': Disc,
  'Tires & Wheels': Circle,
  'Tires': Circle,
  'Wheels': Circle,
  'Body & Exterior': Car,
  'Body / Exterior': Car,
  'Receivers & Transmitters': Radio,
  'Radio': Radio,
  // by category_slug
  motors: Zap,
  batteries: Battery,
  escs: Settings2,
  servos: Activity,
  'suspension-arms': Wrench,
  shocks: Layers,
  driveshafts: Disc,
  differentials: Disc,
  tires: Circle,
  wheels: Circle,
  'body-exterior': Car,
  radio: Radio,
  chassis: Wrench,
  bearings: Disc,
  'gear-sets': Disc,
  'screws-fasteners': Wrench,
  'tools-accessories': Wrench,
  'axles-hubs': Disc,
  'wheel-accessories': Circle,
}

function iconFor(category: Category | undefined): LucideIcon {
  if (!category) return Package
  return (
    CATEGORY_ICON_MAP[category.category_name] ??
    CATEGORY_ICON_MAP[category.category_slug] ??
    Package
  )
}

// Amazon-first link sort (DB display_priority has Amazon at 5/lowest — must override).
function sortLinks(links: PurchaseLink[]): PurchaseLink[] {
  const order: Record<string, number> = { amazon: 0, ebay: 1 }
  return [...links].sort((a, b) => {
    const aRank = order[a.retailer_slug] ?? 2
    const bRank = order[b.retailer_slug] ?? 2
    if (aRank !== bRank) return aRank - bRank
    const aPri = a.display_priority ?? a.priority ?? 0
    const bPri = b.display_priority ?? b.priority ?? 0
    return bPri - aPri
  })
}

function validLinks(links: PurchaseLink[] | undefined | null): PurchaseLink[] {
  if (!links) return []
  return links.filter((l) => typeof l.url === 'string' && l.url.trim().length > 0)
}

const TYPE_BADGE: Record<string, { cls: string; label: string }> = {
  oem: { cls: 'bg-blue-900/40 text-blue-300', label: 'OEM' },
  aftermarket_upgrade: { cls: 'bg-purple-900/40 text-purple-300', label: 'Upgrade' },
  universal_fitment: { cls: 'bg-slate-800 text-slate-400', label: 'Universal' },
}

function PartTypeBadge({ part }: { part: Part }) {
  const b = part.is_oem
    ? TYPE_BADGE.oem
    : TYPE_BADGE[part.part_type] ?? TYPE_BADGE.universal_fitment
  return <span className={`${b.cls} text-[11px] px-1.5 py-0.5 rounded font-medium`}>{b.label}</span>
}

function CtaButton({ link, primary }: { link: PurchaseLink; primary: boolean }) {
  const priceLabel = link.price_usd != null ? ` $${Math.round(link.price_usd)}` : ''
  return (
    <a
      href={link.url}
      target={link.retailer_slug === 'ebay' ? '_self' : '_blank'}
      rel="noopener noreferrer sponsored"
      className={`inline-flex min-h-11 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
        primary
          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
          : 'border border-slate-600 text-slate-200 hover:border-amber-500 hover:text-amber-400'
      }`}
    >
      <span className="truncate">{link.retailer_name}{priceLabel}</span>
      <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0" />
    </a>
  )
}

function PartCard({ part, category }: { part: Part; category: Category }) {
  const Icon = iconFor(category)
  const brand = part.manufacturer || part.aftermarket_brand
  const priceDisplay = fmt(part.best_price)
  const msrpDisplay = !priceDisplay && part.msrp ? `MSRP ${fmt(part.msrp)}` : null
  const links = sortLinks(validLinks(part.purchase_links)).slice(0, 3)

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 space-y-2">
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-white leading-5 line-clamp-2">
            {part.part_name}
          </span>
          {priceDisplay ? (
            <span className="flex-shrink-0 text-sm font-semibold text-amber-400">{priceDisplay}</span>
          ) : msrpDisplay ? (
            <span className="flex-shrink-0 text-xs text-slate-500">{msrpDisplay}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <PartTypeBadge part={part} />
        {brand && <span className="text-xs text-slate-500">{brand}</span>}
        {part.part_number && (
          <span className="text-xs text-slate-600 ml-auto">#{part.part_number}</span>
        )}
      </div>

      {part.description && (
        <p className="text-xs text-slate-500 line-clamp-2">{part.description}</p>
      )}

      {links.length > 0 && (
        <div className={`grid gap-1.5 pt-0.5 ${links.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {links.map((link, i) => (
            <CtaButton key={link.link_id} link={link} primary={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}

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

function selectTopUpgrades(categories: Category[]): Part[] {
  const allParts = categories.flatMap((c) => c.parts)
  const upgrades = allParts.filter(
    (p) => p.part_type === 'aftermarket_upgrade' && validLinks(p.purchase_links).length > 0
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

    score += Math.min(validLinks(p.purchase_links).length * 10, 20)

    const firstLink = sortLinks(validLinks(p.purchase_links))[0]
    const price = firstLink?.price_usd ?? p.msrp ?? 0
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

function UpgradeCard({ part, category }: { part: Part; category: Category | undefined }) {
  const Icon = iconFor(category)
  const links = sortLinks(validLinks(part.purchase_links))
  const bestLink = links[0]
  const price = bestLink?.price_usd ?? part.msrp

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-white leading-5 line-clamp-1">{part.part_name}</div>
          {price != null && (
            <div className="text-xs text-amber-400 mt-0.5">${Number(price).toFixed(2)}</div>
          )}
        </div>
      </div>
      {bestLink?.url && (
        <a
          href={bestLink.url}
          target={bestLink.retailer_slug === 'ebay' ? '_self' : '_blank'}
          rel="noopener noreferrer sponsored"
          className="flex-shrink-0 inline-flex min-h-11 items-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Buy
        </a>
      )}
    </div>
  )
}

const PREVIEW_LIMIT = 5

function CategorySection({
  category,
  defaultOpen,
}: {
  category: Category
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [showAll, setShowAll] = useState(category.parts.length <= PREVIEW_LIMIT)
  const visibleParts = showAll ? category.parts : category.parts.slice(0, PREVIEW_LIMIT)
  const Icon = iconFor(category)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full min-h-11 items-center justify-between py-2 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" aria-hidden />
          <h3 className="text-base font-medium text-white">{category.category_name}</h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            {category.parts.length}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div>
          <div className="grid gap-2 md:grid-cols-2 mt-2">
            {visibleParts.map((part) => (
              <PartCard key={part.part_id} part={part} category={category} />
            ))}
          </div>
          {!showAll && category.parts.length > PREVIEW_LIMIT && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 min-h-11 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Show all {category.parts.length} →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface VariantPartsSectionProps {
  variantSlug: string
  variantName: string
}

export default function VariantPartsSection({ variantSlug }: VariantPartsSectionProps) {
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
        const raw = Array.isArray(result) ? result[0] : result
        const d = raw && typeof raw === 'object' && 'categories' in raw ? (raw as PartsData) : null
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
  const categoryForPart = (p: Part): Category | undefined => {
    for (const c of data.categories) {
      if (c.parts.some((x) => x.part_id === p.part_id)) return c
    }
    return undefined
  }

  // Phase 2: only group by category if >8 parts. Otherwise flat list.
  const useCategories = data.total_parts > 8

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
      <button
        onClick={() => setSectionOpen(!sectionOpen)}
        className="flex w-full min-h-11 items-center justify-between px-4 py-3 text-left sm:px-6 sm:py-4"
        aria-expanded={sectionOpen}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Parts Intelligence &amp; Fitment</h2>
            <span className="text-xs text-slate-500">{supportLabel}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>
              {data.total_parts} parts across {typeGroups.length} categories
            </span>
            {oemCount > 0 && <span className="text-blue-400">OEM: {oemCount}</span>}
            {upgradeCount > 0 && <span className="text-purple-400">Upgrades: {upgradeCount}</span>}
            {universalCount > 0 && <span className="text-slate-400">Universal: {universalCount}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className="text-xs text-slate-500">
            {sectionOpen ? 'Show less' : `Show all ${data.total_parts}`}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform ${sectionOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </div>
      </button>

      {topUpgrades.length > 0 && (
        <div className="px-4 pb-4 border-t border-slate-800 pt-4 sm:px-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Top Upgrades for This Model
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topUpgrades.map((part) => (
              <UpgradeCard key={part.part_id} part={part} category={categoryForPart(part)} />
            ))}
          </div>
        </div>
      )}

      {sectionOpen && (
        <div className="px-4 pb-6 border-t border-slate-800 pt-4 space-y-6 sm:px-6">
          {useCategories ? (
            data.categories.map((cat, i) => (
              <CategorySection key={cat.category_slug} category={cat} defaultOpen={i < 2} />
            ))
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {data.categories.flatMap((cat) =>
                cat.parts.map((part) => (
                  <PartCard key={part.part_id} part={part} category={cat} />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
