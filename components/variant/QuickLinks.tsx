import { Calculator, Gauge, FileText, Layers, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ResourceLink } from "@/lib/tools/types";

interface QuickLinksProps {
  resources: ResourceLink[];
  variantSlug: string;
}

const TOOL_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/tools/gear-ratio", label: "Gear Ratio Calculator", icon: Calculator },
  { href: "/tools/speed-estimator", label: "Speed Calculator", icon: Gauge },
];

const RESOURCE_ICON: Record<string, LucideIcon> = {
  manual: FileText,
  exploded_view: Layers,
  support_page: HelpCircle,
  setup_sheet: FileText,
  product_page: ArrowUpRight,
};

export default function QuickLinks({ resources, variantSlug }: QuickLinksProps) {
  // Pick up to 3 resources prioritized: manual, exploded_view, support_page
  const priorityTypes = ["manual", "exploded_view", "support_page", "setup_sheet", "product_page"];
  const picked: { key: string; label: string; href: string; icon: LucideIcon; external: boolean }[] = [];

  // Add tools first
  for (const t of TOOL_LINKS) {
    picked.push({ key: t.href, label: t.label, href: t.href, icon: t.icon, external: false });
  }

  // Add resources (up to 3 to reach total of 5)
  for (const type of priorityTypes) {
    if (picked.length >= 5) break;
    const match = resources.find((r) => r.resource_type === type);
    if (match) {
      const icon = RESOURCE_ICON[type] ?? FileText;
      const label =
        type === "manual" ? "Manual PDF"
        : type === "exploded_view" ? "Exploded View"
        : type === "support_page" ? "Support"
        : type === "setup_sheet" ? "Setup Sheet"
        : match.title;
      picked.push({ key: match.id, label, href: match.url, icon, external: true });
    }
  }

  if (picked.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
        Quick Links
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {picked.map((link) => {
          const Icon = link.icon;
          if (link.external) {
            return (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-slate-500 transition-colors text-center group"
              >
                <Icon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors leading-tight">
                  {link.label}
                </span>
              </a>
            );
          }
          return (
            <Link
              key={link.key}
              href={link.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-slate-500 transition-colors text-center group"
            >
              <Icon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors leading-tight">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
