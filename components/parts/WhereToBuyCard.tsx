'use client'

/**
 * WhereToBuyCard.tsx
 * ───────────────────
 * Variant-page "Where to Buy" section — mobile-first stacked button card.
 * Dark-first: uses slate-* palette to match site's bg-slate-950 design system.
 *
 * Usage inside the compatible parts section on variant page:
 *
 *   import { WhereToBuyCard } from '@/components/parts/WhereToBuyCard'
 *   import { adaptDbPartLinks } from '@/lib/purchase-link-adapter'
 *
 *   {(part.link_count ?? 0) > 0 && (
 *     <WhereToBuyCard
 *       purchaseLinks={adaptDbPartLinks(part.purchase_links)}
 *       partName={part.part_name}
 *       partNumber={part.part_number}
 *       className="mt-3"
 *     />
 *   )}
 *
 * Drop-in location: components/parts/WhereToBuyCard.tsx
 */

import { resolvePurchaseLinks, type BuyChannel, type PurchaseLinkRow, type ResolvedLink } from '@/lib/purchase-link-router'
import { trackBuyClick } from '@/lib/trackBuyClick'

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

// ─── Icons ────────────────────────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5 shrink-0 opacity-40" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  )
}

function ChannelIcon({ channel }: { channel: ResolvedLink['channel'] }) {
  if (channel === 'amazon') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden>
        <path d="M13.23 10.56v-.33c-.97.11-2.18.23-2.18 1.38 0 .6.32 1.01.87 1.01.4 0 .76-.25 1-.63.27-.45.31-.87.31-1.43zm1.74 4.2c-.11.1-.27.11-.4.04-1.39-1.16-1.33-1.14-2.74.04-.45.38-1.03.57-1.65.57-1.08 0-2.06-.67-2.24-1.9-.19-1.31.55-2.01 1.56-2.4 1.23-.5 2.9-.59 2.9-1.41v-.27c0-.47-.15-.82-.46-1.06-.31-.24-.74-.33-1.26-.33-.52 0-1 .13-1.4.39-.4.25-.65.63-.72 1.06h-1.7c.13-1.53 1.38-2.53 3.38-2.53 1.11 0 2 .25 2.62.73.67.52.93 1.24.93 2.12v4.02c0 .43.01.78.12 1.15.09.29.21.42.41.49v.28h-1.35zm2.49 3.74c-2.42 1.5-5.65 2.3-8.53 2.3-4.04 0-7.68-1.49-10.44-3.97-.22-.2-.02-.46.24-.31 2.97 1.73 6.65 2.77 10.44 2.77 2.56 0 5.38-.53 7.97-1.63.39-.17.71.25.32.84zm.91-1.04c-.29-.38-1.93-.18-2.67-.09-.22.03-.26-.17-.06-.31 1.31-.92 3.45-.66 3.7-.35.26.32-.07 2.52-1.29 3.57-.19.16-.37.08-.28-.13.27-.68.88-2.31.6-2.69z" />
      </svg>
    )
  }
  if (channel === 'ebay') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden>
        <path d="M3.377 7.825l-3.377 8.35h2.143l.629-1.622h2.966l.614 1.622h2.18L5.115 7.825H3.377zm.98 1.598l1.085 2.83H3.268l1.089-2.83zM9.67 7.825v8.35h1.857v-.777c.474.615 1.152.952 1.98.952 1.614 0 2.843-1.261 2.843-2.968s-1.229-2.968-2.843-2.968c-.786 0-1.456.306-1.938.888v-3.477H9.67zm3.429 3.766c.876 0 1.502.659 1.502 1.791 0 1.131-.626 1.79-1.502 1.79-.89 0-1.531-.683-1.531-1.79s.641-1.791 1.531-1.791zM17.078 10.239c-1.68 0-2.89 1.203-2.89 2.968s1.21 2.968 2.89 2.968c.982 0 1.768-.395 2.29-1.077l-1.283-.868c-.267.35-.627.541-1.007.541-.64 0-1.093-.392-1.25-1.022h3.897c.024-.181.037-.367.037-.542 0-1.765-1.1-2.968-2.684-2.968zm-1.243 2.37c.14-.644.576-1.068 1.162-1.068.595 0 1.053.43 1.146 1.068h-2.308zM20.338 10.407l1.569 4.293 1.569-4.293h1.524l-2.484 6.23c-.486 1.21-.98 1.49-2.055 1.49h-1.014v-1.336h.65c.464 0 .655-.088.82-.52l-2.1-5.864h1.521z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 shrink-0" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.5 21v-7.5A.75.75 0 0114.25 13h1.5a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016 2.993 2.993 0 002.25-1.016 3.001 3.001 0 003.75.614" />
    </svg>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

