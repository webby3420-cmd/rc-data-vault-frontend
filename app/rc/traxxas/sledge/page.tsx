import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas Sledge Value & Price Guide | RC Data Vault",
  description: "Used market values for the Traxxas Sledge based on real sold listings.",
};

export default function TraxxasSledgePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href="/rc/traxxas">Traxxas</a>
          <span className="mx-2">/</span>
          <span>Sledge</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">Traxxas Sledge Value &amp; Price Guide</h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">The Traxxas Sledge is a 1/8 scale 6S brushless truggy with stadium-style suspension and aggressive styling. Browse used market values based on real eBay sold listings.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas/sledge/traxxas-sledge" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas Sledge</div>
            <div className="mt-1 text-sm text-slate-400">1/8 scale 6S brushless truggy. Browse market values and recent sold comps.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
