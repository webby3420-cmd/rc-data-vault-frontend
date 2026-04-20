import type { Metadata } from "next";
import BrushedSpeedCalculator from "@/components/tools/BrushedSpeedCalculator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brushed Motor Speed Calculator | RC Data Vault",
  description:
    "Estimate top speed for brushed RC vehicles from motor turns, voltage, gearing, and tire size.",
};

export default function BrushedSpeedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Brushed Speed</span>
      </div>
      <BrushedSpeedCalculator />
      <p className="mt-6 text-xs text-slate-500 text-center">
        All speed figures are theoretical estimates based on motor specifications and geometry. Real-world results vary.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/tools/brushless-speed" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Brushless Speed →
        </Link>
        <Link href="/tools/gear-ratio" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Gear Ratio →
        </Link>
      </div>
    </main>
  );
}
