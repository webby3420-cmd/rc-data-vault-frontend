import { createClient } from "@supabase/supabase-js";
import DealCard from "@/components/DealCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const brand = decodeURIComponent(params.brand);
  return {
    title: `${brand} RC Deals | RC Data Vault`,
    description: `Live ${brand} RC deals scored against market data. Find below-market ${brand} RC vehicles on eBay.`,
  };
}

async function getBrandDeals(brandSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("top_deals_live")
    .select("*")
    .eq("manufacturer_slug", brandSlug)
    .gte("deal_score", 55)
    .order("deal_score", { ascending: false })
    .limit(48);
  return data ?? [];
}

export default async function BrandDealsPage({ params }: { params: { brand: string } }) {
  const deals = await getBrandDeals(params.brand);

  if (deals.length === 0) notFound();

  const brandName = deals[0]?.manufacturer_name ?? params.brand;
  const goodDeals = deals.filter(d => d.deal_score >= 70);
  const fairDeals = deals.filter(d => d.deal_score >= 55 && d.deal_score < 70);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <a href="/deals" className="hover:text-slate-300 transition-colors">All Deals</a>
          <span>/</span>
          <span className="text-slate-300">{brandName}</span>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{brandName} Deals</h1>
        <p className="mt-2 text-slate-400 text-sm">
          {deals.length} live {brandName} listing{deals.length !== 1 ? "s" : ""} scored against market data.
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-12 text-center">
          <p className="text-slate-400">No {brandName} deals right now. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {goodDeals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Good Deals & Above ({goodDeals.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goodDeals.map(deal => <DealCard key={deal.listing_id} deal={deal} />)}
              </div>
            </section>
          )}
          {fairDeals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">Fair Listings ({fairDeals.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fairDeals.map(deal => <DealCard key={deal.listing_id} deal={deal} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
