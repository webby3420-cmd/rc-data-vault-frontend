import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ResourceSection from "@/components/resources/ResourceSection";

export const revalidate = 3600;
export const dynamicParams = true;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Family = {
  family_slug: string;
  family_name: string;
  variant_count: number;
};

type HubStats = {
  total_observations: number;
  families_with_data: number;
  total_variants: number;
  total_families: number;
  valued_variants: number;
  min_value: number;
  max_value: number;
  typical_value: number;
  deep_markets: number;
  moderate_markets: number;
  thin_markets: number;
};

type PageData = {
  manufacturer_id: string;
  manufacturer_slug: string;
  manufacturer_name: string;
  families: Family[];
  hub_stats?: HubStats;
};

type FamilyIntel = {
  familySlug: string;
  familyName: string;
  medianPrice: number | null;
  p25Price: number | null;
  p75Price: number | null;
  marketDepth: string | null;
  observationCount: number;
  variantCount: number;
  valuedVariantCount: number;
  trendDirection: string | null;
  topVariantSlug: string | null;
  topVariantName: string | null;
};

function pickField(row: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeDepth(value: string | null | undefined): "deep" | "moderate" | "thin" | null {
  if (!value) return null;
  const v = value.toLowerCase().trim();

  if (["deep", "strong", "high"].includes(v)) return "deep";
  if (["moderate", "medium"].includes(v)) return "moderate";
  if (["thin", "developing", "limited", "light", "low"].includes(v)) return "thin";

  return null;
}

function normalizeTrend(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.toLowerCase().trim();
  if (["up", "rising", "increase", "increasing"].includes(v)) return "up";
  if (["down", "falling", "decrease", "decreasing"].includes(v)) return "down";
  if (["flat", "stable", "neutral"].includes(v)) return "stable";
  return v;
}

function depthRank(depth: string | null | undefined) {
  const normalized = normalizeDepth(depth);
  if (normalized === "deep") return 3;
  if (normalized === "moderate") return 2;
  if (normalized === "thin") return 1;
  return 0;
}

function formatMoney(value: number | null | undefined) {
  if (value == null) return "—";
  return `$${Math.round(value).toLocaleString()}`;
}

function formatCount(value: number | null | undefined) {
  if (value == null) return "0";
  return Math.round(value).toLocaleString();
}

function depthTone(depth: string | null | undefined) {
  const normalized = normalizeDepth(depth);
  if (normalized === "deep") {
    return "border-emerald-800/70 bg-emerald-950/40 text-emerald-300";
  }
  if (normalized === "moderate") {
    return "border-amber-800/70 bg-amber-950/30 text-amber-300";
  }
  if (normalized === "thin") {
    return "border-slate-700 bg-slate-950 text-slate-300";
  }
  return "border-slate-700 bg-slate-950 text-slate-300";
}

function depthLabel(depth: string | null | undefined) {
  const normalized = normalizeDepth(depth);
  if (!normalized) return null;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  return sorted[middle];
}

function normalizeFamilyIntel(row: Record<string, any>, family: Family): FamilyIntel {
  return {
    familySlug: String(
      pickField(row, ["family_slug", "model_family_slug", "slug"]) ?? family.family_slug
    ),
    familyName: String(
      pickField(row, ["family_name", "model_family_name", "name"]) ?? family.family_name
    ),
    medianPrice: toNumber(
      pickField(row, ["median_price", "median_value", "fair_value_median", "family_median_price"])
    ),
    p25Price: toNumber(
      pickField(row, ["p25_price", "p25_value", "low_price_band", "price_p25"])
    ),
    p75Price: toNumber(
      pickField(row, ["p75_price", "p75_value", "high_price_band", "price_p75"])
    ),
    marketDepth: String(
      pickField(row, ["market_depth", "depth_label", "depth_bucket"]) ?? ""
    ) || null,
    observationCount:
      toNumber(
        pickField(row, [
          "observation_count",
          "obs_count",
          "total_observation_count",
          "sales_count",
          "sold_count",
        ])
      ) ?? 0,
    variantCount:
      toNumber(
        pickField(row, ["variant_count", "tracked_variant_count", "variants_tracked"])
      ) ?? family.variant_count,
    valuedVariantCount:
      toNumber(
        pickField(row, ["valued_variant_count"])
      ) ?? 0,
    trendDirection:
      normalizeTrend(
        String(
          pickField(row, ["trend_direction", "trend_label", "price_trend"]) ?? ""
        )
      ) ?? null,
    topVariantSlug: String(
      pickField(row, ["top_variant_slug", "leading_variant_slug", "best_variant_slug"]) ?? ""
    ) || null,
    topVariantName: String(
      pickField(row, ["top_variant_name", "leading_variant_name", "best_variant_name"]) ?? ""
    ) || null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ manufacturer: string }>;
}): Promise<Metadata> {
  const { manufacturer } = await params;
  const { data } = await supabase.rpc("get_manufacturer_page", {
    p_manufacturer_slug: manufacturer,
  });

  if (!data) return { title: "RC Data Vault" };

  return {
    title: `${data.manufacturer_name} RC Values, Families & Market Data | RC Data Vault`,
    description: `Browse ${data.manufacturer_name} RC family pricing, tracked variants, sold listing activity, and market depth using real market data.`,
  };
}

