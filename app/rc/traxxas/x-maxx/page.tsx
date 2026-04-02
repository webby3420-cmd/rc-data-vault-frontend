import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas X-Maxx Value & Price Guide | RC Data Vault",
  description:
    "Used market values for the Traxxas X-Maxx family based on real sold listings.",
};

export default function TraxxasXMaxxPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> /{" "}
          <a href="/rc/traxxas">Traxxas</a> / X-Maxx
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Traxxas X-Maxx Value &amp; Price Guide
        </h1>

        <p className="mb-10 max-w-2xl text-slate-400">
          Explore used Traxxas X-Maxx values, price ranges, and recent sold
          listing activity across live X-Maxx variants.
        </p>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Family</div>
            <div className="mt-1 text-lg font-medium text-white">X-Maxx</div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="text-sm text-slate-400">Brand</div>
            <div className="mt-1 text-lg font-medium text-white">Traxxas</div>
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
            Browse X-Maxx Variants
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="/rc/traxxas/x-maxx/traxxas-x-maxx-8s-brushless-rtr"
              className="block rounded-xl border border-slate-700 p-4 transition hover:border-slate-500"
            >
              <div className="font-medium text-white">
                Traxxas X-Maxx 8S Brushless RTR
              </div>
              <div className="text-sm text-slate-400">
                Browse X-Maxx 8S Brushless RTR market values and sold listing activity.
              </div>
            </a>

            <a
              href="/rc/traxxas/x-maxx/traxxas-x-maxx-bigfoot-50th-anniversary-rtr"
              className="block rounded-xl border border-slate-700 p-4 transition hover:border-slate-500"
            >
              <div className="font-medium text-white">
                Traxxas X-Maxx Bigfoot 50th Anniversary RTR
              </div>
              <div className="text-sm text-slate-400">
                Browse Bigfoot 50th Anniversary market values and sold listing activity.
              </div>
            </a>

            <a
              href="/rc/traxxas/x-maxx/traxxas-x-maxx"
              className="block rounded-xl border border-slate-700 p-4 transition hover:border-slate-500"
            >
              <div className="font-medium text-white">Traxxas X-Maxx</div>
              <div className="text-sm text-slate-400">
                Browse Traxxas X-Maxx market values and sold listing activity.
              </div>
            </a>

            <a
              href="/rc/traxxas/x-maxx/traxxas-x-maxx-snap-on-edition-rtr"
              className="block rounded-xl border border-slate-700 p-4 transition hover:border-slate-500"
            >
              <div className="font-medium text-white">
                Traxxas X-Maxx Snap-On Edition RTR
              </div>
              <div className="text-sm text-slate-400">
                Browse Snap-On Edition market values and sold listing activity.
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
