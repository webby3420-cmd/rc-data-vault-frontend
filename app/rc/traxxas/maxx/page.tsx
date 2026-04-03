import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas Maxx Value & Price Guide | RC Data Vault",
  description: "Used market values for the Traxxas Maxx based on real sold listings.",
};

export default function TraxxasMaxxPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href="/rc/traxxas">Traxxas</a>
          <span className="mx-2">/</span>
          <span>Maxx</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">Traxxas Maxx Value &amp; Price Guide</h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">The Traxxas Maxx is a 1/10 scale 4WD monster truck with the popular WideMaxx suspension upgrade option. Browse used market values based on real eBay sold listings.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas/maxx/traxxas-maxx-widemaxx-rtr" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas Maxx WideMaxx RTR</div>
            <div className="mt-1 text-sm text-slate-400">1/10 4WD monster truck with WideMaxx suspension. Browse market values and recent sold comps.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
