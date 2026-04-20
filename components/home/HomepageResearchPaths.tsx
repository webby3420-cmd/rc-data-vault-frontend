import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const PATHS = [
  { label: 'Traxxas values', href: '/rc/traxxas' },
  { label: 'ARRMA values', href: '/rc/arrma' },
  { label: 'Losi values', href: '/rc/losi' },
  { label: 'X-Maxx family', href: '/rc/traxxas/x-maxx' },
  { label: 'Kraton family', href: '/rc/arrma/kraton' },
  { label: 'Slash family', href: '/rc/traxxas/slash' },
  { label: 'Typhon family', href: '/rc/arrma/typhon' },
  { label: 'Super Baja Rey family', href: '/rc/losi/super-baja-rey' },
]

export function HomepageResearchPaths() {
  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-base font-semibold text-white">Browse by brand</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PATHS.map((brand) => (
            <Link
              key={brand.href}
              href={brand.href}
              className="group flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 transition hover:border-slate-500 hover:bg-slate-800"
            >
              <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition">
                {brand.label}
              </span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
