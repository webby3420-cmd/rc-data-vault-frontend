import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas RC Values & Price Guide | RC Data Vault",
  description:
    "Used market values for Traxxas RC vehicles based on real sold listings.",
};

export default function TraxxasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 text-slate-100">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> / Traxxas
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Traxxas RC Values & Price Guide
        </h1>

        <p className="mb-10 text-slate-400">
          Browse used Traxxas RC values based on real sold listings.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas/x-maxx" className="card">X-Maxx</a>
          <a href="/rc/traxxas/slash" className="card">Slash</a>
          <a href="/rc/traxxas/xrt" className="card">XRT</a>
          <a href="/rc/traxxas/sledge" className="card">Sledge</a>
        </div>
      </div>
    </main>
  );
}
