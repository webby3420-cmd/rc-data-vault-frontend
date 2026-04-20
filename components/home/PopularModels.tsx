import Link from 'next/link'
import { Car } from 'lucide-react'

type PopularModel = {
  manufacturer: string
  name: string
  href: string
  blurb: string
  priceMid: number | null
}

const POPULAR_MODELS: PopularModel[] = [
  {
    manufacturer: 'Traxxas',
    name: 'X-Maxx 8S Brushless RTR',
    href: '/rc/traxxas/x-maxx/traxxas-x-maxx-8s-brushless-rtr',
    blurb: 'Large-scale brushless monster truck with the deepest market data on the platform.',
    priceMid: 880,
  },
  {
    manufacturer: 'ARRMA',
    name: 'Typhon 6S BLX 4x4 RTR',
    href: '/rc/arrma/typhon/arrma-typhon-6s-blx-4x4-rtr',
    blurb: 'High-power buggy platform with strong used market activity and broad buyer interest.',
    priceMid: 585,
  },
  {
    manufacturer: 'ARRMA',
    name: 'Kraton Brushless 1/8 4X4 RTR 6S',
    href: '/rc/arrma/kraton/arrma-kraton-brushless-1-8-4x4-rtr-6s',
    blurb: 'Popular monster truck with consistent sold listing volume and clear pricing.',
    priceMid: 620,
  },
  {
    manufacturer: 'Traxxas',
    name: 'Slash 4X4 VXL',
    href: '/rc/traxxas/slash/traxxas-slash-4x4-vxl',
    blurb: 'One of the most common short-course platforms on the used market.',
    priceMid: 283,
  },
  {
    manufacturer: 'Losi',
    name: 'Super Baja Rey 2.0',
    href: '/rc/losi/super-baja-rey/losi-super-baja-rey-2-0',
    blurb: 'Premium desert racer platform with strong collector and enthusiast demand.',
    priceMid: 950,
  },
  {
    manufacturer: 'Traxxas',
    name: 'Maxx WideMaxx RTR',
    href: '/rc/traxxas/maxx/traxxas-maxx-widemaxx-rtr',
    blurb: 'Versatile 1/8 monster truck with solid parts support and steady resale.',
    priceMid: 600,
  },
]

function formatPrice(p: number) {
  return '$' + Math.round(p).toLocaleString('en-US')
}

function getBrandTileClass(manufacturer: string): string {
  const m = manufacturer.toLowerCase()
  if (m.includes('traxxas')) return 'bg-amber-950/60'
  if (m.includes('arrma')) return 'bg-blue-950/60'
  if (m.includes('losi')) return 'bg-emerald-950/60'
  if (m.includes('axial')) return 'bg-orange-950/60'
  if (m.includes('associated')) return 'bg-rose-950/60'
  return 'bg-slate-800/80'
}

export function PopularModels() {
  return (
    <section id="popular-models" className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Popular RC models
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Explore commonly researched variants — each with real sold pricing, trend
            context, and market intelligence.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {POPULAR_MODELS.map((model) => {
            const tileClass = getBrandTileClass(model.manufacturer)
            return (
              <Link
                key={model.href}
                href={model.href}
                className="group rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden transition hover:border-slate-500"
              >
                <div className={`h-24 flex items-center justify-center ${tileClass} group-hover:brightness-110 transition`}>
                  <Car className="h-8 w-8 opacity-60" />
                </div>
                <div className="p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {model.manufacturer}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition">
                    {model.name}
                  </h3>
                  {model.priceMid && (
                    <div className="mt-4 text-lg font-semibold text-amber-400">
                      ~{formatPrice(model.priceMid)}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-slate-500">estimated market value</div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/rc"
            className="inline-flex items-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Browse all vehicles →
          </Link>
        </div>
      </div>
    </section>
  )
}
