// app/admin/agent-review/lib/supabase-admin.ts
// Server-only PostgREST fetch helper that uses the Supabase service role key.
// The service role bypasses RLS, which is correct for this admin surface:
// agent_review_queue has RLS enabled with zero policies (fail-closed for all
// other roles). Key must never leak to the client.

import 'server-only';
import type { QueueRow } from './types';

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

export interface FetchQueueOptions {
  status?: string;
  agent_name?: string;
  entity_type?: string;
  proposed_action?: string;
  risk_label?: string;
  confidence_min?: number;
  confidence_max?: number;
  age_days?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function fetchQueueRows(
  opts: FetchQueueOptions,
): Promise<{ rows: QueueRow[]; error: string | null }> {
  const params = new URLSearchParams();

  // Query-shape params (singletons): set()
  params.set('select', '*');
  params.set(
    'order',
    'priority_score.desc.nullslast,severity.desc.nullslast,created_at.asc',
  );
  const limit = Math.min(opts.limit ?? 100, 500);
  params.set('limit', String(limit));
  if (opts.offset) params.set('offset', String(opts.offset));

  // Filter params: append() so multiple filters on the same column stack
  // (e.g. confidence>=X AND confidence<=Y) rather than overwriting each other.
  if (opts.status) params.append('status', `eq.${opts.status}`);
  if (opts.agent_name) params.append('agent_name', `eq.${opts.agent_name}`);
  if (opts.entity_type) params.append('entity_type', `eq.${opts.entity_type}`);
  if (opts.proposed_action)
    params.append('proposed_action', `eq.${opts.proposed_action}`);
  if (opts.risk_label) params.append('risk_label', `eq.${opts.risk_label}`);

  if (typeof opts.confidence_min === 'number')
    params.append('confidence', `gte.${opts.confidence_min}`);
  if (typeof opts.confidence_max === 'number')
    params.append('confidence', `lte.${opts.confidence_max}`);

  if (typeof opts.age_days === 'number' && opts.age_days > 0) {
    const since = new Date(Date.now() - opts.age_days * 86400_000).toISOString();
    params.append('created_at', `gte.${since}`);
  }

  if (opts.search) {
    params.append(
      'or',
      `(entity_id.ilike.*${opts.search}*,reviewer_note.ilike.*${opts.search}*,proposed_action.ilike.*${opts.search}*)`,
    );
  }

  const url = `${SUPABASE_URL}/rest/v1/v_agent_review_queue_enriched?${params.toString()}`;

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
    const rows = (await res.json()) as QueueRow[];
    return { rows, error: null };
  } catch (err) {
    return {
      rows: [],
      error: err instanceof Error ? err.message : 'Unknown fetch error',
    };
  }
}

export async function fetchDistinctValues(
  column: 'agent_name' | 'entity_type' | 'proposed_action',
): Promise<string[]> {
  const url = `${SUPABASE_URL}/rest/v1/v_agent_review_queue_enriched?select=${column}&order=${column}.asc`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: restHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<Record<string, string | null>>;
    const set = new Set<string>();
    for (const row of rows) {
      const v = row[column];
      if (typeof v === 'string' && v.length > 0) set.add(v);
    }
    return Array.from(set).sort();
  } catch {
    return [];
  }
}

export async function fetchQueueCounts(): Promise<Record<string, number>> {
  const statuses = [
    'pending',
    'approved',
    'rejected',
    'needs_more_review',
    'auto_expired',
  ];
  const results: Record<string, number> = {};
  await Promise.all(
    statuses.map(async (s) => {
      const url = `${SUPABASE_URL}/rest/v1/v_agent_review_queue_enriched?select=queue_id&status=eq.${s}&limit=1`;
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          headers: { ...restHeaders(), Prefer: 'count=exact' },
          cache: 'no-store',
        });
        const range = res.headers.get('content-range');
        const total = range?.split('/')?.[1];
        results[s] = total && total !== '*' ? parseInt(total, 10) : 0;
      } catch {
        results[s] = 0;
      }
    }),
  );
  return results;
}

export async function fetchPendingAgentCounts(): Promise<
  Record<string, number>
> {
  // Fetch agent_name for every pending row and group client-side. Cheaper
  // than N parallel HEAD-with-count requests, and fine at current scale
  // (~600 pending rows total). PostgREST default limit is 1000.
  const params = new URLSearchParams();
  params.set('select', 'agent_name');
  params.set('status', 'eq.pending');
  params.set('limit', '5000');

  const url = `${SUPABASE_URL}/rest/v1/v_agent_review_queue_enriched?${params.toString()}`;

  const result: Record<string, number> = {};
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: restHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return result;
    const rows = (await res.json()) as Array<{ agent_name: string | null }>;
    for (const r of rows) {
      if (!r.agent_name) continue;
      result[r.agent_name] = (result[r.agent_name] ?? 0) + 1;
    }
  } catch {
    // Best-effort; counts default to 0 if fetch fails.
  }
  return result;
}

export async function updateQueueRowStatus(
  queueId: number,
  patch: {
    status?: string;
    reviewer_note?: string;
    reviewer?: string | null;
    reviewed_at?: string | null;
  },
): Promise<{ ok: boolean; error: string | null }> {
  const url = `${SUPABASE_URL}/rest/v1/agent_review_queue?queue_id=eq.${queueId}`;
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
