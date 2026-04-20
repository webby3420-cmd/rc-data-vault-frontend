import type { Metadata } from "next";
import GasMixCalculator from "@/components/tools/GasMixCalculator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gas Mix Ratio Calculator | RC Data Vault",
  description:
    "Calculate how much 2-stroke oil to add to your RC fuel for any mix ratio.",
};

export default function GasMixPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Gas Mix Ratio</span>
      </div>
      <GasMixCalculator />
      <div className="mt-4 flex gap-3">
        <Link href="/tools/nitro-speed" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          Nitro &amp; Gas Speed →
        </Link>
      </div>
    </main>
  );
}
