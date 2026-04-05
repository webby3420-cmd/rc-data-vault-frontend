import Link from 'next/link'

type Props = {
  manufacturerName: string
  manufacturerSlug: string
  modelFamilyName: string
  modelFamilySlug: string
  fullName: string
}

export function VariantNextStepCta({
  manufacturerName,
  manufacturerSlug,
  modelFamilyName,
  modelFamilySlug,
  fullName,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 md:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Keep researching
        </p>
        <h2 className="mt-3 text-xl font-semibold text-white">
          Compare more RC models before you decide.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Search another model, explore the {modelFamilyName} family, or browse all {manufacturerName} variants with market data.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Search another RC model
        </Link>
        <Link
          href={`/rc/${manufacturerSlug}/${modelFamilySlug}`}
          className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Browse {modelFamilyName} family
        </Link>
        <Link
          href={`/rc/${manufacturerSlug}`}
          className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          All {manufacturerName} models
        </Link>
      </div>
    </section>
  )
}
