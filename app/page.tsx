import { createSupabaseServerClient } from '@/lib/supabase/server'
import HomepageSearch from '@/components/HomepageSearch'
import { HowItWorks } from '@/components/home/HowItWorks'
import { WhatYouSee } from '@/components/home/WhatYouSee'
import { PopularModels } from '@/components/home/PopularModels'
import { HomeCtaStrip } from '@/components/home/HomeCtaStrip'
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
    <main className="min-h-screen bg-slate-950 text-slate-100" id="top">

      {/* Hero */}
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="RC Data Vault"
            width={720}
            height={300}
            priority
            className="w-full max-w-2xl"
          />
        </div>

        <div className="mb-3 inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
          RC market data · valuations · sold comps · model intelligence
        </div>

        <h1 className="mt-4 mb-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Understand what an RC model is worth before you buy, sell, or hold.
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-base text-slate-400 sm:text-lg">
          Search any RC vehicle to see real market prices, trend context, sold listing
          history, and model intelligence — based on actual eBay sold data.
        </p>

        <HomepageSearch />

        <p className="mt-4 text-sm text-slate-500">
          or{' '}
          <a href="#popular-models" className="text-amber-400 transition hover:text-amber-300">
            browse popular models ↓
          </a>
        </p>

        {stats && (
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Valuations',    value: stats.valued_variants },
              { label: 'Sold Listings', value: stats.total_observations?.toLocaleString() },
              { label: 'Manufacturers', value: stats.manufacturer_count },
              { label: 'Parts Listed',  value: stats.total_parts?.toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="text-2xl font-semibold text-amber-400">{s.value ?? '—'}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HowItWorks />
      <WhatYouSee />
      <PopularModels />
      <HomeCtaStrip />

    </main>
  )
}
