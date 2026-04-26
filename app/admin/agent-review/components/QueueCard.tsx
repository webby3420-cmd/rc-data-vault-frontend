// app/admin/agent-review/components/QueueCard.tsx
'use client';

import { useState, useTransition } from 'react';
import type { QueueRow, RejectReason } from '../lib/types';
import {
  approveQueueItem,
  rejectQueueItem,
  needsMoreReviewQueueItem,
  addNoteToQueueItem,
} from '../actions';

const REJECT_REASON_OPTIONS: ReadonlyArray<{
  value: RejectReason;
  label: string;
}> = [
  { value: 'is_part', label: 'Is a part / accessory' },
  { value: 'wrong_variant', label: 'Wrong variant proposed' },
  { value: 'multi_vehicle_fitment', label: 'Fits multiple vehicles' },
  { value: 'duplicate_listing', label: 'Duplicate listing' },
  { value: 'garbage', label: 'Garbage / unusable listing' },
  { value: 'other', label: 'Other' },
];
import {
  formatConfidencePercent,
  bucketPriority,
  formatPriceUSD,
  deriveSource,
  capitalize,
} from '../lib/format';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-slate-700 text-slate-200',
  approved: 'bg-emerald-700 text-emerald-100',
  rejected: 'bg-rose-700 text-rose-100',
  needs_more_review: 'bg-amber-700 text-amber-100',
  auto_expired: 'bg-slate-600 text-slate-300',
};

const RISK_TEXT_STYLES: Record<string, string> = {
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-orange-300',
  production_blocking: 'text-red-300',
};

