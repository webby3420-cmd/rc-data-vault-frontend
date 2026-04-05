export function WhatYouSee() {
  const items = [
    {
      title: "Valuation range",
      body: "Fair value estimate with low and high range based on real sold listings.",
    },
    {
      title: "Confidence signals",
      body: "Context around how strong or limited the available market evidence is.",
    },
    {
      title: "Sold listing history",
      body: "Recent sold examples from eBay that anchor pricing in real market behavior.",
    },
    {
      title: "Trend direction",
      body: "Whether the model is stable, rising, softening, or thinly traded.",
    },
    {
      title: "Parts and support signals",
      body: "OEM and aftermarket parts availability with pricing context.",
    },
    {
      title: "Related model discovery",
      body: "Easy navigation to sibling variants, family members, and comparable models.",
    },
  ]

  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            What you&apos;ll see on each model page
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Each RC variant page is designed to help you move from curiosity to confidence.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5"
            >
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
