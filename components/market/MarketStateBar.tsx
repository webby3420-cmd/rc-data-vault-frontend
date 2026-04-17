import { Activity, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MarketState = "hot" | "rising" | "stable" | "softening" | "thin";

interface MarketStateBarProps {
  marketState: MarketState;
  marketStateLabel: string;
  marketStateDescription: string;
  alertCTAUrgency: "high" | "medium" | "low";
}

const STATE_STYLE: Record<MarketState, { color: string; icon: LucideIcon }> = {
  hot: { color: "text-amber-400", icon: TrendingUp },
  rising: { color: "text-emerald-400", icon: TrendingUp },
  stable: { color: "text-slate-400", icon: Minus },
  softening: { color: "text-orange-400", icon: TrendingDown },
  thin: { color: "text-slate-500", icon: Activity },
};

export default function MarketStateBar({
  marketState,
  marketStateLabel,
  marketStateDescription,
}: MarketStateBarProps) {
  if (!marketState || !marketStateLabel) return null;

  const style = STATE_STYLE[marketState] ?? STATE_STYLE.stable;
  const Icon = style.icon;

  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className={`h-4 w-4 ${style.color}`} />
      <span className={`font-semibold ${style.color}`}>
        {marketStateLabel}
      </span>
      {marketStateDescription && (
        <span className="text-slate-400">{marketStateDescription}</span>
      )}
    </div>
  );
}
