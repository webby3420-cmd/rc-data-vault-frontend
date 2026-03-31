// @ts-nocheck
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
// ... rest unchanged
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const BASE_URL = "https://rcdatavault.com";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

type Props = {
  params: Promise<{ manufacturer: string; family: string; variant: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const { data } = await getSupabase().rpc("get_variant_page_payload", {
    p_variant_slug: slug,
  });

  if (!data) return { title: "Not Found | RC Data Vault" };

  const name = data.identity.variant_full_name;
  const mid = data.valuation?.estimated_value_mid;
  const obs = data.valuation?.observation_count;
  const canonical = `${BASE_URL}${data.identity.canonical_url}`;

  return {
    title: `${name} Value & Price Guide | RC Data Vault`,
    description: `What is a ${name} worth? Estimated market value ${mid ? `$${mid.toLocaleString()}` : ""} based on ${obs ?? 0} recent sold listings. See price range, market trends, and sold comps.`,
    alternates: { canonical },
    robots: "index, follow",
    openGraph: {
      title: `${name} Value & Price Guide`,
      description: `Current market value and price history for the ${name}.`,
      url: canonical,
      siteName: "RC Data Vault",
      type: "website",
    },
  };
}

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fmtMonth(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default async function VariantPage({ params }: Props) {
  const { variant: slug } = await params;
  const { data: payload, error } = await getSupabase().rpc("get_variant_page_payload", { p_variant_slug: slug });

  if (error || !payload) notFound();

  const { identity, valuation, recent_sales, price_trends, market_summary, related, freshness } = payload;
  const canonical = `${BASE_URL}${identity.canonical_url}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: identity.variant_full_name,
    brand: { "@type": "Brand", name: identity.manufacturer_name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: valuation.estimated_value_low,
      highPrice: valuation.estimated_value_high,
      offerCount: valuation.observation_count,
    },
    url: canonical,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: identity.manufacturer_name, item: `${BASE_URL}${related.manufacturer.canonical_url}` },
      { "@type": "ListItem", position: 2, name: identity.model_family_name, item: `${BASE_URL}${related.model_family.canonical_url}` },
      { "@type": "ListItem", position: 3, name: identity.variant_full_name, item: canonical },
    ],
  };

  const trendFirst = price_trends?.[0]?.median_price;
  const trendLast = price_trends?.[price_trends.length - 1]?.median_price;
  const trendUp = trendFirst != null && trendLast != null && trendLast > trendFirst;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-slate-400">
            <a className="hover:text-white" href={related.manufacturer.canonical_url}>{identity.manufacturer_name}</a>
            <span className="mx-2">/</span>
            <a className="hover:text-white" href={related.model_family.canonical_url}>{identity.model_family_name}</a>
            <span className="mx-2">/</span>
            <span>{identity.variant_name}</span>
          </nav>

          {/* H1 */}
          <header className="mb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {identity.manufacturer_name} {identity.variant_full_name}
              <span className="mt-2 block text-2xl font-normal text-slate-300">Used Value &amp; Price Guide</span>
            </h1>
          </header>

          <div className="grid gap-8">

            {/* Valuation card */}
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
              <div className="mb-2 text-sm uppercase tracking-wide text-slate-400">Estimated Value</div>
              <div className="text-5xl font-semibold text-amber-400">{fmt(valuation.estimated_value_mid)}</div>
              <div className="mt-3 text-lg text-slate-200">Range: {fmt(valuation.estimated_value_low)} – {fmt(valuation.estimated_value_high)}</div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-slate-600 px-3 py-1">{valuation.confidence_label}</span>
                <span>{valuation.observation_count} sold listings</span>
                <span>Updated {fmtDate(valuation.valuation_last_updated_at)}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">Source: eBay sold listings</div>
            </section>

            {/* Price trend */}
            {price_trends && price_trends.length > 0 && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                <h2 className="mb-4 text-2xl font-semibold text-white">Market Trend</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="pb-3 pr-4">Month</th>
                        <th className="pb-3 pr-4">Median</th>
                        <th className="pb-3 pr-4">Range</th>
                        <th className="pb-3">Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                     {(price_trends as Array<{ month: string; median_price: number; min_price: number; max_price: number; observation_count: number }>).map((t) => (
                        <tr key={t.month} className="border-t border-slate-800">
                          <td className="py-3 pr-4">{fmtMonth(t.month)}</td>
                          <td className="py-3 pr-4 font-medium text-amber-400">{fmt(t.median_price)}</td>
                          <td className="py-3 pr-4">{fmt(t.min_price)} – {fmt(t.max_price)}</td>
                          <td className="py-3">{t.observation_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {trendFirst != null && trendLast != null && (
                  <p className="mt-3 text-sm text-slate-400">
                    {trendUp ? "↑" : "↓"} Median price {trendUp ? "up" : "down"} {fmt(Math.abs(trendLast - trendFirst))} from {fmtMonth(price_trends[0].month)} to {fmtMonth(price_trends[price_trends.length - 1].month)}
                  </p>
                )}
              </section>
            )}

            {/* Recent sales */}
            {recent_sales && recent_sales.length > 0 && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                <h2 className="mb-4 text-2xl font-semibold text-white">Recent Sold Listings</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="pb-3 pr-4">Price</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Source</th>
                        <th className="pb-3">Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent_sales.map((sale, i) => (
                        <tr key={i} className="border-t border-slate-800">
                          <td className="py-3 pr-4 font-medium text-amber-400">{fmt(sale.price)}</td>
                          <td className="py-3 pr-4">{new Date(sale.price_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="py-3 pr-4 uppercase text-slate-400">{sale.source}</td>
                          <td className="py-3">{sale.title.length > 72 ? sale.title.slice(0, 71) + "…" : sale.title}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Market summary */}
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-2xl font-semibold text-white">Market Summary</h2>
              <p className="max-w-3xl text-base leading-7 text-slate-200">
                The {identity.variant_full_name} has a {market_summary.market_depth_label} secondary market with {valuation.observation_count} recent sold listings.
                Prices currently range from {fmt(valuation.estimated_value_low)} to {fmt(valuation.estimated_value_high)}, and the market is trending {market_summary.trend_direction === "insufficient_history" ? "without enough history to determine direction" : market_summary.trend_direction}.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Depth</div>
                  <div className="mt-1 text-lg font-medium text-white">{market_summary.market_depth_label}</div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Trend</div>
                  <div className="mt-1 text-lg font-medium text-white">{market_summary.trend_direction}</div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Data points</div>
                  <div className="mt-1 text-lg font-medium text-white">{valuation.observation_count}</div>
                </div>
              </div>
            </section>

            {/* Related */}
            {related && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                <h2 className="mb-4 text-2xl font-semibold text-white">Related Models</h2>
                {related.siblings && related.siblings.length > 0 && (
                  <div className="mb-6 grid gap-3">
                    {related.siblings.map((sib) => (
                      <a key={sib.variant_id} className="rounded-xl border border-slate-800 p-4 transition hover:border-slate-600" href={sib.canonical_url}>
                        <div className="font-medium text-white">{sib.full_name}</div>
                        <div className="text-sm text-slate-400">{sib.obs_count} sold listings</div>
                      </a>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  <a className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500" href={related.model_family.canonical_url}>{identity.model_family_name} family</a>
                  <a className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500" href={related.manufacturer.canonical_url}>{identity.manufacturer_name}</a>
                </div>
              </section>
            )}

            {/* Footer */}
            <div className="text-sm text-slate-400">
              Price data updated {fmtDate(valuation.valuation_last_updated_at)} from {valuation.observation_count} eBay sold listings. Data refreshes every {Math.round(freshness.revalidate_after_seconds / 60)} minutes.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
