interface EcosystemData {
  parts_activity_score: number;
  ecosystem_label: string;
  total_listings: number;
  listings_30d: number;
  distinct_types: number;
  top_categories: Array<{ type: string; count: number }>;
  avg_part_price: number;
  computed_at: string;
}

interface FamilyEcosystemBlockProps {
  ecosystem: EcosystemData | null;
}

const SCORE_COLOR: Record<string, string> = {
  high: "text-emerald-400",
  mid: "text-amber-400",
  low: "text-slate-400",
};

function scoreColor(score: number): string {
  if (score >= 75) return SCORE_COLOR.high;
  if (score >= 50) return SCORE_COLOR.mid;
  return SCORE_COLOR.low;
}

function formatType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FamilyEcosystemBlock({ ecosystem }: FamilyEcosystemBlockProps) {
  if (!ecosystem || ecosystem.total_listings < 3) return null;

  const topCats = (ecosystem.top_categories ?? [])
    .filter((c) => c.count > 0)
    .slice(0, 3);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Parts Ecosystem</h2>

      <div className="flex items-start gap-6">
        {/* Score */}
        <div className="flex-shrink-0 text-center">
          <div className={`text-3xl font-bold ${scoreColor(ecosystem.parts_activity_score)}`}>
            {Math.round(ecosystem.parts_activity_score)}
          </div>
          <div className="mt-1 text-xs text-slate-500">/ 100</div>
        </div>

        {/* Label + details */}
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className={`text-sm font-semibold ${scoreColor(ecosystem.parts_activity_score)}`}>
              {ecosystem.ecosystem_label}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Based on {ecosystem.total_listings.toLocaleString("en-US")} recent market listings
              {ecosystem.listings_30d > 0 && ` · ${ecosystem.listings_30d} in last 30 days`}
            </p>
          </div>

          {/* Top categories */}
          {topCats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topCats.map((cat) => (
                <span
                  key={cat.type}
                  className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  {formatType(cat.type)} ({cat.count})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
