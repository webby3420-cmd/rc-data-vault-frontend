import { Activity } from "lucide-react";

interface Variant {
  obs_30d: number;
  market_depth: string | null;
}

interface FamilyMarketSummary {
  family_state: string;
  family_state_label: string;
  family_state_description: string;
  total_observations: number;
  obs_30d: number;
  family_confidence_description: string;
}

interface FamilyMarketActivityProps {
  summary: FamilyMarketSummary | undefined;
  variants: Variant[];
}

const STATE_STYLE: Record<string, { pill: string; border: string; bg: string }> = {
  active: {
    pill: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30",
    border: "border-emerald-700/50",
    bg: "bg-emerald-950/20",
  },
  moderate: {
    pill: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
    border: "border-blue-700/50",
    bg: "bg-blue-950/20",
  },
  thin: {
    pill: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
    border: "border-amber-700/50",
    bg: "bg-amber-950/20",
  },
  sparse: {
    pill: "bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30",
    border: "border-slate-700",
    bg: "bg-slate-900",
  },
};

const FALLBACK_STYLE = STATE_STYLE.sparse;

export default function FamilyMarketActivity({ summary, variants }: FamilyMarketActivityProps) {
  if (!summary) return null;

  const state = summary.family_state;

  // no_data or baseline_only: nothing market-related to show
  if (state === "no_data" || state === "baseline_only") return null;
  if (summary.total_observations === 0) return null;

  const style = STATE_STYLE[state] ?? FALLBACK_STYLE;

  const activeVariants = variants.filter((v) => (v.obs_30d ?? 0) > 0).length;
  const deepMarkets = variants.filter((v) => v.market_depth === "deep").length;

  const tiles: Array<{ label: string; value: string }> = [];
  if (summary.obs_30d > 0) tiles.push({ label: "30-Day Sales", value: String(summary.obs_30d) });
  if (summary.total_observations > 0) tiles.push({ label: "All-Time Sales", value: String(summary.total_observations) });
  if (activeVariants > 0) tiles.push({ label: "Active Variants", value: String(activeVariants) });
  if (deepMarkets > 0) tiles.push({ label: "Deep Markets", value: String(deepMarkets) });

  if (tiles.length === 0) return null;

  return (
    <section className={`rounded-2xl border ${style.border} ${style.bg} p-6 shadow-sm mt-6`}>
      <div className="flex items-center gap-2.5 mb-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Market Activity</h2>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.pill}`}>
          <Activity className="h-3.5 w-3.5" />
          {summary.family_state_label}
        </span>
      </div>

      <p className="text-base font-medium text-white leading-relaxed mb-4">{summary.family_state_description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-slate-800/60 px-3 py-2">
            <div className="text-xs text-slate-500">{tile.label}</div>
            <div className="text-sm font-semibold text-white mt-0.5">{tile.value}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{summary.family_confidence_description}</p>
    </section>
  );
}
