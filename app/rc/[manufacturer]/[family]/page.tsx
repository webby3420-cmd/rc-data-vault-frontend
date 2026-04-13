import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ResourceSection from "@/components/resources/ResourceSection";
import ToolsBlock from "@/components/tools/ToolsBlock";
import FamilyMarketBand from "@/components/family/FamilyMarketBand";
import FamilyBestPicks from "@/components/family/FamilyBestPicks";
import FamilyWatchCTA from "@/components/family/FamilyWatchCTA";
import AlertReturnBanner from "@/components/alerts/AlertReturnBanner";
import FamilyEcosystemBlock from "@/components/family/FamilyEcosystemBlock";
import FamilyVariantCoverage from "@/components/family/FamilyVariantCoverage";
import FamilyMarketOpportunitySlot from "@/components/family/FamilyMarketOpportunitySlot";

export const revalidate = 3600;
export const dynamicParams = true;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Variant = {
  variant_slug: string;
  variant_name: string;
  fair_value: number | null;
  low: number | null;
  high: number | null;
  confidence: string | null;
  valuation_status: string | null;
  obs_count: number | null;
  candidate_count: number | null;
  has_sufficient_data: boolean;
  obs_30d: number;
  market_depth: string | null;
  is_best_data: boolean;
  is_most_active: boolean;
  canonical_url: string;
};

type FamilyMarketSummary = {
  family_state: string;
  family_state_label: string;
  family_state_description: string;
  total_observations: number;
  obs_30d: number;
  valued_variants: number;
  total_variants: number;
  min_value: number | null;
  max_value: number | null;
  typical_value: number;
  best_variant_slug: string | null;
  most_active_variant_slug: string | null;
  family_confidence: string;
  family_confidence_label: string;
  family_confidence_description: string;
};

type PageData = {
  model_family_id: string;
  manufacturer_slug: string;
  manufacturer_name: string;
  family_slug: string;
  family_name: string;
  variants: Variant[];
  family_market_summary?: FamilyMarketSummary;
};

export async function generateMetadata({ params }: { params: Promise<{ manufacturer: string; family: string }> }): Promise<Metadata> {
  const { manufacturer, family } = await params;
  const { data } = await (supabase.rpc as any)("get_family_page", { p_manufacturer_slug: manufacturer, p_family_slug: family });
  if (!data) return { title: "RC Data Vault" };
  return {
    title: `${data.manufacturer_name} ${data.family_name} Value & Price Guide | RC Data Vault`,
    description: `Used market values for the ${data.manufacturer_name} ${data.family_name} based on real sold listings.`,
  };
}



export default async function FamilyPage({ params, searchParams }: { params: Promise<{ manufacturer: string; family: string }>; searchParams: Promise<{ src?: string; alert_context?: string }> }) {
  const { manufacturer, family } = await params;
  const sp = await searchParams;
  const isAlertTraffic = sp.src === "alert";

  const { data, error } = await (supabase.rpc as any)("get_family_page", { p_manufacturer_slug: manufacturer, p_family_slug: family });

  const page = data as PageData | null;

  // Distinguish RPC failure (transient → 500) from genuinely missing route (→ 404)
  if (error && !page) {
    console.error("[family page] RPC error (returning 500, not 404):", JSON.stringify(error));
    throw new Error(`Family page RPC failed for ${manufacturer}/${family}`);
  }

  if (!page || !page.variants?.length) {
    notFound();
  }

  const [{ data: resourceData }, { data: ecosystemData }] = await Promise.all([
    (supabase.rpc as any)("get_family_resources", { p_family_id: page.model_family_id }),
    (supabase.rpc as any)("get_family_ecosystem", { p_family_slug: page.family_slug }),
  ]);

  const fms = page.family_market_summary;

  const bestVariantName = fms?.best_variant_slug
    ? page.variants.find((v) => v.variant_slug === fms.best_variant_slug)?.variant_name ?? null
    : null;
  const mostActiveName = fms?.most_active_variant_slug
    ? page.variants.find((v) => v.variant_slug === fms.most_active_variant_slug)?.variant_name ?? null
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href={`/rc/${page.manufacturer_slug}`}>{page.manufacturer_name}</a>
          <span className="mx-2">/</span>
          <span>{page.family_name}</span>
        </nav>

        {isAlertTraffic && (
          <AlertReturnBanner scope="family" contextLabel={sp.alert_context} />
        )}

        <h1 className="mb-4 text-3xl font-semibold text-white">{page.manufacturer_name} {page.family_name} Value &amp; Price Guide</h1>
        <p className="mb-6 max-w-2xl text-slate-400 leading-7">Browse used {page.manufacturer_name} {page.family_name} values by variant. All values are based on real sold listings from eBay.</p>

        {fms && (
          <div className="mb-8">
            <FamilyMarketBand
              familyState={fms.family_state as any}
              familyStateLabel={fms.family_state_label}
              familyStateDescription={fms.family_state_description}
              minValue={fms.min_value}
              maxValue={fms.max_value}
              typicalValue={fms.typical_value}
              valuedVariants={fms.valued_variants}
              totalVariants={fms.total_variants}
              familyConfidenceLabel={fms.family_confidence_label}
              familyConfidenceDescription={fms.family_confidence_description}
            />
          </div>
        )}

        <div className="mb-10 space-y-6">
          <ResourceSection resources={resourceData ?? []} />
          <ToolsBlock />
        </div>

        {fms && fms.valued_variants >= 2 && (
          <div className="mb-6">
            <FamilyBestPicks
              bestVariantSlug={fms.best_variant_slug}
              bestVariantName={bestVariantName}
              mostActiveSlug={fms.most_active_variant_slug}
              mostActiveName={mostActiveName}
              manufacturerSlug={page.manufacturer_slug}
              familySlug={page.family_slug}
            />
          </div>
        )}

        {fms && fms.total_variants >= 2 && (
          <div className="mb-6">
            {isAlertTraffic ? (
              <p className="text-sm text-slate-500">Tracking active for this family</p>
            ) : (
              <FamilyWatchCTA
                familyName={page.family_name}
                manufacturerName={page.manufacturer_name}
                modelFamilyId={page.model_family_id}
                familySlug={page.family_slug}
                manufacturerSlug={page.manufacturer_slug}
                totalVariants={fms.total_variants}
              />
            )}
          </div>
        )}

        <FamilyVariantCoverage
          variants={page.variants}
          summary={fms ?? { family_state: "no_data", total_variants: 0 }}
          manufacturerSlug={page.manufacturer_slug}
          familySlug={page.family_slug}
        />

        <div className="mt-8">
          <FamilyEcosystemBlock ecosystem={ecosystemData ?? null} />
        </div>

        <FamilyMarketOpportunitySlot />
      </div>
    </main>
  );
}
