import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TrendingDown, CheckCircle2 } from "lucide-react";

type FamilyCard = {
  model_family_slug: string;
  model_family_name: string;
  manufacturer_slug: string;
  manufacturer_name: string;
  reliable_count: number;
  below_count: number;
  fair_count: number;
  total_sales: number;
  tier: "below" | "fair";
};

export async function ManufacturerFamilyOpportunities({
  manufacturerSlug,
}: {
  manufacturerSlug: string;
}) {
  const supabase = createSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("v_variant_page_payload")
    .select(
      "manufacturer_slug, manufacturer_name, model_family_slug, model_family_name, price_position_band, candidate_count, valuation_median_price, variant_id, confidence_label"
    )
    .eq("manufacturer_slug", manufacturerSlug)
    .eq("confidence_label", "High")
    .not("price_position_band", "is", null)
    .not("valuation_median_price", "is", null);

  if (error || !rows?.length) return null;

  // Filter to reliable confidence
  const variantIds = rows.map((r: any) => r.variant_id);
  const { data: reliableRows } = await supabase
    .from("v_variant_valuations_clean")
    .select("variant_id")
    .in("variant_id", variantIds)
    .eq("confidence", "reliable");

  const reliableSet = new Set((reliableRows ?? []).map((r: any) => r.variant_id));
  const reliableVariants = rows.filter((r: any) => reliableSet.has(r.variant_id));

  if (reliableVariants.length === 0) return null;

  // Group by family
  const familyMap = new Map<string, {
    model_family_slug: string;
    model_family_name: string;
    manufacturer_slug: string;
    manufacturer_name: string;
    below_count: number;
    fair_count: number;
    above_count: number;
    total_sales: number;
    reliable_count: number;
  }>();

  for (const row of reliableVariants) {
    const slug = row.model_family_slug;
    if (!familyMap.has(slug)) {
      familyMap.set(slug, {
        model_family_slug: slug,
        model_family_name: row.model_family_name,
        manufacturer_slug: row.manufacturer_slug,
        manufacturer_name: row.manufacturer_name,
        below_count: 0,
        fair_count: 0,
        above_count: 0,
        total_sales: 0,
        reliable_count: 0,
      });
    }
    const fam = familyMap.get(slug)!;
    fam.reliable_count++;
    fam.total_sales += row.candidate_count ?? 0;
    if (row.price_position_band === "Below Market") fam.below_count++;
    else if (row.price_position_band === "Fair") fam.fair_count++;
    else fam.above_count++;
  }

  const families = Array.from(familyMap.values());

  // Tier 1: Below Market families
  const tier1 = families
    .filter((f) => f.below_count >= 1)
    .sort((a, b) => b.below_count - a.below_count || b.total_sales - a.total_sales)
    .map((f) => ({ ...f, tier: "below" as const }));

  // Tier 2: Fair-depth families (no below, fair >= 1, total_sales >= 20)
  const tier1Slugs = new Set(tier1.map((f) => f.model_family_slug));
  const tier2 = families
    .filter(
      (f) =>
        f.below_count === 0 &&
        f.fair_count >= 1 &&
        f.total_sales >= 20 &&
        !tier1Slugs.has(f.model_family_slug)
    )
    .sort((a, b) => b.total_sales - a.total_sales || b.fair_count - a.fair_count)
    .map((f) => ({ ...f, tier: "fair" as const }));

  const cards: FamilyCard[] = [...tier1, ...tier2].slice(0, 6);

  if (cards.length < 3) return null;

  return (
    <section className="border-t border-slate-800 bg-slate-950 mt-8">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Families Worth Exploring
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Model families with strong pricing data and variants worth a closer look.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const isTier1 = card.tier === "below";
            const Icon = isTier1 ? TrendingDown : CheckCircle2;
            const pillCls = isTier1
              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20"
              : "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30";
            const pillText = isTier1 ? "Below-Market Variants" : "Active Market";

            const statLine = isTier1
              ? `${card.below_count} variant${card.below_count === 1 ? "" : "s"} priced below comps · ${card.reliable_count} with reliable data`
              : `${card.total_sales} verified sales across ${card.reliable_count} ${card.reliable_count === 1 ? "variant" : "variants"}`;

            const reasonText = isTier1
              ? card.below_count >= 2
                ? "Multiple variants currently below recent sold comps"
                : "At least one variant currently below recent sold comps"
              : "Consistent pricing data with an active market";

            return (
              <Link
                key={card.model_family_slug}
                href={`/rc/${card.manufacturer_slug}/${card.model_family_slug}`}
                className="group rounded-2xl border border-slate-700 bg-slate-950 p-5 transition hover:border-slate-500"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.manufacturer_name}
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-white group-hover:text-amber-400 transition">
                  {card.model_family_name}
                </h3>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pillCls}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {pillText}
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-400">{statLine}</div>
                <div className="mt-1 text-xs text-slate-500">{reasonText}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
