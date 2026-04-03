import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARRMA Typhon Value & Price Guide | RC Data Vault",
  description: "Used market values for the ARRMA Typhon family based on real sold listings.",
};

export default function ARRMATyphonPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href="/rc/arrma">ARRMA</a>
          <span className="mx-2">/</span>
          <span>Typhon</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">
          ARRMA Typhon Value &amp; Price Guide
        </h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">
          Explore used ARRMA Typhon values, price ranges, and recent sold listing activity.
          The Typhon is ARRMAs high-speed 4WD buggy platform available in multiple power levels.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/arrma/typhon/arrma-typhon-6s-blx-4x4-rtr" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">ARRMA Typhon 6S BLX 4x4 RTR</div>
            <div className="mt-1 text-sm text-slate-400">Full 6S brushless 4WD buggy. Browse market values and recent sold comps.</div>
          </a>
          <a href="/rc/arrma/typhon/arrma-typhon-v3-3s-blx-4x4-rtr" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">ARRMA Typhon V3 3S BLX 4x4 RTR</div>
            <div className="mt-1 text-sm text-slate-400">3S brushless entry into the Typhon platform. Browse market values and sold comps.</div>
          </a>
        </div>
      </div>
    </main>
  );
}