export default async function ManufacturerPage({
  params,
}: {
  params: Promise<{ manufacturer: string }>;
}) {
  const { manufacturer } = await params;

  const { data } = await supabase.rpc("get_manufacturer_page", {
    p_manufacturer_slug: manufacturer,
  });

  const page = data as PageData | null;

  if (!page || !page.families?.length) notFound();

  const familySlugs = page.families.map((family) => family.family_slug);

  const [
    { data: rawFamilyIntelligence },
    { data: manufacturerVerifiedContent },
  ] = await Promise.all([
    supabase
      .from("mv_family_intelligence")
      .select("*")
      .in("family_slug", familySlugs),
    supabase
      .from("manufacturer_verified_content")
      .select(
        "overview_sentence_1, overview_sentence_2, overview_sentence_3, overview_sentence_4"
      )
      .eq("manufacturer_slug", manufacturer)
      .eq("verification_status", "verified")
      .eq("render_status", "render_verified_only")
      .maybeSingle(),
  ]);

  const { data: resourceData } = await supabase.rpc("get_manufacturer_resources", {
    p_manufacturer_id: page.manufacturer_id,
  });

  const familyIntelMap = new Map<string, FamilyIntel>();

  for (const family of page.families) {
    const matchingRow =
      (rawFamilyIntelligence ?? []).find((row: any) => {
        const slug = String(
          pickField(row, ["family_slug", "model_family_slug", "slug"]) ?? ""
        );
        return slug === family.family_slug;
      }) ?? null;

    familyIntelMap.set(
      family.family_slug,
      normalizeFamilyIntel(matchingRow ?? {}, family)
    );
  }

  const familyRows = page.families
    .map((family) => familyIntelMap.get(family.family_slug)!)
    .sort((a, b) => {
      const depthDiff = depthRank(b.marketDepth) - depthRank(a.marketDepth);
      if (depthDiff !== 0) return depthDiff;

      const obsDiff = b.observationCount - a.observationCount;
      if (obsDiff !== 0) return obsDiff;

      return (b.medianPrice ?? 0) - (a.medianPrice ?? 0);
    });

  const totalVariantsTracked = page.families.reduce(
    (sum, family) => sum + (family.variant_count ?? 0),
    0
  );

  const hubStats = page.hub_stats;

  const totalObservations = hubStats?.total_observations ?? familyRows.reduce(
    (sum, family) => sum + (family.observationCount ?? 0),
    0
  );

  const familiesWithMarketData = hubStats?.families_with_data ?? familyRows.filter(
    (family) => family.observationCount > 0
  ).length;

  const familyMedians = familyRows
    .map((family) => family.medianPrice)
    .filter((value): value is number => value != null);

  const lowestFamilyMedian =
    familyMedians.length > 0 ? Math.min(...familyMedians) : null;
  const highestFamilyMedian =
    familyMedians.length > 0 ? Math.max(...familyMedians) : null;
  const typicalFamilyMedian = median(familyMedians);

  const depthCounts = hubStats
    ? {
        deep: hubStats.deep_markets ?? 0,
        moderate: hubStats.moderate_markets ?? 0,
        thin: hubStats.thin_markets ?? 0,
      }
    : familyRows.reduce(
        (acc, family) => {
          const vc = family.valuedVariantCount;
          if (vc >= 2) acc.deep += 1;
          else if (vc === 1) acc.moderate += 1;
          else acc.thin += 1;
          return acc;
        },
        { deep: 0, moderate: 0, thin: 0 }
      );

  const highestMedianFamily =
    familyRows
      .filter((family) => family.medianPrice != null)
      .sort((a, b) => (b.medianPrice ?? 0) - (a.medianPrice ?? 0))[0] ?? null;

  const mostActiveFamily =
    familyRows
      .filter((family) => family.observationCount > 0)
      .sort((a, b) => b.observationCount - a.observationCount)[0] ?? null;

  const strongestDepthFamily =
    familyRows
      .filter((family) => normalizeDepth(family.marketDepth) != null)
      .sort((a, b) => {
        const depthDiff = depthRank(b.marketDepth) - depthRank(a.marketDepth);
        if (depthDiff !== 0) return depthDiff;
        return b.observationCount - a.observationCount;
      })[0] ?? null;

  const topFamilyLinks = familyRows.slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link className="hover:text-white" href="/rc">
            RC Vehicle Values
          </Link>
          <span className="mx-2">/</span>
          <span>{page.manufacturer_name}</span>
        </nav>

        <header className="rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Manufacturer market hub
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {page.manufacturer_name} RC Values &amp; Market Guide
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Browse real-market pricing across {page.manufacturer_name} families,
            compare tracked variants, and prioritize the most active parts of the
            used market using deterministic sold-listing data only.
          </p>

          {manufacturerVerifiedContent && (
            <div className="mt-6 space-y-3 border-t border-slate-800 pt-6">
              {[
                manufacturerVerifiedContent.overview_sentence_1,
                manufacturerVerifiedContent.overview_sentence_2,
                manufacturerVerifiedContent.overview_sentence_3,
                manufacturerVerifiedContent.overview_sentence_4,
              ]
                .filter(Boolean)
                .map((sentence, index) => (
                  <p key={index} className="text-sm leading-7 text-slate-300">
                    {sentence}
                  </p>
                ))}
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Tracking variants
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">
                {formatCount(totalVariantsTracked)}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Across {formatCount(page.families.length)} families
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Based on sales
              </div>
              <div className="mt-2 text-3xl font-semibold text-amber-400">
                {formatCount(totalObservations)}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Observed sold listings
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Families with market data
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">
                {formatCount(familiesWithMarketData)}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Families currently showing activity
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Price positioning
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {lowestFamilyMedian != null && highestFamilyMedian != null
                  ? `${formatMoney(lowestFamilyMedian)}–${formatMoney(highestFamilyMedian)}`
                  : "—"}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Family medians{typicalFamilyMedian != null ? ` · typical ${formatMoney(typicalFamilyMedian)}` : ""}
              </div>
            </div>
          </div>

          {(depthCounts.deep > 0 || depthCounts.moderate > 0 || depthCounts.thin > 0) && (
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {depthCounts.deep > 0 && (
                <span className="rounded-full border border-emerald-800/70 bg-emerald-950/40 px-3 py-1 text-emerald-300">
                  {depthCounts.deep} deep market{depthCounts.deep === 1 ? "" : "s"}
                </span>
              )}
              {depthCounts.moderate > 0 && (
                <span className="rounded-full border border-amber-800/70 bg-amber-950/30 px-3 py-1 text-amber-300">
                  {depthCounts.moderate} moderate market{depthCounts.moderate === 1 ? "" : "s"}
                </span>
              )}
              {depthCounts.thin > 0 && (
                <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
                  {depthCounts.thin} thin market{depthCounts.thin === 1 ? "" : "s"}
                </span>
              )}
            </div>
          )}

          {topFamilyLinks.length > 0 && (
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Top family paths
              </div>
              <div className="flex flex-wrap gap-2">
                {topFamilyLinks.map((family) => (
                  <Link
                    key={family.familySlug}
                    href={`/rc/${page.manufacturer_slug}/${family.familySlug}`}
                    className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    {family.familyName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="mt-8">
          <ResourceSection resources={resourceData ?? []} />
        </div>

        {(highestMedianFamily || mostActiveFamily || strongestDepthFamily) && (
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-white">Top-performing families</h2>
              <p className="mt-1 text-sm text-slate-400">
                Ranked only from observable pricing, sales activity, and market depth signals.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {highestMedianFamily && (
                <Link
                  href={`/rc/${page.manufacturer_slug}/${highestMedianFamily.familySlug}`}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:border-slate-500"
                >
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Highest median value
                  </div>
                  <div className="mt-3 text-xl font-semibold text-white">
                    {highestMedianFamily.familyName}
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-amber-400">
                    {formatMoney(highestMedianFamily.medianPrice)}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Based on {formatCount(highestMedianFamily.observationCount)} observed sales
                    across {formatCount(highestMedianFamily.variantCount)} tracked variants.
                  </p>
                </Link>
              )}

              {mostActiveFamily && (
                <Link
                  href={`/rc/${page.manufacturer_slug}/${mostActiveFamily.familySlug}`}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:border-slate-500"
                >
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Most active family
                  </div>
                  <div className="mt-3 text-xl font-semibold text-white">
                    {mostActiveFamily.familyName}
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    {formatCount(mostActiveFamily.observationCount)}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Based on sold-listing volume, with {formatCount(mostActiveFamily.variantCount)} tracked variants.
                  </p>
                </Link>
              )}

              {strongestDepthFamily && (
                <Link
                  href={`/rc/${page.manufacturer_slug}/${strongestDepthFamily.familySlug}`}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:border-slate-500"
                >
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Strongest market depth
                  </div>
                  <div className="mt-3 text-xl font-semibold text-white">
                    {strongestDepthFamily.familyName}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${depthTone(
                        strongestDepthFamily.marketDepth
                      )}`}
                    >
                      {depthLabel(strongestDepthFamily.marketDepth) ?? "Observed"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Backed by {formatCount(strongestDepthFamily.observationCount)} observed sales.
                  </p>
                </Link>
              )}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-white">Family intelligence</h2>
            <p className="mt-1 text-sm text-slate-400">
              Sorted by market depth, then activity, then median value.
            </p>
          </div>

          <div className="grid gap-4">
            {familyRows.map((family) => (
              <Link
                key={family.familySlug}
                href={`/rc/${page.manufacturer_slug}/${family.familySlug}`}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-5 transition hover:border-slate-500"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-white">
                        {family.familyName}
                      </h3>
                      {family.marketDepth && (
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${depthTone(
                            family.marketDepth
                          )}`}
                        >
                          {depthLabel(family.marketDepth)}
                        </span>
                      )}
                      {family.trendDirection && (
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                          Trend: {family.trendDirection}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Median price
                        </div>
                        <div className="mt-1 text-lg font-semibold text-amber-400">
                          {formatMoney(family.medianPrice)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Price band
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-200">
                          {family.p25Price != null && family.p75Price != null
                            ? `${formatMoney(family.p25Price)}–${formatMoney(family.p75Price)}`
                            : "—"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Based on sales
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-200">
                          {formatCount(family.observationCount)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Tracking variants
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-200">
                          {formatCount(family.variantCount)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Trust signal
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-200">
                          {family.observationCount > 0
                            ? `Based on ${formatCount(family.observationCount)} sales`
                            : "Tracked family"}
                        </div>
                      </div>
                    </div>

                    {(family.topVariantName || family.topVariantSlug) && (
                      <div className="mt-4 text-sm text-slate-400">
                        Top tracked variant:{" "}
                        {family.topVariantSlug ? (
                          <span className="text-slate-200">
                            {family.topVariantName ?? family.topVariantSlug}
                          </span>
                        ) : (
                          <span className="text-slate-200">{family.topVariantName}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-sm text-slate-400 lg:pl-6">
                    View family →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Crawl path reinforcement
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Continue deeper into {page.manufacturer_name} market data
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Move from manufacturer-level signals into family pages, then into individual variant pages with
              valuation, sold comps, trends, specs, and verified content where available.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {topFamilyLinks.slice(0, 3).map((family) => (
              <Link
                key={family.familySlug}
                href={`/rc/${page.manufacturer_slug}/${family.familySlug}`}
                className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                Browse {family.familyName}
              </Link>
            ))}

            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Search another RC model
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
