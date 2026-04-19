import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CollapsibleSection from "@/components/CollapsibleSection";
import PriceAlertSignup from "@/components/PriceAlertSignup";
import RecentlyViewedVariants from "@/components/RecentlyViewedVariants";
import Link from "next/link";
import AlertReturnBanner from "@/components/alerts/AlertReturnBanner";
import VariantPartsSection from "@/components/parts/VariantPartsSection";
import PriceHistoryChart from "@/components/market/PriceHistoryChart";
import PricingSnapshot from "@/components/variant/PricingSnapshot";
import HeroDecisionSurface from "@/components/variant/HeroDecisionSurface";
import MarketIntelligenceCard from "@/components/variant/MarketIntelligenceCard";
import BestDeals from "@/components/variant/BestDeals";
import QuickLinks from "@/components/variant/QuickLinks";
import {
  HeroDecisionSurfaceSkeleton,
  PricingSnapshotSkeleton,
  MarketIntelligenceCardSkeleton,
  PriceHistoryChartSkeleton,
  BestDealsSkeleton,
  AlertSignupSkeleton,
  SecondarySkeleton,
} from "@/components/variant/skeletons";
import { ArrowUpRight, Search } from "lucide-react";
import { getVariantPagePayload } from "@/lib/variant-page";

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

