import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARRMA RC Values & Price Guide | RC Data Vault",
  description:
    "Used market values for ARRMA RC vehicles based on real sold listings.",
};

export default function ARRMAPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> / ARRMA
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          ARRMA RC Values & Price Guide
        </h1>

        <p className="mb-10 text-slate-400">
          Browse ARRMA RC values based on real sold listings.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/arrma/kraton" className="card">Kraton</a>
          <a href="/rc/arrma/typhon" className="card">Typhon</a>
          <a href="/rc/arrma/mojave" className="card">Mojave</a>
          <a href="/rc/arrma/felony" className="card">Felony</a>
        </div>
      </div>
    </main>
  );
}
