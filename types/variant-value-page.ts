// Trust Layer types for variant_value SEO pages.
//
// Source: public.build_seo_page_payload(p_queue_id bigint). For pages of type
// variant_value the JSON payload contains a nested `trust` object alongside
// the price triangle fields. variant_value pages are NOT activated yet —
// these types describe the contract that future pages will consume.

export type VariantValueTier =
  | 'high'
  | 'high_aging'
  | 'low'
  | 'stale'
  | 'stale_limited'
  | 'insufficient'
  | 'unknown';

export interface VariantValueTrust {
  tier: VariantValueTier;
  tier_label: string;
  raw_confidence: number | null;
  freshness_bucket: string | null;
  sold_comp_age_days: number | null;
  latest_sold_comp_date: string | null;
  sample_size: number;
  warning: string | null;
}

export interface VariantValuePayload {
  fair_value: number | null;
  low_value: number | null;
  high_value: number | null;
  valuation_confidence: string | null;
  trust: VariantValueTrust;
}
