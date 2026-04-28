// app/admin/agent-review/components/SpecPills.tsx
// Shared chassis/spec pill primitives used by both QueueCard (per-row UI)
// and ListingGroupCard (grouped UI).

export const PILL_SLATE =
  'inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300';

export const PILL_SLATE_MUTED =
  'inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-500';

export const PILL_ROSE =
  'inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300';

export function kitRtrText(
  isKit: boolean | null,
  isRtr: boolean | null,
): string | null {
  if (isKit === true && isRtr === true) return 'Kit / RTR';
  if (isKit === true) return 'Kit';
  if (isRtr === true) return 'RTR (Ready to Run)';
  return null;
}

export function ChassisPill({ value }: { value: string | null }) {
  if (!value) return <span className={PILL_ROSE}>Chassis: Missing</span>;
  return <span className={PILL_SLATE}>Chassis: {value}</span>;
}
