import type { Metadata } from "next";
import BrushlessSpeedCalculator from "@/components/tools/BrushlessSpeedCalculator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brushless Speed Calculator | RC Data Vault",
  description:
    "Estimate theoretical top speed for brushless RC vehicles from motor KV, LiPo cells, gearing, and tire size.",
};

export default function BrushlessSpeedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Brushless Speed</span>
      </div>
      <BrushlessSpeedCalculator />
      <p className="mt-6 text-xs text-slate-500 text-center">
        All speed figures are theoretical estimates based on motor specifications and geometry. Real-world results vary.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/tools/speed-estimator" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Speed Estimator →
        </Link>
        <Link href="/tools/brushed-speed" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Brushed Speed →
        </Link>
      </div>
    </main>
  );
}
