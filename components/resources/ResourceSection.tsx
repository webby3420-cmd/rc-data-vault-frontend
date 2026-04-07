import type { ResourceLink } from "@/lib/tools/types";

const TYPE_LABELS: Record<string, string> = {
  manual: "Manual",
  exploded_view: "Exploded View",
  parts_diagram: "Parts Diagram",
  support_page: "Support",
  setup_sheet: "Setup Sheet",
  product_page: "Product Page",
};

const TYPE_ORDER = ["manual", "setup_sheet", "exploded_view", "parts_diagram", "support_page", "product_page"];

const SCOPE_COLORS: Record<string, string> = {
  variant: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  family: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  manufacturer: "bg-slate-500/10 text-slate-400 border-slate-600/20",
};

const SCOPE_LABELS: Record<string, string> = {
  variant: "This Model",
  family: "Platform",
  manufacturer: "Brand",
};

function groupByType(resources: ResourceLink[]) {
  const groups: Record<string, ResourceLink[]> = {};
  for (const r of resources) {
    if (!groups[r.resource_type]) groups[r.resource_type] = [];
    groups[r.resource_type].push(r);
  }
  return groups;
}

export default function ResourceSection({ resources }: { resources: ResourceLink[] }) {
  if (!resources || resources.length === 0) return null;

  const grouped = groupByType(resources);
  const orderedTypes = TYPE_ORDER.filter(t => grouped[t]);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Official Resources</h2>
      <div className="space-y-5">
        {orderedTypes.map(type => (
          <div key={type}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {TYPE_LABELS[type] ?? type}
            </p>
            <div className="space-y-2">
              {grouped[type].map(r => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 hover:border-slate-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                        {r.title}
                      </p>
                      {r.source_label && (
                        <p className="text-xs text-slate-500 mt-0.5">{r.source_label}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${SCOPE_COLORS[r.scope_level]}`}>
                      {SCOPE_LABELS[r.scope_level]}
                    </span>
                    <svg className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
