import Link from 'next/link'

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
        <h2 className="mb-4 text-base font-semibold text-white">Browse by brand or family</h2>
        <div className="flex flex-wrap gap-3">
          {PATHS.map(p => (
            <Link
              key={p.href}
              href={p.href}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
