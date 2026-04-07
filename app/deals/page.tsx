import { createClient } from "@supabase/supabase-js";
import DealCard from "@/components/DealCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Live RC Deals | RC Data Vault",
  description: "Real-time RC vehicle deals from live eBay listings, scored against market data. Find below-market RC cars, trucks, and crawlers.",
};

async function getDeals() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("top_deals_live")
    .select("*")
    .gte("deal_score", 55)
    .order("deal_score", { ascending: false })
    .limit(48);
  return data ?? [];
}

async function getBrands() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("top_deals_live")
    .select("manufacturer_name, manufacturer_slug")
    .gte("deal_score", 55)
    .order("manufacturer_name");
  const seen = new Set<string>();
  return (data ?? []).filter(r => {
    if (seen.has(r.manufacturer_slug)) return false;
    seen.add(r.manufacturer_slug);
    return true;
  });
}

export default async function DealsPage() {
  const [deals, brands] = await Promise.all([getDeals(), getBrands()]);

  const goodDeals = deals.filter(d => d.deal_score >= 70);
  const fairDeals = deals.filter(d => d.deal_score >= 55 && d.deal_score < 70);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live market data
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">RC Deals</h1>
        <p className="mt-2 text-slate-400 text-sm leading-6 max-w-2xl">
          Live eBay listings scored against market data. Updated every 30 minutes.
          {deals.length > 0 && ` ${deals.length} deals tracked right now.`}
        </p>
      </div>

      {/* Brand filters */}
      {brands.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <a href="/deals" className="rounded-full border border-amber-500 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            All Brands
          </a>
          {brands.map(b => (
            <a
              key={b.manufacturer_slug}
              href={`/deals/${b.manufacturer_slug}`}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
            >
              {b.manufacturer_name}
            </a>
          ))}
        </div>
      )}

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-12 text-center">
          <p className="text-slate-400">No deals found right now. Check back soon — data refreshes every 30 minutes.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {goodDeals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                Good Deals & Above
                <span className="text-sm font-normal text-slate-500">({goodDeals.length})</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goodDeals.map(deal => <DealCard key={deal.listing_id} deal={deal} />)}
              </div>
            </section>
          )}
          {fairDeals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400 inline-block"></span>
                Fair Listings
                <span className="text-sm font-normal text-slate-500">({fairDeals.length})</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fairDeals.map(deal => <DealCard key={deal.listing_id} deal={deal} />)}
              </div>
            </section>
          )}
        </div>
      )}

      <p className="mt-10 text-xs text-slate-600 text-center">
        Deal scores are calculated from live listing price vs. current market median. Scores above 70 represent below-market listings.
      </p>
    </main>
  );
}
