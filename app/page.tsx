import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RC Data Vault | Used RC Car Values & Price Guide",
  description:
    "Used RC car values, price guides, and sold market data for Traxxas, ARRMA, Losi, Axial, and more.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          RC Data Vault
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-slate-400">
          Independent market values and price guides for used RC vehicles. Based on real sold listings.
        </p>
        <a
          href="/rc"
          className="inline-block rounded-xl bg-amber-500 px-6 py-3 font-medium text-slate-950 transition-colors hover:bg-amber-400"
        >
          Browse RC Vehicle Values →
        </a>
      </div>
    </main>
  );
}
