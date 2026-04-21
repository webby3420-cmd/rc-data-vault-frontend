'use client'

/**
 * BuyBar.tsx
 * ───────────
 * Compact buy bar for tool-result part cards (ESC calculator, etc.).
 * One primary CTA + one optional secondary text link. No clutter.
 * Dark-first: uses slate-* palette to match site's bg-slate-950 design system.
 *
 * Usage inside ESC calculator result cards:
 *
 *   import { BuyBar } from '@/components/parts/BuyBar'
 *   import { adaptDbPartLinks } from '@/lib/purchase-link-adapter'
 *
 *   <BuyBar
 *     purchaseLinks={adaptDbPartLinks(part.purchase_links ?? [])}
 *     partName={part.part_name}
 *     className="mt-2"
 *   />
 *
 * Drop-in location: components/parts/BuyBar.tsx
 */

import { resolvePurchaseLinks, type BuyChannel, type PurchaseLinkRow } from '@/lib/purchase-link-router'

// ─── Retailer copy ────────────────────────────────────────────────────────────

const RETAILER_COPY: Record<string, { label: string; sub: string | null }> = {
  amazon: { label: 'Buy on Amazon',      sub: 'Fast shipping • Verified product' },
  ebay:   { label: 'View deals on eBay', sub: 'New & used listings' },
}

function getRetailerCopy(slug: string, channel: BuyChannel): { label: string; sub: string | null } {
  if (RETAILER_COPY[slug]) return RETAILER_COPY[slug]
  if (slug.startsWith('castle') || channel === 'manufacturer_direct')
    return { label: 'View official product', sub: 'Specs & compatibility' }
  return { label: 'View product', sub: null }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  purchaseLinks: PurchaseLinkRow[]
  ebaySearchUrl?: string | null
  partName: string
  className?: string
  loading?: boolean
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5 shrink-0" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3 h-3 opacity-50 shrink-0" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="h-7 rounded-lg bg-slate-800 flex-1" />
      <div className="h-7 w-20 rounded-lg bg-slate-800/60" />
    </div>
  )
}

function EmptyBar() {
  return <p className="text-xs text-slate-600 italic">No purchase links available</p>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BuyBar({ purchaseLinks, ebaySearchUrl, partName, className, loading }: Props) {
  if (loading) return <Skeleton />

  const resolved = resolvePurchaseLinks(purchaseLinks, ebaySearchUrl)
  if (resolved.isEmpty) return <EmptyBar />

  const { primary, secondaries } = resolved
  const secondary = secondaries[0] ?? null

  return (
    <div
      className={['flex items-center gap-2 flex-wrap', className].filter(Boolean).join(' ')}
      aria-label={`Buy ${partName}`}
    >
      {primary && (
        <a
          href={primary.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'text-xs font-semibold leading-none whitespace-nowrap',
            'transition-all duration-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900',
            primary.channel === 'amazon'
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 focus-visible:ring-amber-400'
              : primary.channel === 'ebay'
              ? 'bg-blue-600 hover:bg-blue-500 text-white focus-visible:ring-blue-500'
              : 'bg-slate-700 hover:bg-slate-600 text-white focus-visible:ring-slate-500',
          ].join(' ')}
        >
          <CartIcon />
          {getRetailerCopy(primary.retailerSlug, primary.channel).label}
        </a>
      )}

      {secondary && (
        <a
          href={secondary.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={[
            'inline-flex items-center gap-1 px-1',
            'text-xs text-slate-500 hover:text-slate-300',
            'underline underline-offset-2 decoration-slate-700 hover:decoration-slate-500',
            'transition-colors duration-100 whitespace-nowrap',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-500 rounded',
          ].join(' ')}
        >
          {secondary.retailerName}
          <ExternalIcon />
        </a>
      )}
    </div>
  )
}

export default BuyBar
