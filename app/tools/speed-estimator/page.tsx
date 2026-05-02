import type { Metadata } from "next";
import SpeedEstimatorCalculator from "@/components/tools/SpeedEstimatorCalculator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RC Speed Estimator | RC Data Vault",
  description: "Estimate your RC vehicle's theoretical top speed from motor KV, battery voltage, gearing, and tire diameter.",
};

export default function SpeedEstimatorPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Speed Estimator</span>
      </div>
      <SpeedEstimatorCalculator />
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Common battery voltages</h3>
        <p className="text-sm text-slate-400">2S LiPo = 7.4V · 3S = 11.1V · 4S = 14.8V · 6S = 22.2V · 8S = 29.6V · 12S = 44.4V</p>
        <h3 className="text-sm font-semibold text-slate-300">Measuring tire diameter</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Inflate tires to normal running pressure, then measure the outer diameter with calipers or a ruler. Use millimeters for this calculator.
        </p>
        <h3 className="text-sm font-semibold text-slate-300">Why is my actual speed lower?</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          This estimates no-load motor RPM at full voltage. In practice, voltage sags under load, terrain adds resistance, and mechanical losses reduce output. The drivetrain efficiency field accounts for some of this — 0.80–0.85 is realistic for most vehicles.
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <Link href="/tools/gear-ratio" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Gear Ratio Calculator →
        </Link>
        <Link href="/tools/gear-change-comparator" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Gear Change Comparator →
        </Link>
      </div>
    </main>
  );
}
