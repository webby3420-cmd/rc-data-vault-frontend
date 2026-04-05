import Link from 'next/link'

export function HomepageResearchPaths() {
  return (
    <section className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Explore RC research paths
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Manufacturers</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/rc/traxxas" className="text-slate-200 hover:text-white">Traxxas</Link>
              <Link href="/rc/arrma" className="text-slate-200 hover:text-white">ARRMA</Link>
              <Link href="/rc/losi" className="text-slate-200 hover:text-white">Losi</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Popular platforms</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/rc/traxxas/x-maxx" className="text-slate-200 hover:text-white">Traxxas X-Maxx</Link>
              <Link href="/rc/arrma/kraton" className="text-slate-200 hover:text-white">ARRMA Kraton</Link>
              <Link href="/rc/traxxas/slash" className="text-slate-200 hover:text-white">Traxxas Slash</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Live market pages</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/rc/traxxas/x-maxx/traxxas-x-maxx-8s-brushless-rtr" className="text-slate-200 hover:text-white">X-Maxx 8S value</Link>
              <Link href="/rc/arrma/kraton/arrma-kraton-brushless-1-8-4x4-rtr-6s" className="text-slate-200 hover:text-white">Kraton 6S value</Link>
              <Link href="/rc/traxxas/slash/traxxas-slash-4x4-vxl" className="text-slate-200 hover:text-white">Slash 4x4 VXL value</Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
