import type { Metadata } from "next";
import BatteryRuntimeCalculator from "@/components/tools/BatteryRuntimeCalculator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Battery Runtime Calculator | RC Data Vault",
  description: "Estimate how long your RC battery will last based on capacity (mAh) and average current draw.",
};

export default function BatteryRuntimePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Battery Runtime</span>
      </div>
      <BatteryRuntimeCalculator />
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">How to estimate current draw</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Average current draw depends on your driving style, terrain, and setup. Casual bashing is typically 20–40A, aggressive bashing 40–60A, and racing or speed runs can exceed 80A. Check your ESC logs or use a watt meter for precise readings.
        </p>
        <h3 className="text-sm font-semibold text-slate-300">Tips for longer runtime</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Use a higher capacity battery, gear taller (lower FDR) for less motor load, or drive at partial throttle. LiPo batteries should not be discharged below 3.5V per cell to preserve longevity.
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <Link href="/tools/gear-ratio" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Gear Ratio Calculator →
        </Link>
        <Link href="/tools/speed-estimator" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Speed Estimator →
        </Link>
      </div>
    </main>
  );
}
