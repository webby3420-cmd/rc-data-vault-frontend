// Server-only loader for variant_value SEO payloads.
//
// Calls public.build_seo_page_payload(p_queue_id) and normalizes the nested
// `trust` object + price triangle fields into VariantValuePayload. The SQL
// function may return the payload either nested under a top-level `payload`
// key or flat — the loader tolerates both.

import 'server-only';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type {
  VariantValuePayload,
  VariantValueTier,
  VariantValueTrust,
} from '@/types/variant-value-page';

export interface LoadVariantValueResult {
  payload: VariantValuePayload | null;
  error: string | null;
  raw: unknown;
}

const KNOWN_TIERS = new Set<VariantValueTier>([
  'high',
  'high_aging',
  'low',
  'stale',
  'stale_limited',
  'insufficient',
  'unknown',
]);

function normalizeTier(value: unknown): VariantValueTier {
  if (typeof value === 'string' && (KNOWN_TIERS as Set<string>).has(value)) {
    return value as VariantValueTier;
  }
  return 'unknown';
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function unwrapInner(root: Record<string, unknown>): Record<string, unknown> {
  // Tolerate either { payload: {...} } or a flat shape.
  const candidate = root.payload;
  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
    return candidate as Record<string, unknown>;
  }
  return root;
}

export async function loadVariantValuePayload(
  queueId: number,
): Promise<LoadVariantValueResult> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('build_seo_page_payload', {
    p_queue_id: queueId,
  });
  if (error) {
    return { payload: null, error: error.message ?? 'rpc_error', raw: null };
  }
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return { payload: null, error: 'empty_or_invalid_payload', raw: data };
  }

  const root = data as Record<string, unknown>;
  const inner = unwrapInner(root);

  const trustRaw = inner.trust;
  if (!trustRaw || typeof trustRaw !== 'object' || Array.isArray(trustRaw)) {
    return { payload: null, error: 'missing_trust_object', raw: data };
  }
  const t = trustRaw as Record<string, unknown>;

  const trust: VariantValueTrust = {
    tier: normalizeTier(t.tier),
    tier_label:
      typeof t.tier_label === 'string' && t.tier_label.length > 0
        ? t.tier_label
        : 'Unknown',
    raw_confidence: num(t.raw_confidence),
    freshness_bucket: str(t.freshness_bucket),
    sold_comp_age_days: num(t.sold_comp_age_days),
    latest_sold_comp_date: str(t.latest_sold_comp_date),
    sample_size: num(t.sample_size) ?? 0,
    warning: str(t.warning),
  };

  const payload: VariantValuePayload = {
    fair_value: num(inner.fair_value),
    low_value: num(inner.low_value),
    high_value: num(inner.high_value),
    valuation_confidence: str(inner.valuation_confidence),
    trust,
  };

  return { payload, error: null, raw: data };
}
