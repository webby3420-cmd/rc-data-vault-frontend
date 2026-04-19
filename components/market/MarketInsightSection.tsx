import { ShieldCheck, Shield, ShieldAlert, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Lane = { median: number; low: number; high: number; comp_count: number };

type Confidence = "High" | "Medium" | "Low";

interface MarketInsightSectionProps {
  confidence: Confidence;
  summary: string;
  usedComplete: Lane | null;
  nib: Lane | null;
  roller: Lane | null;
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

const CONFIDENCE_PILL: Record<Confidence, { cls: string; icon: LucideIcon }> = {
  High: { cls: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20", icon: ShieldCheck },
  Medium: { cls: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20", icon: Shield },
  Low: { cls: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/20", icon: ShieldAlert },
};

function buildHeadline(
  usedComplete: Lane | null,
  nib: Lane | null,
  roller: Lane | null,
): string {
  if (usedComplete) {
    return `Used units typically sell for ${fmt(usedComplete.median)}`;
  }
  if (nib) {
    return `Sealed/NIB units are selling for ${fmt(nib.median)}`;
  }
  if (roller) {
    return `Rolling chassis trade around ${fmt(roller.median)} (build/project market)`;
  }
  return "Not enough recent sales to report a market price";
}

export default function MarketInsightSection({
  confidence,
  summary,
  usedComplete,
  nib,
  roller,
}: MarketInsightSectionProps) {
  const confStyle = CONFIDENCE_PILL[confidence];
  const ConfIcon = confStyle.icon;
  const headline = buildHeadline(usedComplete, nib, roller);

  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 uppercase tracking-wide">
          <TrendingUp className="h-4 w-4" />
          Market Insight
        </h2>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${confStyle.cls}`}>
          <ConfIcon className="h-3.5 w-3.5" />
          {confidence}
        </span>
      </div>

      <p className="text-base font-medium text-white leading-relaxed">{headline}</p>

      {summary && (
        <p className="mt-3 text-xs text-slate-400 leading-relaxed">{summary}</p>
      )}
    </section>
  );
}
