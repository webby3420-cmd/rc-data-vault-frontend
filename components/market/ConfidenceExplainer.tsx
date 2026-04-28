import type { EffectiveConfidenceTier } from "@/types/variant-page";
import {
  formatNewestSoldComp,
  freshnessCopy,
  resolveEffectiveTier,
  resolveFreshnessBucket,
  type FreshnessSource,
} from "@/lib/valuation/freshness";

interface ConfidenceExplainerProps {
  confidenceLabel: string;
  valuationStatus: string;
  observationCount: number;
  hasOutliersPresent: boolean;
  // Freshness-aware tier from v_variant_valuations_with_freshness. Optional —
  // legacy callers without the freshness payload still work via valuationStatus.
  effectiveTier?: EffectiveConfidenceTier | string | null;
  freshnessSource?: FreshnessSource | null;
}

export default function ConfidenceExplainer({
  valuationStatus,
  observationCount,
  hasOutliersPresent,
  effectiveTier,
  freshnessSource,
}: ConfidenceExplainerProps) {
  // Prefer effective_confidence_tier when available — it already accounts for
  // sold-comp freshness so we don't double-count.
  const tier = effectiveTier
    ? resolveEffectiveTier({ effective_confidence_tier: effectiveTier as string })
    : 'unknown';

  let text: string;

  if (tier !== 'unknown') {
    switch (tier) {
      case 'high':
        text = `Based on ${observationCount} verified sold listings. High confidence estimate.`;
        break;
      case 'high_aging':
        text = `Based on ${observationCount} verified sold listings, but sold comps are aging.`;
        break;
      case 'stale':
        text = `Based on ${observationCount} sold listings; comps are stale, treat as directional.`;
        break;
      case 'stale_limited':
        text = `Based on ${observationCount} stale sales with limited variance coverage.`;
        break;
      case 'low':
        text = `Based on ${observationCount} sales with wider variance. Use as a general guide.`;
        break;
      case 'insufficient':
        text = "Not enough sold data for a confident estimate. Showing available data.";
        break;
      case 'no_data':
      case 'no_candidates':
        return null;
      default:
        text = "Valuation freshness unavailable.";
    }
  } else {
    // Legacy path — use valuationStatus when no freshness payload is provided.
    if (valuationStatus === "no_data") return null;

    if (valuationStatus === "high_confidence" && observationCount >= 10) {
      text = `Based on ${observationCount} verified sold listings. High confidence estimate.`;
    } else if (valuationStatus === "high_confidence") {
      text = `Based on ${observationCount} recent sales. Estimate is directionally reliable.`;
    } else if (valuationStatus === "low_confidence") {
      text = `Based on ${observationCount} sales with wider variance. Use as a general guide.`;
    } else if (valuationStatus === "insufficient") {
      text = "Not enough sold data for a confident estimate. Showing available data.";
    } else {
      return null;
    }
  }

  if (hasOutliersPresent) {
    text += " (outliers excluded)";
  }

  const bucket = resolveFreshnessBucket(freshnessSource ?? null);
  const tooltip = freshnessCopy(bucket);
  const newest = freshnessSource?.newest_sold_observed_at ?? null;

  return (
    <p className="text-sm text-slate-400" title={tooltip}>
      {text}
      {newest && (bucket === 'aging' || bucket === 'stale') && (
        <>
          {" "}<span className="text-amber-300">
            Newest sold comp: {formatNewestSoldComp(newest)}.
          </span>
        </>
      )}
    </p>
  );
}