function PrimaryButton({ link, partNumber }: { link: ResolvedLink; partNumber: string | null }) {
  const isAmazon = link.channel === 'amazon'
  const { label, sub } = getRetailerCopy(link.retailerSlug, link.channel)
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackBuyClick({
        channel: link.channel,
        surface: 'variant_part_card',
        label: partNumber ?? undefined,
      })}
      className={[
        'group flex items-center gap-3 w-full px-4 py-3.5 rounded-xl',
        'font-semibold text-sm leading-none transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
        isAmazon
          ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 focus-visible:ring-amber-400'
          : 'bg-slate-700 hover:bg-slate-600 text-white focus-visible:ring-slate-500',
      ].join(' ')}
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-black/10 shrink-0">
        <ChannelIcon channel={link.channel} />
      </span>
      <span className="flex-1 flex flex-col items-start gap-0.5">
        <span>{label}</span>
        {sub && <span className="text-[11px] text-slate-500 leading-tight font-normal">{sub}</span>}
      </span>
      <ExternalLinkIcon />
    </a>
  )
}

function SecondaryButton({ link, partNumber }: { link: ResolvedLink; partNumber: string | null }) {
  const { label, sub } = getRetailerCopy(link.retailerSlug, link.channel)
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackBuyClick({
        channel: link.channel,
        surface: 'variant_part_card',
        label: partNumber ?? undefined,
      })}
      className={[
        'group flex items-center gap-3 w-full px-4 py-2.5 rounded-lg',
        'text-sm font-medium leading-none transition-all duration-150',
        'border border-slate-700 hover:border-slate-600',
        'text-slate-300 hover:text-white',
        'bg-slate-800/50 hover:bg-slate-800',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'focus-visible:ring-offset-slate-900 focus-visible:ring-slate-500',
      ].join(' ')}
    >
      <span className="text-slate-500 group-hover:text-slate-400 transition-colors shrink-0">
        <ChannelIcon channel={link.channel} />
      </span>
      <span className="flex-1 flex flex-col items-start gap-0.5">
        <span>{label}</span>
        {sub && <span className="text-[11px] text-slate-500 leading-tight font-normal">{sub}</span>}
      </span>
      <ExternalLinkIcon />
    </a>
  )
}

function EmptyState({ partName }: { partName: string }) {
  return (
    <div className="rounded-xl border border-slate-800 px-4 py-3 text-center">
      <p className="text-xs text-slate-500">No verified purchase links available.</p>
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(partName + ' buy RC')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-xs text-slate-400 underline underline-offset-2 hover:text-slate-200"
      >
        Search Google →
      </a>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  purchaseLinks: PurchaseLinkRow[]
  ebaySearchUrl?: string | null
  partName: string
  partNumber?: string | null
  className?: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WhereToBuyCard({ purchaseLinks, ebaySearchUrl, partName, partNumber, className }: Props) {
  const resolved = resolvePurchaseLinks(purchaseLinks, ebaySearchUrl)

  return (
    <section className={['', className].filter(Boolean).join(' ')} aria-label="Where to buy">
      <div className="flex items-baseline gap-2 mb-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Where to Buy
        </h3>
        {partNumber && (
          <span className="text-xs text-slate-600 font-mono">{partNumber}</span>
        )}
      </div>

      {resolved.isEmpty ? (
        <EmptyState partName={partName} />
      ) : (
        <div className="space-y-2">
          {resolved.primary && (
            <PrimaryButton link={resolved.primary} partNumber={partNumber ?? null} />
          )}

          {resolved.secondaries.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              {resolved.secondaries.map((link) => (
                <SecondaryButton key={link.retailerSlug} link={link} partNumber={partNumber ?? null} />
              ))}
            </div>
          )}

          <p className="text-[10px] text-slate-600 px-1 pt-0.5">
            {resolved.hasAmazon
              ? 'Affiliate link · Amazon pricing may vary.'
              : resolved.hasEbay
              ? 'eBay listings vary by seller — check condition and shipping.'
              : 'Verify availability on retailer site.'}
          </p>
        </div>
      )}
    </section>
  )
}

export default WhereToBuyCard