function CompactHeroImage({
  imageUrl,
  imageAlt,
  modelName,
}: {
  imageUrl: string | null;
  imageAlt: string | null;
  modelName: string;
}) {
  if (imageUrl) {
    return (
      <div className="mb-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <img
          src={imageUrl}
          alt={imageAlt || `${modelName} reference image`}
          className="h-full w-full object-cover aspect-[16/9] max-h-56 sm:max-h-64"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    );
  }
  return (
    <p className="mb-4 text-xs text-slate-600">Reference image pending review</p>
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

function cap(s: string | null | undefined) {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function specsAreIndividuallyVerified(specs: any) {
  return Boolean(specs?.spec_verified && specs?.spec_verified_at);
}

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

/* ═══════════════════════════════════════════════════════════════
   TIER 2: PRICING SECTION (async, behind first Suspense)
   Fetches: RPC payload (retail + segmented_pricing) + valuation
   Renders: HeroDecisionSurface + PricingSnapshot
   ═══════════════════════════════════════════════════════════════ */
async function PricingSection({
  variantId,
  variantSlug,
  isAlertTraffic,
  mfrSlug,
  familySlug,
  modelName,
}: {
  variantId: string;
  variantSlug: string;
  isAlertTraffic: boolean;
  mfrSlug: string;
  familySlug: string;
  modelName: string;
}) {
  const [
    { data: valuationData },
    { data: payloadData },
    { data: insightData },
    variantPayload,
  ] = await Promise.all([
    supabase
      .from("v_variant_valuations_clean")
      .select("fair_value, low_value, high_value, confidence, total_observation_count, last_observation_at")
      .eq("variant_id", variantId)
      .single(),
    supabase.from("mv_variant_payload").select("*").eq("variant_slug", variantSlug).single(),
    supabase
      .from("v_variant_page_payload")
      .select("price_position_band, deal_score_simple, confidence_label, market_summary_text, recommendation_text, valuation_median_price")
      .eq("variant_slug", variantSlug)
      .maybeSingle(),
    getVariantPagePayload(variantSlug),
  ]);

  const retail = variantPayload?.retail ?? { retail_current_price: null, retail_price_currency: null, retail_price_source: null, retail_price_last_verified_at: null };
  const segmentedPricing = variantPayload?.segmented_pricing ?? { nib: null, used_complete: null, roller: null, slider: null };

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

  const intelligence = payloadData?.intelligence as any;
  const approvedPrimaryImage = getApprovedPrimaryImage(payloadData);

  return (
    <>
      <CompactHeroImage
        imageUrl={approvedPrimaryImage.url}
        imageAlt={approvedPrimaryImage.alt}
        modelName={modelName}
      />

      <HeroDecisionSurface
        retail={{ retail_current_price: retail.retail_current_price, retail_price_source: retail.retail_price_source }}
        segmentedPricing={{ nib: segmentedPricing.nib, used_complete: segmentedPricing.used_complete, roller: segmentedPricing.roller }}
        hasSufficientData={payloadVal?.has_sufficient_data ?? (valuation?.total_observation_count ?? 0) >= 5}
        observationCount={valuation?.total_observation_count ?? 0}
        demandLabel={intelligence?.demand_label ?? null}
        hasDeals={true}
      />

      <PricingSnapshot
        retail={{ retail_current_price: retail.retail_current_price, retail_price_source: retail.retail_price_source }}
        segmentedPricing={{ nib: segmentedPricing.nib, used_complete: segmentedPricing.used_complete, roller: segmentedPricing.roller }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TIER 3: MARKET + DEALS SECTION (async, second Suspense)
   Fetches: trends, listings, valuation, payload, insight
   Renders: MarketIntelligenceCard, PriceHistoryChart, BestDeals, PriceAlertSignup
   ═══════════════════════════════════════════════════════════════ */
async function MarketDealsSection({
  variantId,
  variantSlug,
  isAlertTraffic,
  mfrSlug,
  familySlug,
  modelName,
}: {
  variantId: string;
  variantSlug: string;
  isAlertTraffic: boolean;
  mfrSlug: string;
  familySlug: string;
  modelName: string;
}) {
  const [
    { data: valuationData },
    { data: trendData },
    { data: listingsData },
    { data: payloadData },
    { data: insightData },
    variantPayload,
  ] = await Promise.all([
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
      .select("price_position_band, deal_score_simple, confidence_label, market_summary_text, recommendation_text, valuation_median_price")
      .eq("variant_slug", variantSlug)
      .maybeSingle(),
    getVariantPagePayload(variantSlug),
  ]);

  const retail = variantPayload?.retail ?? { retail_current_price: null, retail_price_currency: null, retail_price_source: null, retail_price_last_verified_at: null };
  const segmentedPricing = variantPayload?.segmented_pricing ?? { nib: null, used_complete: null, roller: null, slider: null };

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

  const intelligence = payloadData?.intelligence as any;
  const approvedPrimaryImage = getApprovedPrimaryImage(payloadData);

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

  const topSignalText = (() => {
    if (segmentedPricing.used_complete) {
      return `Used prices track near the used-market median of ${fmt(segmentedPricing.used_complete.median)}`;
    }
    if (segmentedPricing.nib && retail.retail_current_price != null && segmentedPricing.nib.median > retail.retail_current_price) {
      return "NIB resale is holding above current retail";
    }
    if (segmentedPricing.roller && segmentedPricing.roller.comp_count >= 3) {
      return "Roller pricing suggests an active project-build market";
    }
    return null;
  })();

  const insightHeadline = (() => {
    if (segmentedPricing.used_complete) return `Used units typically sell for ${fmt(segmentedPricing.used_complete.median)}`;
    if (segmentedPricing.nib) return `Sealed/NIB units are selling for ${fmt(segmentedPricing.nib.median)}`;
    if (segmentedPricing.roller) return `Rolling chassis trade around ${fmt(segmentedPricing.roller.median)}`;
    return insightData?.market_summary_text ?? null;
  })();

  const liquidityLabel = intelligence?.market_depth ?? (
    (valuation?.total_observation_count ?? 0) > 20 ? "deep"
    : (valuation?.total_observation_count ?? 0) > 10 ? "moderate"
    : (valuation?.total_observation_count ?? 0) > 3 ? "thin"
    : "insufficient"
  );

  return (
    <>
      <MarketIntelligenceCard
        trendDirection={trendDirection}
        buyZone={valuation?.low_value ?? null}
        overpayZone={valuation?.high_value ?? null}
        liquidityLabel={liquidityLabel}
        insightHeadline={insightHeadline}
        topSignalText={topSignalText}
      />

      {trendRows.length > 0 && (
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <PriceHistoryChart trendRows={trendRows} />
        </section>
      )}

      <BestDeals
        soldListings={soldListings}
        fairValue={valuation?.fair_value ?? null}
        variantImageUrl={approvedPrimaryImage.url}
        modelName={modelName}
      />

      <div id="alert">
        {isAlertTraffic ? (
          <p className="text-sm text-slate-500">Tracking active for this model</p>
        ) : (
          <PriceAlertSignup
            variantId={variantId}
            variantSlug={variantSlug}
            modelName={modelName}
            mfrSlug={mfrSlug}
            familySlug={familySlug}
            signupSource="variant_page"
            referencePrice={
              segmentedPricing.used_complete?.median
              ?? segmentedPricing.nib?.median
              ?? retail.retail_current_price
            }
            referenceLabel={
              segmentedPricing.used_complete ? "used resale"
              : segmentedPricing.nib ? "NIB resale"
              : retail.retail_current_price != null ? "retail"
              : null
            }
          />
        )}
      </div>

      {soldListings.length > 0 && (
        <p className="text-xs text-slate-600">
          Updated {fmtDate(valuation?.last_observation_at)} · {soldListings.length} sold listings · Refreshes hourly
        </p>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TIER 3B: SECONDARY SECTION (async, parallel Suspense)
   Fetches: specs, content, purchase links
   Renders: Verified content, Specifications, Where to Buy
   ═══════════════════════════════════════════════════════════════ */
async function SecondarySection({
  variantId,
  variantSlug,
  modelName,
}: {
  variantId: string;
  variantSlug: string;
  modelName: string;
}) {
  const [
    { data: specsData },
    { data: verifiedContent },
    { data: purchaseLinks },
  ] = await Promise.all([
    supabase.from("variant_specs").select("*").eq("variant_id", variantId).single(),
    supabase
      .from("variant_verified_content")
      .select("overview_sentence_1, overview_sentence_2, overview_sentence_3, overview_sentence_4, spec_facts, included_facts, required_facts")
      .eq("variant_slug", variantSlug)
      .eq("verification_status", "verified")
      .eq("render_status", "render_verified_only")
      .maybeSingle(),
    supabase
      .from("variant_purchase_links")
      .select("retailer_name, retailer_slug, retailer_type, affiliate_url, product_url, price_usd, in_stock, display_priority")
      .eq("variant_id", variantId)
      .eq("is_active", true)
      .order("display_priority", { ascending: true }),
  ]);

  const specRows = buildSpecRows(specsData);
  const specsVerified = specsAreIndividuallyVerified(specsData);
  const fullName = modelName;
  const encodedName = encodeURIComponent(fullName);
  const encodedSlug = encodeURIComponent(variantSlug);

  return (
    <>
      {verifiedContent && (
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          {[verifiedContent.overview_sentence_1, verifiedContent.overview_sentence_2].filter(Boolean).map((s: string, i: number) => (
            <p key={i} className={`text-sm text-slate-300 leading-6${i > 0 ? " mt-2" : ""}`}>{s}</p>
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
          {specsVerified && (
            <div className="mt-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 px-4 py-3">
              <p className="text-xs leading-6 text-emerald-200">
                Specs verified against a primary manufacturer source.
              </p>
            </div>
          )}
        </CollapsibleSection>
      )}

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Where to Buy</h2>
        <div className="space-y-2">
          {(() => {
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
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
              </a>
            ));
          })()}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          Affiliate links — we may earn a commission.
        </p>
      </section>

      <section id="parts">
        <VariantPartsSection variantSlug={variantSlug} variantName={modelName} />
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TIER 4: LAZY SECTION (async, lowest priority Suspense)
   Fetches: resources, siblings, sold listings
   Renders: QuickLinks, sold listings, siblings, compare CTA
   ═══════════════════════════════════════════════════════════════ */
async function LazySection({
  variantId,
  variantSlug,
  modelFamilyId,
  mfrName,
  mfrSlug,
  familyName,
  familySlug,
  modelName,
}: {
  variantId: string;
  variantSlug: string;
  modelFamilyId: string;
  mfrName: string;
  mfrSlug: string;
  familyName: string;
  familySlug: string;
  modelName: string;
}) {
  const [
    { data: resourceData },
    { data: siblingVariants },
    { data: listingsData },
  ] = await Promise.all([
    supabase.rpc("get_variant_resources", { p_variant_id: variantId }),
    supabase
      .from("variants")
      .select("variant_id, full_name, slug")
      .eq("model_family_id", modelFamilyId)
      .neq("slug", variantSlug)
      .limit(6),
    supabase
      .from("v_price_observations")
      .select("*")
      .eq("variant_id", variantId)
      .order("observed_at", { ascending: false })
      .limit(12),
  ]);

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

  const soldListings: any[] = listingsData ?? [];

  return (
    <>
      <QuickLinks resources={resourceData ?? []} variantSlug={variantSlug} />

      {soldListings.length > 0 && (
        <CollapsibleSection title="All Sold Listings">
          <div className="space-y-2">
            {soldListings.map((listing: any, i: number) => {
              const Wrapper = listing.listing_url ? "a" : "div";
              const wrapperProps = listing.listing_url
                ? { href: listing.listing_url, target: "_blank", rel: "noopener noreferrer" }
                : {};
              return (
                <Wrapper key={i} {...wrapperProps} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 hover:border-slate-500 transition-colors cursor-pointer">
                  <div className="min-w-0">
                    <div className="text-sm text-slate-300 leading-5 truncate">
                      {listing.listing_title ?? "Sold listing"}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{listingSourceLabel(listing.source)}</span>
                      <span>·</span>
                      <span>{fmtDate(listing.observed_at)}</span>
                      {listing.condition_grade_id && (
                        <>
                          <span>·</span>
                          <span className="capitalize">{listing.condition_grade_id}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-amber-400 flex-shrink-0 ml-3">
                    {fmt(listing.sale_price)}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {siblingData.length > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">More from {mfrName}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {siblingData.map((v: any) => (
              <Link
                key={v.slug}
                className="rounded-xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-600"
                href={`/rc/${mfrSlug}/${familySlug}/${v.slug}`}
              >
                <div className="text-sm font-medium text-white leading-5">{v.full_name}</div>
                {v.valuation?.fair_value && (
                  <div className="mt-1 text-sm font-semibold text-amber-400">
                    ~{fmt(v.valuation.fair_value)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-base font-semibold text-white">Compare more RC models before you decide.</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          <Link
            href={`/rc/${mfrSlug}/${familySlug}`}
            className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            {familyName} family
          </Link>
          <Link
            href={`/rc/${mfrSlug}`}
            className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            All {mfrName}
          </Link>
        </div>
      </section>

      <RecentlyViewedVariants
        canonicalPath={`/rc/${mfrSlug}/${familySlug}/${variantSlug}`}
        fullName={modelName}
        manufacturerName={mfrName}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   Tier 1: Only blocks on identity lookup (fast, indexed).
   Everything else streams via Suspense boundaries.
   ═══════════════════════════════════════════════════════════════ */
export default async function VariantPage({ params, searchParams }: PageProps) {
  const { manufacturer, family, variant: variantSlug } = await params;
  const sp = await searchParams;
  const isAlertTraffic = sp.src === "alert";

  /* ─── Tier 1: identity lookup (only blocking query) ─── */
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
  const mfr = (variantData.model_families as any)?.manufacturers;
  const mfrName: string = mfr?.name ?? manufacturer;
  const mfrSlug: string = mfr?.slug ?? manufacturer;
  const familyName: string = (variantData.model_families as any)?.name ?? family;
  const familySlug = family;

  /* ─── Structured data (sync, from identity) ─── */
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: variantData.full_name,
    brand: { "@type": "Brand", name: mfrName },
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ─── TIER 1: INSTANT SHELL (sync) ─── */}

        <nav className="mb-6 text-sm text-slate-400">
          <Link className="hover:text-white" href={`/rc/${mfrSlug}`}>{mfrName}</Link>
          <span className="mx-2">/</span>
          <Link className="hover:text-white" href={`/rc/${mfrSlug}/${familySlug}`}>{familyName}</Link>
          <span className="mx-2">/</span>
          <span>{variantData.full_name}</span>
        </nav>

        {isAlertTraffic && (
          <AlertReturnBanner scope="variant" contextLabel={sp.alert_context} />
        )}

        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {variantData.full_name}
          </h1>
        </header>

        <div className="space-y-6">

          {/* ─── TIER 2: PRICING (first data to arrive) ─── */}
          <Suspense fallback={<><HeroDecisionSurfaceSkeleton /><PricingSnapshotSkeleton /></>}>
            <PricingSection
              variantId={variantId}
              variantSlug={variantSlug}
              isAlertTraffic={isAlertTraffic}
              mfrSlug={mfrSlug}
              familySlug={familySlug}
              modelName={variantData.full_name}
            />
          </Suspense>

          {/* ─── TIER 3: MARKET + DEALS + ALERT ─── */}
          <Suspense fallback={<><MarketIntelligenceCardSkeleton /><PriceHistoryChartSkeleton /><BestDealsSkeleton /><AlertSignupSkeleton /></>}>
            <MarketDealsSection
              variantId={variantId}
              variantSlug={variantSlug}
              isAlertTraffic={isAlertTraffic}
              mfrSlug={mfrSlug}
              familySlug={familySlug}
              modelName={variantData.full_name}
            />
          </Suspense>

          {/* ─── TIER 3B: SECONDARY (specs, content, buy, parts) ─── */}
          <Suspense fallback={<SecondarySkeleton />}>
            <SecondarySection
              variantId={variantId}
              variantSlug={variantSlug}
              modelName={variantData.full_name}
            />
          </Suspense>

          {/* ─── TIER 4: LAZY (links, siblings, sold listings, CTA) ─── */}
          <Suspense fallback={null}>
            <LazySection
              variantId={variantId}
              variantSlug={variantSlug}
              modelFamilyId={modelFamilyId}
              mfrName={mfrName}
              mfrSlug={mfrSlug}
              familyName={familyName}
              familySlug={familySlug}
              modelName={variantData.full_name}
            />
          </Suspense>

        </div>
      </div>
    </main>
  );
}
