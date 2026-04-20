import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import DealValueCalculator from "@/components/tools/DealValueCalculator";
import ModelComparison from "@/components/tools/ModelComparison";

export const metadata: Metadata = {
  title: "RC Tools — Deal Calculator, Model Comparison & Setup Tools | RC Data Vault",
  description: "Check if a listing is a deal, compare models side by side, and use free RC calculators for gear ratio, top speed, and gearing.",
};

const TOOLS = [
  {
    href: "/tools/gear-ratio",
    title: "Gear Ratio Calculator",
    description: "Calculate your final drive ratio from spur, pinion, and internal drive ratio. Understand acceleration vs. top speed tradeoffs.",
    icon: "⚙️",
    tags: ["Gearing", "FDR"],
  },
  {
    href: "/tools/speed-estimator",
    title: "Speed Estimator",
    description: "Estimate theoretical top speed from motor KV, battery voltage, gearing, and tire diameter. Includes wheel RPM and FDR output.",
    icon: "⚡",
    tags: ["Motor", "Speed", "Gearing"],
  },
  {
    href: "/tools/gear-change-comparator",
    title: "Gear Change Comparator",
    description: "Compare your current gearing setup to a proposed change. See the FDR delta and whether you're going taller or shorter.",
    icon: "🔄",
    tags: ["Gearing", "Tuning"],
  },
  {
    href: "/tools/battery-runtime",
    title: "Battery Runtime Calculator",
    description: "Estimate how long your battery will last based on capacity (mAh) and current draw. Useful for planning run sessions.",
    icon: "🔋",
    tags: ["Battery", "Runtime"],
  },
  {
    href: "/tools/esc-calculator",
    title: "ESC Selector",
    description: "Find the right ESC amp rating for your battery and use case. See matching ESCs from our catalog with direct buy links.",
    icon: "⚡",
    tags: ["ESC", "Amps", "Parts"],
  },
  {
    href: "/tools/vehicle-evaluator",
    title: "Vehicle Evaluator",
    description: "Estimate what your RC is worth based on its condition and upgrades installed.",
    icon: "🚗",
    tags: ["Valuation", "Upgrades"],
  },
  {
    href: "/tools/identify",
    title: "Identify by Photo",
    description: "Upload a photo of an RC vehicle and we'll identify the model using image matching against our catalog.",
    icon: "📷",
    tags: ["Image", "Identification"],
  },
];

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">RC Data Vault</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">RC Setup Tools</h1>
        <p className="mt-3 text-slate-400 max-w-xl leading-relaxed">
          Free calculators for gearing, speed estimation, and setup comparisons.
          Built for hobbyists who want real numbers, not guesswork.
        </p>
      </div>
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-1">Deal Value Calculator</h2>
        <p className="text-sm text-slate-400 mb-4">See if a listing price is a deal, fair, or overpriced — based on real sold data</p>
        <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
          <DealValueCalculator />
        </Suspense>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-1">Model Comparison</h2>
        <p className="text-sm text-slate-400 mb-4">Compare up to 3 models by price, market activity, and value</p>
        <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
          <ModelComparison />
        </Suspense>
      </section>

      <h2 className="text-xl font-semibold text-white mb-4">Setup Calculators</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(tool => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-2xl border border-slate-700 bg-slate-900 p-6 hover:border-slate-500 transition-colors"
          >
            <div className="text-3xl mb-4">{tool.icon}</div>
            <h2 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors mb-2">
              {tool.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{tool.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map(tag => (
                <span key={tag} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-xs text-slate-600 text-center">
        All calculations are theoretical estimates. Real-world results vary with sag voltage, temperature, terrain, and mechanical losses.
      </p>
    </main>
  );
}
