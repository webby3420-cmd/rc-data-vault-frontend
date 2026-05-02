'use client'

import { trackBuyClick } from '@/lib/trackBuyClick'

// ─── Affiliate URL builders ───────────────────────────

const AMAZON_TAG   = 'rcdatavault-20'
const EBAY_CAMPID  = '5339148896'

function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`
}

function ebaySearchUrl(query: string, customId: string): string {
  return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&LH_BIN=1&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=${EBAY_CAMPID}&customid=${encodeURIComponent(customId)}&toolid=10001&mkevt=1`
}

// Manufacturer homepage search URLs — extend as more brands are added.
// `q` is the variant display name; `familySlug` is the canonical lowercase
// family slug (e.g. "x-maxx") and is preferred when the brand's URL scheme
// addresses by family rather than search query.
const MFR_SEARCH: Record<string, (q: string, familySlug?: string) => string> = {
  // TRAXXAS — model-family page, addressed by canonical lowercase slug.
  // Pattern: traxxas.com/products/models/electric/<family-slug>
  //   confirmed for: x-maxx, slash, maxx, rustler, e-revo, ...
  // Prefer the family slug from URL params; fall back to deriving a slug
  // from the variant name (lowercased, leading brand + trailing variant
  // suffix stripped) so the link still works for any caller that doesn't
  // pass familySlug. Either way the resulting suffix is lowercase.
  traxxas: (q, familySlug) => {
    if (familySlug) {
      return `https://traxxas.com/products/models/electric/${familySlug}`
    }
    const derived = q
      .replace(/^traxxas\s+/i, '')
      .replace(/\s+(rtr|brushless|vxl|trx|4x4|2wd|4wd|blx|telluride|\d+s)\b.*$/i, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
    return derived
      ? `https://traxxas.com/products/models/electric/${encodeURIComponent(derived)}`
      : 'https://traxxas.com/products/models'
  },

  // ARRMA — upgraded from dead catalog stub to Horizon Hobby search
  // arrma-rc.com has no useful site search.
  // horizonhobby.com is the authorized ARRMA distributor and has
  // excellent search. The variant_purchase_links for ARRMA are
  // all horizon_hobby search URLs. Use the same destination.
  arrma: (q) => `https://www.horizonhobby.com/search?q=${encodeURIComponent(q)}`,

  // LOSI — keep search, stays on losi.com (same Horizon family)
  // Confirmed: losi.com/search?q= returns correct product pages
  losi: (q) => `https://www.losi.com/search?q=${encodeURIComponent(q)}`,

  // AXIAL — keep search (axialadventure.com is the Horizon-family site)
  axial: (q) => `https://www.axialadventure.com/search?q=${encodeURIComponent(q)}`,

  // TEAM ASSOCIATED — keep search (direct manufacturer search works)
  'team-associated': (q) => `https://www.teamassociated.com/search/?q=${encodeURIComponent(q)}`,
}

// ─── Retailer copy ────────────────────────────────────

const COPY = {
  amazon: { label: 'Buy on Amazon',       sub: 'Fast shipping • Verified product' },
  ebay:   { label: 'Find on eBay',        sub: 'New & used listings' },
  mfr:    { label: 'View on brand site',  sub: 'Official specs & support' },
} as const

// ─── Icons ───────────────────────────────────────────

function ExternalIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 opacity-60" fill="none"
         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

// ─── Props ───────────────────────────────────────────

interface VariantBuyBlockProps {
  variantName:      string
  manufacturerSlug: string
  variantSlug:      string
  familySlug?:      string
  className?:       string
}

// ─── Component ───────────────────────────────────────

export default function VariantBuyBlock({
  variantName,
  manufacturerSlug,
  variantSlug,
  familySlug,
  className = '',
}: VariantBuyBlockProps) {
  const amazon   = amazonSearchUrl(variantName)
  const ebay     = ebaySearchUrl(variantName, variantSlug)
  const mfrFn    = MFR_SEARCH[manufacturerSlug]
  const mfr      = mfrFn ? mfrFn(variantName, familySlug) : null

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Where to buy new
      </p>

      {/* Primary — Amazon */}
      <a
        href={amazon}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={() => trackBuyClick({
          channel: 'amazon',
          surface: 'variant_retail_block',
          label: variantSlug,
        })}
        className="flex w-full items-center gap-3 rounded-lg bg-amber-500 px-4 py-2.5
                   text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        <span className="flex-1 flex flex-col items-start gap-0.5">
          <span>{COPY.amazon.label}</span>
          <span className="text-[11px] font-normal text-slate-800 leading-tight">
            {COPY.amazon.sub}
          </span>
        </span>
        <ExternalIcon />
      </a>

      {/* Secondary row — eBay + manufacturer */}
      <div className="flex flex-wrap gap-2">
        <a
          href={ebay}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          onClick={() => trackBuyClick({
            channel: 'ebay',
            surface: 'variant_retail_block',
            label: variantSlug,
          })}
          className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700
                     bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300
                     transition hover:border-slate-500 hover:text-white min-w-[120px]"
        >
          <span className="flex-1">{COPY.ebay.label}</span>
          <ExternalIcon />
        </a>

        {mfr && (
          <a
            href={mfr}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => trackBuyClick({
              channel: 'manufacturer',
              surface: 'variant_retail_block',
              label: variantSlug,
            })}
            className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700
                       bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300
                       transition hover:border-slate-500 hover:text-white min-w-[120px]"
          >
            <span className="flex-1">{COPY.mfr.label}</span>
            <ExternalIcon />
          </a>
        )}
      </div>

      <p className="text-[10px] text-slate-600 leading-snug">
        Links may include affiliate tracking. RC Data Vault earns a small
        commission at no extra cost to you.
      </p>
    </div>
  )
}
