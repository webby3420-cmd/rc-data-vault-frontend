import type { Metadata } from "next";
import GearRatioCalculator from "@/components/tools/GearRatioCalculator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gear Ratio Calculator | RC Data Vault",
  description: "Calculate your RC vehicle's final drive ratio from spur, pinion, and internal drive ratio.",
};

export default function GearRatioPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Gear Ratio</span>
      </div>
      <GearRatioCalculator />
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">How to find your internal drive ratio</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          The internal drive ratio (IDR) is found in your vehicle's manual under drivetrain specs. Common examples: Traxxas Slash 4X4 ≈ 2.72, ARRMA Kraton 6S ≈ 2.6, Losi Super Baja Rey ≈ 2.25. If you can't find it, search "[your model] internal drive ratio" on the manufacturer's support page.
        </p>
        <h3 className="text-sm font-semibold text-slate-300">What does final drive ratio mean?</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          FDR tells you how many motor rotations produce one wheel rotation. Higher FDR = more torque multiplication, lower top speed. Lower FDR = more top speed, less torque.
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <Link href="/tools/speed-estimator" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Speed Estimator →
        </Link>
        <Link href="/tools/gear-change-comparator" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Gear Change Comparator →
        </Link>
      </div>
    </main>
  );
}
