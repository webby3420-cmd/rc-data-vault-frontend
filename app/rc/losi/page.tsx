import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Losi RC Values & Price Guide | RC Data Vault",
  description: "Used market values for Losi RC vehicles based on real sold listings. Browse price guides for Super Baja Rey, LMT, Baja Rey, Mini LMT, and more.",
};

export default function LosiPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <span>Losi</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">
          Losi RC Values &amp; Price Guide
        </h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">
          Losi RC vehicles are known for high-quality scale desert trucks and monster trucks.
          Browse used market values based on real sold listings from eBay.
        </p>
        <h2 className="mb-4 text-xl font-medium text-slate-200">Browse by Model Family</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/losi/super-baja-rey" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Super Baja Rey</div>
            <div className="mt-1 text-sm text-slate-400">1/6 scale desert truck with long-travel suspension. Includes the 2.0 variant.</div>
          </a>
          <a href="/rc/losi/lmt" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">LMT</div>
            <div className="mt-1 text-sm text-slate-400">1/8 4WD solid axle monster truck. Available in MEGA and TLR Tuned Kit versions.</div>
          </a>
          <a href="/rc/losi/baja-rey" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Baja Rey</div>
            <div className="mt-1 text-sm text-slate-400">1/10 scale desert truck. The predecessor to the Super Baja Rey platform.</div>
          </a>
          <a href="/rc/losi/mini-lmt" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Mini LMT</div>
            <div className="mt-1 text-sm text-slate-400">1/18 scale solid axle monster truck. Includes the MEGALODON limited edition.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
