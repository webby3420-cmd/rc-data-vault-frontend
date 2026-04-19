import {
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Lane = { median: number; low: number; high: number; comp_count: number };

interface OpportunitySignalsProps {
  retailPrice: number | null;
  usedComplete: Lane | null;
  nib: Lane | null;
  roller: Lane | null;
}

interface Signal {
  key: string;
  text: string;
  tone: "positive" | "neutral";
  icon: LucideIcon;
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

const TONE_COLOR: Record<string, string> = {
  positive: "text-emerald-400",
  neutral: "text-slate-300",
};

function buildSignals(props: OpportunitySignalsProps): Signal[] {
  const signals: Signal[] = [];

  // Used prices track near the used-market median
  if (props.usedComplete) {
    signals.push({
      key: "used",
      text: `Used prices track near the used-market median of ${fmt(props.usedComplete.median)}`,
      tone: "neutral",
      icon: ShoppingCart,
    });
  }

  // NIB resale is holding above current retail
  if (
    props.nib &&
    props.retailPrice != null &&
    props.nib.median > props.retailPrice
  ) {
    signals.push({
      key: "nib_above_retail",
      text: "NIB resale is holding above current retail",
      tone: "positive",
      icon: TrendingUp,
    });
  }

  // NIB median standalone (only if we didn't already emit the above)
  if (props.nib && !signals.some((s) => s.key === "nib_above_retail")) {
    signals.push({
      key: "nib",
      text: `NIB units are trading around ${fmt(props.nib.median)}`,
      tone: "neutral",
      icon: Package,
    });
  }

  // Roller pricing suggests active project-build market
  if (props.roller && props.roller.comp_count >= 3) {
    signals.push({
      key: "roller",
      text: "Roller pricing suggests an active project-build market",
      tone: "neutral",
      icon: Wrench,
    });
  }

  return signals;
}

export default function OpportunitySignals(props: OpportunitySignalsProps) {
  const signals = buildSignals(props);
  if (signals.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Opportunity Signals
        </h2>
      </div>
      <div className="space-y-2">
        {signals.map((sig) => {
          const Icon = sig.icon;
          return (
            <div
              key={sig.key}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
            >
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${TONE_COLOR[sig.tone]}`} />
              <span className="text-sm text-slate-200">{sig.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
