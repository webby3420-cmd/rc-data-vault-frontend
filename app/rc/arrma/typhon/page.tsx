import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arrma Typhon Value & Price Guide | RC Data Vault",
  description:
    "Used market values for the Arrma Typhon family based on real sold listings.",
};

export default function ArrmaTyphonPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> / 
          <a href="/rc/arrma"> Arrma</a> / Typhon
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Arrma Typhon Value &amp; Price Guide
        </h1>

        <p className="mb-10 text-slate-400">
          Browse Typhon variants based on real sold listings.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/arrma/typhon/arrma-typhon-6s-blx" className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            Arrma Typhon 6S BLX
          </a>
        </div>
      </div>
    </main>
  );
}
