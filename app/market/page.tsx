export const dynamic = 'force-dynamic';

import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RC Market Overview',
  description: 'Current market conditions, top-valued RC vehicles, and price trends across the used RC market.',
}

export default async function MarketPage() {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.rpc('get_market_overview')

  const topByValue: any[] = data?.top_by_value ?? []
  const topByDemand: any[] = data?.top_by_demand ?? []

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">RC Market Overview</h1>
        <p className="mb-10 text-slate-400">Based on recent eBay sold listings across all tracked variants.</p>
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Top Value Retention</h2>
            <div className="space-y-3">
              {topByValue.length > 0 ? topByValue.map((v: any) => (
                <a key={v.slug} href={`/rc/${v.manufacturer_slug}/${v.family_slug}/${v.slug}`} className="flex items-center justify-between rounded-xl border border-slate-800 p-3 hover:border-slate-600 transition">
                  <span className="text-sm text-slate-200">{v.full_name}</span>
                  <span className="text-sm font-semibold text-amber-400">${Number(v.median_price).toLocaleString()}</span>
                </a>
              )) : <p className="text-sm text-slate-500">No data yet.</p>}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Most Active Markets</h2>
            <div className="space-y-3">
              {topByDemand.length > 0 ? topByDemand.map((v: any) => (
                <a key={v.slug} href={`/rc/${v.manufacturer_slug}/${v.family_slug}/${v.slug}`} className="flex items-center justify-between rounded-xl border border-slate-800 p-3 hover:border-slate-600 transition">
                  <span className="text-sm text-slate-200">{v.full_name}</span>
                  <span className="text-sm text-slate-400">{v.total_sales} sales</span>
                </a>
              )) : <p className="text-sm text-slate-500">No data yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
