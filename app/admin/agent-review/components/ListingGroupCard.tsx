// app/admin/agent-review/components/ListingGroupCard.tsx
'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Loader2,
  Tag,
  X,
} from 'lucide-react';
import type {
  ApplyReceipt,
  GroupCandidate,
  ListingGroup,
} from '../lib/types';
import { formatPriceUSD, deriveSource } from '../lib/format';
import {
  approveListingToVariantAction,
  retargetListingAction,
  rejectQueueRowViaRpcAction,
} from '../actions';

type ActionKind = 'approve' | 'retarget' | 'reject';

export default function ListingGroupCard({ group }: { group: ListingGroup }) {
  const [pending, startTransition] = useTransition();
  const [activeQueueId, setActiveQueueId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<ActionKind | null>(null);
  const [dryRunReceipt, setDryRunReceipt] = useState<ApplyReceipt | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [showEvidence, setShowEvidence] = useState<Record<number, boolean>>({});

  const isComboLocked =
    group.n_pending >= 3 && group.title_risk_flags?.combo === true;
  const sourceLabel = deriveSource(group.listing_source, group.listing_url);
  const priceText = formatGroupPrice(
    group.listing_price_usd,
    group.listing_price,
    group.listing_currency,
  );

  function setNoteFor(queueId: number, value: string) {
    setNotes((prev) => ({ ...prev, [queueId]: value }));
  }
  function setErrorFor(queueId: number, value: string) {
    setErrors((prev) => ({ ...prev, [queueId]: value }));
  }
  function clearActive() {
    setActiveQueueId(null);
    setActiveAction(null);
    setDryRunReceipt(null);
  }
  function toggleEvidence(queueId: number) {
    setShowEvidence((prev) => ({ ...prev, [queueId]: !prev[queueId] }));
  }

  function handleApprove(queueId: number) {
    if (isComboLocked) return;
    setActiveQueueId(queueId);
    setActiveAction('approve');
    setDryRunReceipt(null);
    setErrorFor(queueId, '');
    startTransition(async () => {
      const result = await approveListingToVariantAction({
        queueId,
        dryRun: true,
      });
      if (result.ok) setDryRunReceipt(result.receipt ?? null);
      else setErrorFor(queueId, result.error);
    });
  }

  function handleApproveConfirm(queueId: number) {
    startTransition(async () => {
      const result = await approveListingToVariantAction({
        queueId,
        dryRun: false,
      });
      if (result.ok) clearActive();
      else setErrorFor(queueId, result.error);
    });
  }

  function handleRetargetStart(queueId: number) {
    if (isComboLocked) return;
    setActiveQueueId(queueId);
    setActiveAction('retarget');
    setDryRunReceipt(null);
    setErrorFor(queueId, '');
  }

  function handleRetargetDryRun(queueId: number) {
    const note = (notes[queueId] ?? '').trim();
    if (!note) {
      setErrorFor(queueId, 'reviewer_note_required');
      return;
    }
    setErrorFor(queueId, '');
    startTransition(async () => {
      const result = await retargetListingAction({
        queueId,
        reviewerNote: note,
        overrideTargetVariantId: null,
        dryRun: true,
      });
      if (result.ok) setDryRunReceipt(result.receipt ?? null);
      else setErrorFor(queueId, result.error);
    });
  }

  function handleRetargetConfirm(queueId: number) {
    const note = (notes[queueId] ?? '').trim();
    if (!note) return;
    startTransition(async () => {
      const result = await retargetListingAction({
        queueId,
        reviewerNote: note,
        overrideTargetVariantId: null,
        dryRun: false,
      });
      if (result.ok) clearActive();
      else setErrorFor(queueId, result.error);
    });
  }

  function handleRejectStart(queueId: number) {
    if (isComboLocked) return;
    setActiveQueueId(queueId);
    setActiveAction('reject');
    setDryRunReceipt(null);
    setErrorFor(queueId, '');
  }

  function handleRejectDryRun(queueId: number) {
    const note = (notes[queueId] ?? '').trim();
    if (!note) {
      setErrorFor(queueId, 'reviewer_note_required');
      return;
    }
    setErrorFor(queueId, '');
    startTransition(async () => {
      const result = await rejectQueueRowViaRpcAction({
        queueId,
        reviewerNote: note,
        dryRun: true,
      });
      if (result.ok) setDryRunReceipt(result.receipt ?? null);
      else setErrorFor(queueId, result.error);
    });
  }

  function handleRejectConfirm(queueId: number) {
    const note = (notes[queueId] ?? '').trim();
    if (!note) return;
    startTransition(async () => {
      const result = await rejectQueueRowViaRpcAction({
        queueId,
        reviewerNote: note,
        dryRun: false,
      });
      if (result.ok) clearActive();
      else setErrorFor(queueId, result.error);
    });
  }

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
      {/* A. COMBO BANNER */}
      {isComboLocked && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-semibold">
              Combo listing — manual handling required.
            </p>
            <p className="mt-1 text-amber-300/80">
              This listing references multiple distinct vehicles. No automatic
              split is supported yet. All apply actions are disabled.
            </p>
          </div>
        </div>
      )}

      {/* B. TOP CONTEXT ROW */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {/* LEFT: thumbnail */}
        <div className="flex-shrink-0">
          {group.listing_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={group.listing_image_url}
              alt={group.listing_title ?? 'listing'}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-24 w-24 rounded-lg bg-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-800">
              <Tag className="h-6 w-6 text-slate-600" />
            </div>
          )}
        </div>

        {/* RIGHT: title + meta */}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold text-white sm:text-lg">
            {group.listing_title ?? 'Untitled listing'}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-200">
              {sourceLabel}
            </span>
            {group.listing_condition && (
              <span className="inline-flex items-center rounded-full border border-blue-700/40 bg-blue-500/10 px-2 py-0.5 text-blue-300">
                {group.listing_condition}
              </span>
            )}
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 font-medium text-white">
              {priceText}
            </span>
            <span
              className={
                group.is_sold
                  ? 'inline-flex items-center rounded-full border border-rose-700/40 bg-rose-500/10 px-2 py-0.5 text-rose-300'
                  : 'inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-300'
              }
            >
              {group.is_sold ? 'Sold' : 'Active'}
            </span>
            {group.observation_count > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                {group.observation_count} obs
              </span>
            )}
            {group.listing_url && (
              <a
                href={group.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-sky-400 hover:bg-slate-700 hover:text-sky-300"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {[
              group.posted_at && `posted ${formatDate(group.posted_at)}`,
              group.seller_name,
              group.listing_location,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      {/* C. RISK FLAG STRIP */}
      {group.has_any_risk_flag && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(
            Object.entries(group.title_risk_flags) as Array<[string, boolean]>
          )
            .filter(([, v]) => v === true)
            .map(([k]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300"
              >
                <Info className="h-3 w-3" />
                {humanize(k)}
              </span>
            ))}
        </div>
      )}

      {/* D. CURRENT PRIMARY BLOCK */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Current primary
        </p>
        <p className="mt-1 text-sm text-white">
          {group.primary_variant_name ?? '— (none)'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {group.primary_verification_status && (
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300">
              {group.primary_verification_status}
            </span>
          )}
          {group.primary_match_method && (
            <span className="text-slate-500">{group.primary_match_method}</span>
          )}
          {group.primary_is_human_verified === true && (
            <span className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              human-verified
            </span>
          )}
          {group.primary_family_deprecated && (
            <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-300">
              Family deprecated
            </span>
          )}
        </div>
      </div>

      {/* E. CANDIDATES SECTION */}
      <h4 className="mt-4 text-xs uppercase tracking-wider text-slate-500">
        Candidates ({group.n_pending})
      </h4>
      <div>
        {group.candidates.map((candidate) => (
          <CandidateBlock
            key={candidate.queue_id}
            candidate={candidate}
            isComboLocked={isComboLocked}
            pending={pending}
            isActive={activeQueueId === candidate.queue_id}
            activeAction={
              activeQueueId === candidate.queue_id ? activeAction : null
            }
            note={notes[candidate.queue_id] ?? ''}
            error={errors[candidate.queue_id] ?? ''}
            receipt={
              activeQueueId === candidate.queue_id ? dryRunReceipt : null
            }
            evidenceOpen={!!showEvidence[candidate.queue_id]}
            onApprove={() => handleApprove(candidate.queue_id)}
            onApproveConfirm={() => handleApproveConfirm(candidate.queue_id)}
            onRetargetStart={() => handleRetargetStart(candidate.queue_id)}
            onRetargetDryRun={() => handleRetargetDryRun(candidate.queue_id)}
            onRetargetConfirm={() => handleRetargetConfirm(candidate.queue_id)}
            onRejectStart={() => handleRejectStart(candidate.queue_id)}
            onRejectDryRun={() => handleRejectDryRun(candidate.queue_id)}
            onRejectConfirm={() => handleRejectConfirm(candidate.queue_id)}
            onSetNote={(v) => setNoteFor(candidate.queue_id, v)}
            onCancel={clearActive}
            onToggleEvidence={() => toggleEvidence(candidate.queue_id)}
          />
        ))}
      </div>

      {/* F. FOOTER */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600">
        <span>listing {group.listing_id.slice(0, 8)}…</span>
        {group.posted_at && (
          <span>posted {new Date(group.posted_at).toLocaleDateString()}</span>
        )}
      </div>
    </article>
  );
}

function CandidateBlock({
  candidate,
  isComboLocked,
  pending,
  isActive,
  activeAction,
  note,
  error,
  receipt,
  evidenceOpen,
  onApprove,
  onApproveConfirm,
  onRetargetStart,
  onRetargetDryRun,
  onRetargetConfirm,
  onRejectStart,
  onRejectDryRun,
  onRejectConfirm,
  onSetNote,
  onCancel,
  onToggleEvidence,
}: {
  candidate: GroupCandidate;
  isComboLocked: boolean;
  pending: boolean;
  isActive: boolean;
  activeAction: ActionKind | null;
  note: string;
  error: string;
  receipt: ApplyReceipt | null;
  evidenceOpen: boolean;
  onApprove: () => void;
  onApproveConfirm: () => void;
  onRetargetStart: () => void;
  onRetargetDryRun: () => void;
  onRetargetConfirm: () => void;
  onRejectStart: () => void;
  onRejectDryRun: () => void;
  onRejectConfirm: () => void;
  onSetNote: (v: string) => void;
  onCancel: () => void;
  onToggleEvidence: () => void;
}) {
  const approveActive = isActive && activeAction === 'approve';
  const retargetActive = isActive && activeAction === 'retarget';
  const rejectActive = isActive && activeAction === 'reject';

  const approveDisabled =
    isComboLocked || !candidate.matches_primary || pending;
  const retargetDisabled = isComboLocked || pending;
  const rejectDisabled = isComboLocked || pending;

  return (
    <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {candidate.proposed_variant_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.proposed_variant_image_url}
              alt={candidate.proposed_variant_name ?? ''}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-16 w-16 rounded-md bg-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-800">
              <Tag className="h-5 w-5 text-slate-600" />
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white">
            {candidate.proposed_variant_name ?? '(unknown variant)'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {[
              candidate.proposed_manufacturer_name,
              candidate.proposed_family_name,
            ]
              .filter(Boolean)
              .join(' · ') || '—'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {candidate.confidence != null && (
              <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300">
                {Math.round(Number(candidate.confidence) * 100)}% conf
              </span>
            )}
            {candidate.matches_primary ? (
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                Matches current primary
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-400">
                Different from primary
              </span>
            )}
            {candidate.risk_label && (
              <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">
                {candidate.risk_label}
              </span>
            )}
            {candidate.proposed_family_deprecated && (
              <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-300">
                Family deprecated
              </span>
            )}
            <span className="font-mono text-[11px] text-slate-500">
              #{candidate.queue_id}
            </span>
          </div>

          {/* Evidence toggle */}
          <button
            type="button"
            onClick={onToggleEvidence}
            className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
          >
            {evidenceOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Evidence
          </button>
          {evidenceOpen && (
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-900 p-2 text-[10px] text-slate-400">
              {candidate.evidence_payload
                ? JSON.stringify(candidate.evidence_payload, null, 2)
                : '(empty)'}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 flex-col gap-2 sm:w-44">
          <ActionButton
            kind="approve"
            disabled={approveDisabled}
            isLoading={approveActive && pending}
            onClick={onApprove}
            tooltip={
              isComboLocked
                ? 'Disabled: combo listing'
                : !candidate.matches_primary
                  ? 'Only enabled when candidate matches current primary'
                  : undefined
            }
          >
            <Check className="h-3.5 w-3.5" /> Approve same-primary
          </ActionButton>
          <ActionButton
            kind="retarget"
            disabled={retargetDisabled}
            isLoading={retargetActive && pending}
            onClick={onRetargetStart}
            tooltip={isComboLocked ? 'Disabled: combo listing' : undefined}
          >
            <Tag className="h-3.5 w-3.5" /> Retarget to this
          </ActionButton>
          <ActionButton
            kind="reject"
            disabled={rejectDisabled}
            isLoading={rejectActive && pending}
            onClick={onRejectStart}
            tooltip={isComboLocked ? 'Disabled: combo listing' : undefined}
          >
            <X className="h-3.5 w-3.5" /> Reject candidate
          </ActionButton>
        </div>
      </div>

      {/* Inline disclosure */}
      {isActive && activeAction && (
        <ActionPanel
          action={activeAction}
          note={note}
          setNote={onSetNote}
          receipt={receipt}
          error={error}
          pending={pending}
          onSubmitDryRun={
            activeAction === 'retarget'
              ? onRetargetDryRun
              : activeAction === 'reject'
                ? onRejectDryRun
                : null
          }
          onConfirm={
            activeAction === 'approve'
              ? onApproveConfirm
              : activeAction === 'retarget'
                ? onRetargetConfirm
                : onRejectConfirm
          }
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

function ActionPanel({
  action,
  note,
  setNote,
  receipt,
  error,
  pending,
  onSubmitDryRun,
  onConfirm,
  onCancel,
}: {
  action: ActionKind;
  note: string;
  setNote: (v: string) => void;
  receipt: ApplyReceipt | null;
  error: string;
  pending: boolean;
  onSubmitDryRun: (() => void) | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const refused =
    !!receipt && typeof receipt.status === 'string' && receipt.status === 'refused';
  const message =
    receipt && typeof receipt.message === 'string'
      ? (receipt.message as string)
      : null;

  // For retarget/reject: still in note-entry stage if no receipt yet and no error.
  const needsNote = action !== 'approve';
  const inNoteStage = needsNote && !receipt;

  return (
    <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-3">
      {inNoteStage && (
        <>
          <label className="text-[11px] uppercase tracking-wider text-slate-400">
            Reviewer note (required)
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-slate-100 placeholder:text-slate-600"
            rows={2}
            placeholder={
              action === 'retarget'
                ? 'Why is this the correct variant?'
                : 'Why are you rejecting this candidate?'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={pending}
            autoFocus
          />
          {error && (
            <p className="mt-2 text-xs text-rose-300">
              {error === 'reviewer_note_required'
                ? 'A reviewer note is required.'
                : `Error: ${error}`}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onSubmitDryRun ?? undefined}
              disabled={pending || note.trim().length === 0}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-700 bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Info className="h-3.5 w-3.5" />
              )}
              Run dry-run
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Receipt + confirm/cancel */}
      {receipt && (
        <div
          className={
            refused
              ? 'rounded-md border border-rose-700/50 bg-rose-950/40 p-2 text-rose-200'
              : 'rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-300'
          }
        >
          <div className="flex items-center gap-2 text-xs">
            <Info
              className={
                refused
                  ? 'h-3.5 w-3.5 text-rose-300'
                  : 'h-3.5 w-3.5 text-sky-400'
              }
            />
            <span className="font-semibold">
              {refused ? 'Refused' : 'Dry-run receipt'}
            </span>
          </div>
          {refused && message && (
            <p className="mt-2 text-sm font-medium text-rose-100">{message}</p>
          )}
          <pre className="mt-2 max-h-64 overflow-auto rounded border border-slate-800 bg-slate-950 p-2 text-[10px] text-slate-300">
            {JSON.stringify(receipt, null, 2)}
          </pre>
        </div>
      )}
      {receipt && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending || refused}
            title={
              refused ? 'Cannot apply: backend refused' : 'Apply for real'
            }
            className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-700/50 bg-emerald-600/90 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Confirm — apply for real
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error in approve flow (which has no note stage) */}
      {!receipt && !inNoteStage && error && (
        <div className="rounded-md border border-rose-700/50 bg-rose-950/40 p-2 text-xs text-rose-200">
          <strong>Error:</strong> {error}
        </div>
      )}
      {/* Approve flow loading state (no note panel, no receipt yet) */}
      {!receipt && !inNoteStage && !error && pending && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Running dry-run…
        </div>
      )}
    </div>
  );
}

function ActionButton({
  kind,
  disabled,
  isLoading,
  onClick,
  tooltip,
  children,
}: {
  kind: ActionKind;
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
  tooltip: string | undefined;
  children: React.ReactNode;
}) {
  const base =
    'inline-flex items-center justify-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
  const palette =
    kind === 'approve'
      ? 'border-emerald-700/50 bg-emerald-600/90 text-white hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-400 disabled:border-slate-700'
      : kind === 'retarget'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 disabled:bg-slate-800 disabled:text-slate-400 disabled:border-slate-700'
        : 'border-rose-700/50 bg-rose-600/90 text-white hover:bg-rose-600 disabled:bg-slate-800 disabled:text-slate-400 disabled:border-slate-700';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`${base} ${palette}`}
    >
      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
    </button>
  );
}

function humanize(s: string): string {
  if (!s) return s;
  const spaced = s.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatDate(iso: string): string {
  const t = new Date(iso);
  if (!Number.isFinite(t.getTime())) return iso;
  return t.toLocaleDateString();
}

function formatGroupPrice(
  usd: number | null,
  raw: number | null,
  currency: string | null,
): string {
  if (usd != null) return formatPriceUSD(usd, 'USD');
  if (raw == null) return 'Price not available';
  if (currency && currency !== 'USD') {
    return `${currency} ${raw.toLocaleString('en-US')}`;
  }
  return formatPriceUSD(raw, currency ?? 'USD');
}
