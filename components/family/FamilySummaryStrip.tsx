interface FamilyMarketSummary {
  family_state: string;
  family_state_label: string;
  total_observations: number;
  obs_30d: number;
  valued_variants: number;
  baseline_variants?: number;
  total_variants: number;
  min_value: number | null;
  max_value: number | null;
  typical_value: number;
  family_confidence: string;
  family_confidence_label: string;
}

interface FamilySummaryStripProps {
  summary: FamilyMarketSummary | undefined;
}

const CONFIDENCE_PILL: Record<string, string> = {
  reliable: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20",
  directional: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20",
  limited: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20",
  baseline: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20",
  insufficient: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/20",
};

function fmt(v: number | null): string | null {
  if (v == null || v <= 0) return null;
  return "$" + Math.round(v).toLocaleString("en-US");
}

export default function FamilySummaryStrip({ summary }: FamilySummaryStripProps) {
  if (!summary) return null;

  const state = summary.family_state;

  // no_data: nothing to show
  if (state === "no_data") return null;

  // baseline_only: MSRP-oriented strip
  if (state === "baseline_only") {
    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2.5 mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">MSRP Reference</h2>
          <span className={`rounded-full px-2 py-0.5 text-xs ${CONFIDENCE_PILL.baseline}`}>
            {summary.family_confidence_label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-800/60 px-3 py-2">
            <div className="text-xs text-slate-500">Total Variants</div>
            <div className="text-sm font-semibold text-white mt-0.5">{summary.total_variants}</div>
          </div>
          {(summary.baseline_variants ?? 0) > 0 && (
            <div className="rounded-xl bg-slate-800/60 px-3 py-2">
              <div className="text-xs text-slate-500">With MSRP</div>
              <div className="text-sm font-semibold text-white mt-0.5">{summary.baseline_variants}</div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // active / moderate / thin / sparse: full market strip
  const confPill = CONFIDENCE_PILL[summary.family_confidence] ?? CONFIDENCE_PILL.insufficient;
  const rangeStr = fmt(summary.min_value) && fmt(summary.max_value)
    ? `${fmt(summary.min_value)} – ${fmt(summary.max_value)}`
    : null;
  const typicalStr = fmt(summary.typical_value);

  const tiles: Array<{ label: string; value: string }> = [];
  if (rangeStr) tiles.push({ label: "Market Range", value: rangeStr });
  if (typicalStr) tiles.push({ label: "Typical Value", value: typicalStr });
  if (summary.valued_variants > 0) tiles.push({ label: "Valued Variants", value: `${summary.valued_variants} / ${summary.total_variants}` });
  if (summary.obs_30d > 0) tiles.push({ label: "30-Day Activity", value: `${summary.obs_30d} sold` });

  if (tiles.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2.5 mb-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Family Overview</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs ${confPill}`}>
          {summary.family_confidence_label}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-slate-800/60 px-3 py-2">
            <div className="text-xs text-slate-500">{tile.label}</div>
            <div className="text-sm font-semibold text-white mt-0.5">{tile.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
