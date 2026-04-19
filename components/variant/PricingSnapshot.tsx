import { DollarSign, Package, ShoppingCart, Wrench } from "lucide-react";

type Lane = { median: number; low: number; high: number; comp_count: number };

interface PricingSnapshotProps {
  retail: {
    retail_current_price: number | null;
    retail_price_source: string | null;
  };
  segmentedPricing: {
    nib: Lane | null;
    used_complete: Lane | null;
    roller: Lane | null;
  };
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function compLabel(count: number) {
  if (count >= 10) return "10+ sales";
  if (count >= 5) return "5\u20139 sales";
  return "3\u20134 sales";
}

function PriceCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  price,
  range,
  sub,
  muted,
}: {
  icon: typeof DollarSign;
  iconBg: string;
  iconColor: string;
  label: string;
  price: string;
  range: string | null;
  sub: string;
  muted?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${muted ? "border-slate-800 bg-slate-950/60" : "border-slate-700 bg-slate-900"}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${iconBg}`}>
          <Icon className={`h-3 w-3 ${iconColor}`} />
        </div>
        <span className={`text-xs font-medium uppercase tracking-wide ${muted ? "text-slate-600" : "text-slate-500"}`}>
          {label}
        </span>
      </div>
      <div className={`text-xl font-semibold ${muted ? "text-slate-400" : "text-white"}`}>{price}</div>
      {range && (
        <div className="text-xs text-slate-500 mt-1">{range}</div>
      )}
      <div className={`text-[11px] mt-1 ${muted ? "text-slate-600" : "text-slate-500"}`}>{sub}</div>
    </div>
  );
}

export default function PricingSnapshot({ retail, segmentedPricing }: PricingSnapshotProps) {
  const hasRetail = retail.retail_current_price != null;
  const hasNib = segmentedPricing.nib != null;
  const hasUsed = segmentedPricing.used_complete != null;
  const hasRoller = segmentedPricing.roller != null;

  if (!hasRetail && !hasNib && !hasUsed && !hasRoller) return null;

  const retailSub =
    retail.retail_price_source === "variant_specs_msrp_usd"
      ? "MSRP"
      : retail.retail_price_source === "variants_msrp_original"
      ? "Original MSRP"
      : "List price";

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Pricing Snapshot
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {hasRetail && (
          <PriceCard
            icon={DollarSign}
            iconBg="bg-amber-500/15"
            iconColor="text-amber-400"
            label="Retail"
            price={fmt(retail.retail_current_price!)}
            range={null}
            sub={retailSub}
          />
        )}
        {hasNib && (
          <PriceCard
            icon={Package}
            iconBg="bg-blue-500/15"
            iconColor="text-blue-400"
            label="NIB"
            price={fmt(segmentedPricing.nib!.median)}
            range={segmentedPricing.nib!.comp_count >= 5 ? `${fmt(segmentedPricing.nib!.low)} – ${fmt(segmentedPricing.nib!.high)}` : null}
            sub={compLabel(segmentedPricing.nib!.comp_count)}
          />
        )}
        {hasUsed && (
          <PriceCard
            icon={ShoppingCart}
            iconBg="bg-emerald-500/15"
            iconColor="text-emerald-400"
            label="Used"
            price={fmt(segmentedPricing.used_complete!.median)}
            range={segmentedPricing.used_complete!.comp_count >= 5 ? `${fmt(segmentedPricing.used_complete!.low)} – ${fmt(segmentedPricing.used_complete!.high)}` : null}
            sub={compLabel(segmentedPricing.used_complete!.comp_count)}
          />
        )}
        {hasRoller && (
          <PriceCard
            icon={Wrench}
            iconBg="bg-slate-500/15"
            iconColor="text-slate-400"
            label="Roller"
            price={fmt(segmentedPricing.roller!.median)}
            range={segmentedPricing.roller!.comp_count >= 5 ? `${fmt(segmentedPricing.roller!.low)} – ${fmt(segmentedPricing.roller!.high)}` : null}
            sub={compLabel(segmentedPricing.roller!.comp_count)}
            muted
          />
        )}
      </div>
    </section>
  );
}
