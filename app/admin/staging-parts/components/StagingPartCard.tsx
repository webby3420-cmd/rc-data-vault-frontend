// app/admin/staging-parts/components/StagingPartCard.tsx
'use client';

import { useState, useTransition } from 'react';
import type { PartType, StagingPartRow } from '../lib/types';
import {
  approveStagingPart,
  rejectStagingPart,
  markStagingPartDuplicate,
} from '../actions';

const PART_TYPE_OPTIONS: ReadonlyArray<{ value: PartType; label: string }> = [
  { value: 'oem_replacement', label: 'OEM replacement' },
  { value: 'aftermarket_upgrade', label: 'Aftermarket upgrade' },
  { value: 'universal_fitment', label: 'Universal fitment' },
];

const STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-amber-700 text-amber-100',
  pending: 'bg-emerald-700 text-emerald-100',
  rejected: 'bg-rose-700 text-rose-100',
  duplicate: 'bg-slate-600 text-slate-200',
};

function deriveSourceLabel(url: string | null): string {
  if (!url) return 'External';
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    if (host.includes('ebay')) return 'eBay';
    if (host.includes('facebook')) return 'Facebook Marketplace';
    return 'External';
  } catch {
    return 'External';
  }
}

export default function StagingPartCard({ row }: { row: StagingPartRow }) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [actionFired, setActionFired] = useState(false);
  const [partType, setPartType] = useState<PartType | null>(null);

  if (dismissed) return null;

  const canChange = !actionFired;

  function runAction(
    fn: () => Promise<{ ok: boolean; error: string | null }>,
  ) {
    if (!canChange || pending) return;
    setErr(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setErr(result.error ?? 'Action failed');
      } else {
        setActionFired(true);
        setDismissed(true);
      }
    });
  }

  const sourceLabel = deriveSourceLabel(row.source_url);
  const statusClass =
    STATUS_STYLES[row.status] ?? 'bg-slate-700 text-slate-200';

  const ingested = new Date(row.ingested_at);
  const ingestedStr =
    ingested.toISOString().replace('T', ' ').slice(0, 16) + 'Z';

  const brandLabel = row.aftermarket_brand || row.manufacturer_name || null;
  const dupCount = row.duplicate_count ?? 1;

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 text-slate-200 shadow-sm">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* LEFT — part details */}
        <section className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Part
          </div>
          <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-white">
            {row.part_name || (
              <span className="text-slate-500">Unnamed part</span>
            )}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-slate-200">
              {row.part_number || '—'}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-200">
              {sourceLabel}
            </span>
          </div>
          <div className="text-xs">
            {brandLabel ? (
              <span className="text-slate-400">
                Brand: <span className="text-slate-200">{brandLabel}</span>
              </span>
            ) : (
              <span className="italic text-slate-500">Brand: unknown</span>
            )}
          </div>
          {row.listing_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.listing_image_url}
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
          {row.source_url && (
            <a
              href={row.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
            >
              View source listing ↗
            </a>
          )}
        </section>

        {/* RIGHT — status / meta */}
        <section className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Status
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded px-2 py-0.5 ${statusClass}`}>
              {row.status}
            </span>
            <span className="text-slate-500">{ingestedStr}</span>
          </div>
          {dupCount > 1 && (
            <div className="rounded-lg border border-amber-700/40 bg-amber-500/10 p-2 text-xs text-amber-200">
              ⚠ {dupCount - 1} other row{dupCount - 1 === 1 ? '' : 's'} with
              the same SKU
            </div>
          )}
          <div className="text-[11px] text-slate-500">
            <div>
              <span>ingestion_source:</span>{' '}
              <span className="text-slate-400">
                {row.ingestion_source ?? '—'}
              </span>
            </div>
            <div>
              <span>staging_id:</span>{' '}
              <span className="font-mono text-slate-400">
                {row.staging_id}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* PART TYPE — required to approve */}
      <fieldset className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500">
          Part type (required to approve)
        </legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {PART_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 text-slate-200"
            >
              <input
                type="radio"
                name={`part-type-${row.staging_id}`}
                value={opt.value}
                checked={partType === opt.value}
                onChange={() => setPartType(opt.value)}
                disabled={!canChange || pending}
                className="h-4 w-4 cursor-pointer accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ACTIONS */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton
          variant="approve"
          disabled={!canChange || pending || partType === null}
          title={
            partType === null ? 'Choose a part type to approve' : undefined
          }
          onClick={() => {
            if (partType === null) return;
            runAction(() => approveStagingPart(row.staging_id, partType));
          }}
        >
          Approve for promotion
        </ActionButton>
        <ActionButton
          variant="reject"
          disabled={!canChange || pending}
          onClick={() => runAction(() => rejectStagingPart(row.staging_id))}
        >
          Reject
        </ActionButton>
        <ActionButton
          variant="duplicate"
          disabled={!canChange || pending}
          onClick={() =>
            runAction(() => markStagingPartDuplicate(row.staging_id))
          }
        >
          Mark duplicate
        </ActionButton>
        {pending && (
          <span className="self-center text-xs text-slate-400">Saving…</span>
        )}
      </div>

      {canChange && !pending && partType === null && (
        <p className="mt-2 text-xs text-slate-500">
          Choose a part type to approve.
        </p>
      )}

      {err && <p className="mt-2 text-xs text-rose-400">Error: {err}</p>}
    </article>
  );
}

function ActionButton({
  variant,
  disabled,
  onClick,
  children,
  title,
}: {
  variant: 'approve' | 'reject' | 'duplicate';
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const base =
    'flex-1 min-w-[7rem] rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles: Record<string, string> = {
    approve: 'bg-emerald-600 text-white hover:bg-emerald-500',
    reject: 'bg-rose-600 text-white hover:bg-rose-500',
    duplicate: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
