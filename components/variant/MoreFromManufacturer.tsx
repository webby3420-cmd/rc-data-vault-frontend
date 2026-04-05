import Link from 'next/link'

type SearchResult = {
  variant_id: string
  full_name: string
  manufacturer_name: string
  canonical_path: string
  price_mid: number | null
}

type Props = {
  manufacturerName: string
  currentCanonicalPath: string
  currentFamilySlug: string
}

async function fetchManufacturerVariants(
  manufacturerName: string,
  currentCanonicalPath: string,
  currentFamilySlug: string
): Promise<SearchResult[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rcdatavault.com'
    const url = `${base}/api/search?q=${encodeURIComponent(manufacturerName)}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    const results: SearchResult[] = json.results ?? []

    return results
      .filter(r =>
        r.canonical_path &&
        r.canonical_path !== currentCanonicalPath &&
        !r.canonical_path.includes(`/${currentFamilySlug}/`)
      )
      .slice(0, 6)
  } catch {
    return []
  }
}

function formatPrice(p: number | null) {
  if (!p) return null
  return '$' + Math.round(p).toLocaleString('en-US')
}

export async function MoreFromManufacturer({ manufacturerName, currentCanonicalPath, currentFamilySlug }: Props) {
  const variants = await fetchManufacturerVariants(manufacturerName, currentCanonicalPath, currentFamilySlug)

  if (!variants.length) return null

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">More from {manufacturerName}</h2>
        <p className="mt-1 text-xs text-slate-500">Other {manufacturerName} variants with market data</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {variants.map(v => (
          <Link
            key={v.canonical_path}
            href={v.canonical_path}
            className="rounded-xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-600"
          >
            <div className="text-sm font-medium text-white leading-5">{v.full_name}</div>
            {v.price_mid && (
              <div className="mt-1.5 text-sm font-semibold text-amber-400">
                ~{formatPrice(v.price_mid)}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
