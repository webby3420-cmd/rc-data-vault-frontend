interface ActiveDealsStripProps {
  qualifyingDeals: number;
  bestDealPrice: number | null;
  bestDealScore: number | null;
  bestDealUrl: string | null;
  soldMedian90d: number | null;
}

export default function ActiveDealsStrip({
  qualifyingDeals,
  bestDealPrice,
  bestDealScore,
  bestDealUrl,
  soldMedian90d,
}: ActiveDealsStripProps) {
  if (qualifyingDeals <= 0) return null;

  const badge =
    bestDealScore != null && bestDealScore >= 70
      ? { text: "Strong Buy", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }
      : bestDealScore != null && bestDealScore >= 55
        ? { text: "Good Deal", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" }
        : null;

  return (
    <div className="rounded-xl border border-amber-800/30 bg-amber-500/10 px-4 py-3 space-y-1.5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <span>
            {qualifyingDeals} qualifying deal{qualifyingDeals !== 1 ? "s" : ""} found
          </span>
          {bestDealPrice != null && (
            <span className="text-amber-400 font-semibold">
              · Best price: ${Math.round(bestDealPrice).toLocaleString("en-US")}
            </span>
          )}
          {badge && (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
              {badge.text}
            </span>
          )}
        </div>

        {bestDealUrl && (
          <a
            href={bestDealUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
          >
            View on eBay →
          </a>
        )}
      </div>

      {soldMedian90d != null && (
        <div className="text-xs text-slate-500">
          Compared to ${Math.round(soldMedian90d).toLocaleString("en-US")} 90-day sold median
        </div>
      )}
    </div>
  );
}
