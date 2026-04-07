import Link from "next/link";

interface Deal {
  listing_id: string;
  variant_id: string;
  variant_name: string;
  variant_slug: string;
  family_name: string;
  manufacturer_name: string;
  manufacturer_slug: string;
  family_slug: string;
  title_raw: string;
  price_amount: number;
  listing_url: string;
  condition_raw: string;
  source_name: string;
  listing_quality_score: number;
  active_median_price: number;
  active_supply_count: number;
  active_price_delta_pct: number;
  deal_score: number;
  deal_label: string;
  pct_below_market: number;
}

const labelConfig: Record<string, { color: string; text: string }> = {
  strong_buy: { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", text: "Strong Buy" },
  good_deal: { color: "bg-amber-500/20 text-amber-300 border-amber-500/30", text: "Good Deal" },
  fair: { color: "bg-slate-500/20 text-slate-300 border-slate-600/30", text: "Fair" },
  overpriced_or_risky: { color: "bg-red-500/10 text-red-400 border-red-500/20", text: "Risky" },
};

export default function DealCard({ deal }: { deal: Deal }) {
  const label = labelConfig[deal.deal_label] ?? labelConfig.fair;
  const variantPath = `/rc/${deal.manufacturer_slug}/${deal.family_slug}/${deal.variant_slug}`;
  const savings = deal.active_median_price && deal.price_amount
    ? (deal.active_median_price - deal.price_amount).toFixed(0)
    : null;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${label.color}`}>
          {label.text}
        </span>
        <span className="text-xs text-slate-500">{deal.source_name === "ebay" ? "eBay" : deal.source_name}</span>
      </div>

      {/* Title */}
      <p className="text-sm text-slate-300 leading-snug line-clamp-2">{deal.title_raw}</p>

      {/* Variant link */}
      <Link href={variantPath} className="text-xs text-amber-400 hover:text-amber-300 truncate">
        {deal.variant_name}
      </Link>

      {/* Price block */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-white">
          ${Number(deal.price_amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
        {deal.active_median_price && (
          <span className="text-sm text-slate-500 line-through">
            ${Number(deal.active_median_price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        )}
        {deal.pct_below_market > 0 && (
          <span className="text-sm font-semibold text-emerald-400">-{Number(deal.pct_below_market).toFixed(0)}%</span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-3 text-xs text-slate-500">
        {savings && Number(savings) > 0 && (
          <span className="text-emerald-500">~${savings} below market</span>
        )}
        {deal.active_supply_count && (
          <span>{deal.active_supply_count} active listing{deal.active_supply_count !== 1 ? "s" : ""}</span>
        )}
        {deal.condition_raw && <span>{deal.condition_raw}</span>}
      </div>

      {/* Deal score bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Deal score</span>
          <span className="font-medium text-slate-300">{deal.deal_score}/100</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              deal.deal_score >= 85 ? "bg-emerald-500" :
              deal.deal_score >= 70 ? "bg-amber-500" :
              deal.deal_score >= 55 ? "bg-slate-400" : "bg-red-500"
            }`}
            style={{ width: `${deal.deal_score}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <a
        href={deal.listing_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
      >
        View on eBay →
      </a>
    </div>
  );
}
