import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CollapsibleSection from "@/components/CollapsibleSection";
import PriceAlertSignup from "@/components/PriceAlertSignup";
import RecentlyViewedVariants from "@/components/RecentlyViewedVariants";
import Link from "next/link";
import ResourceSection from "@/components/resources/ResourceSection";
import ToolsBlock from "@/components/tools/ToolsBlock";
import MarketStateBar from "@/components/market/MarketStateBar";
import SoldTrendBlock from "@/components/market/SoldTrendBlock";
import ActiveDealsStrip from "@/components/market/ActiveDealsStrip";
import ConfidenceExplainer from "@/components/market/ConfidenceExplainer";
import AlertReturnBanner from "@/components/alerts/AlertReturnBanner";
import VariantPartsSection from "@/components/parts/VariantPartsSection";
import PriceHistoryChart from "@/components/market/PriceHistoryChart";
import MarketInsightSection from "@/components/market/MarketInsightSection";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{ manufacturer: string; family: string; variant: string }>;
  searchParams: Promise<{ src?: string; alert_context?: string; alert_scope?: string }>;
};

function getApprovedPrimaryImage(payloadRow: any): {
  url: string | null;
  alt: string | null;
} {
  if (!payloadRow) return { url: null, alt: null };
  return {
    url: payloadRow.primary_image_url ?? null,
    alt: payloadRow.primary_image_alt ?? null,
  };
}

