// app/admin/agent-review/page.tsx
// Main Review Queue page. Server component; reads queue rows via service role.
// Admin gate: ADMIN_REVIEW_TOKEN shared secret, set via ?token=XXX on first visit.

import { redirect } from 'next/navigation';
import { isAdminAuthorized } from './lib/admin-guard';
import {
  fetchDistinctValues,
  fetchQueueCounts,
  fetchQueueRows,
} from './lib/supabase-admin';
import { resolveOptionsFromSearchParams } from './lib/filters';
import type { QueueRow } from './lib/types';
import QueueTabs from './components/QueueTabs';
import QueueFilters from './components/QueueFilters';
import QueueCard from './components/QueueCard';

export const dynamic = 'force-dynamic';

export default async function AgentReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Token-in-url handshake: if ?token=XXX matches ADMIN_REVIEW_TOKEN, set cookie.
  const tokenParam = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  if (tokenParam) {
    const expected = process.env.ADMIN_REVIEW_TOKEN;
    if (expected && tokenParam === expected) {
      const next = new URLSearchParams();
      for (const [k, v] of Object.entries(sp)) {
        if (k === 'token') continue;
        if (Array.isArray(v)) next.set(k, v[0] ?? '');
        else if (typeof v === 'string') next.set(k, v);
      }
      redirect(`/admin/agent-review${next.toString() ? '?' + next.toString() : ''}`);
    }
  }

  if (!(await isAdminAuthorized())) {
    return <UnauthorizedView />;
  }

  const { tab, options } = resolveOptionsFromSearchParams(sp);

  let rows: QueueRow[] = [];
  let rowsError: string | null = null;
  try {
    const result = await fetchQueueRows(options);
    rows = result.rows;
    rowsError = result.error;
  } catch (err) {
    rows = [];
    rowsError = err instanceof Error ? err.message : 'Unknown error';
  }

  const [agentNames, entityTypes, proposedActions, counts] = await Promise.all([
    fetchDistinctValues('agent_name').catch(() => []),
    fetchDistinctValues('entity_type').catch(() => []),
    fetchDistinctValues('proposed_action').catch(() => []),
    fetchQueueCounts().catch(() => ({})),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">
          Agent Review Queue
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Central review surface for agent proposals. Reviewer decisions update
          the queue row only — no production data is mutated here.
        </p>
      </header>

      <QueueTabs activeTab={tab} counts={counts} />

      <div className="mt-4">
        <QueueFilters
          agentNames={agentNames}
          entityTypes={entityTypes}
          proposedActions={proposedActions}
        />
      </div>

      {rowsError && (
        <div className="mt-4 rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-sm text-rose-200">
          <strong>Error loading queue:</strong> {rowsError}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {!rowsError && rows.length === 0 && <EmptyState tab={tab} />}
        {rows.map((row) => (
          <QueueCard key={row.queue_id} row={row} />
        ))}
      </div>
    </main>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
      <p className="text-sm font-medium text-slate-200">No items in this view.</p>
      <p className="mt-2 text-xs text-slate-500">
        {tab === 'all_pending'
          ? 'No pending proposals. Once agents are enabled, they will appear here.'
          : 'No items match the current tab or filters.'}
      </p>
    </div>
  );
}

function UnauthorizedView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-6">
      <div className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-6 text-slate-200">
        <h1 className="text-lg font-semibold text-white">
          Agent Review — Access Required
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Append <code className="rounded bg-slate-800 px-1">?token=...</code>{' '}
          to the URL with the admin review token to gain access. The token is
          stored as an httpOnly cookie for 8 hours, then you will need to
          re-authenticate.
        </p>
      </div>
    </main>
  );
}
