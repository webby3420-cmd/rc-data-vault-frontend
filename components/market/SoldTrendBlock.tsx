interface SoldTrendBlockProps {
  median30d: number | null;
  median90d: number | null;
  count30d: number;
  count90d: number;
  trendPct: number | null;
  trendDirection: "rising" | "falling" | "stable" | "insufficient";
  lastSaleDaysAgo: number | null;
}

function fmt(v: number | null): string {
  if (v == null) return "—";
  return "$" + Math.round(v).toLocaleString("en-US");
}

const ARROW: Record<string, { icon: string; color: string }> = {
  rising: { icon: "↑", color: "text-emerald-400" },
  falling: { icon: "↓", color: "text-orange-400" },
  stable: { icon: "→", color: "text-slate-400" },
};

export default function SoldTrendBlock({
  median30d,
  median90d,
  count30d,
  count90d,
  trendPct,
  trendDirection,
  lastSaleDaysAgo,
}: SoldTrendBlockProps) {
  if (count30d < 3 || count90d < 3) return null;

  const arrow = ARROW[trendDirection];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">30-Day Median</div>
          <div className="mt-1 text-xl font-semibold text-white">{fmt(median30d)}</div>
          <div className="mt-0.5 text-xs text-slate-500">{count30d} sales</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">90-Day Median</div>
          <div className="mt-1 text-xl font-semibold text-white">{fmt(median90d)}</div>
          <div className="mt-0.5 text-xs text-slate-500">{count90d} sales</div>
        </div>
      </div>

      {arrow && trendPct != null && (
        <div className={`text-sm font-medium ${arrow.color}`}>
          {arrow.icon} {Math.abs(trendPct).toFixed(1)}% {trendDirection === "rising" ? "above" : trendDirection === "falling" ? "below" : "vs"} 90-day median
        </div>
      )}

      {lastSaleDaysAgo != null && (
        <div
          className={`text-xs ${
            lastSaleDaysAgo <= 7
              ? "text-emerald-500"
              : lastSaleDaysAgo > 30
                ? "text-orange-400"
                : "text-slate-500"
          }`}
        >
          {lastSaleDaysAgo <= 7
            ? "Recently active"
            : `Last sold ${lastSaleDaysAgo} days ago`}
        </div>
      )}
    </div>
  );
}
