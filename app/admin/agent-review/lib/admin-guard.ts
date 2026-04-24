// app/admin/agent-review/lib/admin-guard.ts
// Server-only admin gate. Validates the ADMIN_REVIEW_TOKEN shared secret
// from an httpOnly cookie. Does NOT use Supabase Auth; this is a minimal
// shared-secret gate for V1. Replace with real auth later.

import 'server-only';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'rcdv_admin_review';

export async function isAdminAuthorized(): Promise<boolean> {
  const expected = process.env.ADMIN_REVIEW_TOKEN;
  if (!expected) return false;
  const jar = await cookies();
  const actual = jar.get(ADMIN_COOKIE_NAME)?.value;
  return typeof actual === 'string' && actual.length > 0 && actual === expected;
}
