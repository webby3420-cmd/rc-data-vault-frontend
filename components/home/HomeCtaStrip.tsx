import Link from 'next/link'

export function HomeCtaStrip() {
  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-10 md:px-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Start with the exact RC variant you care about.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 md:text-base">
              Search a model, review the valuation and sold comps, and use the page
              to compare nearby variants and understand market context.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            
              href="#top"
              className="inline-flex items-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Search now
            </a>
            <Link
              href="#popular-models"
              className="inline-flex items-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Explore popular models
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
