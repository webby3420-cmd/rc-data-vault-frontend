// components/variant/ValuationTrustCard.tsx
import Link from "next/link";
import type {
  ConfidenceReason,
  VariantValuationConfidence,
} from "@/types/variant-page";

export type ConfidenceLevel = "high" | "medium" | "low";

// V1 trust signals (kept for transitional callers that haven't migrated yet).
// New callers should pass `confidence` instead.
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

const V1_REASON_COPY: Record<string, string> = {
  sufficient_recent_comps: "Strong recent sales data",
  moderate_recent_comps: "Moderate recent sales data",
  thin_recent_comps: "Limited recent sales data",
  no_recent_comps: "No sales in the last 90 days",
  high_downgraded_wide_price_range: "Strong volume, but prices vary widely",
  high_downgraded_stale_latest_comp:
    "Strong volume, but recent sales are aging",
  medium_downgraded_wide_price_range: "Moderate volume with wide price range",
  medium_downgraded_stale_latest_comp:
    "Moderate volume, but recent sales are aging",
};

// V2 reason copy — keys MUST match the 8 stable strings emitted by
// public.variant_valuation_confidence_v1.confidence_reason.
const V2_REASON_COPY: Record<ConfidenceReason, string> = {
  strong_sample_recent_sales_tight_spread:
    "Strong sample, recent sales, and a tight price range.",
  strong_volume_but_wide_spread:
    "Strong sales volume, but prices vary widely.",
  moderate_sample_recent_sales:
    "Moderate recent sales volume with usable pricing signal.",
  recent_sales_but_volatile_range:
    "Recent sales exist, but the price range is volatile.",
  thin_sample_recent_sales:
    "Recent sales exist, but sample size is thin.",
  stale_sales_data: "Sales data is older or less active than ideal.",
  insufficient_recent_comps: "Not enough recent clean sold comps.",
  volatile_price_range:
    "Recent sale prices vary too widely for high confidence.",
};

const V2_BADGE: Record<ConfidenceLevel, { label: string; cls: string }> = {
  high: {
    label: "High confidence",
    cls: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  medium: {
    label: "Medium confidence",
    cls: "bg-amber-100 text-amber-900 border-amber-200",
  },
  low: {
    label: "Low confidence",
    cls: "bg-rose-100 text-rose-900 border-rose-200",
  },
};

const V2_NO_DATA_BADGE = {
  label: "No recent data",
  cls: "bg-gray-100 text-gray-700 border-gray-200",
};

const V1_BADGE: Record<ConfidenceLevel, { label: string; cls: string }> = {
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
  // iso is 'YYYY-MM-DD' (date type, not timestamp). UTC anchor avoids
  // server/client timezone drift and the resulting hydration mismatch.
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

type ValuationTrustCardProps = {
  trust?: ValuationTrustSignals | null;
  // V2 source of truth. `null` = no_recent_data. `undefined` = caller hasn't
  // migrated yet, fall back to V1 trust prop.
  confidence?: VariantValuationConfidence | null;
};

export default function ValuationTrustCard({
  trust,
  confidence,
}: ValuationTrustCardProps) {
  // Caller provided V2 prop → V2 is the source of truth.
  if (confidence !== undefined) {
    return confidence === null ? (
      <NoRecentDataCard />
    ) : (
      <V2ConfidenceCard confidence={confidence} />
    );
  }

  // Transitional V1 path (caller hasn't migrated yet).
  return <V1TrustCard trust={trust ?? null} />;
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="trust-card-heading"
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      data-testid="valuation-trust-card"
    >
      {children}
    </section>
  );
}

function MethodologyLink() {
  return (
    <p className="text-xs">
      <Link
        href="/rc/methodology"
        className="text-blue-600 underline-offset-2 hover:underline"
      >
        How we calculate confidence
      </Link>
    </p>
  );
}

function NoRecentDataCard() {
  return (
    <CardShell>
      <header className="flex items-center justify-between gap-2">
        <h2
          id="trust-card-heading"
          className="text-sm font-semibold text-gray-900"
        >
          Valuation confidence
        </h2>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${V2_NO_DATA_BADGE.cls}`}
        >
          {V2_NO_DATA_BADGE.label}
        </span>
      </header>
      <div className="mt-3 space-y-2 text-sm">
        <p className="text-gray-700">
          We don&apos;t have enough clean sold comps from the last 90 days to
          assign a confidence tier yet.
        </p>
        <MethodologyLink />
      </div>
    </CardShell>
  );
}

function V2ConfidenceCard({
  confidence,
}: {
  confidence: VariantValuationConfidence;
}) {
  const badge = V2_BADGE[confidence.valuationConfidence];
  const reasonCopy =
    V2_REASON_COPY[confidence.confidenceReason] ??
    "Confidence is based on sample size, freshness, and price spread.";
  const saleWord = confidence.observationCount90d === 1 ? "sale" : "sales";
  const rangeText =
    confidence.minPrice90d === confidence.maxPrice90d
      ? formatUSD(confidence.minPrice90d)
      : `${formatUSD(confidence.minPrice90d)} – ${formatUSD(confidence.maxPrice90d)}`;

  return (
    <CardShell>
      <header className="flex flex-wrap items-center justify-between gap-2">
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
        <p className="text-gray-700">
          Based on{" "}
          <strong>
            {confidence.observationCount90d} {saleWord}
          </strong>{" "}
          in the last 90 days.
        </p>
        <dl className="grid grid-cols-1 gap-1 text-gray-800">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Median</dt>
            <dd className="font-medium">
              {formatUSD(confidence.medianPrice90d)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Range</dt>
            <dd className="font-medium">{rangeText}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Last sale</dt>
            <dd className="font-medium">
              {formatDate(confidence.mostRecentSaleDate)}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500">{reasonCopy}</p>
        <p className="text-[11px] text-gray-400">90-day sold-comp window</p>
        <MethodologyLink />
      </div>
    </CardShell>
  );
}

function V1TrustCard({ trust }: { trust: ValuationTrustSignals | null }) {
  const noData = !trust || trust.observation_count_90d === 0;
  const level: ConfidenceLevel = noData ? "low" : trust!.confidence_level;
  const reasonCode = noData ? "no_recent_comps" : trust!.confidence_reason;
  const reasonCopy =
    V1_REASON_COPY[reasonCode] ?? "Recent sales confidence estimate";
  const badge = V1_BADGE[level];

  return (
    <CardShell>
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
        <MethodologyLink />
      </div>
    </CardShell>
  );
}
