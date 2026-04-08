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

const DOT_COLOR: Record<FamilyState, string> = {
  active: "bg-emerald-400",
  moderate: "bg-amber-400",
  thin: "bg-slate-400",
  sparse: "bg-slate-600",
  no_data: "bg-slate-700",
};

const LABEL_COLOR: Record<FamilyState, string> = {
  active: "text-emerald-400",
  moderate: "text-amber-400",
  thin: "text-slate-400",
  sparse: "text-slate-500",
  no_data: "text-slate-600",
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

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 px-5 py-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${DOT_COLOR[familyState] ?? "bg-slate-700"}`} />
          <span className={`font-semibold ${LABEL_COLOR[familyState] ?? "text-slate-500"}`}>
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
