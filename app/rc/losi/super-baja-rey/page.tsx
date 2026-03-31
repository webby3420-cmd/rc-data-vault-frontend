import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Losi Super Baja Rey Value & Price Guide | RC Data Vault",
  description:
    "Used market values for the Losi Super Baja Rey family based on real sold listings.",
};

export default function LosiSuperBajaReyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> / 
          <a href="/rc/losi"> Losi</a> / Super Baja Rey
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Losi Super Baja Rey Value &amp; Price Guide
        </h1>

        <p className="mb-10 text-slate-400">
          Browse Super Baja Rey variants based on real sold listings.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/losi/super-baja-rey/losi-super-baja-rey-2-0" className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            Losi Super Baja Rey 2.0
          </a>
        </div>
      </div>
    </main>
  );
}
