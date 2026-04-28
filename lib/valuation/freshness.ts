// lib/valuation/freshness.ts
//
// Sold-comp freshness helpers that interpret the additive layer added by
// public.v_variant_valuations_with_freshness (2026-04-28 backend migration).
// Helpers default to neutral 'unknown' values when the freshness fields are
// null/undefined — callers must remain crash-free against the cached payload
// that predates the migration.

import type {
  EffectiveConfidenceTier,
  SoldCompFreshnessBucket,
} from '@/types/variant-page';

/** Shape of any object that may carry the freshness columns. Loose so it works
 *  for the cached `VariantPagePayload['valuation']` and the freshly-queried
 *  row from v_variant_valuations_with_freshness. */
export interface FreshnessSource {
  sold_comp_freshness_bucket?: string | null;
  effective_confidence_tier?: string | null;
  newest_sold_observed_at?: string | null;
  sold_comp_age_days?: number | null;
  valuation_freshness_warning?: string | null;
}

const KNOWN_BUCKETS = new Set<SoldCompFreshnessBucket>([
  'fresh',
  'aging',
  'stale',
  'no_sold',
]);

const KNOWN_TIERS = new Set<EffectiveConfidenceTier>([
  'high',
  'high_aging',
  'stale',
  'stale_limited',
  'low',
  'insufficient',
  'no_data',
  'no_candidates',
]);

export function resolveFreshnessBucket(
  v: FreshnessSource | null | undefined,
): SoldCompFreshnessBucket {
  const raw = v?.sold_comp_freshness_bucket;
  if (typeof raw === 'string' && KNOWN_BUCKETS.has(raw as SoldCompFreshnessBucket)) {
    return raw as SoldCompFreshnessBucket;
  }
  return 'unknown';
}

export function resolveEffectiveTier(
  v: FreshnessSource | null | undefined,
): EffectiveConfidenceTier {
  const raw = v?.effective_confidence_tier;
  if (typeof raw === 'string' && KNOWN_TIERS.has(raw as EffectiveConfidenceTier)) {
    return raw as EffectiveConfidenceTier;
  }
  return 'unknown';
}

export function freshnessCopy(bucket: SoldCompFreshnessBucket): string {
  switch (bucket) {
    case 'fresh':
      return 'Based on recent sold comps.';
    case 'aging':
      return 'Sold comp data is aging; estimate may be less current.';
    case 'stale':
      return 'Sold comps are stale; treat this estimate as directional.';
    case 'no_sold':
      return 'No usable sold comps are available yet.';
    case 'unknown':
    default:
      return 'Valuation freshness unavailable.';
  }
}

/** Format newest sold-comp date as e.g. "Apr 14, 2026 · 14 days ago".
 *  Safe fallback for null/invalid input. */
export function formatNewestSoldComp(
  date: string | null | undefined,
): string {
  if (!date) return 'No sold comp on record';
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) return 'No sold comp on record';
  const formatted = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const dayMs = 86_400_000;
  const ageDays = Math.max(
    0,
    Math.round((Date.now() - parsed.getTime()) / dayMs),
  );
  const ageLabel = ageDays === 0 ? 'today' : `${ageDays} day${ageDays === 1 ? '' : 's'} ago`;
  return `${formatted} · ${ageLabel}`;
}

/** Whether the bucket warrants any visible warning treatment. */
export function freshnessIsWarning(bucket: SoldCompFreshnessBucket): boolean {
  return bucket === 'aging' || bucket === 'stale' || bucket === 'no_sold';
}

/** Whether the bucket warrants a "demoted" visual treatment. Stale > aging. */
export function freshnessIsDemoted(bucket: SoldCompFreshnessBucket): boolean {
  return bucket === 'stale' || bucket === 'no_sold';
}

/** Compact pill label per bucket — used next to the existing confidence badge. */
export function freshnessShortLabel(bucket: SoldCompFreshnessBucket): string {
  switch (bucket) {
    case 'fresh':
      return 'Fresh sold comps';
    case 'aging':
      return 'Sold comps aging';
    case 'stale':
      return 'Stale valuation';
    case 'no_sold':
      return 'No recent sold comps';
    case 'unknown':
    default:
      return 'Freshness unknown';
  }
}
