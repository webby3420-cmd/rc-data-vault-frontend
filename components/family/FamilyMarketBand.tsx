import { Activity, Minus, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FamilyState = "active" | "moderate" | "thin" | "sparse" | "no_data";

interface FamilyMarketBandProps {
  familyState: FamilyState;
  familyStateLabel: string;
  familyStateDescription: string;
  minValue: number | null;
  maxValue: number | null;
  typicalValue: number;
  valuedVariants: number;
  totalVariants: number;
  familyConfidenceLabel: string;
  familyConfidenceDescription: string;
}

const STATE_STYLE: Record<FamilyState, { color: string; icon: LucideIcon }> = {
  active: { color: "text-emerald-400", icon: TrendingUp },
  moderate: { color: "text-amber-400", icon: Activity },
  thin: { color: "text-slate-400", icon: Minus },
  sparse: { color: "text-slate-500", icon: Minus },
  no_data: { color: "text-slate-600", icon: Minus },
};

function fmt(v: number | null): string {
  if (v == null) return "—";
  return "$" + Math.round(v).toLocaleString("en-US");
}

export default function FamilyMarketBand({
  familyState,
  familyStateLabel,
  familyStateDescription,
  minValue,
  maxValue,
  typicalValue,
  familyConfidenceDescription,
}: FamilyMarketBandProps) {
  if (familyState === "no_data") return null;

  const style = STATE_STYLE[familyState] ?? STATE_STYLE.sparse;
  const Icon = style.icon;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 px-5 py-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <Icon className={`h-4 w-4 ${style.color}`} />
          <span className={`font-semibold ${style.color}`}>
            {familyStateLabel}
          </span>
          {familyStateDescription && (
            <span className="text-slate-400">{familyStateDescription}</span>
          )}
        </div>

        {minValue != null && maxValue != null && (
          <div className="text-sm text-slate-400">
            Range: {fmt(minValue)} – {fmt(maxValue)}
            {typicalValue > 0 && <> · Typical: {fmt(typicalValue)}</>}
          </div>
        )}
      </div>

      {familyConfidenceDescription && (
        <p className="text-xs text-slate-500">{familyConfidenceDescription}</p>
      )}
    </div>
  );
}
