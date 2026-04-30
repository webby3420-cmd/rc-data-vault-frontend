// components/variant/ValuationTrustCard.tsx
import Link from "next/link";

export type ConfidenceLevel = "high" | "medium" | "low";

export type ValuationTrustSignals = {
  observation_count_90d: number;
  median_price_90d: number | null;
  price_low_90d: number | null;
  price_high_90d: number | null;
  trust_latest_observation_at: string | null;
  data_window_days: number;
  confidence_level: ConfidenceLevel;
  confidence_reason: string;
};

const REASON_COPY: Record<string, string> = {
  sufficient_recent_comps: "Strong recent sales data",
  moderate_recent_comps: "Moderate recent sales data",
  thin_recent_comps: "Limited recent sales data",
  no_recent_comps: "No sales in the last 90 days",
  high_downgraded_wide_price_range:
    "Strong volume, but prices vary widely",
  high_downgraded_stale_latest_comp:
    "Strong volume, but recent sales are aging",
  medium_downgraded_wide_price_range:
    "Moderate volume with wide price range",
  medium_downgraded_stale_latest_comp:
    "Moderate volume, but recent sales are aging",
};

const BADGE: Record<
  ConfidenceLevel,
  { label: string; cls: string }
> = {
  high: {
    label: "High confidence",
    cls: "bg-green-100 text-green-800 border-green-200",
  },
  medium: {
    label: "Medium confidence",
    cls: "bg-amber-100 text-amber-900 border-amber-200",
  },
  low: {
    label: "Low confidence",
    cls: "bg-red-100 text-red-800 border-red-200",
  },
};

function formatUSD(n: number | null | undefined): string {
  if (n == null) return "—";
  const r = Math.round(Number(n));
  return `$${r.toLocaleString("en-US")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  // iso is 'YYYY-MM-DD' (date type, not timestamp)
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ValuationTrustCard({
  trust,
}: {
  trust: ValuationTrustSignals | null | undefined;
}) {
  const noData = !trust || trust.observation_count_90d === 0;
  const level: ConfidenceLevel = noData ? "low" : trust!.confidence_level;
  const reasonCode = noData ? "no_recent_comps" : trust!.confidence_reason;
  const reasonCopy =
    REASON_COPY[reasonCode] ?? "Recent sales confidence estimate";
  const badge = BADGE[level];

  return (
    <section
      aria-labelledby="trust-card-heading"
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      data-testid="valuation-trust-card"
    >
      <header className="flex items-center justify-between gap-2">
        <h2
          id="trust-card-heading"
          className="text-sm font-semibold text-gray-900"
        >
          Valuation confidence
        </h2>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badge.cls}`}
        >
          {badge.label}
        </span>
      </header>

      <div className="mt-3 space-y-2 text-sm">
        {noData ? (
          <p className="text-gray-700">
            No recent sales data in the last 90 days.
          </p>
        ) : (
          <>
            <p className="text-gray-700">
              Based on{" "}
              <strong>
                {trust!.observation_count_90d}{" "}
                {trust!.observation_count_90d === 1 ? "sale" : "sales"}
              </strong>{" "}
              in the last 90 days.
            </p>
            <dl className="grid grid-cols-1 gap-1 text-gray-800">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Median</dt>
                <dd className="font-medium">
                  {formatUSD(trust!.median_price_90d)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Range</dt>
                <dd className="font-medium">
                  {formatUSD(trust!.price_low_90d)} –{" "}
                  {formatUSD(trust!.price_high_90d)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Last sale</dt>
                <dd className="font-medium">
                  {formatDate(trust!.trust_latest_observation_at)}
                </dd>
              </div>
            </dl>
          </>
        )}
        <p className="text-xs text-gray-500">{reasonCopy}</p>
        <p className="text-xs">
          <Link
            href="/rc/methodology"
            className="text-blue-600 underline-offset-2 hover:underline"
          >
            How we calculate confidence
          </Link>
        </p>
      </div>
    </section>
  );
}
