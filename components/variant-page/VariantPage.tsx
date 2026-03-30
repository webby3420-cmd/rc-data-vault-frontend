import Link from "next/link";
import type { VariantPagePayload } from "@/types/variant-page";
import { ValueCard } from "@/components/variant-page/ValueCard";
import { TrendChart } from "@/components/variant-page/TrendChart";
import { RecentSales } from "@/components/variant-page/RecentSales";
import { RelatedLinks } from "@/components/variant-page/RelatedLinks";

function formatMonthYear(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSummary(payload: VariantPagePayload) {
  const { market_summary, valuation } = payload;

  const trend =
    market_summary.trend_direction === "rising"
      ? "is trending higher"
      : market_summary.trend_direction === "falling"
      ? "is trending lower"
      : "is holding relatively stable";

  return `The ${payload.identity.variant_full_name} has a ${market_summary.market_depth_label} secondary market with ${
    valuation.observation_count
  } recent sold listings. Prices currently range from ${formatCurrency(
    valuation.estimated_value_low
  )} to ${formatCurrency(
    valuation.estimated_value_high
  )}, and the market ${trend}.`;
}

export function VariantPage({ payload }: { payload: VariantPagePayload }) {
  const summary = buildSummary(payload);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: payload.identity.manufacturer_name,
        item: `https://rcbluebook.com/rc/${payload.identity.manufacturer_slug}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: payload.identity.model_family_name,
        item: `https://rcbluebook.com/rc/${payload.identity.manufacturer_slug}/${payload.identity.model_family_slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: payload.identity.variant_full_name,
        item: payload.seo.canonical_url,
      },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: payload.identity.variant_full_name,
    brand: {
      "@type": "Brand",
      name: payload.identity.manufacturer_name,
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: payload.valuation.estimated_value_low,
      highPrice: payload.valuation.estimated_value_high,
      offerCount: payload.valuation.observation_count,
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-slate-400">
            <Link href={`/rc/${payload.identity.manufacturer_slug}`} className="hover:text-white">
              {payload.identity.manufacturer_name}
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/rc/${payload.identity.manufacturer_slug}/${payload.identity.model_family_slug}`}
              className="hover:text-white"
            >
              {payload.identity.model_family_name}
            </Link>
            <span className="mx-2">/</span>
            <span>{payload.identity.variant_name}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {payload.identity.manufacturer_name} {payload.identity.variant_name}
              <span className="mt-2 block text-2xl font-normal text-slate-300">
                Used Value &amp; Price Guide
              </span>
            </h1>
          </header>

          <div className="grid gap-8">

            <ValueCard payload={payload} />

            <TrendChart payload={payload} />

            <RecentSales payload={payload} />

            {/* Market Summary */}
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="mb-4 text-2xl font-semibold text-white">Market Summary</h2>
              <p className="max-w-3xl text-base leading-7 text-slate-200">
                {summary}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Depth</div>
                  <div className="mt-1 text-lg font-medium text-white">
                    {payload.market_summary.market_depth_label}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Trend</div>
                  <div className="mt-1 text-lg font-medium text-white">
                    {payload.market_summary.trend_direction}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Data points</div>
                  <div className="mt-1 text-lg font-medium text-white">
                    {payload.valuation.observation_count}
                  </div>
                </div>
              </div>
            </section>

            <RelatedLinks payload={payload} />

            {/* Affiliate placeholder */}
            <section className="rounded-2xl border border-dashed border-amber-500/40 bg-slate-900 p-6">
              <h2 className="mb-2 text-2xl font-semibold text-white">Buy / Track Listings</h2>
              <p className="mb-4 text-slate-300">
                Affiliate and live marketplace modules will appear here.
              </p>
              <button className="rounded-xl bg-amber-500 px-4 py-2 font-medium text-slate-950">
                View current listings
              </button>
            </section>

            {/* Freshness */}
            <div className="text-sm text-slate-400">
              Price data updated {formatMonthYear(payload.valuation.valuation_last_updated_at)} from{" "}
              {payload.valuation.observation_count} eBay sold listings. Data refreshes every{" "}
              {Math.round(payload.freshness.revalidate_after_seconds / 60)} minutes.
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
