import type { VariantPagePayload } from "@/types/variant-page";
import {
  formatNewestSoldComp,
  freshnessCopy,
  freshnessIsDemoted,
  freshnessIsWarning,
  freshnessShortLabel,
  resolveFreshnessBucket,
} from "@/lib/valuation/freshness";

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ValueCard({ payload }: { payload: VariantPagePayload }) {
  const { valuation } = payload;
  const bucket = resolveFreshnessBucket(valuation);
  const tooltip = freshnessCopy(bucket);
  const showFreshnessChip = freshnessIsWarning(bucket);
  const demoted = freshnessIsDemoted(bucket);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
      <div className="mb-2 text-sm uppercase tracking-wide text-slate-400">
        Fair Market Value
      </div>

      <div className="text-5xl font-semibold text-amber-400">
        {formatCurrency(valuation.estimated_value_mid)}
      </div>

      <div className="mt-3 text-lg text-slate-200">
        Range: {formatCurrency(valuation.estimated_value_low)} –{" "}
        {formatCurrency(valuation.estimated_value_high)}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
        <span
          className={
            demoted
              ? "rounded-full border border-amber-700/50 bg-amber-500/10 px-3 py-1 text-amber-200"
              : "rounded-full border border-slate-600 px-3 py-1"
          }
          title={tooltip}
        >
          {valuation.confidence_label}
        </span>
        {showFreshnessChip && (
          <span
            className="rounded-full border border-amber-700/50 bg-amber-500/10 px-3 py-1 text-amber-200"
            title={tooltip}
          >
            {freshnessShortLabel(bucket)}
          </span>
        )}
        <span>{valuation.observation_count} sold listings</span>
        <span>Updated {formatDate(valuation.valuation_last_updated_at)}</span>
      </div>

      {showFreshnessChip && valuation.newest_sold_observed_at && (
        <p className="mt-2 text-xs text-amber-300/80" title={tooltip}>
          Newest sold comp: {formatNewestSoldComp(valuation.newest_sold_observed_at)}
        </p>
      )}
    </section>
  );
}
