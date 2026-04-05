export function HowItWorks() {
  const steps = [
    {
      title: "Search a specific RC model",
      body: "Start with the exact variant you own, want to buy, or want to sell. Search by name, model number, or manufacturer.",
    },
    {
      title: "Review the valuation and market picture",
      body: "See pricing range, confidence level, sold listing history, trend direction, and market depth — all from real eBay sold data.",
    },
    {
      title: "Make a better decision",
      body: "Use the data to price a listing, judge a deal, compare variants, or track a model over time.",
    },
  ]

  return (
    <section id="how-it-works" className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            How it works
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            RC Data Vault is built around variant-level research — evaluate the exact
            model that matters to you, not broad category averages.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-slate-950">
                {index + 1}
              </div>
              <h3 className="text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
