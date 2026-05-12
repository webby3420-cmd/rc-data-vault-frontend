// Freshness-aware valuation trust + price triangle for future variant_value
// SEO pages. Self-contained: tier=unknown suppresses the price triangle and
// shows "Insufficient data to score." Other low-quality tiers (low, stale,
// stale_limited, insufficient) keep the numbers but visually qualify them.
//
// Primary trust signal is trust.tier_label — raw_confidence is NEVER shown.

import type {
  VariantValuePayload,
  VariantValueTier,
} from '@/types/variant-value-page';

const TIER_BADGE_CLS: Record<VariantValueTier, string> = {
  high: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  high_aging: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  low: 'bg-amber-100 text-amber-900 border-amber-200',
  stale: 'bg-orange-100 text-orange-900 border-orange-200',
  stale_limited: 'bg-orange-100 text-orange-900 border-orange-200',
  insufficient: 'bg-rose-100 text-rose-900 border-rose-200',
  unknown: 'bg-gray-100 text-gray-700 border-gray-200',
};

const QUALIFIED_TIERS = new Set<VariantValueTier>([
  'low',
  'stale',
  'stale_limited',
  'insufficient',
  'unknown',
]);

function fmtUSD(n: number | null): string {
  if (n == null) return '—';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function VariantValueTrustBlock({
  payload,
}: {
  payload: VariantValuePayload;
}) {
  const { fair_value, low_value, high_value, trust } = payload;
  const tier = trust.tier;
  const isUnknown = tier === 'unknown';
  const isQualified = QUALIFIED_TIERS.has(tier);

  return (
    <section
      aria-labelledby="vv-trust-heading"
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      data-testid="variant-value-trust-block"
      data-tier={tier}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h2
          id="vv-trust-heading"
          className="text-sm font-semibold text-gray-900"
        >
          Estimated value
        </h2>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TIER_BADGE_CLS[tier]}`}
          data-testid="vv-tier-label"
        >
          {trust.tier_label}
        </span>
      </header>

      <p
        className="mt-2 text-xs text-gray-600"
        data-testid="vv-sample-line"
      >
        Sample:{' '}
        <strong className="font-medium text-gray-800">
          {trust.sample_size}
        </strong>
        {trust.sample_size === 1 ? ' sale' : ' sales'}
        <span aria-hidden="true" className="mx-2 text-gray-300">
          ·
        </span>
        Last sold:{' '}
        <strong className="font-medium text-gray-800">
          {fmtDate(trust.latest_sold_comp_date)}
        </strong>
      </p>

      {isUnknown ? (
        <p
          className="mt-4 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-700"
          data-testid="vv-insufficient"
        >
          Insufficient data to score.
        </p>
      ) : (
        <div
          className="mt-4 grid grid-cols-3 items-end gap-2 sm:gap-4"
          data-testid="vv-price-triangle"
        >
          <div className={`text-left ${isQualified ? 'text-gray-400' : 'text-gray-700'}`}>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              Low
            </div>
            <div className="mt-1 text-base font-medium tabular-nums sm:text-lg">
              {fmtUSD(low_value)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              Fair value
            </div>
            <div
              className={`mt-1 text-2xl font-semibold tabular-nums sm:text-3xl ${
                isQualified ? 'text-gray-500' : 'text-gray-900'
              }`}
            >
              {fmtUSD(fair_value)}
            </div>
          </div>
          <div className={`text-right ${isQualified ? 'text-gray-400' : 'text-gray-700'}`}>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              High
            </div>
            <div className="mt-1 text-base font-medium tabular-nums sm:text-lg">
              {fmtUSD(high_value)}
            </div>
          </div>
        </div>
      )}

      {isQualified && !isUnknown && (
        <p
          className="mt-3 text-xs text-gray-500"
          data-testid="vv-qualifier"
        >
          Estimate is indicative only — treat as directional.
        </p>
      )}

      {trust.warning && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          data-testid="vv-warning"
        >
          <strong className="font-semibold">Heads up:</strong> {trust.warning}
        </div>
      )}
    </section>
  );
}
