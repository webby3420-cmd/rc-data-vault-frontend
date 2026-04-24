// app/admin/agent-review/actions.ts
// Server actions for reviewer decisions on queue rows.
// Mutates ONLY agent_review_queue. No production tables.

'use server';

import { revalidatePath } from 'next/cache';
import { isAdminAuthorized } from './lib/admin-guard';
import { updateQueueRowStatus } from './lib/supabase-admin';

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
  reviewerNote: string | null,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateQueueRowStatus(queueId, {
    status: 'rejected',
    reviewer_note: reviewerNote || undefined,
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
