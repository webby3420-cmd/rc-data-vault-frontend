import { createSupabaseServerClient } from '@/lib/supabase/server'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RC Data Vault | Used RC Car Values & Price Guide',
  description: 'Used RC car values, price guides, and sold market data for Traxxas, ARRMA, Losi, Axial, and more.',
}

export default async function HomePage() {
  const supabase = createSupabaseServerClient()
  const { data: stats } = await supabase.rpc('get_homepage_stats')

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="RC Data Vault" width={720} height={300} priority className="w-full max-w-2xl" />
        </div>
        <p className="mx-auto mb-10 max-w-xl text-lg text-slate-400">Independent market values and price guides for used RC vehicles. Based on real sold listings.</p>
        {stats && (
          <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Valuations', value: stats.valued_variants },
              { label: 'Sold Listings', value: stats.total_observations?.toLocaleString() },
              { label: 'Manufacturers', value: stats.manufacturer_count },
              { label: 'Parts Listed', value: stats.total_parts?.toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-2xl font-semibold text-amber-400">{s.value ?? '—'}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <a href="/rc" className="inline-block rounded-xl bg-amber-500 px-6 py-3 font-medium text-slate-950 transition-colors hover:bg-amber-400">Browse RC Vehicle Values</a>
      </div>
    </main>
  )
}
