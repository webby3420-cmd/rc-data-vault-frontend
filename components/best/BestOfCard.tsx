import PriceAlertSignup from "@/components/PriceAlertSignup";

type BestOfVariant = {
  variant_name: string;
  variant_slug: string;
  manufacturer: string;
  manufacturer_slug: string;
  family_slug: string;
  canonical_url: string;
  scale: string | null;
  vehicle_class: string | null;
  power_type: string | null;
  battery_config: string | null;
  top_speed_mph: number | null;
  msrp_usd: number | null;
  fair_value: number | null;
  low_value: number | null;
  high_value: number | null;
  confidence: string | null;
  obs_count: number;
  value_vs_msrp_pct: number | null;
};

function fmt(n: number | null) {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}

const CONFIDENCE_CLS: Record<string, string> = {
  reliable: "text-green-400 bg-green-900/30",
  low: "text-amber-400 bg-amber-900/30",
};

export default function BestOfCard({
  variant,
  rank,
  signupSource,
  imageUrl,
}: {
  variant: BestOfVariant;
  rank: number;
  signupSource: string;
  imageUrl?: string | null;
}) {
  const v = variant;
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl font-bold text-slate-600 flex-shrink-0 w-10 text-center">
          {rank}
        </div>
        {imageUrl && (
          <div className="flex-shrink-0 overflow-hidden rounded-lg border border-slate-700 w-20 h-20">
            <img src={imageUrl} alt={v.variant_name} className="h-full w-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{v.variant_name}</h3>
            <span className="inline-block rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400 mt-1">
              {v.manufacturer}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-amber-400">{fmt(v.fair_value)}</span>
            <span className="text-sm text-slate-400">
              {fmt(v.low_value)} – {fmt(v.high_value)}
            </span>
          </div>

          {v.confidence && (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                CONFIDENCE_CLS[v.confidence] ?? "text-slate-400 bg-slate-800"
              }`}
            >
              {v.confidence}
            </span>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {v.scale && <span>{v.scale}</span>}
            {v.vehicle_class && <span className="capitalize">{v.vehicle_class.replace(/_/g, " ")}</span>}
            {v.top_speed_mph != null && <span>{v.top_speed_mph} mph</span>}
          </div>

          {v.value_vs_msrp_pct != null && (
            <p className={`text-sm ${v.value_vs_msrp_pct < 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {v.value_vs_msrp_pct < 0
                ? `${Math.abs(Math.round(v.value_vs_msrp_pct))}% below MSRP`
                : `${Math.round(v.value_vs_msrp_pct)}% above MSRP`}
            </p>
          )}

          <p className="text-xs text-slate-500">Based on {v.obs_count} sold listings</p>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={v.canonical_url}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              View full market data &rarr;
            </a>
            <a
              href={`/tools?tool=deal&model=${v.variant_slug}`}
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
            >
              Check a price &rarr;
            </a>
          </div>

          <PriceAlertSignup
            variantId={v.variant_slug}
            variantSlug={v.variant_slug}
            modelName={`${v.manufacturer} ${v.variant_name}`}
            mfrSlug={v.manufacturer_slug}
            familySlug={v.family_slug}
            signupSource={signupSource}
          />
        </div>
      </div>
    </div>
  );
}
