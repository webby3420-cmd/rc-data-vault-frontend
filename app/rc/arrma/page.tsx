import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARRMA RC Values & Price Guide | RC Data Vault",
  description:
    "Used market values for ARRMA RC vehicles based on real sold listings. Browse price guides for Kraton, Typhon, Mojave, Felony, Granite, and more.",
};

export default function ARRMAPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <span>ARRMA</span>
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          ARRMA RC Values &amp; Price Guide
        </h1>

        <p className="mb-10 max-w-2xl text-slate-400 leading-7">
          ARRMA builds performance-focused bashers and race trucks known for durability and
          high-speed capability. All values below are based on real sold listings from eBay.
        </p>

        <h2 className="mb-4 text-xl font-medium text-slate-200">Browse by Model Family</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/arrma/kraton" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Kraton</div>
            <div className="mt-1 text-sm text-slate-400">6S and 8S monster trucks. One of ARRMA&apos;s most popular and heavily traded models.</div>
          </a>
          <a href="/rc/arrma/typhon" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Typhon</div>
            <div className="mt-1 text-sm text-slate-400">High-speed 4WD buggy platform. Available in 3S V3 and 6S BLX variants.</div>
          </a>
          <a href="/rc/arrma/mojave" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Mojave</div>
            <div className="mt-1 text-sm text-slate-400">Desert truck with long-travel suspension. Available in 1/7 6S and 1/16 GROM sizes.</div>
          </a>
          <a href="/rc/arrma/felony" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Felony</div>
            <div className="mt-1 text-sm text-slate-400">1/7 scale street bash platform with 6S brushless power.</div>
          </a>
          <a href="/rc/arrma/granite" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Granite</div>
            <div className="mt-1 text-sm text-slate-400">1/10 4WD brushless monster truck. Strong used market presence.</div>
          </a>
          <a href="/rc/arrma/gorgon" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Gorgon</div>
            <div className="mt-1 text-sm text-slate-400">Budget-friendly stadium truck and GROM variants. Popular entry point into ARRMA.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
