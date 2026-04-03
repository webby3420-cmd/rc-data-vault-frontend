import type { Metadata } from "next";
import RCSearch from "@/components/RCSearch";

export const metadata: Metadata = {
  title: "RC Vehicle Values & Price Guide | RC Data Vault",
  description:
    "Search used RC vehicle values and price guides. Based on real sold listings for Traxxas, ARRMA, Losi, and more.",
};

export default function RCBrowsePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">RC Vehicle Values</h1>
        <p className="mb-8 text-slate-400">
          Search or browse used RC vehicle price guides. Based on real sold listings.
        </p>

        <RCSearch />

        <h2 className="mb-4 text-xl font-medium text-slate-200">Browse by Manufacturer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas</div>
            <div className="mt-1 text-sm text-slate-400">X-Maxx, Slash, XRT, Sledge &amp; more</div>
          </a>
          <a href="/rc/arrma" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">ARRMA</div>
            <div className="mt-1 text-sm text-slate-400">Typhon, Kraton, Mojave &amp; more</div>
          </a>
          <a href="/rc/losi" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Losi</div>
            <div className="mt-1 text-sm text-slate-400">Super Baja Rey, LMT &amp; more</div>
          </a>
        </div>
      </div>
    </main>
  );
}
