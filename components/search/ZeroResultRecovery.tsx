'use client'

import Link from 'next/link'

export interface ZeroResultSuggestion {
  suggestion_type: 'family'
  name: string
  slug: string
  manufacturer_name: string
  manufacturer_slug: string
  canonical_url: string
  match_score: number
  valued_variants: number
  typical_value: number
}

interface ZeroResultRecoveryProps {
  query: string
  suggestions: ZeroResultSuggestion[]
}

function formatPrice(value: number): string {
  return '$' + Math.round(value).toLocaleString('en-US')
}

export default function ZeroResultRecovery({ query, suggestions }: ZeroResultRecoveryProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium text-slate-300">
          No exact matches for &lsquo;{query}&rsquo;
        </p>
        {suggestions.length > 0 && (
          <p className="mt-1 text-sm text-slate-500">Similar models we track:</p>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.slice(0, 3).map((s) => (
            <Link
              key={s.canonical_url}
              href={s.canonical_url}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 transition-colors hover:border-amber-500"
            >
              <span className="text-sm font-medium text-white">
                {s.manufacturer_name} {s.name}
              </span>
              {s.valued_variants > 0 ? (
                <span className="ml-3 flex-shrink-0 text-sm text-amber-400">
                  from {formatPrice(s.typical_value)}
                </span>
              ) : (
                <span className="ml-3 flex-shrink-0 text-sm text-slate-500">
                  Catalog entry
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      <div>
        <Link href="/rc" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
          Get alerted when matching listings appear &rarr;
        </Link>
      </div>
    </div>
  )
}
