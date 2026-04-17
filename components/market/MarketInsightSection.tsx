type Band = "Below Market" | "Fair" | "Above Market";
type Confidence = "High" | "Medium" | "Low";

interface MarketInsightSectionProps {
  band: Band;
  score: number;
  confidence: Confidence;
  summary: string;
  recommendation: string;
}

const BAND_STYLE: Record<Band, { pill: string; border: string; bg: string; scoreBg: string }> = {
  "Below Market": {
    pill: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30",
    border: "border-emerald-700/50",
    bg: "bg-emerald-950/20",
    scoreBg: "bg-emerald-500/15 text-emerald-400",
  },
  Fair: {
    pill: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
    border: "border-blue-700/50",
    bg: "bg-blue-950/20",
    scoreBg: "bg-blue-500/15 text-blue-400",
  },
  "Above Market": {
    pill: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
    border: "border-amber-700/50",
    bg: "bg-amber-950/20",
    scoreBg: "bg-amber-500/15 text-amber-400",
  },
};

const CONFIDENCE_PILL: Record<Confidence, string> = {
  High: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20",
  Medium: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20",
  Low: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/20",
};

// Defensively extract fair value and range from pre-formatted summary string
// Expected shape: "Fair value: $900 (range $600 – $1,200). Confidence: High."
function parseSummaryMetrics(summary: string): {
  fairValue: string | null;
  rangeLow: string | null;
  rangeHigh: string | null;
} {
  const valueMatch = summary.match(/Fair value:\s*(\$[\d,]+)/i);
  const rangeMatch = summary.match(/range\s*(\$[\d,]+)\s*[–—-]\s*(\$[\d,]+)/i);
  return {
    fairValue: valueMatch?.[1] ?? null,
    rangeLow: rangeMatch?.[1] ?? null,
    rangeHigh: rangeMatch?.[2] ?? null,
  };
}

export default function MarketInsightSection({
  band,
  score,
  confidence,
  summary,
  recommendation,
}: MarketInsightSectionProps) {
  const style = BAND_STYLE[band];
  const metrics = parseSummaryMetrics(summary);
  const hasMetrics = metrics.fairValue !== null;

  return (
    <section className={`rounded-2xl border ${style.border} ${style.bg} p-6 shadow-sm`}>
      {/* Headline row: label + badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Market Insight</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.pill}`}>
            {band}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${CONFIDENCE_PILL[confidence]}`}>
            {confidence}
          </span>
        </div>
        <div className={`rounded-lg px-2.5 py-1 text-sm font-bold ${style.scoreBg}`}>
          {score}
        </div>
      </div>

      {/* Primary takeaway: recommendation is visually dominant */}
      <p className="text-base font-medium text-white leading-relaxed">{recommendation}</p>

      {/* Metrics grid: compact 2x2 on mobile, 4-col on desktop */}
      {hasMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {metrics.fairValue && (
            <div className="rounded-xl bg-slate-800/60 px-3 py-2">
              <div className="text-xs text-slate-500">Fair Value</div>
              <div className="text-sm font-semibold text-white mt-0.5">{metrics.fairValue}</div>
            </div>
          )}
          {metrics.rangeLow && metrics.rangeHigh && (
            <div className="rounded-xl bg-slate-800/60 px-3 py-2">
              <div className="text-xs text-slate-500">Market Range</div>
              <div className="text-sm font-semibold text-white mt-0.5">{metrics.rangeLow} – {metrics.rangeHigh}</div>
            </div>
          )}
          <div className="rounded-xl bg-slate-800/60 px-3 py-2">
            <div className="text-xs text-slate-500">Confidence</div>
            <div className="text-sm font-semibold text-white mt-0.5">{confidence}</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 px-3 py-2">
            <div className="text-xs text-slate-500">Deal Score</div>
            <div className="text-sm font-semibold text-white mt-0.5">{score} / 100</div>
          </div>
        </div>
      )}

      {/* Supporting summary: secondary text */}
      <p className="mt-3 text-xs text-slate-400 leading-relaxed">{summary}</p>
    </section>
  );
}
