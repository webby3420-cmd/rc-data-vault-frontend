import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Losi RC Values & Price Guide | RC Data Vault",
  description:
    "Used market values for Losi RC vehicles based on real sold listings.",
};

export default function LosiPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> / Losi
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Losi RC Values & Price Guide
        </h1>

        <p className="mb-10 text-slate-400">
          Browse Losi RC values based on real sold listings.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
  <a href="/rc/losi/super-baja-rey" className="card">Super Baja Rey</a>
</div>
      </div>
    </main>
  );
}
