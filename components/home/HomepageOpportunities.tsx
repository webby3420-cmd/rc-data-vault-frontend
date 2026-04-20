import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TrendingDown, CheckCircle2 } from "lucide-react";

type OpportunityCard = {
  variant_slug: string;
  variant_name: string;
  manufacturer_slug: string;
  manufacturer_name: string;
  model_family_slug: string;
  median_price: number;
  price_position_band: "Below Market" | "Fair";
  deal_score_simple: number;
  candidate_count: number;
  demand_score: number | null;
  demand_label: string | null;
  pool: "below" | "fair";
};

function formatPrice(p: number) {
  return "$" + Math.round(p).toLocaleString("en-US");
}

export async function HomepageOpportunities() {
  const supabase = createSupabaseServerClient();

  // Query 1: payload view for market-insight fields
  const { data: payloadRows, error: payloadErr } = await supabase
    .from("v_variant_page_payload")
    .select(
      "variant_id, variant_slug, variant_name, manufacturer_slug, manufacturer_name, model_family_slug, valuation_median_price, price_position_band, deal_score_simple, confidence_label, candidate_count"
    )
    .eq("confidence_label", "High")
    .not("price_position_band", "is", null)
    .not("valuation_median_price", "is", null);

  if (payloadErr || !payloadRows?.length) return null;

  // Filter to reliable confidence via v_variant_valuations_clean
  const variantIds = payloadRows.map((r: any) => r.variant_id);
  const { data: reliableRows } = await supabase
    .from("v_variant_valuations_clean")
    .select("variant_id")
    .in("variant_id", variantIds)
    .eq("confidence", "reliable");

  const reliableSet = new Set((reliableRows ?? []).map((r: any) => r.variant_id));

  // Query 2: demand scores
  const { data: demandRows } = await supabase
    .from("variant_dashboard_scores")
    .select("variant_id, demand_score, demand_label")
    .in("variant_id", variantIds);

  const demandMap = new Map(
    (demandRows ?? []).map((r: any) => [r.variant_id, { score: r.demand_score, label: r.demand_label }])
  );

  // Filter to reliable only and exclude Above Market
  const qualified = payloadRows
    .filter((r: any) => reliableSet.has(r.variant_id))
    .filter((r: any) => r.price_position_band === "Below Market" || r.price_position_band === "Fair")
    .map((r: any) => ({
      variant_slug: r.variant_slug,
      variant_name: r.variant_name,
      manufacturer_slug: r.manufacturer_slug,
      manufacturer_name: r.manufacturer_name,
      model_family_slug: r.model_family_slug,
      median_price: Math.round(r.valuation_median_price),
      price_position_band: r.price_position_band as "Below Market" | "Fair",
      deal_score_simple: r.deal_score_simple ?? 0,
      candidate_count: r.candidate_count ?? 0,
      demand_score: demandMap.get(r.variant_id)?.score ?? null,
      demand_label: demandMap.get(r.variant_id)?.label ?? null,
      pool: "below" as const,
    }));

  // Pool A: Below Market, sorted by deal_score DESC
  const poolACandidates = qualified
    .filter((r) => r.price_position_band === "Below Market")
    .sort((a, b) => b.deal_score_simple - a.deal_score_simple);

  // Pool B: Fair + demand >= 60, sorted by demand then candidate_count
  const poolBCandidates = qualified
    .filter(
      (r) =>
        r.price_position_band === "Fair" &&
        r.demand_score != null &&
        r.demand_score >= 60
    )
    .sort((a, b) => (b.demand_score ?? 0) - (a.demand_score ?? 0) || b.candidate_count - a.candidate_count);

  // Merge with per-manufacturer cap of 2 and dedup by slug
  const mfrCount = new Map<string, number>();
  const seenSlugs = new Set<string>();
  const cards: OpportunityCard[] = [];

  for (const candidate of poolACandidates) {
    if (cards.length >= 6) break;
    if (seenSlugs.has(candidate.variant_slug)) continue;
    const count = mfrCount.get(candidate.manufacturer_slug) ?? 0;
    if (count >= 2) continue;
    mfrCount.set(candidate.manufacturer_slug, count + 1);
    seenSlugs.add(candidate.variant_slug);
    cards.push({ ...candidate, pool: "below" });
  }

  for (const candidate of poolBCandidates) {
    if (cards.length >= 6) break;
    if (seenSlugs.has(candidate.variant_slug)) continue;
    const count = mfrCount.get(candidate.manufacturer_slug) ?? 0;
    if (count >= 2) continue;
    mfrCount.set(candidate.manufacturer_slug, count + 1);
    seenSlugs.add(candidate.variant_slug);
    cards.push({ ...candidate, pool: "fair" });
  }

  if (cards.length < 4) return null;

  return (
    <section className="border-t border-slate-800 bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Opportunities</h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Models currently priced below recent sold comps, plus high-signal variants worth researching.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const isBelowMarket = card.price_position_band === "Below Market";
            const Icon = isBelowMarket ? TrendingDown : CheckCircle2;
            const pillCls = isBelowMarket
              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20"
              : "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30";
            const accentCls = isBelowMarket
              ? "border-l-2 border-l-emerald-500/40"
              : "border-l-2 border-l-blue-500/40";

            return (
              <Link
                key={card.variant_slug}
                href={`/rc/${card.manufacturer_slug}/${card.model_family_slug}/${card.variant_slug}`}
                className={`group rounded-2xl border border-slate-700 bg-slate-950 p-5 transition hover:border-slate-500 ${accentCls}`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.manufacturer_name}
                </div>
                <div className="mt-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pillCls}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {card.price_position_band}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white group-hover:text-amber-400 transition">
                  {card.variant_name}
                </h3>
                <div className="mt-3 text-lg font-semibold text-amber-400">
                  ~{formatPrice(card.median_price)}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {card.pool === "below"
                    ? "Priced below recent sold comps"
                    : `High demand · ${card.candidate_count} verified sales`}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
