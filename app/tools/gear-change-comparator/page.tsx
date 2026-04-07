import type { Metadata } from "next";
import GearChangeComparator from "@/components/tools/GearChangeComparator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gear Change Comparator | RC Data Vault",
  description: "Compare your current RC gearing to a proposed change. See if you're going taller or shorter and what it means for performance.",
};

export default function GearChangeComparatorPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Gear Change Comparator</span>
      </div>
      <GearChangeComparator />
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Taller vs. shorter gearing</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Taller (lower FDR):</strong> more top speed potential, less torque multiplication, more motor heat at low speed. Good for bashing on hard smooth surfaces.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Shorter (higher FDR):</strong> more punch, better acceleration, less strain on ESC/motor. Good for technical terrain, rock crawling, or preserving drivetrain health.
        </p>
        <h3 className="text-sm font-semibold text-slate-300">General rule</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Always monitor motor temperature after a gearing change. If it runs too hot, go shorter. If performance feels sluggish, try one tooth up on the pinion.
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
