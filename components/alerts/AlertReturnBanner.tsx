'use client'

const CONTEXT_NOTES: Record<string, string> = {
  priced_below_market: 'Listed below market value',
  limited_inventory: 'Inventory is limited',
  fast_moving_market: 'Selling fast right now',
  rising_market: 'Prices trending up',
}

interface AlertReturnBannerProps {
  scope: 'variant' | 'family'
  contextLabel?: string
}

export default function AlertReturnBanner({ scope, contextLabel }: AlertReturnBannerProps) {
  const note = contextLabel ? CONTEXT_NOTES[contextLabel] : undefined

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span aria-hidden="true">
          <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </span>
        <span>
          {scope === 'family'
            ? "You're viewing this because of a family alert."
            : "You're viewing this because it matched your alert."}
        </span>
      </div>
      {note && (
        <span className="flex-shrink-0 text-xs text-slate-500">{note}</span>
      )}
    </div>
  )
}
