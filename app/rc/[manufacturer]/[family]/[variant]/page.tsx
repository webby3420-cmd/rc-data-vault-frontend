import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CollapsibleSection from "@/components/CollapsibleSection";
import PriceAlertSignup from "@/components/PriceAlertSignup";
import RecentlyViewedVariants from "@/components/RecentlyViewedVariants";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{ manufacturer: string; family: string; variant: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const { data: variant } = await supabase
    .from("variants")
    .select("full_name, model_families(name, manufacturers(name))")
    .eq("slug", variantSlug)
    .single();

  if (!variant) return { title: "RC Data Vault" };

  const name = variant.full_name;

  return {
    title: `${name} Value, Sold Prices & Market Trends | RC Data Vault`,
    description: `Research the ${name} with valuation data, sold listing comps, price trends, specs, and market insights from RC Data Vault.`,
    robots: "index,follow",
    alternates: {
      canonical: `https://rcdatavault.com/rc/${(variant.model_families as any)?.manufacturers?.name?.toLowerCase()}/${(variant.model_families as any)?.name?.toLowerCase().replace(/\s+/g, "-")}/${variantSlug}`,
    },
    openGraph: {
      title: `${name} Value, Sold Prices & Market Trends | RC Data Vault`,
      description: `Research the ${name} with valuation data, sold listing comps, price trends, specs, and market insights from RC Data Vault.`,
      siteName: "RC Data Vault",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${name} Value, Sold Prices & Market Trends | RC Data Vault`,
      description: `Research the ${name} with valuation data, sold listing comps, price trends, specs, and market insights from RC Data Vault.`,
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
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function cap(s: string | null | undefined) {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type SpecRow = { label: string; value: string | null };

function buildSpecRows(specs: any): SpecRow[] {
  if (!specs) return [];
  const rows: SpecRow[] = [];

  const add = (label: string, value: string | number | boolean | null | undefined, suffix = "") => {
    if (value === null || value === undefined) return;
    const display =
      typeof value === "boolean"
        ? value ? "Yes" : "No"
        : `${value}${suffix}`;
    rows.push({ label, value: display });
  };

  add("Scale", specs.scale);
  add("Class", cap(specs.vehicle_type?.replace(/_/g, " ")));
  add("Configuration", specs.configuration);
  add("Drive", specs.drive_config?.toUpperCase());
  add("Drivetrain", cap(specs.drivetrain_type));
  add("Power", specs.power_system ? cap(specs.power_system.replace(/_/g, " ")) : null);
  add("Battery", specs.battery_config);
  add("Battery Included", specs.battery_included);
  add("Motor", specs.motor_name);
  add("ESC", specs.esc_name);
  add("Top Speed", specs.top_speed_mph, " mph");
  add("Length", specs.length_mm, " mm");
  add("Width", specs.width_mm, " mm");
  add("Wheelbase", specs.wheelbase_mm, " mm");
  add("Weight", specs.weight_g ? (specs.weight_g / 1000).toFixed(1) + " kg" : null);
  add("Waterproof", specs.waterproof);
  add("Self-Righting", specs.self_righting);
  add("Diff Lock", specs.diff_lock);
  add("2-Speed", specs.two_speed);
  add("Portal Axles", specs.portal_axles);
  add("Radio", specs.radio_system);
  add("Original MSRP", specs.msrp_display ?? null;
  add("Year Released", specs.year_released);

  return rows;
}

export default async function VariantPage({ params }: PageProps) {
  const { manufacturer, family, variant: variantSlug } = await params;

  const { data: variantData } = await supabase
    .from("variants")
    .select("variant_id, model_family_id, full_name, slug, model_families(name, manufacturers(name, slug))")
    .eq("slug", variantSlug)
    .single();

  if (!variantData) return <div className="p-8 text-white">Variant not found.</div>;

  const variantId = variantData.variant_id;
  const modelFamilyId = variantData.model_family_id;

  const [
    { data: specsData },
    { data: valuationData },
    { data: contentData },
    { data: trendData },
    { data: listingsData },
    { data: intelligenceData },
    { data: partsData },
    { data: siblingData },
  ] = await Promise.all([
    supabase.from("variant_specs").select("*").eq("variant_id", variantId).single(),
    supabase
      .from("v_variant_valuations_clean")
      .select("fair_value, low_value, high_value, confidence, total_observation_count, last_observation_at")
      .eq("variant_id", variantId)
      .single(),
    supabase
      .from("variant_content")
      .select("intro_paragraph, buying_tips, category_tags")
      .eq("variant_id", variantId)
      .single(),
    supabase
      .from("price_observations")
      .select("sale_price, observed_at")
      .eq("variant_id", variantId)
      .order("observed_at", { ascending: false })
      .limit(50),
    supabase
      .from("price_observations")
      .select("sale_price, observed_at, source, listing_title")
      .eq("variant_id", variantId)
      .order("observed_at", { ascending: false })
      .limit(12),
    supabase.from("mv_variant_payload").select("intelligence").eq("variant_slug", variantSlug).single(),
    supabase
      .from("parts")
      .select("part_id, name, part_number, oem_price, part_type")
      .contains("compatible_variant_ids", [variantId])
      .limit(3),
    supabase
      .from("variants")
      .select("full_name, slug, v_variant_valuations_clean(fair_value)")
      .eq("model_family_id", modelFamilyId)
      .neq("slug", variantSlug)
      .limit(6),
  ]);

  const mfr = (variantData.model_families as any)?.manufacturers;
  const mfrName: string = mfr?.name ?? manufacturer;
  const mfrSlug: string = mfr?.slug ?? manufacturer;
  const familyName: string = (variantData.model_families as any)?.name ?? family;
  const familySlug = family;

  const valuation = valuationData;
  const specs = specsData;
  const content = contentData;
  const intelligence = intelligenceData?.intelligence as any;

  const monthlyMap = new Map<string, number[]>();
  for (const obs of trendData ?? []) {
    const d = new Date(obs.observed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    if (!monthlyMap.has(key)) monthlyMap.set(key, []);
    monthlyMap.get(key)!.push(obs.sale_price);
  }
  const trendRows = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, prices]) => {
      const sorted = [...prices].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      return { month, median, low: sorted[0], high: sorted[sorted.length - 1], count: prices.length };
    });

  const trendDirection =
    trendRows.length >= 2
      ? trendRows[trendRows.length - 1].median > trendRows[trendRows.length - 2].median
        ? "up"
        : "down"
      : null;

  const trendDelta =
    trendRows.length >= 2
      ? Math.abs(trendRows[trendRows.length - 1].median - trendRows[trendRows.length - 2].median)
      : null;

  const totalPartsCount = partsData?.length ?? 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: variantData.full_name,
    brand: { "@type": "Brand", name: mfrName },
    ...(valuation
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: valuation.low_value,
            highPrice: valuation.high_value,
            offerCount: valuation.total_observation_count,
          },
        }
      : {}),
    url: `https://rcdatavault.com/rc/${mfrSlug}/${familySlug}/${variantSlug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: mfrName, item: `https://rcdatavault.com/rc/${mfrSlug}` },
      { "@type": "ListItem", position: 2, name: familyName, item: `https://rcdatavault.com/rc/${mfrSlug}/${familySlug}` },
      { "@type": "ListItem", position: 3, name: variantData.full_name, item: `https://rcdatavault.com/rc/${mfrSlug}/${familySlug}/${variantSlug}` },
    ],
  };

  const specRows = buildSpecRows(specs);
  const confidenceLabel =
    valuation?.confidence === "high_confidence"
      ? "High Confidence"
      : valuation?.confidence === "low_confidence"
      ? "Low Confidence"
      : valuation?.confidence === "estimate"
      ? "Estimate"
      : "Limited Data";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href={`/rc/${mfrSlug}`}>{mfrName}</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href={`/rc/${mfrSlug}/${familySlug}`}>{familyName}</a>
          <span className="mx-2">/</span>
          <span>{familyName}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {variantData.full_name}
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            Current valuation, sold comps, price trends, specs, and market intelligence.
          </p>
        </header>

        <div className="grid gap-8">

          {content?.intro_paragraph && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              {content.intro_paragraph.split("\n\n").map((para: string, i: number) => (
                <p key={i} className={`text-slate-300 leading-7${i > 0 ? " mt-4" : ""}`}>
                  {para}
                </p>
              ))}
            </section>
          )}

          {specRows.length > 0 && (
            <CollapsibleSection title="Specifications">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {specRows.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
              {specs?.motor_name && (
                <p className="mt-4 text-xs text-slate-500">
                  * {specs.motor_name} — purpose-built motor for {familyName}. Verified April 2026.
                </p>
              )}
            </CollapsibleSection>
          )}

          {valuation && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
              <div className="mb-2 text-sm uppercase tracking-wide text-slate-400">Estimated Value</div>
              <div className="text-5xl font-semibold text-amber-400">{fmt(valuation.fair_value)}</div>
              <div className="mt-3 text-lg text-slate-200">
                Range: {fmt(valuation.low_value)} – {fmt(valuation.high_value)}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-slate-600 px-3 py-1">{confidenceLabel}</span>
                <span>{valuation.total_observation_count} sold listings</span>
                <span>Updated {fmtDate(valuation.last_observation_at)}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">Source: eBay sold listings</div>
            </section>
          )}

          <PriceAlertSignup
            variantId={variantData.variant_id}
            variantSlug={variantSlug}
            modelName={variantData.full_name}
          />

          {intelligence && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 mt-8">
              <h2 className="mb-1 text-2xl font-semibold text-white">Market Intelligence</h2>
              {intelligence.era && (
                <p className="mb-4 text-xs text-slate-500 uppercase tracking-wide">{intelligence.era}</p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
                {intelligence.popularity_score != null && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Popularity</div>
                    <div className="text-3xl font-semibold text-amber-400">{intelligence.popularity_score}</div>
                    {intelligence.popularity_label && (
                      <div className="text-sm text-slate-300 mt-0.5 capitalize">{intelligence.popularity_label}</div>
                    )}
                  </div>
                )}
                {intelligence.demand_score != null && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Demand</div>
                    <div className="text-3xl font-semibold text-green-400">{intelligence.demand_score}</div>
                    {intelligence.demand_label && (
                      <div className="text-sm text-slate-300 mt-0.5 capitalize">{intelligence.demand_label}</div>
                    )}
                  </div>
                )}
                {intelligence.total_sales != null && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Total Sales</div>
                    <div className="text-3xl font-semibold text-slate-200">{intelligence.total_sales}</div>
                    <div className="text-sm text-slate-400 mt-0.5">observed</div>
                  </div>
                )}
                {intelligence.market_depth && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Market Depth</div>
                    <div className="text-xl font-semibold text-slate-200 mt-1 capitalize">
                      {intelligence.market_depth}
                    </div>
                  </div>
                )}
              </div>
              {intelligence.buyer_signal && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Buyer Signal</div>
                  <div className="text-slate-200 capitalize">{intelligence.buyer_signal}</div>
                </div>
              )}
            </section>
          )}

          {trendRows.length > 0 && (
            <CollapsibleSection title="Market Trend">
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
                    {trendRows.map((row) => (
                      <tr key={row.month} className="border-t border-slate-800">
                        <td className="py-3 pr-4">{fmtMonth(row.month)}</td>
                        <td className="py-3 pr-4 font-medium text-amber-400">{fmt(row.median)}</td>
                        <td className="py-3 pr-4">{fmt(row.low)} – {fmt(row.high)}</td>
                        <td className="py-3">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {trendRows.length >= 2 && trendDirection && (
                <p className="mt-3 text-sm text-slate-400">
                  {trendDirection === "up" ? "↑" : "↓"} Median price{" "}
                  <strong>{trendDirection === "up" ? "up" : "down"}</strong>{" "}
                  {fmt(trendDelta)} from {fmtMonth(trendRows[trendRows.length - 2].month)} to{" "}
                  {fmtMonth(trendRows[trendRows.length - 1].month)}
                </p>
              )}
            </CollapsibleSection>
          )}

          {listingsData && listingsData.length > 0 && (
            <CollapsibleSection title="Recent Sold Listings">
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
                    {listingsData.map((listing, i) => (
                      <tr key={i} className="border-t border-slate-800">
                        <td className="py-3 pr-4 font-medium text-amber-400">{fmt(listing.sale_price)}</td>
                        <td className="py-3 pr-4">{fmtDate(listing.observed_at)}</td>
                        <td className="py-3 pr-4 uppercase text-slate-400">{listing.source}</td>
                        <td className="py-3">{listing.listing_title?.slice(0, 50)}…</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )}

          {partsData && partsData.length > 0 && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Parts &amp; Upgrades</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {totalPartsCount} part{totalPartsCount !== 1 ? "s" : ""} available — OEM + aftermarket
                  </p>
                </div>
                <Link
                  href={`/rc/${mfrSlug}/${familySlug}/${variantSlug}/parts`}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400"
                >
                  View all parts
                </Link>
              </div>
              <div className="grid gap-3">
                {partsData.map((part) => (
                  <div
                    key={part.part_id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm text-white">{part.name}</span>
                      <span className="ml-2 text-xs text-slate-500">#{part.part_number}</span>
                    </div>
                    {part.oem_price && (
                      <span className="text-sm font-semibold text-amber-400">{fmt(part.oem_price)}</span>
                    )}
                  </div>
                ))}
              </div>
              {totalPartsCount > 3 && (
                <p className="mt-3 text-xs text-slate-500">{totalPartsCount - 3} more parts available →</p>
              )}
            </section>
          )}

          {valuation && (
            <CollapsibleSection title="Market Summary">
              <p className="max-w-3xl text-base leading-7 text-slate-200">
                The {variantData.full_name} has a{" "}
                <strong className="text-white">
                  {(valuation.total_observation_count ?? 0) > 20
                    ? "deep"
                    : (valuation.total_observation_count ?? 0) > 10
                    ? "moderate"
                    : "developing"}
                </strong>{" "}
                secondary market with{" "}
                <strong className="text-white">{valuation.total_observation_count}</strong> recent sold listings.
                Prices currently range from{" "}
                <strong className="text-white">{fmt(valuation.low_value)}</strong> to{" "}
                <strong className="text-white">{fmt(valuation.high_value)}</strong>, and the market is trending{" "}
                <strong className="text-white">
                  {trendDirection === "up" ? "rising" : trendDirection === "down" ? "falling" : "stable"}
                </strong>.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Depth</div>
                  <div className="mt-1 text-lg font-medium text-white">
                    {(valuation.total_observation_count ?? 0) > 20
                      ? "deep"
                      : (valuation.total_observation_count ?? 0) > 10
                      ? "moderate"
                      : "developing"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Trend</div>
                  <div className="mt-1 text-lg font-medium text-white">
                    {trendDirection === "up" ? "rising" : trendDirection === "down" ? "falling" : "stable"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Data points</div>
                  <div className="mt-1 text-lg font-medium text-white">{valuation.total_observation_count}</div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {content?.buying_tips && content.buying_tips.length > 0 && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">What to Look For When Buying Used</h2>
              <ol className="space-y-3">
                {content.buying_tips.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-slate-950">
                      {i + 1}
                    </span>
                    <span className="leading-6">{tip}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="mt-8 space-y-6">

            {siblingData && siblingData.length > 0 && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-white">More from {mfrName}</h2>
                  <p className="mt-1 text-xs text-slate-500">Other {mfrName} variants with market data</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {siblingData.map((v: any) => (
                    <Link
                      key={v.slug}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-600"
                      href={`/rc/${mfrSlug}/${familySlug}/${v.slug}`}
                    >
                      <div className="text-sm font-medium text-white leading-5">{v.full_name}</div>
                      {v.v_variant_valuations_clean?.fair_value && (
                        <div className="mt-1.5 text-sm font-semibold text-amber-400">
                          ~{fmt(v.v_variant_valuations_clean.fair_value)}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 md:p-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Keep researching</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Compare more RC models before you decide.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Search another model, explore the {familyName} family, or browse all {mfrName} variants with market data.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  Search another RC model
                </Link>
                <Link
                  href={`/rc/${mfrSlug}/${familySlug}`}
                  className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Browse {familyName} family
                </Link>
                <Link
                  href={`/rc/${mfrSlug}`}
                  className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  All {mfrName} models
                </Link>
              </div>
            </section>

            <RecentlyViewedVariants
              canonicalPath={`/rc/${mfrSlug}/${familySlug}/${variantSlug}`}
              fullName={variantData.full_name}
              manufacturerName={mfrName}
            />
          </div>

          <div className="text-sm text-slate-400">
            Price data updated {fmtDate(valuation?.last_observation_at)} from{" "}
            {valuation?.total_observation_count} eBay sold listings. Data refreshes every 60 minutes.
          </div>
        </div>
      </div>
    </main>
  );
}
