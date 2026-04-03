import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARRMA Kraton Value & Price Guide | RC Data Vault",
  description: "Used market values for the ARRMA Kraton family based on real sold listings.",
};

export default function ARRMAKratonPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href="/rc/arrma">ARRMA</a>
          <span className="mx-2">/</span>
          <span>Kraton</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">
          ARRMA Kraton Value &amp; Price Guide
        </h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">
          The ARRMA Kraton is one of the most traded monster trucks on the used RC market.
          Available in 6S and 8S configurations with BLX and EXB variants.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/arrma/kraton/arrma-kraton-6s-blx-exb-rtr" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Kraton 6S BLX EXB RTR</div>
            <div className="mt-1 text-sm text-slate-400">6S extreme bash version with upgraded components. Most popular Kraton variant.</div>
          </a>
          <a href="/rc/arrma/kraton/arrma-kraton-8s-blx-exb-rtr" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Kraton 8S BLX EXB RTR</div>
            <div className="mt-1 text-sm text-slate-400">The flagship 8S monster truck with extreme power output.</div>
          </a>
          <a href="/rc/arrma/kraton/arrma-kraton-6s-exb-v6-rtr" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Kraton 6S EXB V6 RTR</div>
            <div className="mt-1 text-sm text-slate-400">V6 generation EXB with updated chassis and electronics.</div>
          </a>
          <a href="/rc/arrma/kraton/arrma-kraton-brushless-1-8-4x4-rtr-6s" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Kraton Brushless 1/8 4X4 RTR 6S</div>
            <div className="mt-1 text-sm text-slate-400">Standard 1/8 6S brushless Kraton platform.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
