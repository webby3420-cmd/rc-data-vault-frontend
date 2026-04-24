// app/admin/agent-review/components/QueueCard.tsx
'use client';

import { useState, useTransition } from 'react';
import type { QueueRow } from '../lib/types';
import {
  approveQueueItem,
  rejectQueueItem,
  needsMoreReviewQueueItem,
  addNoteToQueueItem,
} from '../actions';

const RISK_STYLES: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  production_blocking: 'bg-red-500/10 text-red-300 border-red-500/30',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-slate-700 text-slate-200',
  approved: 'bg-emerald-700 text-emerald-100',
  rejected: 'bg-rose-700 text-rose-100',
  needs_more_review: 'bg-amber-700 text-amber-100',
  auto_expired: 'bg-slate-600 text-slate-300',
};

export default function QueueCard({ row }: { row: QueueRow }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(row.reviewer_note ?? '');
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  // Local lock to prevent a successful approve/reject/needs_more_review from
  // re-firing on the same card during the window between server action
  // success and RSC revalidation. Note actions do not flip this lock.
  const [statusActionFired, setStatusActionFired] = useState(false);

  const rowAllowsStatusChange =
    row.status === 'pending' || row.status === 'needs_more_review';
  const canChangeStatus = rowAllowsStatusChange && !statusActionFired;

  function runStatusAction(
    fn: () => Promise<{ ok: boolean; error: string | null }>,
  ) {
    if (!canChangeStatus || pending) return;
    setErr(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setErr(result.error ?? 'Action failed');
      } else {
        setStatusActionFired(true);
      }
    });
  }

  function runNoteAction(
    fn: () => Promise<{ ok: boolean; error: string | null }>,
  ) {
    if (pending) return;
    setErr(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setErr(result.error ?? 'Action failed');
      }
    });
  }

  const riskClass =
    row.risk_label && RISK_STYLES[row.risk_label]
      ? RISK_STYLES[row.risk_label]
      : 'bg-slate-700 text-slate-300 border-slate-600';

  const statusClass = STATUS_STYLES[row.status] ?? 'bg-slate-700 text-slate-200';

  const created = new Date(row.created_at);
  const createdStr = created.toISOString().replace('T', ' ').slice(0, 16) + 'Z';

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-slate-200 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-slate-300">
          #{row.queue_id}
        </span>
        <span className={`rounded px-2 py-0.5 ${statusClass}`}>{row.status}</span>
        {row.risk_label && (
          <span className={`rounded border px-2 py-0.5 ${riskClass}`}>
            {row.risk_label.replace('_', ' ')}
          </span>
        )}
        <span className="ml-auto text-slate-500">{createdStr}</span>
      </header>

      <div className="mt-3">
        <div className="text-sm font-semibold text-white">
          {row.proposed_action}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          <span className="text-slate-500">agent:</span> {row.agent_name}{' '}
          <span className="ml-2 text-slate-500">entity:</span> {row.entity_type}
          <span className="ml-2 text-slate-500">id:</span>{' '}
          <span className="font-mono">{row.entity_id}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Metric
          label="confidence"
          value={row.confidence ? parseFloat(row.confidence).toFixed(3) : '—'}
        />
        <Metric
          label="priority"
          value={
            row.priority_score ? parseFloat(row.priority_score).toFixed(3) : '—'
          }
        />
        <Metric
          label="severity"
          value={row.severity !== null ? String(row.severity) : '—'}
        />
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
      >
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 text-xs">
          <Section title="proposed_payload" json={row.proposed_payload} />
          <Section title="evidence_payload" json={row.evidence_payload} />
          <Section title="source_ref" json={row.source_ref} />
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 font-mono text-slate-400">
            <div>source_match_id: {row.source_match_id ?? '—'}</div>
            <div>source_stage_id: {row.source_stage_id ?? '—'}</div>
            <div>action_status: {row.action_status}</div>
            <div>reviewed_at: {row.reviewed_at ?? '—'}</div>
            <div>reviewer: {row.reviewer ?? '—'}</div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className="text-xs text-slate-400" htmlFor={`note-${row.queue_id}`}>
          reviewer note
        </label>
        <textarea
          id={`note-${row.queue_id}`}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-200 placeholder:text-slate-600"
          rows={2}
          placeholder="optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={pending}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton
          variant="approve"
          disabled={!canChangeStatus || pending}
          onClick={() =>
            runStatusAction(() => approveQueueItem(row.queue_id, note || null))
          }
        >
          Approve
        </ActionButton>
        <ActionButton
          variant="reject"
          disabled={!canChangeStatus || pending}
          onClick={() =>
            runStatusAction(() => rejectQueueItem(row.queue_id, note || null))
          }
        >
          Reject
        </ActionButton>
        <ActionButton
          variant="review"
          disabled={!canChangeStatus || pending}
          onClick={() =>
            runStatusAction(() =>
              needsMoreReviewQueueItem(row.queue_id, note || null),
            )
          }
        >
          Needs more review
        </ActionButton>
        <ActionButton
          variant="note"
          disabled={pending || note.trim().length === 0}
          onClick={() => runNoteAction(() => addNoteToQueueItem(row.queue_id, note))}
        >
          Save note
        </ActionButton>
      </div>

      {statusActionFired && !err && (
        <p className="mt-2 text-xs text-emerald-400">
          Decision recorded. Refreshing…
        </p>
      )}

      {err && (
        <p className="mt-2 text-xs text-rose-400">Error: {err}</p>
      )}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2">
      <div className="text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-slate-200">{value}</div>
    </div>
  );
}

function Section({
  title,
  json,
}: {
  title: string;
  json: Record<string, unknown> | null;
}) {
  const text = json ? JSON.stringify(json, null, 2) : '(empty)';
  return (
    <div>
      <div className="mb-1 text-slate-500">{title}</div>
      <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/50 p-2 font-mono text-[11px] leading-relaxed text-slate-300">
        {text}
      </pre>
    </div>
  );
}

function ActionButton({
  variant,
  disabled,
  onClick,
  children,
}: {
  variant: 'approve' | 'reject' | 'review' | 'note';
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const base =
    'flex-1 min-w-[7rem] rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles: Record<string, string> = {
    approve: 'bg-emerald-600 text-white hover:bg-emerald-500',
    reject: 'bg-rose-600 text-white hover:bg-rose-500',
    review: 'bg-amber-600 text-white hover:bg-amber-500',
    note: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
