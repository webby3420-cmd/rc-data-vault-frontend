import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas XRT Value & Price Guide | RC Data Vault",
  description: "Used market values for the Traxxas XRT family based on real sold listings.",
};

export default function TraxxasXRTPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href="/rc/traxxas">Traxxas</a>
          <span className="mx-2">/</span>
          <span>XRT</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">Traxxas XRT Value &amp; Price Guide</h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">The Traxxas XRT is an 8S brushless race truck capable of extreme speeds. Browse used market values based on real eBay sold listings.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas/xrt/traxxas-xrt" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas XRT</div>
            <div className="mt-1 text-sm text-slate-400">8S brushless 4WD race truck. High-speed platform with strong used market demand.</div>
          </a>
          <a href="/rc/traxxas/xrt/traxxas-xrt-ultimate" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas XRT Ultimate</div>
            <div className="mt-1 text-sm text-slate-400">Ultimate edition with upgraded wheels, tires, and performance components.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
