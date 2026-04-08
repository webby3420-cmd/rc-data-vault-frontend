type MarketState = "hot" | "rising" | "stable" | "softening" | "thin";

interface MarketStateBarProps {
  marketState: MarketState;
  marketStateLabel: string;
  marketStateDescription: string;
  alertCTAUrgency: "high" | "medium" | "low";
}

const DOT_COLOR: Record<MarketState, string> = {
  hot: "bg-amber-400",
  rising: "bg-emerald-400",
  stable: "bg-slate-400",
  softening: "bg-orange-400",
  thin: "bg-slate-600",
};

const LABEL_COLOR: Record<MarketState, string> = {
  hot: "text-amber-400",
  rising: "text-emerald-400",
  stable: "text-slate-400",
  softening: "text-orange-400",
  thin: "text-slate-500",
};

export default function MarketStateBar({
  marketState,
  marketStateLabel,
  marketStateDescription,
}: MarketStateBarProps) {
  if (!marketState || !marketStateLabel) return null;

  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${DOT_COLOR[marketState] ?? "bg-slate-600"}`} />
      <span className={`font-semibold ${LABEL_COLOR[marketState] ?? "text-slate-500"}`}>
        {marketStateLabel}
      </span>
      {marketStateDescription && (
        <span className="text-slate-400">{marketStateDescription}</span>
      )}
    </div>
  );
}
