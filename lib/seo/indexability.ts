// Single source of truth for family-page indexability.
//
// family_indexable = there is at least one variant URL in the result of the
// existing `get_sitemap_all_pages` RPC that lives under this family.
// The variant-indexable predicate itself lives in SQL inside that RPC and
// is intentionally not re-implemented here — both the sitemap generator
// and the family page metadata consume this helper so there can be no
// drift between what /sitemap.xml advertises and what each family page
// declares in its <meta name="robots"> tag.

import 'server-only';
import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type FamilyIndexabilityReason =
  | 'has_indexable_variants'
  | 'zero_indexable_variants';

export interface FamilyIndexability {
  familySlug: string;
  manufacturerSlug: string;
  indexable: boolean;
  reason: FamilyIndexabilityReason;
}

interface SitemapRow {
  url?: string | null;
  canonical_path?: string | null;
  page_type?: string | null;
}

function rowPath(row: SitemapRow): string | null {
  return row.url ?? row.canonical_path ?? null;
}

interface RcSegments {
  manufacturer: string;
  family: string | null;
  variant: string | null;
  extra: string | null;
}

function parseRcSegments(path: string): RcSegments | null {
  const segments = path.split('/').filter(Boolean);
  if (segments.length < 2 || segments[0] !== 'rc') return null;
  return {
    manufacturer: segments[1],
    family: segments[2] ?? null,
    variant: segments[3] ?? null,
    extra: segments[4] ?? null,
  };
}

const fetchSitemapRows = cache(async (): Promise<SitemapRow[]> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_sitemap_all_pages');
  if (error || !data) return [];
  return data as SitemapRow[];
});

export const getAllFamilyIndexability = cache(
  async (): Promise<Map<string, FamilyIndexability>> => {
    const rows = await fetchSitemapRows();

    const familiesWithIndexableVariant = new Set<string>();
    for (const row of rows) {
      if (row.page_type !== 'variant') continue;
      const path = rowPath(row);
      if (!path) continue;
      const parts = parseRcSegments(path);
      if (!parts || !parts.family || !parts.variant || parts.extra) continue;
      familiesWithIndexableVariant.add(`${parts.manufacturer}/${parts.family}`);
    }

    const result = new Map<string, FamilyIndexability>();
    for (const row of rows) {
      if (row.page_type !== 'family') continue;
      const path = rowPath(row);
      if (!path) continue;
      const parts = parseRcSegments(path);
      if (!parts || !parts.family || parts.variant) continue;
      const key = `${parts.manufacturer}/${parts.family}`;
      if (result.has(key)) continue;
      const indexable = familiesWithIndexableVariant.has(key);
      result.set(key, {
        manufacturerSlug: parts.manufacturer,
        familySlug: parts.family,
        indexable,
        reason: indexable ? 'has_indexable_variants' : 'zero_indexable_variants',
      });
    }
    return result;
  },
);

export async function getFamilyIndexability(
  manufacturerSlug: string,
  familySlug: string,
): Promise<FamilyIndexability> {
  const map = await getAllFamilyIndexability();
  const key = `${manufacturerSlug}/${familySlug}`;
  const existing = map.get(key);
  if (existing) return existing;
  return {
    manufacturerSlug,
    familySlug,
    indexable: false,
    reason: 'zero_indexable_variants',
  };
}
