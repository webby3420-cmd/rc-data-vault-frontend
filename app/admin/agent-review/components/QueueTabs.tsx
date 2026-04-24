// app/admin/agent-review/components/QueueTabs.tsx
// Server component — renders tab strip with active state from searchParams.

import Link from 'next/link';
import { TAB_DEFINITIONS, type TabKey } from '../lib/types';

export default function QueueTabs({
  activeTab,
  counts,
}: {
  activeTab: TabKey;
  counts: Record<string, number>;
}) {
  return (
    <nav className="-mx-4 overflow-x-auto border-b border-slate-800 sm:mx-0">
      <ul className="flex min-w-max gap-1 px-4 sm:px-0">
        {TAB_DEFINITIONS.map(({ key, label }) => {
          const active = key === activeTab;
          const suffix = countSuffixForTab(key, counts);
          return (
            <li key={key}>
              <Link
                href={`/admin/agent-review?tab=${key}`}
                className={`inline-block whitespace-nowrap border-b-2 px-3 py-2 text-sm transition ${
                  active
                    ? 'border-amber-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {label}
                {suffix !== null && (
                  <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">
                    {suffix}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function countSuffixForTab(
  key: TabKey,
  counts: Record<string, number>,
): number | null {
  switch (key) {
    case 'approved':
      return counts.approved ?? 0;
    case 'rejected':
      return counts.rejected ?? 0;
    case 'all_pending':
      return counts.pending ?? 0;
    default:
      return null;
  }
}
