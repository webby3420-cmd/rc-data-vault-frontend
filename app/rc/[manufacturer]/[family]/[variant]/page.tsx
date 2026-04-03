import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type PageProps = { params: Promise<{ manufacturer: string; family: string; variant: string }> };
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const { data } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });
  if (!data) return { title: "RC Data Vault" };
  return { title: data.seo.title_tag, description: data.seo.meta_description, robots: data.seo.robots_directive, alternates: { canonical: data.seo.canonical_url }, openGraph: { title: data.identity.variant_full_name + " Value & Price Guide", description: data.seo.meta_description, url: data.seo.canonical_url, siteName: "RC Data Vault", type: "website" }, twitter: { card: "summary", title: data.identity.variant_full_name + " Value & Price Guide", description: data.seo.meta_description } };
}
function fmt(n: number | null | undefined) { if (n == null) return "—"; return "$" + Math.round(n).toLocaleString(); }
function fmtExact(n: number | null | undefined) { if (n == null) return null; return "$" + Number(n).toFixed(2); }
function fmtDate(d: string | null | undefined) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtMonth(d: string | null | undefined) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" }); }
function cap(s: string | null | undefined) { if (!s) return null; return s.charAt(0).toUpperCase() + s.slice(1); }
type SpecRow = { label: string; value: string };
function buildSpecRows(specs: any): SpecRow[] {
  if (!specs) return [];
  const rows: SpecRow[] = [];
  const add = (label: string, value: string | number | boolean | null | undefined, suffix = "") => { if (value === null || value === undefined) return; const display = typeof value === "boolean" ? (value ? "Yes" : "No") : `${value}${suffix}`; rows.push({ label, value: display }); };
  add("Scale", specs.scale); add("Class", cap(specs.vehicle_class)); add("Configuration", specs.body_style?.toUpperCase()); add("Drive", specs.drive_config?.toUpperCase()); add("Drivetrain", cap(specs.drivetrain_type)); add("Power", cap(specs.power_type)); add("Battery", specs.battery_config); add("Battery Included", specs.battery_included); add("Motor", specs.motor_name); add("ESC", specs.esc_name); add("Top Speed", specs.top_speed_mph, " mph");
  if (specs.length_mm) add("Length", `${specs.length_mm} mm`); if (specs.width_mm) add("Width", `${specs.width_mm} mm`); if (specs.wheelbase_mm) add("Wheelbase", `${specs.wheelbase_mm} mm`); if (specs.weight_g) add("Weight", specs.weight_g >= 1000 ? `${(specs.weight_g / 1000).toFixed(1)} kg` : `${specs.weight_g} g`);
  add("Waterproof", specs.is_waterproof); add("Self-Righting", specs.is_self_righting); add("Diff Lock", specs.has_diff_lock); add("2-Speed", specs.has_2_speed); add("Portal Axles", specs.has_portal_axles); add("Radio", specs.radio_system);
  if (specs.msrp_usd) add("Original MSRP", `$${Number(specs.msrp_usd).toLocaleString()}`); if (specs.year_released) add("Year Released", specs.year_released); if (specs.year_discontinued) add("Discontinued", specs.year_discontinued);
  return rows;
}
function StarRating({ rating, count }: { rating: number | null; count: number | null }) {
  if (!rating) return null;
  const full = Math.floor(rating); const half = rating - full >= 0.5;
  return (<span className="flex items-center gap-1.5"><span className="flex text-amber-400 text-xs">{Array.from({ length: 5 }, (_, i) => (<span key={i}>{i < full ? "★" : i === full && half ? "½" : "☆"}</span>))}</span><span className="text-slate-400 text-xs">{rating.toFixed(1)}{count ? ` (${count.toLocaleString()})` : ""}</span></span>);
}
const RETAILER_LABELS: Record<string, string> = { traxxas_direct: "Traxxas", amain: "AMain Hobbies", amazon: "Amazon", tower: "Tower Hobbies", spektrum_direct: "Spektrum", gpm_direct: "GPM Racing", vitavon_direct: "Vitavon", hot_racing_direct: "Hot Racing", losi_direct: "Losi" };
function BuyButton({ link }: { link: any }) {
  const label = RETAILER_LABELS[link.retailer_slug] ?? link.retailer_name;
  const price = fmtExact(link.price_usd);
  return (<a href={link.url} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:border-amber-500 hover:text-amber-400"><span>{label}</span>{price && <span className="text-amber-400 font-medium">{price}</span>}</a>);
}
function PartCard({ part }: { part: any }) {
  const isOem = part.is_oem === true || part.is_oem === "true";
  const isAftermarket = part.part_type === "aftermarket_upgrade";
  const links: any[] = part.purchase_links ?? [];
  const sortedLinks = [...links].sort((a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99));
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isOem && (<span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">OEM</span>)}
            {isAftermarket && (<span className="rounded-full bg-amber-950 border border-amber-800 px-2 py-0.5 text-xs text-amber-400">Upgrade</span>)}
            {part.fit_confidence === "verified" && (<span className="rounded-full bg-green-950 border border-green-800 px-2 py-0.5 text-xs text-green-400">✓ Verified Fit</span>)}
          </div>
          <h4 className="text-sm font-medium text-white leading-snug">{part.part_name}</h4>
          {part.part_number && (<p className="text-xs text-slate-500 mt-0.5">#{part.part_number}</p>)}
          {part.description && (<p className="text-xs text-slate-400 mt-1 leading-relaxed">{part.description}</p>)}
          {part.replaces_part_number && (<p className="text-xs text-slate-500 mt-1">Replaces OEM #{part.replaces_part_number}</p>)}
          {part.spec_notes && (<p className="text-xs text-slate-500 mt-1 italic">{part.spec_notes}</p>)}
          {(part.weighted_rating || part.total_reviews) && (<div className="mt-2"><StarRating rating={Number(part.weighted_rating)} count={Number(part.total_reviews)} /></div>)}
        </div>
        {part.best_price && (<div className="text-right flex-shrink-0"><div className="text-lg font-semibold text-amber-400">{fmtExact(part.best_price)}</div><div className="text-xs text-slate-500">best price</div></div>)}
      </div>
      {sortedLinks.length > 0 && (<div className="mt-3 flex flex-wrap gap-2">{sortedLinks.map((link: any) => (<BuyButton key={link.link_id ?? link.retailer_slug} link={link} />))}</div>)}
    </div>
  );
}
export default async function VariantPage({ params }: PageProps) {
  const { variant: variantSlug } = await params;
  const { data: payload } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });
  if (!payload) {
    return (<main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-semibold text-white mb-2">Vehicle Not Found</h1><p className="text-slate-400 mb-6">This listing may have been removed or the URL is incorrect.</p><a href="/rc" className="text-amber-400 hover:text-amber-300">Browse all RC values →</a></div></main>);
  }
  const variantId = payload.identity.variant_id;
  const { data: partsData } = await supabase.rpc("get_parts_for_vehicle", { p_variant_id: variantId });
  const parts: any[] = partsData ?? [];
  const partsByCategory: Record<string, any[]> = {};
  for (const part of parts) { const cat = part.category ?? "Other"; if (!partsByCategory[cat]) partsByCategory[cat] = []; partsByCategory[cat].push(part); }
  const hasOemParts = parts.some(p => p.is_oem === true || p.is_oem === "true");
  const hasAftermarketParts = parts.some(p => p.part_type === "aftermarket_upgrade");
  const { identity, valuation, recent_sales, price_trends, market_summary, related, specs, content, seo, freshness } = payload;
  const hasValuation = valuation?.has_sufficient_data;
  const hasTrends = price_trends && price_trends.length >= 2;
  const firstTrend = hasTrends ? price_trends[0] : null;
  const lastTrend = hasTrends ? price_trends[price_trends.length - 1] : null;
  const trendDelta = (firstTrend && lastTrend) ? Math.round(lastTrend.median_price - firstTrend.median_price) : null;
  const specRows = buildSpecRows(specs);
  const productSchema = hasValuation ? JSON.stringify({ "@context": "https://schema.org", "@type": "Product", "name": identity.variant_full_name, "brand": { "@type": "Brand", "name": identity.manufacturer_name }, "offers": { "@type": "AggregateOffer", "priceCurrency": "USD", "lowPrice": valuation.estimated_value_low, "highPrice": valuation.estimated_value_high, "offerCount": valuation.observation_count }, "url": seo.canonical_url }) : null;
  const breadcrumbSchema = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": identity.manufacturer_name, "item": `https://rcdatavault.com/rc/${identity.manufacturer_slug}` }, { "@type": "ListItem", "position": 2, "name": identity.model_family_name, "item": `https://rcdatavault.com/rc/${identity.manufacturer_slug}/${identity.model_family_slug}` }, { "@type": "ListItem", "position": 3, "name": identity.variant_full_name, "item": seo.canonical_url }] });
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {productSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productSchema }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400"><a className="hover:text-white" href={`/rc/${identity.manufacturer_slug}`}>{identity.manufacturer_name}</a><span className="mx-2">/</span><a className="hover:text-white" href={`/rc/${identity.manufacturer_slug}/${identity.model_family_slug}`}>{identity.model_family_name}</a><span className="mx-2">/</span><span>{identity.variant_name}</span></nav>
        <header className="mb-8"><h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{identity.variant_full_name}<span className="mt-2 block text-2xl font-normal text-slate-300">Used Value & Price Guide</span></h1></header>
        <div className="grid gap-8">
          {content?.intro_paragraph && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><p className="text-base leading-7 text-slate-200">{content.intro_paragraph}</p>{content.category_tags && content.category_tags.length > 0 && (<div className="mt-4 flex flex-wrap gap-2">{content.category_tags.map((tag: string) => (<span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400 capitalize">{tag}</span>))}</div>)}</section>)}
          {specRows.length > 0 && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><h2 className="mb-4 text-2xl font-semibold text-white">Specifications</h2><dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">{specRows.map(({ label, value }) => (<div key={label}><dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-0.5 text-sm font-medium text-slate-200">{value}</dd></div>))}</dl>{specs?.spec_notes && <p className="mt-4 text-xs text-slate-500">* {specs.spec_notes}</p>}</section>)}
          {hasValuation ? (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm"><div className="mb-2 text-sm uppercase tracking-wide text-slate-400">Estimated Value</div><div className="text-5xl font-semibold text-amber-400">{fmt(valuation.estimated_value_mid)}</div><div className="mt-3 text-lg text-slate-200">Range: {fmt(valuation.estimated_value_low)} – {fmt(valuation.estimated_value_high)}</div><div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300"><span className="rounded-full border border-slate-600 px-3 py-1">{valuation.confidence_label}</span><span>{valuation.observation_count} sold listings</span><span>Updated {fmtDate(valuation.valuation_last_updated_at)}</span></div><div className="mt-2 text-xs text-slate-500">Source: eBay sold listings</div></section>) : (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><div className="text-slate-400">Not enough sold listings yet to generate a valuation. Check back as market data accumulates.</div></section>)}
          {hasTrends && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><h2 className="mb-4 text-2xl font-semibold text-white">Market Trend</h2><div className="overflow-x-auto"><table className="min-w-full text-left text-sm text-slate-200"><thead className="text-slate-400"><tr><th className="pb-3 pr-4">Month</th><th className="pb-3 pr-4">Median</th><th className="pb-3 pr-4">Range</th><th className="pb-3">Sales</th></tr></thead><tbody>{price_trends.map((t: any) => (<tr key={t.month} className="border-t border-slate-800"><td className="py-3 pr-4">{fmtMonth(t.month)}</td><td className="py-3 pr-4 font-medium text-amber-400">{fmt(t.median_price)}</td><td className="py-3 pr-4">{fmt(t.min_price)} – {fmt(t.max_price)}</td><td className="py-3">{t.observation_count}</td></tr>))}</tbody></table></div>{trendDelta !== null && firstTrend && lastTrend && (<p className="mt-3 text-sm text-slate-400">{trendDelta >= 0 ? "↑" : "↓"} Median price {trendDelta >= 0 ? "up" : "down"} {fmt(Math.abs(trendDelta))} from {fmtMonth(firstTrend.month)} to {fmtMonth(lastTrend.month)}</p>)}</section>)}
          {recent_sales && recent_sales.length > 0 && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><h2 className="mb-4 text-2xl font-semibold text-white">Recent Sold Listings</h2><div className="overflow-x-auto"><table className="min-w-full text-left text-sm text-slate-200"><thead className="text-slate-400"><tr><th className="pb-3 pr-4">Price</th><th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Source</th><th className="pb-3">Title</th></tr></thead><tbody>{recent_sales.map((s: any, i: number) => (<tr key={i} className="border-t border-slate-800"><td className="py-3 pr-4 font-medium text-amber-400">{fmt(s.price)}</td><td className="py-3 pr-4">{fmtDate(s.price_date)}</td><td className="py-3 pr-4 uppercase text-slate-400">{s.source}</td><td className="py-3">{s.title ? s.title.slice(0, 60) + (s.title.length > 60 ? "…" : "") : "—"}</td></tr>))}</tbody></table></div></section>)}
          {parts.length > 0 && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-2xl font-semibold text-white">Parts & Upgrades</h2><p className="mt-1 text-sm text-slate-400">{parts.length} part{parts.length !== 1 ? "s" : ""} available for the {identity.variant_full_name}{hasOemParts && hasAftermarketParts && " — OEM replacements and aftermarket upgrades"}{hasOemParts && !hasAftermarketParts && " — OEM replacement parts"}</p></div><div className="flex gap-2 text-xs flex-shrink-0">{hasOemParts && <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-400">OEM</span>}{hasAftermarketParts && <span className="rounded-full bg-amber-950 border border-amber-800 px-2 py-1 text-amber-400">Upgrades</span>}</div></div><div className="space-y-8">{Object.entries(partsByCategory).map(([category, categoryParts]) => (<div key={category}><h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2">{category}</h3><div className="grid gap-3">{categoryParts.map((part: any) => (<PartCard key={part.part_id} part={part} />))}</div></div>))}</div><p className="mt-6 text-xs text-slate-600">Fitment verified against manufacturer specs. Purchase links may include affiliate referrals. Always verify fitment with your specific vehicle configuration before ordering.</p></section>)}
          {content?.buying_tips && content.buying_tips.length > 0 && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><h2 className="mb-4 text-2xl font-semibold text-white">What to Look For When Buying Used</h2><ul className="space-y-3">{content.buying_tips.map((tip: string, i: number) => (<li key={i} className="flex gap-3 text-slate-200"><span className="mt-0.5 flex-shrink-0 text-amber-400 font-semibold">{i + 1}.</span><span className="leading-7">{tip}</span></li>))}</ul></section>)}
          {hasValuation && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><h2 className="mb-4 text-2xl font-semibold text-white">Market Summary</h2><p className="max-w-3xl text-base leading-7 text-slate-200">The {identity.variant_full_name} has a <strong className="text-white">{market_summary.market_depth_label}</strong> secondary market with <strong className="text-white">{valuation.observation_count}</strong> recent sold listings. Prices currently range from <strong className="text-white">{fmt(valuation.estimated_value_low)}</strong> to <strong className="text-white">{fmt(valuation.estimated_value_high)}</strong>, and the market is trending <strong className="text-white">{market_summary.trend_direction?.replace("_", " ")}</strong>.</p><div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-800 p-4"><div className="text-sm text-slate-400">Depth</div><div className="mt-1 text-lg font-medium text-white">{market_summary.market_depth_label}</div></div><div className="rounded-xl border border-slate-800 p-4"><div className="text-sm text-slate-400">Trend</div><div className="mt-1 text-lg font-medium text-white">{market_summary.trend_direction?.replace("_", " ")}</div></div><div className="rounded-xl border border-slate-800 p-4"><div className="text-sm text-slate-400">Data points</div><div className="mt-1 text-lg font-medium text-white">{valuation.observation_count}</div></div></div></section>)}
          {related?.siblings?.length > 0 && (<section className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><h2 className="mb-4 text-2xl font-semibold text-white">Related Models</h2><div className="mb-6 grid gap-3">{related.siblings.map((s: any) => (<a key={s.variant_id} className="rounded-xl border border-slate-800 p-4 transition hover:border-slate-600" href={s.canonical_url}><div className="font-medium text-white">{s.full_name}</div><div className="text-sm text-slate-400">{s.obs_count} sold listings</div></a>))}</div><div className="flex flex-wrap gap-3 text-sm"><a className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500" href={related.model_family.canonical_url}>{related.model_family.name} family</a><a className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500" href={related.manufacturer.canonical_url}>{related.manufacturer.name}</a></div></section>)}
          <div className="text-sm text-slate-400">Price data updated {fmtDate(valuation?.valuation_last_updated_at)} from {valuation?.observation_count ?? 0} eBay sold listings. Data refreshes every {Math.round((freshness?.revalidate_after_seconds ?? 3600) / 60)} minutes.</div>
        </div>
      </div>
    </main>
  );
}
