export type VariantPagePayload = {
  identity: {
    variant_id: string;
    variant_name: string;
    variant_full_name: string;
    manufacturer_name: string;
    model_family_name: string;
    release_year: number | null;
    variant_slug: string;
    manufacturer_slug: string;
    model_family_slug: string;
    canonical_url: string;
    chassis_platform: string | null;
    catalog_number: string | null;
    is_kit: boolean | null;
    is_rtr: boolean | null;
    public_display_name: string | null;
  };
  valuation: {
    estimated_value_mid: number | null;
    estimated_value_low: number | null;
    estimated_value_high: number | null;
    estimated_value_mean: number | null;
    observation_count: number;
    valuation_status: string;
    quartile_confidence: string | null;
    confidence_label: string;
    has_sufficient_data: boolean;
    valuation_iqr: number | null;
    valuation_spread: number | null;
    has_outliers_present: boolean;
    valuation_last_updated_at: string | null;
  };

  retail: {
    retail_current_price: number | null;
    retail_price_currency: string | null;
    retail_price_source: string | null;
    retail_price_last_verified_at: string | null;
  };

  segmented_pricing: {
    nib: { median: number; low: number; high: number; comp_count: number } | null;
    used_complete: { median: number; low: number; high: number; comp_count: number } | null;
    roller: { median: number; low: number; high: number; comp_count: number } | null;
    slider: { median: number; low: number; high: number; comp_count: number } | null;
  };

  recent_sales: Array<{
    price: number;
    price_date: string | null;
    title: string;
    source: string | null;
    condition: string | null;
  }>;
  price_trends: Array<{
    month: string;
    median_price: number | null;
    mean_price: number | null;
    min_price: number | null;
    max_price: number | null;
    observation_count: number;
  }>;
  market_summary: {
    has_price_history: boolean;
    price_bucket_count: number;
    latest_price_bucket_date: string | null;
    latest_bucket_median_price: number | null;
    price_range_width: number | null;
    market_depth_label: string;
    trend_direction: string;
  };
  related: {
    siblings: Array<{
      variant_id: string;
      full_name: string;
      slug: string;
      canonical_url: string;
      obs_count: number;
    }>;
    model_family: {
      name: string;
      slug: string;
      canonical_url: string;
    };
    manufacturer: {
      name: string;
      slug: string;
      canonical_url: string;
    };
  };
  seo: {
    title_tag: string;
    meta_description: string;
    canonical_url: string;
    robots_directive: string;
  };
  freshness: {
    payload_generated_at: string;
    revalidate_after_seconds: number;
  };
};
