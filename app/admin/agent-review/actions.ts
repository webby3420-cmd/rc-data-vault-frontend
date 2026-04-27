// app/admin/agent-review/actions.ts
// Server actions for reviewer decisions on queue rows.
// Mutates ONLY agent_review_queue. No production tables.

'use server';

import { revalidatePath } from 'next/cache';
import { isAdminAuthorized } from './lib/admin-guard';
import {
  callApplyApproveListingToVariant,
  callApplyListingMatchApproval,
  callApplyRejectQueueRow,
  updateQueueRowStatus,
} from './lib/supabase-admin';
import { ALLOWED_REJECT_REASONS, type RejectReason } from './lib/types';

async function guardOrFail(): Promise<void> {
  if (!(await isAdminAuthorized())) {
    throw new Error('Not authorized');
  }
}

export async function approveQueueItem(
  queueId: number,
  reviewerNote: string | null,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateQueueRowStatus(queueId, {
    status: 'approved',
    reviewer_note: reviewerNote || undefined,
    reviewer: 'admin',
    reviewed_at: new Date().toISOString(),
  });
  if (result.ok) revalidatePath('/admin/agent-review');
  return result;
}

export async function rejectQueueItem(
  queueId: number,
  rejectReason: RejectReason,
  freeTextNote?: string,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  if (!ALLOWED_REJECT_REASONS.includes(rejectReason)) {
    throw new Error(`invalid reject_reason: ${rejectReason}`);
  }
  const cleanedNote = (freeTextNote ?? '').trim();
  const reviewer_note = cleanedNote
    ? `reject_reason:${rejectReason}\n${cleanedNote}`
    : `reject_reason:${rejectReason}`;
  const result = await updateQueueRowStatus(queueId, {
    status: 'rejected',
    reviewer_note,
    reviewer: 'admin',
    reviewed_at: new Date().toISOString(),
  });
  if (result.ok) revalidatePath('/admin/agent-review');
  return result;
}

export async function needsMoreReviewQueueItem(
  queueId: number,
  reviewerNote: string | null,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateQueueRowStatus(queueId, {
    status: 'needs_more_review',
    reviewer_note: reviewerNote || undefined,
    reviewer: 'admin',
    reviewed_at: new Date().toISOString(),
  });
  if (result.ok) revalidatePath('/admin/agent-review');
  return result;
}

export async function addNoteToQueueItem(
  queueId: number,
  reviewerNote: string,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  if (!reviewerNote || reviewerNote.trim().length === 0) {
    return { ok: false, error: 'Empty note' };
  }
  const result = await updateQueueRowStatus(queueId, {
    reviewer_note: reviewerNote,
    reviewer: 'admin',
  });
  if (result.ok) revalidatePath('/admin/agent-review');
  return result;
}

// =====================================================================
// Grouped listing actions (RPC-backed)
// =====================================================================

const REVIEWER_ID = 'admin_review_ui';

export async function approveListingToVariantAction(input: {
  queueId: number;
  dryRun: boolean;
}) {
  if (!(await isAdminAuthorized())) {
    return { ok: false as const, error: 'unauthorized' };
  }
  const { receipt, error } = await callApplyApproveListingToVariant(
    input.queueId,
    input.dryRun,
  );
  if (error) return { ok: false as const, error };
  if (!input.dryRun) revalidatePath('/admin/agent-review');
  return { ok: true as const, receipt };
}

export async function retargetListingAction(input: {
  queueId: number;
  reviewerNote: string;
  overrideTargetVariantId: string | null;
  dryRun: boolean;
}) {
  if (!(await isAdminAuthorized())) {
    return { ok: false as const, error: 'unauthorized' };
  }
  const note = (input.reviewerNote ?? '').trim();
  if (!note) {
    return { ok: false as const, error: 'reviewer_note_required' };
  }
  const { receipt, error } = await callApplyListingMatchApproval(
    input.queueId,
    REVIEWER_ID,
    note,
    input.overrideTargetVariantId,
    input.dryRun,
  );
  if (error) return { ok: false as const, error };
  if (!input.dryRun) revalidatePath('/admin/agent-review');
  return { ok: true as const, receipt };
}

export async function rejectQueueRowViaRpcAction(input: {
  queueId: number;
  reviewerNote: string;
  dryRun: boolean;
}) {
  if (!(await isAdminAuthorized())) {
    return { ok: false as const, error: 'unauthorized' };
  }
  const note = (input.reviewerNote ?? '').trim();
  if (!note) {
    return { ok: false as const, error: 'reviewer_note_required' };
  }
  const { receipt, error } = await callApplyRejectQueueRow(
    input.queueId,
    REVIEWER_ID,
    note,
    input.dryRun,
  );
  if (error) return { ok: false as const, error };
  if (!input.dryRun) revalidatePath('/admin/agent-review');
  return { ok: true as const, receipt };
}
