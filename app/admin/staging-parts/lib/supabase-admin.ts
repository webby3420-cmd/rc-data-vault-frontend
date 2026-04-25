// app/admin/staging-parts/lib/supabase-admin.ts
// Server-only PostgREST helpers for the staging_parts review surface.
// Mirrors the pattern in app/admin/agent-review/lib/supabase-admin.ts:
// raw fetch + service-role key. RLS on staging_parts is bypassed by the
// service role; key must never leak to the client.

import 'server-only';
import type { StagingPartRow } from './types';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://frphiluaykgrmvyvdzsp.supabase.co';

function requireServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Set it in Vercel env vars (server-only, no NEXT_PUBLIC_ prefix).',
    );
  }
  return key;
}

function restHeaders(): HeadersInit {
  const key = requireServiceRoleKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

const SELECT_COLUMNS = [
  'staging_id',
  'ingestion_source',
  'source_url',
  'ingested_at',
  'part_number',
  'part_name',
  'aftermarket_brand',
  'manufacturer_name',
  'status',
].join(',');

export async function fetchStagingPartRows(): Promise<{
  rows: StagingPartRow[];
  error: string | null;
}> {
  const params = new URLSearchParams();
  params.set('select', SELECT_COLUMNS);
  params.set('status', 'eq.pending_review');
  params.set('order', 'ingested_at.desc');
  params.set('limit', '100');

  const url = `${SUPABASE_URL}/rest/v1/staging_parts?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: restHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text();
      return { rows: [], error: `Supabase ${res.status}: ${body}` };
    }
    const raw = (await res.json()) as StagingPartRow[];

    // Compute duplicate_count grouped by part_number — equivalent to the
    // window function in the spec, but done client-side after fetch to keep
    // this PR purely frontend.
    const counts = new Map<string, number>();
    for (const r of raw) {
      const k = r.part_number ?? '';
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const rows = raw.map((r) => ({
      ...r,
      duplicate_count: counts.get(r.part_number ?? '') ?? 1,
    }));

    return { rows, error: null };
  } catch (err) {
    return {
      rows: [],
      error: err instanceof Error ? err.message : 'Unknown fetch error',
    };
  }
}

export async function updateStagingPartStatus(
  stagingId: string,
  patch: {
    status: 'pending' | 'rejected' | 'duplicate';
    processed_at?: string;
  },
): Promise<{ ok: boolean; error: string | null }> {
  const url = `${SUPABASE_URL}/rest/v1/staging_parts?staging_id=eq.${encodeURIComponent(
    stagingId,
  )}`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...restHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(patch),
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Supabase ${res.status}: ${body}` };
    }
    return { ok: true, error: null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown patch error',
    };
  }
}
