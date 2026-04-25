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
