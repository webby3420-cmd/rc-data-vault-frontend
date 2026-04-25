// app/admin/staging-parts/actions.ts
// Server actions for reviewer decisions on staging_parts rows.
// Mutates ONLY staging_parts.status (+ processed_at). Does not call
// promote_staging_parts(); does not write to public.parts.

'use server';

import { revalidatePath } from 'next/cache';
import { isAdminAuthorized } from '../agent-review/lib/admin-guard';
import { updateStagingPartStatus } from './lib/supabase-admin';

async function guardOrFail(): Promise<void> {
  if (!(await isAdminAuthorized())) {
    throw new Error('Not authorized');
  }
}

export async function approveStagingPart(
  stagingId: string,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateStagingPartStatus(stagingId, {
    status: 'pending',
    processed_at: new Date().toISOString(),
  });
  if (result.ok) revalidatePath('/admin/staging-parts');
  return result;
}

export async function rejectStagingPart(
  stagingId: string,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateStagingPartStatus(stagingId, {
    status: 'rejected',
    processed_at: new Date().toISOString(),
  });
  if (result.ok) revalidatePath('/admin/staging-parts');
  return result;
}

export async function markStagingPartDuplicate(
  stagingId: string,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateStagingPartStatus(stagingId, {
    status: 'duplicate',
    processed_at: new Date().toISOString(),
  });
  if (result.ok) revalidatePath('/admin/staging-parts');
  return result;
}
