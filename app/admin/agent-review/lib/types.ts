// app/admin/agent-review/lib/types.ts
// TypeScript types for agent_review_queue rows.
// Numeric columns arrive from PostgREST as strings.

export type QueueStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs_more_review'
  | 'auto_expired';

export type ActionStatus = 'not_applied' | 'applied' | 'failed' | 'skipped';

export type RiskLabel = 'low' | 'medium' | 'high' | 'production_blocking';

export interface QueueRow {
  queue_id: number;
  agent_name: string;
  run_id: string | null;
  entity_type: string;
  entity_id: string;
  proposed_action: string;
  proposed_payload: Record<string, unknown> | null;
  evidence_payload: Record<string, unknown> | null;
  confidence: string | null;
  severity: number | null;
  priority_score: string | null;
  risk_label: RiskLabel | null;
  source_match_id: string | null;
  source_stage_id: number | null;
  source_ref: Record<string, unknown> | null;
  status: QueueStatus;
  reviewer: string | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  action_status: ActionStatus;
  created_at: string;
  updated_at: string;

  // Joined columns from v_agent_review_queue_enriched.
  // INNER JOIN guarantees these are present whenever the row is returned.
  // Numeric columns arrive from PostgREST as strings.
  listing_id: string;
  listing_title: string;
  listing_price_usd: string | null;
  listing_currency: string | null;
  listing_url: string | null;
  listing_source: string | null;
  listing_condition: string | null;
  listing_image_url: string | null;
  proposed_variant_image_url: string | null;

  variant_id: string;
  variant_full_name: string;
  variant_slug: string;
  variant_box_art_url: string | null;

  family_name: string;
  family_slug: string;
  family_image_url: string | null;
  manufacturer_name: string;
  manufacturer_slug: string;

  variant_url_path: string;

  // Spec fields surfaced to reviewer (from v_agent_review_queue_enriched)
  proposed_chassis_platform: string | null;
  proposed_catalog_number: string | null;
  proposed_release_year: number | null;
  proposed_is_kit: boolean | null;
  proposed_is_rtr: boolean | null;
  proposed_public_display_name: string | null;
}

export interface QueueFilters {
  tab: TabKey;
  status?: QueueStatus;
  agent_name?: string;
  entity_type?: string;
  proposed_action?: string;
  risk_label?: RiskLabel;
  confidence_min?: number;
  confidence_max?: number;
  age_days?: number;
  q?: string;
}

export type TabKey =
  | 'all_pending'
  | 'listing_matches'
  | 'catalog_issues'
  | 'purchase_links'
  | 'specs'
  | 'vintage_discontinued'
  | 'approved'
  | 'rejected';

export type RejectReason =
  | 'is_part'
  | 'wrong_variant'
  | 'multi_vehicle_fitment'
  | 'duplicate_listing'
  | 'garbage'
  | 'other';

export const ALLOWED_REJECT_REASONS: readonly RejectReason[] = [
  'is_part',
  'wrong_variant',
  'multi_vehicle_fitment',
  'duplicate_listing',
  'garbage',
  'other',
] as const;

export const TAB_DEFINITIONS: Array<{ key: TabKey; label: string }> = [
  { key: 'all_pending', label: 'All Pending' },
  { key: 'listing_matches', label: 'Listing Matches' },
  { key: 'catalog_issues', label: 'Catalog Issues' },
  { key: 'purchase_links', label: 'Purchase Links' },
  { key: 'specs', label: 'Specs' },
  { key: 'vintage_discontinued', label: 'Vintage / Discontinued' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

// =====================================================================
// Grouped listing view (v_agent_review_groups)
// =====================================================================

export type ScopeLevel = 'family' | 'manufacturer' | 'variant';

export interface GroupCandidate {
  queue_id: number;
  agent_name: string;
  proposed_action: string;
  proposed_variant_id: string | null;
  proposed_variant_name: string | null;
  proposed_variant_slug: string | null;
  proposed_family_name: string | null;
  proposed_family_deprecated: boolean | null;
  proposed_manufacturer_name: string | null;
  proposed_manufacturer_slug: string | null;
  proposed_variant_image_url: string | null;
  proposed_variant_url_path: string | null;
  confidence: number | null;
  risk_label: string | null;
  evidence_payload: Record<string, unknown> | null;
  matches_primary: boolean;
  created_at: string;

  // Spec fields exposed for reviewer decisions
  proposed_catalog_number: string | null;
  proposed_release_year: number | null;
  proposed_chassis_platform: string | null;
  proposed_is_kit: boolean | null;
  proposed_is_rtr: boolean | null;
  proposed_public_display_name: string | null;
}

export interface GroupTitleRiskFlags {
  combo: boolean;
  parts: boolean;
  roller: boolean;
  static: boolean;
  read_desc: boolean;
  upgraded: boolean;
}

export interface ListingGroup {
  listing_id: string;
  listing_title: string | null;
  listing_url: string | null;
  listing_source: string | null;
  listing_condition: string | null;
  listing_price: number | null;
  listing_price_amount: number | null;
  listing_price_usd: number | null;
  listing_currency: string | null;
  seller_name: string | null;
  listing_location: string | null;
  is_sold: boolean | null;
  listing_status: string | null;
  posted_at: string | null;
  listing_image_url: string | null;
  primary_listing_match_id: string | null;
  primary_variant_id: string | null;
  primary_variant_name: string | null;
  primary_variant_slug: string | null;
  primary_family_name: string | null;
  primary_family_deprecated: boolean | null;
  primary_manufacturer_slug: string | null;
  primary_manufacturer_name: string | null;
  primary_verification_status: string | null;
  primary_match_method: string | null;
  primary_is_human_verified: boolean | null;
  primary_variant_image_url: string | null;

  // Primary spec fields
  primary_catalog_number: string | null;
  primary_release_year: number | null;
  primary_chassis_platform: string | null;
  primary_is_kit: boolean | null;
  primary_is_rtr: boolean | null;
  primary_public_display_name: string | null;
  observation_count: number;
  n_pending: number;
  n_match_primary: number;
  candidates: GroupCandidate[];
  title_risk_flags: GroupTitleRiskFlags;
  has_any_risk_flag: boolean;
}

// JSONB receipts returned by the apply RPCs.
// Keep loose — they're forwarded to UI as-is for display.
export type ApplyReceipt = Record<string, unknown>;
