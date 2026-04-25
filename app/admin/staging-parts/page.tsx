// app/admin/staging-parts/page.tsx
// Staging Parts Review. Server component; reads pending_review rows via
// service role. Admin gate is shared with /admin/agent-review (same cookie,
// site-wide path). To authenticate, visit /admin/agent-review?token=... first.

import { isAdminAuthorized } from '../agent-review/lib/admin-guard';
import { fetchStagingPartRows } from './lib/supabase-admin';
import type { StagingPartRow } from './lib/types';
import StagingPartCard from './components/StagingPartCard';

export const dynamic = 'force-dynamic';

export default async function StagingPartsPage() {
  if (!(await isAdminAuthorized())) {
    return <UnauthorizedView />;
  }

  let rows: StagingPartRow[] = [];
  let rowsError: string | null = null;
  try {
    const result = await fetchStagingPartRows();
    rows = result.rows;
    rowsError = result.error;
  } catch (err) {
    rows = [];
    rowsError = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-white sm:text-2xl">
          Staging Parts Review
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Pending parts captured from listings. Approve to enqueue for
          promotion, reject to drop, or mark as duplicate. No production
          parts data is mutated here — only staging_parts.status.
        </p>
        <p className="mt-2 text-[11px] text-slate-500">
          {rows.length} row{rows.length === 1 ? '' : 's'} pending review
        </p>
      </header>

      {rowsError && (
        <div className="mt-4 rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-sm text-rose-200">
          <strong>Error loading staging parts:</strong> {rowsError}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {!rowsError && rows.length === 0 && <EmptyState />}
        {rows.map((row) => (
          <StagingPartCard key={row.staging_id} row={row} />
        ))}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
      <p className="text-sm font-medium text-slate-200">No pending parts.</p>
      <p className="mt-2 text-xs text-slate-500">
        New rows will appear here as the listing capture cron ingests them.
      </p>
    </div>
  );
}

function UnauthorizedView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-6">
      <div className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-6 text-slate-200">
        <h1 className="text-lg font-semibold text-white">
          Staging Parts — Access Required
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Visit{' '}
          <code className="rounded bg-slate-800 px-1">
            /admin/agent-review?token=...
          </code>{' '}
          first to set the admin cookie. The cookie is site-wide and applies
          to this page once set.
        </p>
      </div>
    </main>
  );
}
