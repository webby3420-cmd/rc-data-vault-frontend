import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas RC Values & Price Guide | RC Data Vault",
  description:
    "Used market values for Traxxas RC vehicles based on real sold listings. Browse price guides for X-Maxx, Slash, XRT, Sledge, TRX-4, and more.",
};

export default function TraxxasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <span>Traxxas</span>
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Traxxas RC Values &amp; Price Guide
        </h1>

        <p className="mb-10 max-w-2xl text-slate-400 leading-7">
          Traxxas is the best-selling name in RC. Browse used market values for Traxxas vehicles
          by model family. All values are based on real sold listings from eBay.
        </p>

        <h2 className="mb-4 text-xl font-medium text-slate-200">Browse by Model Family</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas/x-maxx" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">X-Maxx</div>
            <div className="mt-1 text-sm text-slate-400">1/5 and 1/6 scale brushless monster truck. One of the most traded Traxxas platforms.</div>
          </a>
          <a href="/rc/traxxas/slash" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Slash</div>
            <div className="mt-1 text-sm text-slate-400">1/10 short course truck. Available in 4X4 VXL and standard 4X4 variants.</div>
          </a>
          <a href="/rc/traxxas/xrt" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">XRT</div>
            <div className="mt-1 text-sm text-slate-400">8S brushless race truck with extreme speed capability.</div>
          </a>
          <a href="/rc/traxxas/sledge" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Sledge</div>
            <div className="mt-1 text-sm text-slate-400">1/8 scale truggy with 6S brushless power and stadium-style suspension.</div>
          </a>
          <a href="/rc/traxxas/trx-4" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">TRX-4</div>
            <div className="mt-1 text-sm text-slate-400">Scale trail crawler with portal axles. Includes Land Rover Defender and other bodies.</div>
          </a>
          <a href="/rc/traxxas/maxx" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Maxx</div>
            <div className="mt-1 text-sm text-slate-400">1/10 scale 4WD monster truck with WideMaxx suspension upgrade option.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
