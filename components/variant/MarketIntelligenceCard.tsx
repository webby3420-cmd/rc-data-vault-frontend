import { TrendingUp, TrendingDown, Minus, DollarSign, AlertTriangle, Activity, Sparkles } from "lucide-react";

type Lane = { median: number; low: number; high: number; comp_count: number };

interface MarketIntelligenceCardProps {
  trendDirection: "up" | "down" | null;
  buyZone: number | null;
  overpayZone: number | null;
  liquidityLabel: string;
  insightHeadline: string | null;
  topSignalText: string | null;
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function MarketIntelligenceCard({
  trendDirection,
  buyZone,
  overpayZone,
  liquidityLabel,
  insightHeadline,
  topSignalText,
}: MarketIntelligenceCardProps) {
  const hasMeta = buyZone != null || overpayZone != null || liquidityLabel;
  if (!hasMeta && !insightHeadline && !topSignalText) return null;

  const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;
  const trendLabel = trendDirection === "up" ? "Rising" : trendDirection === "down" ? "Falling" : "Stable";
  const trendColor = trendDirection === "up" ? "text-amber-400" : trendDirection === "down" ? "text-emerald-400" : "text-slate-400";

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
        <Activity className="h-4 w-4" />
        Market Intelligence
      </h2>

      {/* Row 1 — metric strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-slate-600">Trend</div>
          <div className={`flex items-center gap-1 text-sm font-semibold mt-0.5 ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendLabel}
          </div>
        </div>
        {buyZone != null && (
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
            <div className="text-[11px] uppercase tracking-wide text-slate-600">Buy Zone</div>
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-400 mt-0.5">
              <DollarSign className="h-3.5 w-3.5" />
              {fmt(buyZone)}
            </div>
          </div>
        )}
        {overpayZone != null && (
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
            <div className="text-[11px] uppercase tracking-wide text-slate-600">Overpay Zone</div>
            <div className="flex items-center gap-1 text-sm font-semibold text-red-400 mt-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {fmt(overpayZone)}
            </div>
          </div>
        )}
        <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-slate-600">Liquidity</div>
          <div className="text-sm font-semibold text-slate-300 mt-0.5 capitalize">{liquidityLabel || "—"}</div>
        </div>
      </div>

      {/* Row 2 — insight */}
      {insightHeadline && (
        <p className="mt-3 text-sm text-slate-300 leading-snug">{insightHeadline}</p>
      )}

      {/* Row 3 — top opportunity signal */}
      {topSignalText && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
          <span className="text-xs text-slate-400">{topSignalText}</span>
        </div>
      )}
    </section>
  );
}
