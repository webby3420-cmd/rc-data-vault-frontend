import { DollarSign, Package, ShoppingCart, Wrench } from "lucide-react";

type Lane = { median: number; low: number; high: number; comp_count: number };

interface PricingSnapshotProps {
  retail: {
    retail_current_price: number | null;
    retail_price_source: string | null;
  };
  segmentedPricing: {
    nib: Lane | null;
    used_complete: Lane | null;
    roller: Lane | null;
  };
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function compChip(count: number) {
  if (count >= 10) return "10+ sales";
  if (count >= 5) return "5\u20139 sales";
  return "3\u20134 sales";
}

function RangePill({ low, high }: { low: number; high: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-800/70 px-2.5 py-0.5 text-xs text-slate-400">
      {fmt(low)} – {fmt(high)}
    </span>
  );
}

function CompChip({ count }: { count: number }) {
  const color =
    count >= 10
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
      : count >= 5
      ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
      : "bg-slate-500/15 text-slate-400 border-slate-600/25";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${color}`}>
      {compChip(count)}
    </span>
  );
}

export default function PricingSnapshot({ retail, segmentedPricing }: PricingSnapshotProps) {
  const hasRetail = retail.retail_current_price != null;
  const hasNib = segmentedPricing.nib != null;
  const hasUsed = segmentedPricing.used_complete != null;
  const hasRoller = segmentedPricing.roller != null;

  if (!hasRetail && !hasNib && !hasUsed && !hasRoller) return null;

  const retailSubtitle =
    retail.retail_price_source === "variant_specs_msrp_usd"
      ? "MSRP"
      : retail.retail_price_source === "variants_msrp_original"
      ? "Original MSRP"
      : "Retail";

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Pricing Snapshot
      </h2>

      <div className="space-y-0">
        {/* Retail Now */}
        {hasRetail && (
          <div className="flex items-start gap-3 border-b border-slate-800 py-4 first:pt-0 last:border-b-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Retail Now
                </span>
                <span className="text-xs text-slate-600">{retailSubtitle}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {fmt(retail.retail_current_price!)}
              </div>
            </div>
          </div>
        )}

        {/* NIB Market */}
        {hasNib && (
          <div className="flex items-start gap-3 border-b border-slate-800 py-4 first:pt-0 last:border-b-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
              <Package className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  NIB Market
                </span>
                <CompChip count={segmentedPricing.nib!.comp_count} />
              </div>
              <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-semibold text-white">
                  {fmt(segmentedPricing.nib!.median)}
                </span>
                {segmentedPricing.nib!.comp_count >= 5 && (
                  <RangePill low={segmentedPricing.nib!.low} high={segmentedPricing.nib!.high} />
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Sealed / new-in-box resale</p>
            </div>
          </div>
        )}

        {/* Used Market */}
        {hasUsed && (
          <div className="flex items-start gap-3 border-b border-slate-800 py-4 first:pt-0 last:border-b-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
              <ShoppingCart className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Used Market
                </span>
                <CompChip count={segmentedPricing.used_complete!.comp_count} />
              </div>
              <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-semibold text-white">
                  {fmt(segmentedPricing.used_complete!.median)}
                </span>
                {segmentedPricing.used_complete!.comp_count >= 5 && (
                  <RangePill low={segmentedPricing.used_complete!.low} high={segmentedPricing.used_complete!.high} />
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Typical resale for used-complete units</p>
            </div>
          </div>
        )}

        {/* Roller Market — secondary lane */}
        {hasRoller && (
          <div className="flex items-start gap-3 py-4 first:pt-0 last:border-b-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700/40">
              <Wrench className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  Build / Project Market
                </span>
                <CompChip count={segmentedPricing.roller!.comp_count} />
              </div>
              <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                <span className="text-xl font-semibold text-slate-300">
                  {fmt(segmentedPricing.roller!.median)}
                </span>
                {segmentedPricing.roller!.comp_count >= 5 && (
                  <RangePill low={segmentedPricing.roller!.low} high={segmentedPricing.roller!.high} />
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-600">Roller / chassis-only sales</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
