export default function RCBrowsePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-semibold text-white">RC Vehicle Values</h1>
        <p className="mb-8 text-slate-400">
          Browse used RC vehicle price guides by manufacturer. Based on real sold listings.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/rc/traxxas" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Traxxas</div>
            <div className="mt-1 text-sm text-slate-400">X-Maxx, Slash, XRT, Sledge & more</div>
          </a>
          <a href="/rc/arrma" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">ARRMA</div>
            <div className="mt-1 text-sm text-slate-400">Typhon, Kraton, Mojave & more</div>
          </a>
          <a href="/rc/losi" className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
            <div className="text-lg font-medium text-white">Losi</div>
            <div className="mt-1 text-sm text-slate-400">Super Baja Rey, LMT & more</div>
          </a>
        </div>
      </div>
    </main>
  );
}
