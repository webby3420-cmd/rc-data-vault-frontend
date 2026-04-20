import { createSupabaseServerClient } from '@/lib/supabase/server'
import HomepageSearch from '@/components/HomepageSearch'
import { HowItWorks } from '@/components/home/HowItWorks'
import { PopularModels } from '@/components/home/PopularModels'
import { HomepageRecentlyResearchedVariants } from '@/components/home/HomepageRecentlyResearchedVariants'
import { HomepageResearchPaths } from '@/components/home/HomepageResearchPaths'
import { HomepageOpportunities } from '@/components/home/HomepageOpportunities'
import { HomepageYourAlerts } from '@/components/home/HomepageYourAlerts'
import type { Metadata } from 'next'

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'RC Data Vault | Used RC Car Values & Price Guide',
  description: 'Used RC car values, price guides, and sold market data for Traxxas, ARRMA, Losi, Axial, and more.',
}

export default async function HomePage() {
  const supabase = createSupabaseServerClient()
  await supabase.rpc('get_homepage_stats')

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100" id="top">

      {/* Hero */}
      <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-center gap-2">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-6 w-auto"
          />
          <span className="text-sm font-semibold tracking-tight text-white">
            RC<span className="text-amber-400">DataVault</span>
          </span>
        </div>
        <h1 className="mt-0 mb-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Know what any RC is worth.
        </h1>

        <HomepageSearch />

        <p className="mt-6 text-sm text-slate-500">
          2,500+ real sold prices · 100+ models valued · real eBay data
        </p>
      </div>

      <HomepageResearchPaths />
      <HomepageRecentlyResearchedVariants />
      <PopularModels />
      <HomepageOpportunities />
      <HomepageYourAlerts />
      <HowItWorks />

    </main>
  )
}
