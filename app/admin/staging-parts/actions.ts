// app/admin/staging-parts/actions.ts
// Server actions for reviewer decisions on staging_parts rows.
// Mutates ONLY staging_parts.status (+ processed_at, + part_type on approve).
// Does not call promote_staging_parts(); does not write to public.parts.

'use server';

import { revalidatePath } from 'next/cache';
import { isAdminAuthorized } from '../agent-review/lib/admin-guard';
import { updateStagingPartStatus } from './lib/supabase-admin';
import { ALLOWED_PART_TYPES, type PartType } from './lib/types';

async function guardOrFail(): Promise<void> {
  if (!(await isAdminAuthorized())) {
    throw new Error('Not authorized');
  }
}

export async function approveStagingPart(
  stagingId: string,
  partType: PartType,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  if (!ALLOWED_PART_TYPES.includes(partType)) {
    throw new Error(`invalid part_type: ${partType}`);
  }
  const result = await updateStagingPartStatus(stagingId, 'pending', {
    part_type: partType,
  });
  if (result.ok) revalidatePath('/admin/staging-parts');
  return result;
}

export async function rejectStagingPart(
  stagingId: string,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateStagingPartStatus(stagingId, 'rejected');
  if (result.ok) revalidatePath('/admin/staging-parts');
  return result;
}

export async function markStagingPartDuplicate(
  stagingId: string,
): Promise<{ ok: boolean; error: string | null }> {
  await guardOrFail();
  const result = await updateStagingPartStatus(stagingId, 'duplicate');
  if (result.ok) revalidatePath('/admin/staging-parts');
  return result;
}
