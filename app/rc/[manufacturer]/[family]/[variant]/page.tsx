import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{ manufacturer: string; family: string; variant: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const { data } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });
  if (!data) return { title: "RC Data Vault" };
  const seo = data.seo;
  return {
    title: seo.title_tag,
    description: seo.meta_description,
    robots: seo.robots_directive,
    alternates: { canonical: seo.canonical_url },
    openGraph: {
      title: data.identity.variant_full_name + " Value & Price Guide",
      description: seo.meta_description,
      url: seo.canonical_url,
      siteName: "RC Data Vault",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: data.identity.variant_full_name + " Value & Price Guide",
      description: seo.meta_description,
    },
  };
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString();
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMonth(d: string | null | undefined) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default async function VariantPage({ params }: PageProps) {
  const { manufacturer, family, variant: variantSlug } = await params;
  const { data: payload } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });

  if (!payload) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-2">Vehicle Not Found</h1>
          <p className="text-slate-400 mb-6">This listing may have been removed or the URL is incorrect.</p>
          <a href="/rc" className="text-amber-400 hover:text-amber-300">Browse all RC values →</a>
        </div>
      </main>
    );
  }

  const { identity, valuation, recent_sales, price_trends, market_summary, related, content, seo, freshness } = payload;
  const hasValuation = valuation?.has_sufficient_data;
  const hasTrends = price_trends && price_trends.length >= 2;
  const firstTrend = hasTrends ? price_trends[0] : null;
  const lastTrend = hasTrends ? price_trends[price_trends.length - 1] : null;
  const trendDelta = (firstTrend && lastTrend) ? Math.round(lastTrend.median_price - firstTrend.median_price) : null;

  const productSchema = hasValuation ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": identity.variant_full_name,
    "brand": { "@type": "Brand", "name": identity.manufacturer_name },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": valuation.estimated_value_low,
      "highPrice": valuation.estimated_value_high,
      "offerCount": valuation.observation_count,
    },
    "url": seo.canonical_url,
  }) : null;

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": identity.manufacturer_name, "item": `https://rcdatavault.com/rc/${identity.manufacturer_slug}` },
      { "@type": "ListItem", "position": 2, "name": identity.model_family_name, "item": `https://rcdatavault.com/rc/${identity.manufacturer_slug}/${identity.model_family_slug}` },
      { "@type": "ListItem", "position": 3, "name": identity.variant_full_name, "item": seo.canonical_url },
    ],
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {productSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productSchema }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href={`/rc/${identity.manufacturer_slug}`}>{identity.manufacturer_name}</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href={`/rc/${identity.manufacturer_slug}/${identity.model_family_slug}`}>{identity.model_family_name}</a>
          <span className="mx-2">/</span>
          <span>{identity.variant_name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {identity.variant_full_name}
            <span className="mt-2 block text-2xl font-normal text-slate-300">Used Value & Price Guide</span>
          </h1>
        </header>

        <div className="grid gap-8">

          {/* SEO Intro Content — shown when available */}
          {content?.intro_paragraph && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <p className="text-base leading-7 text-slate-200">{content.intro_paragraph}</p>
              {content.category_tags && content.category_tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.category_tags.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400 capitalize">{tag}</span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Valuation Hero */}
          {hasValuation ? (
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
          ) : (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <div className="text-slate-400">Not enough sold listings yet to generate a valuation. Check back as market data accumulates.</div>
            </section>
          )}

          {/* Price Trend Table */}
          {hasTrends && (
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
                    {price_trends.map((t: any) => (
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
              {trendDelta !== null && firstTrend && lastTrend && (
                <p className="mt-3 text-sm text-slate-400">
                  {trendDelta >= 0 ? "↑" : "↓"} Median price {trendDelta >= 0 ? "up" : "down"} {fmt(Math.abs(trendDelta))} from {fmtMonth(firstTrend.month)} to {fmtMonth(lastTrend.month)}
                </p>
              )}
            </section>
          )}

          {/* Recent Sold Listings */}
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
                    {recent_sales.map((s: any, i: number) => (
                      <tr key={i} className="border-t border-slate-800">
                        <td className="py-3 pr-4 font-medium text-amber-400">{fmt(s.price)}</td>
                        <td className="py-3 pr-4">{fmtDate(s.price_date)}</td>
                        <td className="py-3 pr-4 uppercase text-slate-400">{s.source}</td>
                        <td className="py-3">{s.title ? s.title.slice(0, 60) + (s.title.length > 60 ? "…" : "") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Buying Tips — shown when available */}
          {content?.buying_tips && content.buying_tips.length > 0 && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-2xl font-semibold text-white">What to Look For When Buying Used</h2>
              <ul className="space-y-3">
                {content.buying_tips.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-slate-200">
                    <span className="mt-0.5 flex-shrink-0 text-amber-400 font-semibold">{i + 1}.</span>
                    <span className="leading-7">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Market Summary */}
          {hasValuation && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-2xl font-semibold text-white">Market Summary</h2>
              <p className="max-w-3xl text-base leading-7 text-slate-200">
                The {identity.variant_full_name} has a{" "}
                <strong className="text-white">{market_summary.market_depth_label}</strong> secondary market with{" "}
                <strong className="text-white">{valuation.observation_count}</strong> recent sold listings. Prices currently range from{" "}
                <strong className="text-white">{fmt(valuation.estimated_value_low)}</strong> to{" "}
                <strong className="text-white">{fmt(valuation.estimated_value_high)}</strong>, and the market is trending{" "}
                <strong className="text-white">{market_summary.trend_direction?.replace("_", " ")}</strong>.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Depth</div>
                  <div className="mt-1 text-lg font-medium text-white">{market_summary.market_depth_label}</div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Trend</div>
                  <div className="mt-1 text-lg font-medium text-white">{market_summary.trend_direction?.replace("_", " ")}</div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Data points</div>
                  <div className="mt-1 text-lg font-medium text-white">{valuation.observation_count}</div>
                </div>
              </div>
            </section>
          )}

          {/* Related Models */}
          {(related?.siblings?.length > 0) && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-2xl font-semibold text-white">Related Models</h2>
              <div className="mb-6 grid gap-3">
                {related.siblings.map((s: any) => (
                  <a key={s.variant_id} className="rounded-xl border border-slate-800 p-4 transition hover:border-slate-600" href={s.canonical_url}>
                    <div className="font-medium text-white">{s.full_name}</div>
                    <div className="text-sm text-slate-400">{s.obs_count} sold listings</div>
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <a className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500" href={related.model_family.canonical_url}>
                  {related.model_family.name} family
                </a>
                <a className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500" href={related.manufacturer.canonical_url}>
                  {related.manufacturer.name}
                </a>
              </div>
            </section>
          )}

          {/* Freshness footer */}
          <div className="text-sm text-slate-400">
            Price data updated {fmtDate(valuation?.valuation_last_updated_at)} from {valuation?.observation_count ?? 0} eBay sold listings. Data refreshes every {Math.round((freshness?.revalidate_after_seconds ?? 3600) / 60)} minutes.
          </div>

        </div>
      </div>
    </main>
  );
}
