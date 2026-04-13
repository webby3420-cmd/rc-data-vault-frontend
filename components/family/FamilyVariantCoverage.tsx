import Link from "next/link";

interface Variant {
  variant_slug: string;
  variant_name: string;
  canonical_url: string;
  fair_value: number | null;
  low: number | null;
  high: number | null;
  confidence: string | null;
  valuation_status: string | null;
  obs_count: number | null;
  has_sufficient_data: boolean;
  obs_30d: number;
  market_depth: string | null;
  is_best_data: boolean;
  is_most_active: boolean;
}

interface FamilyMarketSummary {
  family_state: string;
  total_variants: number;
}

const DEPTH_BADGE: Record<string, { text: string; cls: string }> = {
  deep: { text: "Deep", cls: "bg-emerald-900/40 text-emerald-400" },
  moderate: { text: "Moderate", cls: "bg-amber-900/40 text-amber-400" },
  thin: { text: "Thin", cls: "bg-slate-800 text-slate-400" },
};

function fmt(v: number | null) {
  if (!v) return null;
  return `$${Math.round(v).toLocaleString()}`;
}

export default function FamilyVariantCoverage({
  variants,
  summary,
  manufacturerSlug,
  familySlug,
}: {
  variants: Variant[];
  summary: FamilyMarketSummary;
  manufacturerSlug: string;
  familySlug: string;
}) {
  if (summary.family_state === "no_data" && summary.total_variants === 0) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-sm text-slate-500">No market data tracked for this family yet.</p>
      </div>
    );
  }

  const sorted = [...variants].sort((a, b) => {
    const aHasData = a.fair_value != null ? 0 : 1;
    const bHasData = b.fair_value != null ? 0 : 1;
    if (aHasData !== bHasData) return aHasData - bHasData;
    return (b.obs_count ?? 0) - (a.obs_count ?? 0);
  });

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h2 className="text-base font-semibold text-white">Variant Coverage</h2>
        <p className="text-xs text-slate-500 mt-0.5">{variants.length} variants tracked</p>
      </div>
      <div className="divide-y divide-slate-800">
        {sorted.map((v) => {
          const depthBadge = v.market_depth ? DEPTH_BADGE[v.market_depth] : null;
          return (
            <Link
              key={v.variant_slug}
              href={v.canonical_url ?? `/rc/${manufacturerSlug}/${familySlug}/${v.variant_slug}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-white truncate">{v.variant_name}</span>
                {v.is_best_data && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 shrink-0">Most Data</span>
                )}
                {v.is_most_active && !v.is_best_data && v.obs_30d >= 3 && (
                  <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-400 shrink-0">Most Active</span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                {v.fair_value ? (
                  <div className="text-right">
                    <span className="text-sm font-semibold text-amber-400">{fmt(v.fair_value)}</span>
                    {v.obs_count != null && v.obs_count > 0 && (
                      <span className="text-xs text-slate-500 ml-1.5">{v.obs_count} sales</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">No valuation yet</span>
                )}
                {depthBadge && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${depthBadge.cls}`}>
                    {depthBadge.text}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
