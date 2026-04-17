type Band = "Below Market" | "Fair" | "Above Market";
type Confidence = "High" | "Medium" | "Low";

interface MarketInsightSectionProps {
  band: Band;
  score: number;
  confidence: Confidence;
  summary: string;
  recommendation: string;
}

const BAND_STYLE: Record<Band, { dot: string; label: string; border: string; bg: string }> = {
  "Below Market": {
    dot: "bg-emerald-400",
    label: "text-emerald-400",
    border: "border-emerald-800/40",
    bg: "bg-emerald-950/20",
  },
  Fair: {
    dot: "bg-blue-400",
    label: "text-blue-400",
    border: "border-blue-800/40",
    bg: "bg-blue-950/20",
  },
  "Above Market": {
    dot: "bg-amber-400",
    label: "text-amber-400",
    border: "border-amber-800/40",
    bg: "bg-amber-950/20",
  },
};

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  High: "text-emerald-400",
  Medium: "text-amber-400",
  Low: "text-slate-400",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-emerald-400 border-emerald-800/40"
    : score >= 40 ? "text-amber-400 border-amber-800/40"
    : "text-slate-400 border-slate-700";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {score}
    </span>
  );
}

export default function MarketInsightSection({
  band,
  score,
  confidence,
  summary,
  recommendation,
}: MarketInsightSectionProps) {
  const style = BAND_STYLE[band];

  return (
    <section className={`rounded-2xl border ${style.border} ${style.bg} p-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <h2 className={`text-base font-semibold ${style.label}`}>{band}</h2>
          <span className={`text-xs ${CONFIDENCE_STYLE[confidence]}`}>
            {confidence} confidence
          </span>
        </div>
        <ScoreBadge score={score} />
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">{recommendation}</p>
    </section>
  );
}