export default function QueueCard({ row }: { row: QueueRow }) {
  const [note, setNote] = useState(row.reviewer_note ?? '');
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  // Local lock to prevent a successful approve/reject/needs_more_review from
  // re-firing on the same card during the window between server action
  // success and RSC revalidation. Note actions do not flip this lock.
  const [statusActionFired, setStatusActionFired] = useState(false);

  // Reject panel state — required reason picker + optional free text.
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectReason | null>(null);
  const [rejectFreeText, setRejectFreeText] = useState('');

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

  const listingImageSrc = row.listing_image_url ?? null;

  // For catalog_qa_agent rows that surface a suggested value, pluck it
  // out of evidence_payload defensively. Different proposed_action types
  // use different suggested-* keys; missing keys → null and the line
  // doesn't render.
  const suggested = pickSuggestedFromEvidence(
    row.proposed_action,
    row.evidence_payload,
  );

  const statusClass = STATUS_STYLES[row.status] ?? 'bg-slate-700 text-slate-200';
  const riskTextClass = row.risk_label
    ? RISK_TEXT_STYLES[row.risk_label] ?? 'text-slate-200'
    : 'text-slate-500';

  const created = new Date(row.created_at);
  const createdStr = created.toISOString().replace('T', ' ').slice(0, 16) + 'Z';

  const sourceLabel = deriveSource(row.listing_source, row.listing_url);
  const variantImageSrc = row.proposed_variant_image_url ?? null;
  const placeholderLetter =
    row.manufacturer_name?.charAt(0).toUpperCase() ?? '?';

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 text-slate-200 shadow-sm">
      {/* HEADER */}
      <header className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-slate-300">
          #{row.queue_id}
        </span>
        <span className={`rounded px-2 py-0.5 ${statusClass}`}>{row.status}</span>
        <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-slate-300">
          {row.proposed_action}
        </span>
        <span className="ml-auto text-slate-500">{createdStr}</span>
      </header>

      {/* TWO-COLUMN: LISTING ↔ PROPOSED MATCH */}
      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* LEFT — listing */}
        <section className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Listing
          </div>
          <h2 className="text-lg font-semibold leading-tight text-white">
            {row.listing_title || (
              <span className="text-slate-500">Title not available</span>
            )}
          </h2>
          <div className="text-2xl font-medium text-white">
            {formatPriceUSD(row.listing_price_usd, row.listing_currency)}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-200">
              {sourceLabel}
            </span>
            {row.listing_condition && (
              <span className="rounded-full border border-blue-700/40 bg-blue-500/10 px-2 py-0.5 text-blue-300">
                {row.listing_condition}
              </span>
            )}
          </div>
          {listingImageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listingImageSrc}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-24 w-24 flex-shrink-0 rounded-md border border-slate-800 bg-slate-900 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-950/50 text-[10px] text-slate-600">
              No image
            </div>
          )}
          {row.listing_url ? (
            <a
              href={row.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
            >
              View original listing ↗
            </a>
          ) : (
            <span className="text-xs text-slate-500">
              No listing link available
            </span>
          )}
        </section>

        {/* RIGHT — proposed variant match */}
        <section className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Proposed match
          </div>
          {(row.manufacturer_name || row.family_name) && (
            <div className="text-xs text-slate-400">
              {row.manufacturer_name || '—'}{' '}
              <span className="text-slate-600">›</span>{' '}
              {row.family_name || '—'}
            </div>
          )}
          <h2 className="text-lg font-semibold leading-tight text-white">
            {row.variant_full_name || (
              <span className="text-slate-500">Variant not specified</span>
            )}
          </h2>
          {suggested && (
            <div className="text-xs text-amber-300">
              Suggested:{' '}
              <span className="font-medium text-amber-200">
                {suggested.value}
              </span>
              {suggested.mentionCount != null && (
                <span className="text-amber-300/80">
                  {' '}
                  ({suggested.mentionCount} listing mention
                  {suggested.mentionCount === 1 ? '' : 's'})
                </span>
              )}
            </div>
          )}
          {variantImageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={variantImageSrc}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-24 w-24 flex-shrink-0 rounded-md border border-slate-800 bg-slate-900 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-950/50 text-3xl font-bold text-slate-700">
              {placeholderLetter}
            </div>
          )}
          {row.variant_url_path ? (
            <a
              href={row.variant_url_path}
              className="inline-flex items-center text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
            >
              View RC Data Vault page →
            </a>
          ) : (
            <span className="text-xs text-slate-500">
              No variant link available
            </span>
          )}
        </section>
      </div>

      {/* AGENT / ENTITY META */}
      <div className="mt-4 text-[11px] text-slate-500">
        <span>agent:</span>{' '}
        <span className="text-slate-400">{row.agent_name}</span>{' '}
        <span className="ml-2">entity:</span>{' '}
        <span className="text-slate-400">{row.entity_type}</span>{' '}
        <span className="ml-2">id:</span>{' '}
        <span className="font-mono text-slate-400">{row.entity_id}</span>
      </div>

      {/* DECISION CONTEXT — confidence / risk / priority / severity */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-xs sm:grid-cols-4">
        <Stat
          label="Confidence"
          value={formatConfidencePercent(row.confidence)}
        />
        <Stat
          label="Risk"
          value={capitalize(row.risk_label) ?? '—'}
          valueClassName={riskTextClass}
        />
        <Stat label="Priority" value={bucketPriority(row.priority_score)} />
        <Stat
          label="Severity"
          value={row.severity != null ? String(row.severity) : '—'}
        />
      </div>

      {/* RAW DETAILS — collapsed by default */}
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer select-none text-slate-500 hover:text-slate-300">
          Show raw details
        </summary>
        <div className="mt-3 space-y-3">
          <Section title="proposed_payload" json={row.proposed_payload} />
          <Section title="evidence_payload" json={row.evidence_payload} />
          <Section title="source_ref" json={row.source_ref} />
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2 font-mono text-[11px] leading-relaxed text-slate-400">
            <div>source_match_id: {row.source_match_id ?? '—'}</div>
            <div>source_stage_id: {row.source_stage_id ?? '—'}</div>
            <div>action_status: {row.action_status}</div>
            <div>reviewed_at: {row.reviewed_at ?? '—'}</div>
            <div>reviewer: {row.reviewer ?? '—'}</div>
          </div>
        </div>
      </details>

      {/* REVIEWER NOTE */}
      <div className="mt-4">
        <label
          className="text-xs text-slate-400"
          htmlFor={`note-${row.queue_id}`}
        >
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

      {/* ACTIONS */}
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
          onClick={() => {
            setErr(null);
            setShowRejectPanel((v) => !v);
          }}
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
          onClick={() =>
            runNoteAction(() => addNoteToQueueItem(row.queue_id, note))
          }
        >
          Save note
        </ActionButton>
      </div>

      {showRejectPanel && canChangeStatus && (
        <div className="mt-3 rounded-lg border border-rose-700/40 bg-rose-950/20 p-3">
          <fieldset>
            <legend className="px-1 text-[10px] uppercase tracking-wider text-rose-300">
              Reject reason (required)
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
              {REJECT_REASON_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 text-slate-200"
                >
                  <input
                    type="radio"
                    name={`reject-reason-${row.queue_id}`}
                    value={opt.value}
                    checked={rejectReason === opt.value}
                    onChange={() => setRejectReason(opt.value)}
                    disabled={pending}
                    className="h-4 w-4 cursor-pointer accent-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-3">
            <label
              className="text-xs text-slate-400"
              htmlFor={`reject-note-${row.queue_id}`}
            >
              Additional notes (optional)
            </label>
            <textarea
              id={`reject-note-${row.queue_id}`}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-200 placeholder:text-slate-600"
              rows={2}
              placeholder="optional context for this rejection"
              value={rejectFreeText}
              onChange={(e) => setRejectFreeText(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canChangeStatus || pending || rejectReason === null}
              title={
                rejectReason === null
                  ? 'Choose a reject reason to confirm'
                  : undefined
              }
              onClick={() => {
                if (rejectReason === null) return;
                runStatusAction(() =>
                  rejectQueueItem(
                    row.queue_id,
                    rejectReason,
                    rejectFreeText.trim() || undefined,
                  ),
                );
              }}
              className="flex-1 min-w-[7rem] rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm reject
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setShowRejectPanel(false)}
              className="flex-1 min-w-[7rem] rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {statusActionFired && !err && (
        <p className="mt-2 text-xs text-emerald-400">
          Decision recorded. Refreshing…
        </p>
      )}

      {err && <p className="mt-2 text-xs text-rose-400">Error: {err}</p>}
    </article>
  );
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div
        className={`mt-0.5 font-medium ${valueClassName ?? 'text-slate-200'}`}
      >
        {value}
      </div>
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
      <div className="mb-1 font-mono text-[11px] text-slate-500">{title}</div>
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

// Extract a "Suggested: <value>" line from evidence_payload for the catalog_qa
// proposed_action types that emit one. Returns null when no key matches —
// the JSX then skips rendering the line entirely.
function pickSuggestedFromEvidence(
  action: string,
  evidence: Record<string, unknown> | null,
): { value: string; mentionCount: number | null } | null {
  if (!evidence) return null;

  const candidateKeys: Record<string, readonly string[]> = {
    missing_chassis_platform_with_evidence: [
      'suggested_chassis_platform',
      'suggested_platform',
    ],
    catalog_number_missing_with_evidence: [
      'suggested_catalog_number',
      'suggested_part_number',
    ],
  };
  const keys = candidateKeys[action];
  if (!keys) return null;

  let value: string | null = null;
  for (const k of keys) {
    const v = evidence[k];
    if (typeof v === 'string' && v.trim().length > 0) {
      value = v;
      break;
    }
  }
  if (!value) return null;

  const countCandidates: readonly string[] = [
    'listing_mentions',
    'listing_mention_count',
    'mention_count',
    'listing_count',
    'evidence_count',
    'n_listings',
    'count',
  ];
  let mentionCount: number | null = null;
  for (const k of countCandidates) {
    const v = evidence[k];
    if (typeof v === 'number' && Number.isFinite(v)) {
      mentionCount = v;
      break;
    }
    if (typeof v === 'string') {
      const n = Number(v);
      if (Number.isFinite(n)) {
        mentionCount = n;
        break;
      }
    }
  }

  return { value, mentionCount };
}
