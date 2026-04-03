import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas Slash Value & Price Guide | RC Data Vault",
  description: "Used market values for the Traxxas Slash family based on real sold listings.",
};

export default function TraxxasSlashPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href="/rc/traxxas">Traxxas</a>
          <span className="mx-2">/</span>
          <span>Slash</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">
          Traxxas Slash Value &amp; Price Guide
        </h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">
          Explore used Traxxas Slash values, price ranges, and recent sold listing activity. Based on real eBay sold listings.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas/slash/traxxas-slash-4x4-vxl" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas Slash 4X4 VXL</div>
            <div className="mt-1 text-sm text-slate-400">1/10 brushless 4WD short course truck. High demand used platform.</div>
          </a>
          <a href="/rc/traxxas/slash/traxxas-slash-4x4" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas Slash 4X4</div>
            <div className="mt-1 text-sm text-slate-400">1/10 4WD brushless short course truck including base and Ultimate variants.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
