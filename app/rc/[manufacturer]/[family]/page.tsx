import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ResourceSection from "@/components/resources/ResourceSection";
import ToolsBlock from "@/components/tools/ToolsBlock";
import FamilyMarketBand from "@/components/family/FamilyMarketBand";
import FamilyBestPicks from "@/components/family/FamilyBestPicks";

export const dynamic = "force-dynamic";

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

function formatValue(v: number | null) {
  if (!v) return null;
  return `$${Math.round(v).toLocaleString()}`;
}

const DEPTH_BADGE: Record<string, { text: string; cls: string }> = {
  deep: { text: "Deep", cls: "bg-emerald-900/40 text-emerald-400" },
  moderate: { text: "Moderate", cls: "bg-amber-900/40 text-amber-400" },
  thin: { text: "Thin", cls: "bg-slate-800 text-slate-400" },
};

export default async function FamilyPage({ params }: { params: Promise<{ manufacturer: string; family: string }> }) {
  const { manufacturer, family } = await params;

  const { data, error } = await (supabase.rpc as any)("get_family_page", { p_manufacturer_slug: manufacturer, p_family_slug: family });

  if (error) console.error("[family page] RPC error:", JSON.stringify(error));

  const page = data as PageData | null;

  if (!page || !page.variants?.length) {
    console.error("[family page] notFound — manufacturer:", manufacturer, "family:", family, "data:", JSON.stringify(data));
    notFound();
  }

  const { data: resourceData } = await (supabase.rpc as any)("get_family_resources", {
    p_family_id: page.model_family_id,
  });

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

        <div className="grid gap-4 sm:grid-cols-2">
          {page.variants.map((v) => {
            const depthBadge = v.market_depth ? DEPTH_BADGE[v.market_depth] : null;

            return (
              <a
                key={v.variant_slug}
                href={v.canonical_url ?? `/rc/${page.manufacturer_slug}/${page.family_slug}/${v.variant_slug}`}
                className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-lg font-medium text-white">{v.variant_name}</div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {v.is_best_data && (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">Most Data</span>
                    )}
                    {v.is_most_active && v.obs_30d >= 3 && (
                      <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-400">Most Active</span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {v.fair_value ? (
                    <span className="text-xl font-semibold text-amber-400">{formatValue(v.fair_value)}</span>
                  ) : (
                    <span className="text-sm text-slate-500">No valuation yet</span>
                  )}
                  {v.low != null && v.high != null && (
                    <span className="text-sm text-slate-400">{formatValue(v.low)} – {formatValue(v.high)}</span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {depthBadge && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${depthBadge.cls}`}>
                      {depthBadge.text}
                    </span>
                  )}
                  {v.has_sufficient_data && v.confidence && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      v.confidence === "reliable"
                        ? "bg-emerald-900/40 text-emerald-400"
                        : "bg-amber-900/40 text-amber-400"
                    }`}>
                      {v.confidence === "reliable" ? "High Confidence" : "Est."}
                    </span>
                  )}
                  {v.obs_30d > 0 && (
                    <span className="text-xs text-slate-500">{v.obs_30d} sales · 30d</span>
                  )}
                  {v.obs_count != null && v.obs_count > 0 && (
                    <span className="text-xs text-slate-500">{v.obs_count} total</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
