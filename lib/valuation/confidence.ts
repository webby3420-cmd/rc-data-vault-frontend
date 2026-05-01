// lib/valuation/confidence.ts
//
// Trust Layer V2 loader. Reads public.variant_valuation_confidence_v1, the
// canonical source for the ValuationTrustCard. Variants with no recent comps
// are absent from the view by design; this loader returns null for those
// (the "no_recent_data" state). Never falls back to V1 valuation_status.
//
// confidence_score_internal is intentionally NOT selected — it is QA-only
// and must not appear in the network payload.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ConfidenceReason,
  VariantValuationConfidenceLoaderResult,
} from "@/types/variant-page";

export async function getVariantValuationConfidence(
  variantId: string
): Promise<VariantValuationConfidenceLoaderResult> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("variant_valuation_confidence_v1")
    .select(
      [
        "variant_id",
        "variant_slug",
        "observation_count_90d",
        "median_price_90d",
        "min_price_90d",
        "max_price_90d",
        "most_recent_sale_date",
        "days_since_latest_sale",
        "price_spread_ratio",
        "valuation_confidence",
        "confidence_reason",
        "data_window_days",
      ].join(",")
    )
    .eq("variant_id", variantId)
    .maybeSingle();

  if (error) {
    console.error("[trust-v2] confidence fetch failed", error);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as {
    variant_id: string;
    variant_slug: string | null;
    observation_count_90d: number | string;
    median_price_90d: number | string;
    min_price_90d: number | string;
    max_price_90d: number | string;
    most_recent_sale_date: string;
    days_since_latest_sale: number | string;
    price_spread_ratio: number | string | null;
    valuation_confidence: "high" | "medium" | "low";
    confidence_reason: ConfidenceReason;
    data_window_days: number | string;
  };

  return {
    variantId: row.variant_id,
    variantSlug: row.variant_slug,
    observationCount90d: Number(row.observation_count_90d),
    medianPrice90d: Number(row.median_price_90d),
    minPrice90d: Number(row.min_price_90d),
    maxPrice90d: Number(row.max_price_90d),
    mostRecentSaleDate: row.most_recent_sale_date,
    daysSinceLatestSale: Number(row.days_since_latest_sale),
    priceSpreadRatio:
      row.price_spread_ratio == null ? null : Number(row.price_spread_ratio),
    valuationConfidence: row.valuation_confidence,
    confidenceReason: row.confidence_reason,
    dataWindowDays: 90,
  };
}
