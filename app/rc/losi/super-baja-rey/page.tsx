import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Losi Super Baja Rey Value & Price Guide | RC Data Vault",
  description:
    "Used market values for the Losi Super Baja Rey family based on real sold listings.",
};

export default function LosiSuperBajaReyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> /{" "}
          <a href="/rc/losi">Losi</a> / Super Baja Rey
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Losi Super Baja Rey Value &amp; Price Guide
        </h1>

        <p className="mb-10 max-w-2xl text-slate-400">
          Explore used Losi Super Baja Rey values, price ranges, and recent sold
          listing activity across live Super Baja Rey variants.
        </p>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Family</div>
            <div className="mt-1 text-lg font-medium text-white">
              Super Baja Rey
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Brand</div>
            <div className="mt-1 text-lg font-medium text-white">Losi</div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Page Type</div>
            <div className="mt-1 text-lg font-medium text-white">
              Family Hub
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Browse Super Baja Rey Variants
          </h2>

          <div className="grid gap-4">
            <a
              href="/rc/losi/super-baja-rey/losi-super-baja-rey-2-0"
              className="block rounded-xl border border-slate-700 p-4 transition hover:border-slate-500"
            >
              <div className="font-medium text-white">
                Losi Super Baja Rey 2.0
              </div>
              <div className="text-sm text-slate-400">
                Browse Losi Super Baja Rey 2.0 market values and sold listing activity.
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