function VariantHeroImage({
  imageUrl,
  imageAlt,
  modelName,
}: {
  imageUrl: string | null;
  imageAlt: string | null;
  modelName: string;
}) {
  return (
    <section className="mb-8">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <div className="relative w-full aspect-[4/3] bg-slate-950">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt || `${modelName} approved reference image`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
              <div className="px-6 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Approved image pending
                </div>
                <div className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                  {modelName}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  RC Data Vault only displays approved governed images.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const { data: variant } = await supabase
    .from("variants")
    .select("full_name, model_families(name, manufacturers(name))")
    .eq("slug", variantSlug)
    .single();

  if (!variant) return { title: "RC Data Vault" };

  const name = variant.full_name;

  const { data: indexMeta } = await (supabase.rpc as any)("get_variant_indexing_metadata", {
    p_variant_slug: variantSlug,
  }).maybeSingle();
  const shouldIndex = indexMeta?.should_index !== false;

  return {
    title: `${name} Value, Sold Prices & Market Trends | RC Data Vault`,
    description: `Research the ${name} with valuation data, sold listing comps, price trends, specs, and market insights from RC Data Vault.`,
    robots: shouldIndex ? "index,follow" : "noindex,follow",
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

function specsAreIndividuallyVerified(specs: any) {
  return Boolean(specs?.spec_verified && specs?.spec_verified_at);
}

// Extracts the best purchase URL from a part's purchase_links JSON array

// Returns a human-readable source label for a sold listing
function listingSourceLabel(source: string | null | undefined): string {
  if (!source) return "Marketplace";
  const map: Record<string, string> = {
    ebay: "eBay",
    facebook: "Facebook Marketplace",
    craigslist: "Craigslist",
    amazon: "Amazon",
  };
  return map[source.toLowerCase()] ?? cap(source) ?? "Marketplace";
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
  add("Class", cap(specs.vehicle_class?.replace(/_/g, " ")));
  add("Body Style", cap(specs.body_style?.replace(/_/g, " ")));
  add("Drive", specs.drive_config?.toUpperCase());
  add("Drivetrain", cap(specs.drivetrain_type));
  add("Power", specs.power_type ? cap(specs.power_type.replace(/_/g, " ")) : null);
  add("Battery", specs.battery_config);
  add("Battery Included", specs.battery_included);
  add("Motor", specs.motor_name);
  add("ESC", specs.esc_name);
  add("Top Speed", specs.top_speed_mph, " mph");
  add("Length", specs.length_mm, " mm");
  add("Width", specs.width_mm, " mm");
  add("Wheelbase", specs.wheelbase_mm, " mm");
  add("Weight", specs.weight_g ? (specs.weight_g / 1000).toFixed(1) + " kg" : null);
  add("Waterproof", specs.is_waterproof);
  add("Self-Righting", specs.is_self_righting);
  add("Diff Lock", specs.has_diff_lock);
  add("2-Speed", specs.has_2_speed);
  add("Portal Axles", specs.has_portal_axles);
  add("Radio", specs.radio_system);
  add("Original MSRP", specs.msrp_display ?? null);
  add("Year Released", specs.year_released);

  return rows;
}

const RESOURCE_LABEL: Record<string, string> = {
  product_page: "Product Page",
  manual: "Manuals",
  exploded_view: "Exploded Views",
  parts_list: "Parts Lists",
  setup_sheet: "Setup Sheets",
  spare_parts_page: "Spare Parts",
  video: "Videos",
  other: "Other Resources",
};
const RESOURCE_ORDER = ["product_page", "manual", "exploded_view", "parts_list", "setup_sheet", "spare_parts_page", "video", "other"];

export default async function VariantPage({ params, searchParams }: PageProps) {
  const { manufacturer, family, variant: variantSlug } = await params;
  const sp = await searchParams;
  const isAlertTraffic = sp.src === "alert";

  const { data: variantData } = await supabase
    .from("variants")
    .select("variant_id, model_family_id, full_name, slug, model_families(name, manufacturers(name, slug))")
    .eq("slug", variantSlug)
    .single();

  if (!variantData) {
    const { data: fallbackVariant } = await supabase
      .from("variants")
      .select("slug, model_families!inner(slug, manufacturers!inner(slug))")
      .eq("model_families.slug", family)
      .eq("model_families.manufacturers.slug", manufacturer)
      .order("release_year", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (fallbackVariant?.slug) {
      redirect(`/rc/${manufacturer}/${family}/${fallbackVariant.slug}`);
    }

    return <div className="p-8 text-white">Variant not found.</div>;
  }

  const variantId = variantData.variant_id;
  const modelFamilyId = variantData.model_family_id;

  const { data: siblingVariants } = await supabase
    .from("variants")
    .select("variant_id, full_name, slug")
    .eq("model_family_id", modelFamilyId)
    .neq("slug", variantSlug)
    .limit(6);

  const siblingIds = (siblingVariants ?? []).map((s: any) => s.variant_id);
  const { data: siblingVals } = siblingIds.length > 0
    ? await supabase
        .from("v_variant_valuations_clean")
        .select("variant_id, fair_value")
        .in("variant_id", siblingIds)
    : { data: [] };

  const siblingValMap = Object.fromEntries(
    (siblingVals ?? []).map((v: any) => [v.variant_id, v])
  );
  const siblingData = (siblingVariants ?? []).map((s: any) => ({
    ...s,
    valuation: siblingValMap[s.variant_id] ?? null,
  }));

  const [
    { data: specsData },
    { data: valuationData },
    { data: trendData },
    { data: listingsData },
    { data: payloadData },
    { data: insightData },
  ] = await Promise.all([
    supabase.from("variant_specs").select("*").eq("variant_id", variantId).single(),
    supabase
      .from("v_variant_valuations_clean")
      .select("fair_value, low_value, high_value, confidence, total_observation_count, last_observation_at")
      .eq("variant_id", variantId)
      .single(),
    supabase
      .from("v_price_observations")
      .select("sale_price, observed_at")
      .eq("variant_id", variantId)
      .order("observed_at", { ascending: false })
      .limit(50),
    supabase
      .from("v_price_observations")
      .select("*")
      .eq("variant_id", variantId)
      .order("observed_at", { ascending: false })
      .limit(12),
    supabase.from("mv_variant_payload").select("*").eq("variant_slug", variantSlug).single(),
    supabase
      .from("v_variant_page_payload")
      .select("price_position_band, deal_score_simple, confidence_label, market_summary_text, recommendation_text")
      .eq("variant_slug", variantSlug)
      .maybeSingle(),
  ]);

  const { data: verifiedContent } = await supabase
    .from("variant_verified_content")
    .select("overview_sentence_1, overview_sentence_2, overview_sentence_3, overview_sentence_4, spec_facts, included_facts, required_facts")
    .eq("variant_slug", variantSlug)
    .eq("verification_status", "verified")
    .eq("render_status", "render_verified_only")
    .maybeSingle();

  const { data: resources } = await supabase
    .from("variant_resources")
    .select("resource_id, resource_type, title, url, file_format, language, publisher, display_order")
    .eq("variant_id", variantId)
    .eq("is_verified", true)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const { data: resourceData } = await supabase.rpc("get_variant_resources", { p_variant_id: variantData.variant_id });

  const { data: marketIntel } = await (supabase.rpc as any)("get_variant_market_intel_by_slug", { p_slug: variantSlug });

  const { data: purchaseLinks } = await supabase
    .from("variant_purchase_links")
    .select("retailer_name, retailer_slug, retailer_type, affiliate_url, product_url, price_usd, in_stock, display_priority")
    .eq("variant_id", variantId)
    .eq("is_active", true)
    .order("display_priority", { ascending: true });

  const mfr = (variantData.model_families as any)?.manufacturers;
  const mfrName: string = mfr?.name ?? manufacturer;
  const mfrSlug: string = mfr?.slug ?? manufacturer;
  const familyName: string = (variantData.model_families as any)?.name ?? family;
  const familySlug = family;

  // Prefer live valuation from v_variant_valuations_clean; fall back to payload estimates
  const payloadVal = payloadData?.valuation as any;
  const valuation = valuationData ?? (payloadVal?.estimated_value_mid ? {
    fair_value: payloadVal.estimated_value_mid,
    low_value: payloadVal.estimated_value_low,
    high_value: payloadVal.estimated_value_high,
    confidence: payloadVal.confidence ?? null,
    total_observation_count: payloadVal.observation_count ?? 0,
    last_observation_at: payloadVal.last_observation_at ?? null,
    _source: "payload_estimate" as const,
  } : null);
  const specs = specsData;
  const intelligence = payloadData?.intelligence as any;
  const approvedPrimaryImage = getApprovedPrimaryImage(payloadData);

  // Sold listings: prefer live v_price_observations, fall back to payload.recent_sales
  const recentSales = (payloadData?.recent_sales as any[]) ?? [];
  const soldListings: any[] = (listingsData && listingsData.length > 0)
    ? listingsData
    : recentSales.map((s: any) => ({
        listing_title: s.title ?? s.listing_title ?? "Sold listing",
        sale_price: s.price ?? s.sale_price,
        observed_at: s.sold_at ?? s.observed_at,
        source: s.source ?? "ebay",
        condition_grade_id: s.condition ?? s.condition_grade_id ?? null,
        listing_url: s.url ?? s.listing_url ?? null,
      }));

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
  const specsVerified = specsAreIndividuallyVerified(specs);
  const confidenceLabel =
    valuation?.confidence === "high_confidence"
      ? "High Confidence"
      : valuation?.confidence === "low_confidence"
      ? "Low Confidence"
      : valuation?.confidence === "estimate"
      ? "Estimate"
      : "Limited Data";

  // Pin product_page resources to top of resources list
  const pinnedResources = (resources ?? []).filter((r: any) => r.resource_type === "product_page");
  const otherResources = (resources ?? []).filter((r: any) => r.resource_type !== "product_page");

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
          <span>{variantData.full_name}</span>
        </nav>

        {isAlertTraffic && (
          <AlertReturnBanner scope="variant" contextLabel={sp.alert_context} />
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {variantData.full_name}
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            Current valuation, sold comps, price trends, specs, and market intelligence.
          </p>
        </header>

        <VariantHeroImage
          imageUrl={approvedPrimaryImage.url}
          imageAlt={approvedPrimaryImage.alt}
          modelName={variantData.full_name}
        />

        <div className="grid gap-8">

          {/* ═══ LAYER 1: ABOVE-THE-FOLD DECISION LAYER ═══ */}

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
              <div className="mt-2 text-xs text-slate-500">
                {(valuation as any)?._source === "payload_estimate"
                  ? "Estimated from MSRP and market heuristics — no sold listings yet"
                  : "Source: eBay sold listings"}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <a href={`/tools?tool=deal&model=${variantSlug}`} className="text-slate-400 underline hover:text-amber-400 transition-colors">
                  Check a price &rarr;
                </a>
                <a href={`/tools?tool=compare&model=${variantSlug}`} className="text-slate-400 underline hover:text-amber-400 transition-colors">
                  Compare models &rarr;
                </a>
                <a href={`/tools/vehicle-evaluator?model=${variantSlug}`} className="text-slate-400 underline hover:text-amber-400 transition-colors">
                  Evaluate your build &rarr;
                </a>
              </div>

              <div className="mt-4 space-y-4">
                <ConfidenceExplainer
                  confidenceLabel={confidenceLabel}
                  valuationStatus={valuation.confidence ?? "no_data"}
                  observationCount={valuation.total_observation_count ?? 0}
                  hasOutliersPresent={false}
                />

                {marketIntel?.market_state && (
                  <MarketStateBar
                    marketState={marketIntel.market_state}
                    marketStateLabel={marketIntel.market_state_label ?? ""}
                    marketStateDescription={marketIntel.market_state_description ?? ""}
                    alertCTAUrgency={marketIntel.alert_cta_urgency ?? "low"}
                  />
                )}

                <PriceHistoryChart trendRows={trendRows} />

                {marketIntel?.sold_trend && (
                  <SoldTrendBlock
                    median30d={marketIntel.sold_trend.median_30d}
                    median90d={marketIntel.sold_trend.median_90d}
                    count30d={marketIntel.sold_trend.count_30d ?? 0}
                    count90d={marketIntel.sold_trend.count_90d ?? 0}
                    trendPct={marketIntel.sold_trend.trend_pct}
                    trendDirection={marketIntel.sold_trend.trend_direction ?? "insufficient"}
                    lastSaleDaysAgo={marketIntel.sold_trend.last_sale_days_ago}
                  />
                )}

                {marketIntel?.active_market && (
                  <ActiveDealsStrip
                    qualifyingDeals={marketIntel.active_market.qualifying_deals ?? 0}
                    bestDealPrice={marketIntel.active_market.best_deal_price}
                    bestDealScore={marketIntel.active_market.best_deal_score}
                    bestDealUrl={marketIntel.active_market.best_deal_url}
                    soldMedian90d={marketIntel.active_market.sold_median_90d}
                  />
                )}
              </div>
            </section>
          )}

          {insightData?.price_position_band && (
            <MarketInsightSection
              band={insightData.price_position_band}
              score={insightData.deal_score_simple!}
              confidence={insightData.confidence_label!}
              summary={insightData.market_summary_text!}
              recommendation={insightData.recommendation_text!}
            />
          )}

          {isAlertTraffic ? (
            <p className="text-sm text-slate-500">Tracking active for this model</p>
          ) : (
            <PriceAlertSignup
              variantId={variantData.variant_id}
              variantSlug={variantSlug}
              modelName={variantData.full_name}
              mfrSlug={mfrSlug}
              familySlug={familySlug}
              signupSource="variant_page"
            />
          )}

          {/* ═══ LAYER 2: MID-PAGE CONTEXT + CONVERSION LAYER ═══ */}

          {verifiedContent && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              {[verifiedContent.overview_sentence_1, verifiedContent.overview_sentence_2, verifiedContent.overview_sentence_3, verifiedContent.overview_sentence_4].filter(Boolean).map((s, i) => (
                <p key={i} className={`text-slate-300 leading-7${i > 0 ? " mt-3" : ""}`}>{s}</p>
              ))}
              {Array.isArray(verifiedContent.spec_facts) && verifiedContent.spec_facts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Key Facts</h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {verifiedContent.spec_facts.map((f: any, i: number) => (
                      <li key={i}>• {typeof f === "object" ? `${f.label}: ${f.value}${f.qualifier ? ` (${f.qualifier})` : ""}` : f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(verifiedContent.included_facts) && verifiedContent.included_facts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">What&apos;s Included</h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {verifiedContent.included_facts.map((f: any, i: number) => (
                      <li key={i}>• {typeof f === "object" ? f.value : f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(verifiedContent.required_facts) && verifiedContent.required_facts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">What You&apos;ll Need</h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {verifiedContent.required_facts.map((f: any, i: number) => (
                      <li key={i}>• {typeof f === "object" ? f.value : f}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              {specsVerified ? (
                <div className="mt-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 px-4 py-3">
                  <p className="text-xs leading-6 text-emerald-200">
                    Specs verified against a primary manufacturer source for this variant.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/30 px-4 py-3">
                  <p className="text-xs leading-6 text-amber-200">
                    Specification disclosure: these specs are shown for research utility, but individual field verification is still in progress for this variant. Treat them as provisional until confirmed against a primary manufacturer source.
                  </p>
                </div>
              )}
            </CollapsibleSection>
          )}

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
                    <div className="text-2xl font-semibold text-slate-200">{intelligence.demand_score}</div>
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
                    <div className="text-xs text-slate-500 mt-0.5">
                      {intelligence.market_depth === "deep" && "10+ verified sales — strong pricing confidence"}
                      {intelligence.market_depth === "moderate" && "5–9 verified sales — reasonable estimate"}
                      {intelligence.market_depth === "thin" && "3–4 verified sales — treat as directional only"}
                      {intelligence.market_depth === "insufficient" && "Fewer than 3 sales — not enough to value reliably"}
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
              <p className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-800">
                Values are estimated from recent eBay sold listings. Parts listings, lot sales, and statistical outliers are excluded. Updated as new sales are recorded.
              </p>
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

          {/* Where to Buy — affiliate links first */}
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 mt-10 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Where to Buy</h2>
            <div className="space-y-2">
              {(() => {
                const fullName = variantData.full_name;
                const encodedName = encodeURIComponent(fullName);
                const encodedSlug = encodeURIComponent(variantSlug);

                const affiliateLinks = [
                  {
                    key: "ebay",
                    name: "eBay",
                    url: `https://www.ebay.com/sch/i.html?_nkw=${encodedName}&_sacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339148896&customid=${encodedSlug}&toolid=10001&mkevt=1`,
                    badge: { label: "Marketplace", color: "bg-amber-900/40 text-amber-400 border-amber-600/20" },
                  },
                  {
                    key: "amazon",
                    name: "Amazon",
                    url: `https://www.amazon.com/s?k=${encodedName}&tag=rcdatavault-20`,
                    badge: { label: "Retail", color: "bg-slate-500/10 text-slate-400 border-slate-600/20" },
                  },
                  {
                    key: "amain",
                    name: "AMain Hobbies",
                    url: `https://www.amainhobbies.com/search?q=${encodedName}`,
                    badge: { label: "Hobby Shop", color: "bg-emerald-900/40 text-emerald-400 border-emerald-600/20" },
                  },
                ];

                // Add DB purchase links that aren't eBay/Amazon/AMain (manufacturer, others)
                const dbLinks = (purchaseLinks ?? [])
                  .filter((l: any) => !["ebay", "amazon", "amain-hobbies", "amain"].includes(l.retailer_slug?.toLowerCase()))
                  .map((l: any) => ({
                    key: l.retailer_slug,
                    name: l.retailer_name,
                    url: l.affiliate_url || l.product_url,
                    badge: ({
                      manufacturer: { label: "Brand", color: "bg-blue-900/40 text-blue-400 border-blue-600/20" },
                      hobby_specialist: { label: "Hobby Shop", color: "bg-emerald-900/40 text-emerald-400 border-emerald-600/20" },
                    } as Record<string, { label: string; color: string }>)[l.retailer_type] ?? { label: "Shop", color: "bg-slate-500/10 text-slate-400 border-slate-600/20" },
                  }));

                return [...affiliateLinks, ...dbLinks].map((link) => (
                  <a
                    key={link.key}
                    href={link.url}
                    target={link.key === 'ebay' ? '_self' : '_blank'}
                    rel="noopener noreferrer sponsored"
                    className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 hover:border-slate-500 transition-colors group"
                  >
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                      {link.name}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${link.badge.color}`}>
                        {link.badge.label}
                      </span>
                      <svg className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ));
              })()}
            </div>
            <p className="text-xs text-slate-600 mt-3">
              Affiliate links — we may earn a commission. Check retailer for current pricing.
            </p>
          </section>

          <section id="parts" className="mt-10">
            <VariantPartsSection variantSlug={variantSlug} variantName={variantData.full_name} />
          </section>

          <ResourceSection resources={resourceData ?? []} />
          <ToolsBlock />

          {/* ═══ LAYER 3: BOTTOM PROOF LAYER ═══ */}

          {soldListings.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-200">Recent Sold Listings</h2>
                <p className="text-sm text-slate-500 mt-1">Individual sales used to calculate the estimated value above.</p>
              </div>
            <CollapsibleSection title="Show all sales">
              <div className="space-y-3">
                {soldListings.map((listing: any, i: number) => {
                  const Wrapper = listing.listing_url ? "a" : "div";
                  const wrapperProps = listing.listing_url
                    ? { href: listing.listing_url, target: "_blank", rel: "noopener noreferrer" }
                    : {};
                  return (
                    <Wrapper key={i} {...wrapperProps} className="block rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 hover:border-slate-500 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm text-slate-300 leading-5 truncate">
                            {listing.listing_title ?? "Sold listing"}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>{listingSourceLabel(listing.source)}</span>
                            <span>·</span>
                            <span>{fmtDate(listing.observed_at)}</span>
                            {listing.condition_grade_id && (
                              <>
                                <span>·</span>
                                <span className="capitalize">{listing.condition_grade_id}</span>
                              </>
                            )}
                            {listing.listing_url && (
                              <span className="text-amber-400">View on eBay →</span>
                            )}
                          </div>
                        </div>
                        <div className="text-base font-semibold text-amber-400 flex-shrink-0">
                          {fmt(listing.sale_price)}
                        </div>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Sold listing data sourced from eBay completed listings. Prices reflect actual transaction values.
              </p>
            </CollapsibleSection>
            </div>
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
                  <div className="text-xs text-slate-500 mt-0.5">
                    {(valuation.total_observation_count ?? 0) > 20
                      ? "10+ verified sales — strong pricing confidence"
                      : (valuation.total_observation_count ?? 0) > 10
                      ? "5–9 verified sales — reasonable estimate"
                      : "Fewer sales — treat as directional only"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Trend</div>
                  <div className="mt-1 text-lg font-medium text-white">
                    {trendDirection === "up" ? "rising" : trendDirection === "down" ? "falling" : "stable"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {trendDirection === "up" && "Recent prices higher than 90-day average"}
                    {trendDirection === "down" && "Recent prices lower than 90-day average"}
                    {!trendDirection && "Prices have been consistent over time"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 p-4">
                  <div className="text-sm text-slate-400">Data points</div>
                  <div className="mt-1 text-lg font-medium text-white">{valuation.total_observation_count}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Spread between low and high sold comps in the dataset</div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          <div className="mt-8 space-y-6">

            {siblingData.length > 0 && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
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
                      {v.valuation?.fair_value && (
                        <div className="mt-1.5 text-sm font-semibold text-amber-400">
                          ~{fmt(v.valuation.fair_value)}
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
