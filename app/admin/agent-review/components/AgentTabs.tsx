// app/admin/agent-review/components/AgentTabs.tsx
// Server component — segmented control to filter the queue by agent_name.
// Writes to the ?agent=<name> URL param; "All" removes the param. Preserves
// every other existing search-param so existing filters / sort / pagination
// continue to work when the active agent is switched.

import Link from 'next/link';

interface Props {
  activeAgent: string | null;
  agentCounts: Record<string, number>;
  searchParams: Record<string, string | string[] | undefined>;
}

const AGENT_TABS: ReadonlyArray<{ value: string | null; label: string }> = [
  { value: null, label: 'All' },
  { value: 'listing_normalization_agent', label: 'Listing Normalization' },
  { value: 'catalog_qa_agent', label: 'Catalog QA' },
];

function buildHref(
  searchParams: Record<string, string | string[] | undefined>,
  agent: string | null,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === 'agent') continue; // we set this explicitly below
    if (Array.isArray(v)) {
      if (v[0]) next.set(k, v[0]);
    } else if (typeof v === 'string' && v.length > 0) {
      next.set(k, v);
    }
  }
  if (agent) next.set('agent', agent);
  const qs = next.toString();
  return `/admin/agent-review${qs ? `?${qs}` : ''}`;
}

export default function AgentTabs({
  activeAgent,
  agentCounts,
  searchParams,
}: Props) {
  const allCount = Object.values(agentCounts).reduce((a, b) => a + b, 0);

  return (
    <nav className="-mx-4 overflow-x-auto sm:mx-0">
      <ul className="flex min-w-max gap-2 px-4 sm:px-0">
        {AGENT_TABS.map(({ value, label }) => {
          const active =
            (value === null && activeAgent === null) ||
            (value !== null && value === activeAgent);
          const count =
            value === null ? allCount : (agentCounts[value] ?? 0);
          return (
            <li key={value ?? 'all'}>
              <Link
                href={buildHref(searchParams, value)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? 'border-amber-400 bg-amber-500/10 text-white'
                    : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    active
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
