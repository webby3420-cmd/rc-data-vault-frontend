import type { VariantPagePayload } from "@/types/variant-page";

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

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
      <div className="mb-2 text-sm uppercase tracking-wide text-slate-400">
        Bluebook Value
      </div>

      <div className="text-5xl font-semibold text-amber-400">
        {formatCurrency(valuation.estimated_value_mid)}
      </div>

      <div className="mt-3 text-lg text-slate-200">
        Range: {formatCurrency(valuation.estimated_value_low)} –{" "}
        {formatCurrency(valuation.estimated_value_high)}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
        <span className="rounded-full border border-slate-600 px-3 py-1">
          {valuation.confidence_label}
        </span>
        <span>{valuation.observation_count} sold listings</span>
        <span>Updated {formatDate(valuation.valuation_last_updated_at)}</span>
      </div>
    </section>
  );
}
