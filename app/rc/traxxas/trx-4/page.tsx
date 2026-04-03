import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas TRX-4 Value & Price Guide | RC Data Vault",
  description: "Used market values for the Traxxas TRX-4 based on real sold listings.",
};

export default function TraxxasTRX4Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href="/rc/traxxas">Traxxas</a>
          <span className="mx-2">/</span>
          <span>TRX-4</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">Traxxas TRX-4 Value &amp; Price Guide</h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">The Traxxas TRX-4 is a scale trail crawler with portal axles and licensed body options including the Land Rover Defender. Browse used market values based on real eBay sold listings.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas/trx-4/traxxas-trx-4-land-rover-defender" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">TRX-4 Land Rover Defender</div>
            <div className="mt-1 text-sm text-slate-400">Scale crawler with official Land Rover Defender body. One of the most recognizable TRX-4 variants.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
