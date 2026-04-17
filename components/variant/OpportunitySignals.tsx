import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Flame,
  Minus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

interface OpportunitySignalsProps {
  priceBand: "Below Market" | "Fair" | "Above Market" | null;
  dealScore: number | null;
  confidenceLabel: "High" | "Medium" | "Low" | null;
  demandScore: number | null;
  demandLabel: string | null;
  marketDepth: string | null;
  buyerSignal: string | null;
  marketState: "hot" | "rising" | "stable" | "softening" | "thin" | null;
  marketStateLabel: string | null;
  candidateCount: number | null;
  valuationStatus: string | null;
}

interface Signal {
  key: string;
  label: string;
  valueText: string;
  tone: "positive" | "caution" | "neutral" | "weak";
  icon: LucideIcon;
}

const TONE_COLOR: Record<string, string> = {
  positive: "text-emerald-400",
  caution: "text-amber-400",
  neutral: "text-slate-300",
  weak: "text-slate-500",
};

function buildSignals(props: OpportunitySignalsProps): Signal[] {
  const signals: Signal[] = [];

  // Signal 1 — Deal Quality
  if (props.priceBand != null) {
    const score = props.dealScore ?? 0;
    if (props.priceBand === "Below Market") {
      signals.push({ key: "deal", label: "Deal Quality", valueText: `Priced below typical market (${score}/100)`, tone: "positive", icon: TrendingDown });
    } else if (props.priceBand === "Fair") {
      signals.push({ key: "deal", label: "Deal Quality", valueText: `Trading near fair value (${score}/100)`, tone: "neutral", icon: CheckCircle2 });
    } else {
      signals.push({ key: "deal", label: "Deal Quality", valueText: `Listings running above typical (${score}/100)`, tone: "caution", icon: TrendingUp });
    }
  }

  // Signal 2 — Confidence
  if (props.confidenceLabel != null) {
    const count = props.candidateCount ?? 0;
    if (props.confidenceLabel === "High") {
      signals.push({ key: "confidence", label: "Confidence", valueText: `Backed by ${count} verified sales`, tone: "positive", icon: ShieldCheck });
    } else if (props.confidenceLabel === "Medium") {
      signals.push({ key: "confidence", label: "Confidence", valueText: `Directional — ${count} sales`, tone: "neutral", icon: Shield });
    } else {
      signals.push({ key: "confidence", label: "Confidence", valueText: `Limited data — ${count} sales`, tone: "weak", icon: ShieldAlert });
    }
  }

  // Signal 3 — Demand
  if (props.demandScore != null) {
    const tone = props.demandScore >= 70 ? "positive" as const : props.demandScore >= 40 ? "neutral" as const : "weak" as const;
    const text = props.demandLabel ? `${props.demandLabel} (${props.demandScore}/100)` : `Buyer interest: ${props.demandScore}/100`;
    signals.push({ key: "demand", label: "Demand", valueText: text, tone, icon: Users });
  }

  // Signal 4 — Market Activity
  if (props.marketState != null && props.marketStateLabel != null) {
    const map: Record<string, { tone: Signal["tone"]; icon: LucideIcon; suffix: string }> = {
      hot: { tone: "caution", icon: Flame, suffix: "moving fast" },
      rising: { tone: "positive", icon: TrendingUp, suffix: "prices trending up" },
      stable: { tone: "neutral", icon: Minus, suffix: "steady pricing" },
      softening: { tone: "positive", icon: TrendingDown, suffix: "possible buying window" },
      thin: { tone: "weak", icon: Activity, suffix: "few recent sales" },
    };
    const entry = map[props.marketState];
    if (entry) {
      signals.push({ key: "activity", label: "Market Activity", valueText: `${props.marketStateLabel} — ${entry.suffix}`, tone: entry.tone, icon: entry.icon });
    }
  }

  // Signal 5 — Market Depth (only if < 4 signals so far)
  if (signals.length < 4 && props.marketDepth != null) {
    const depthMap: Record<string, { tone: Signal["tone"]; text: string }> = {
      deep: { tone: "positive", text: "Strong sample size for pricing" },
      moderate: { tone: "neutral", text: "Reasonable sample size" },
      thin: { tone: "weak", text: "Shallow comp pool — treat carefully" },
      sparse: { tone: "weak", text: "Shallow comp pool — treat carefully" },
    };
    const entry = depthMap[props.marketDepth];
    if (entry) {
      signals.push({ key: "depth", label: "Market Depth", valueText: entry.text, tone: entry.tone, icon: BarChart3 });
    }
  }

  return signals.slice(0, 5);
}

function buildSummary(props: OpportunitySignalsProps): string {
  const { priceBand, demandScore, confidenceLabel, marketState } = props;

  if (priceBand === "Below Market" && (demandScore ?? 0) >= 60 && confidenceLabel !== "Low") {
    return "Worth a close look: priced below typical market with solid buyer interest.";
  }
  if (priceBand === "Above Market" && marketState === "softening") {
    return "Prices are running above typical but the market is softening — consider waiting.";
  }
  if (priceBand === "Above Market") {
    return "Currently trading above typical market — deals may be scarce.";
  }
  if (priceBand === "Fair" && (demandScore ?? 0) >= 60) {
    return "Balanced market with healthy demand — fair-value buys available.";
  }
  if (priceBand === "Fair") {
    return "Market is trading near fair value.";
  }
  if (priceBand === "Below Market") {
    return "Below-market pricing — worth a closer read on condition and seller.";
  }
  return "Current market signals for this model at a glance.";
}

function SignalRow({ signal }: { signal: Signal }) {
  const Icon = signal.icon;
  const color = TONE_COLOR[signal.tone];

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-slate-500">{signal.label}</div>
        <div className="text-sm text-slate-200 mt-0.5">{signal.valueText}</div>
      </div>
    </div>
  );
}

export default function OpportunitySignals(props: OpportunitySignalsProps) {
  // Gate: only render for sufficiently valued variants
  const status = props.valuationStatus;
  if (status !== "high_confidence" && status !== "low_confidence" && status !== "estimate") return null;
  if (props.priceBand == null) return null;

  const signals = buildSignals(props);
  if (signals.length === 0) return null;

  const summary = buildSummary(props);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Opportunity Signals
        </h2>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{summary}</p>
      <div className="space-y-2">
        {signals.map((sig) => (
          <SignalRow key={sig.key} signal={sig} />
        ))}
      </div>
    </section>
  );
}
