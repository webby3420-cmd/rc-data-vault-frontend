import { DollarSign, Package, ShoppingCart, Wrench, ShieldCheck, BarChart3, Users, Bell, Eye, Cog } from "lucide-react";

type Lane = { median: number; low: number; high: number; comp_count: number };

interface HeroDecisionSurfaceProps {
  retail: {
    retail_current_price: number | null;
    retail_price_source: string | null;
  };
  segmentedPricing: {
    nib: Lane | null;
    used_complete: Lane | null;
    roller: Lane | null;
  };
  hasSufficientData: boolean;
  observationCount: number;
  demandLabel: string | null;
  hasDeals: boolean;
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/* ─── Pricing Pill Row ─── */
function PricingPillRow({
  retail,
  segmentedPricing,
}: Pick<HeroDecisionSurfaceProps, "retail" | "segmentedPricing">) {
  const pills: { key: string; label: string; price: string; sub: string; icon: typeof DollarSign; iconBg: string; iconColor: string }[] = [];

  if (retail.retail_current_price != null) {
    pills.push({
      key: "retail",
      label: "Retail",
      price: fmt(retail.retail_current_price),
      sub: retail.retail_price_source === "variant_specs_msrp_usd" ? "MSRP" : "List",
      icon: DollarSign,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
    });
  }
  if (segmentedPricing.nib) {
    pills.push({
      key: "nib",
      label: "NIB",
      price: fmt(segmentedPricing.nib.median),
      sub: `${segmentedPricing.nib.comp_count} sales`,
      icon: Package,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    });
  }
  if (segmentedPricing.used_complete) {
    pills.push({
      key: "used",
      label: "Used",
      price: fmt(segmentedPricing.used_complete.median),
      sub: `${segmentedPricing.used_complete.comp_count} sales`,
      icon: ShoppingCart,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
    });
  }
  if (segmentedPricing.roller) {
    pills.push({
      key: "roller",
      label: "Roller",
      price: fmt(segmentedPricing.roller.median),
      sub: `${segmentedPricing.roller.comp_count} sales`,
      icon: Wrench,
      iconBg: "bg-slate-500/15",
      iconColor: "text-slate-400",
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {pills.map((p) => {
        const Icon = p.icon;
        return (
          <div
            key={p.key}
            className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 shrink-0"
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${p.iconBg}`}>
              <Icon className={`h-3.5 w-3.5 ${p.iconColor}`} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500 leading-none">{p.label}</div>
              <div className="text-xl font-bold text-white leading-tight mt-0.5">{p.price}</div>
              <div className="text-[10px] text-slate-500 leading-none mt-0.5">{p.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Signal Strip ─── */
function SignalStrip({
  hasSufficientData,
  observationCount,
  demandLabel,
}: Pick<HeroDecisionSurfaceProps, "hasSufficientData" | "observationCount" | "demandLabel">) {
  const chips: { key: string; label: string; icon: typeof ShieldCheck; color: string }[] = [];

  if (hasSufficientData) {
    chips.push({ key: "verified", label: "Verified Data", icon: ShieldCheck, color: "text-emerald-400" });
  }
  if (observationCount > 0) {
    chips.push({ key: "observations", label: `${observationCount} price observations`, icon: BarChart3, color: "text-slate-300" });
  }
  if (demandLabel) {
    chips.push({ key: "demand", label: demandLabel, icon: Users, color: "text-slate-300" });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => {
        const Icon = c.icon;
        return (
          <span key={c.key} className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs">
            <Icon className={`h-3 w-3 ${c.color}`} />
            <span className="text-slate-300 capitalize">{c.label}</span>
          </span>
        );
      })}
    </div>
  );
}

/* ─── CTA Row ─── */
function CtaRow({ hasDeals }: { hasDeals: boolean }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {hasDeals && (
        <a
          href="#deals"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shrink-0 hover:bg-amber-400 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          View Deals
        </a>
      )}
      <a
        href="#alert"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3.5 py-2 text-xs font-medium text-slate-300 shrink-0 hover:border-slate-400 hover:text-white transition-colors"
      >
        <Bell className="h-3.5 w-3.5" />
        Set Alert
      </a>
      <a
        href="#parts"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3.5 py-2 text-xs font-medium text-slate-300 shrink-0 hover:border-slate-400 hover:text-white transition-colors"
      >
        <Cog className="h-3.5 w-3.5" />
        View Parts
      </a>
    </div>
  );
}

/* ─── Main ─── */
export default function HeroDecisionSurface(props: HeroDecisionSurfaceProps) {
  const hasPricing =
    props.retail.retail_current_price != null ||
    props.segmentedPricing.nib != null ||
    props.segmentedPricing.used_complete != null ||
    props.segmentedPricing.roller != null;

  if (!hasPricing && !props.hasSufficientData && props.observationCount === 0) return null;

  return (
    <div className="space-y-3">
      <PricingPillRow retail={props.retail} segmentedPricing={props.segmentedPricing} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SignalStrip
          hasSufficientData={props.hasSufficientData}
          observationCount={props.observationCount}
          demandLabel={props.demandLabel}
        />
        <CtaRow hasDeals={props.hasDeals} />
      </div>
    </div>
  );
}
