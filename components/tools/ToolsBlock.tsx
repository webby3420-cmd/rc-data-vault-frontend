import Link from "next/link";

const TOOLS = [
  { href: "/tools/gear-ratio", label: "Gear Ratio Calculator", desc: "Calculate FDR from spur, pinion, and internal drive ratio" },
  { href: "/tools/speed-estimator", label: "Speed Estimator", desc: "Estimate top speed from motor KV, voltage, and gearing" },
  { href: "/tools/gear-change-comparator", label: "Gear Change Comparator", desc: "Compare current vs. proposed gearing setups" },
];

export default function ToolsBlock() {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Setup Tools</h2>
        <Link href="/tools" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
          All tools →
        </Link>
      </div>
      <div className="space-y-2">
        {TOOLS.map(tool => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 hover:border-slate-600 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{tool.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{tool.desc}</p>
            </div>
            <svg className="h-4 w-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 ml-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}
