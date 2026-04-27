import type { ResourceLink } from "@/lib/tools/types";
import { ArrowUpRight } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  manual: "Manual",
  exploded_view: "Exploded View",
  interactive_exploded_view: "Interactive Exploded View",
  parts_diagram: "Parts Diagram",
  parts_list: "Parts List",
  cross_reference: "Cross Reference",
  setup_sheet: "Setup Sheet",
  support_page: "Support",
  product_page: "Product Page",
};

const RESOURCE_CATEGORY_ORDER = [
  "manual",
  "exploded_view",
  "interactive_exploded_view",
  "parts_diagram",
  "parts_list",
  "cross_reference",
  "setup_sheet",
  "support_page",
  "product_page",
] as const;

const SCOPE_COLORS: Record<string, string> = {
  variant: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  family: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  manufacturer: "bg-slate-500/10 text-slate-400 border-slate-600/20",
};

const SCOPE_LABELS: Record<string, string> = {
  variant: "This Model",
  family: "Family",
  manufacturer: "Brand",
};

const SCOPE_SORT: Record<string, number> = {
  family: 0,
  manufacturer: 1,
  variant: 2,
};

function humanize(type: string): string {
  return type
    .split("_")
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

function groupByType(resources: ResourceLink[]) {
  const groups: Record<string, ResourceLink[]> = {};
  for (const r of resources) {
    if (!groups[r.resource_type]) groups[r.resource_type] = [];
    groups[r.resource_type].push(r);
  }
  return groups;
}

function sortWithinGroup(rows: ResourceLink[]): ResourceLink[] {
  return [...rows].sort((a, b) => {
    const scopeDiff = (SCOPE_SORT[a.scope_level] ?? 99) - (SCOPE_SORT[b.scope_level] ?? 99);
    if (scopeDiff !== 0) return scopeDiff;
    const aOrder = a.sort_order ?? Number.POSITIVE_INFINITY;
    const bOrder = b.sort_order ?? Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  });
}

export default function ResourceSection({ resources }: { resources: ResourceLink[] }) {
  if (!resources || resources.length === 0) return null;

  const grouped = groupByType(resources);
  const knownOrdered = RESOURCE_CATEGORY_ORDER.filter((t) => grouped[t]);
  const knownSet = new Set<string>(RESOURCE_CATEGORY_ORDER);
  const unknownOrdered = Object.keys(grouped)
    .filter((t) => !knownSet.has(t))
    .sort((a, b) => a.localeCompare(b));
  const orderedTypes = [...knownOrdered, ...unknownOrdered];

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Official Resources</h2>
      <div className="space-y-5">
        {orderedTypes.map(type => (
          <div key={type}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {TYPE_LABELS[type] ?? humanize(type)}
            </p>
            <div className="space-y-2">
              {sortWithinGroup(grouped[type]).map(r => (
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
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
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
