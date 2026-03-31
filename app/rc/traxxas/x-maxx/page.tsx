import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traxxas X-Maxx Value & Price Guide | RC Data Vault",
  description:
    "Used market values for the Traxxas X-Maxx family based on real sold listings.",
};

export default function TraxxasXMaxxPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <nav className="mb-6 text-sm text-slate-400">
          <a href="/rc">RC Vehicle Values</a> / 
          <a href="/rc/traxxas"> Traxxas</a> / X-Maxx
        </nav>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Traxxas X-Maxx Value &amp; Price Guide
        </h1>

        <p className="mb-10 text-slate-400">
          Browse X-Maxx variants based on real sold listings.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/rc/traxxas/x-maxx/traxxas-x-maxx-8s-brushless-rtr"
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            Traxxas X-Maxx 8S Brushless RTR
          </a>

          <a
            href="/rc/traxxas/x-maxx/traxxas-x-maxx-bigfoot-50th-anniversary-rtr"
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            X-Maxx Bigfoot 50th Anniversary
          </a>

          <a
            href="/rc/traxxas/x-maxx/traxxas-x-maxx"
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            Traxxas X-Maxx
          </a>

          <a
            href="/rc/traxxas/x-maxx/traxxas-x-maxx-snap-on-edition-rtr"
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            X-Maxx Snap-On Edition
          </a>
        </div>
      </div>
    </main>
  );
}
