// app/admin/staging-parts/lib/types.ts
// TypeScript types for staging_parts rows shown on the review surface.

export type StagingPartStatus =
  | 'pending_review'
  | 'pending'
  | 'rejected'
  | 'duplicate';

export type PartType =
  | 'oem_replacement'
  | 'aftermarket_upgrade'
  | 'universal_fitment';

export const ALLOWED_PART_TYPES: readonly PartType[] = [
  'oem_replacement',
  'aftermarket_upgrade',
  'universal_fitment',
] as const;

export interface StagingPartRow {
  staging_id: string;
  ingestion_source: string | null;
  source_url: string | null;
  ingested_at: string;
  part_number: string;
  part_name: string;
  aftermarket_brand: string | null;
  manufacturer_name: string | null;
  status: StagingPartStatus | string;

  // Computed in TS after fetch — number of pending_review rows sharing the
  // same part_number (always >=1; >1 indicates duplicates).
  duplicate_count?: number;
}
