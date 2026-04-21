'use client'

import type { BuyChannel } from '@/lib/purchase-link-router'

// ─── Affiliate URL builders ───────────────────────────

const AMAZON_TAG   = 'rcdatavault-20'
const EBAY_CAMPID  = '5339148896'

function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`
}

function ebaySearchUrl(query: string): string {
  return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=${EBAY_CAMPID}&customid=&toolid=10001&mkevt=1`
}

// Manufacturer homepage search URLs — extend as more brands are added
const MFR_SEARCH: Record<string, (q: string) => string> = {
  traxxas:        (q) => `https://traxxas.com/search?q=${encodeURIComponent(q)}`,
  arrma:          (q) => `https://www.arrma-rc.com/rc-cars`,
  losi:           (q) => `https://www.losi.com/search?q=${encodeURIComponent(q)}`,
  axial:          (q) => `https://www.axialadventure.com/search?q=${encodeURIComponent(q)}`,
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
  className?:       string
}

// ─── Component ───────────────────────────────────────

export default function VariantBuyBlock({
  variantName,
  manufacturerSlug,
  className = '',
}: VariantBuyBlockProps) {
  const amazon   = amazonSearchUrl(variantName)
  const ebay     = ebaySearchUrl(variantName)
  const mfrFn    = MFR_SEARCH[manufacturerSlug]
  const mfr      = mfrFn ? mfrFn(variantName) : null

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
