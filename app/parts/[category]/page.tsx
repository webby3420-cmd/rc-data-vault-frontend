import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type PageProps = { params: Promise<{ category: string }> };
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { title: `${label} Parts for RC Vehicles | RC Data Vault`, description: `Shop OEM and aftermarket ${label.toLowerCase()} for Traxxas, ARRMA, Losi, and more. Fitment verified against manufacturer specs.`, alternates: { canonical: `https://rcdatavault.com/parts/${category}` } };
}
function fmt(n: number | null | undefined) { if (n == null) return null; return "$" + Number(n).toFixed(2); }
function StarRating({ rating, count }: { rating: number | null; count: number | null }) {
  if (!rating) return null;
  const full = Math.floor(rating); const half = rating - full >= 0.5;
  return (<span className="flex items-center gap-1.5"><span className="flex text-amber-400 text-xs">{Array.from({ length: 5 }, (_, i) => (<span key={i}>{i < full ? "★" : i === full && half ? "½" : "☆"}</span>))}</span><span className="text-slate-400 text-xs">{rating.toFixed(1)}{count ? ` (${count.toLocaleString()})` : ""}</span></span>);
}
const RETAILER_LABELS: Record<string, string> = { traxxas_direct: "Traxxas", amain: "AMain Hobbies", amazon: "Amazon", tower: "Tower Hobbies", spektrum_direct: "Spektrum", gpm_direct: "GPM Racing", vitavon_direct: "Vitavon", hot_racing_direct: "Hot Racing", losi_direct: "Losi", proline_direct: "Proline", jconcepts_direct: "JConcepts", integy_direct: "Integy" };
export default async function CategoryPartsPage({ params }: PageProps) {
  const { category } = await params;
  const { data: partsData } = await supabase.rpc("get_parts_by_category", { p_category_slug: category });
  const parts: any[] = partsData ?? [];
  const label = category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  if (!parts.length) {
    return (<main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-semibold text-white mb-2">Category Not Found</h1><a href="/parts" className="text-amber-400 hover:text-amber-300">← Back to Parts Catalog</a></div></main>);
  }
  const oemParts = parts.filter(p => p.is_oem === true || p.is_oem === "true");
  const aftermarketParts = parts.filter(p => p.is_oem !== true && p.is_oem !== "true");
  return (<main className="min-h-screen bg-slate-950 text-slate-100"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><nav className="mb-6 text-sm text-slate-400"><a className="hover:text-white" href="/parts">Parts</a><span className="mx-2">/</span><span>{label}</span></nav><header className="mb-8"><h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{label}<span className="mt-2 block text-2xl font-normal text-slate-300">{parts.length} parts available</span></h1></header><div className="grid gap-10">{oemParts.length > 0 && (<section><h2 className="mb-4 text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">OEM Replacement Parts <span className="text-slate-500 font-normal text-sm">({oemParts.length})</span></h2><div className="grid gap-3">{oemParts.map((part: any) => (<PartRow key={part.part_id} part={part} />))}</div></section>)}{aftermarketParts.length > 0 && (<section><h2 className="mb-4 text-lg font-semibold text-amber-400 border-b border-slate-800 pb-2">Aftermarket Upgrades <span className="text-slate-500 font-normal text-sm">({aftermarketParts.length})</span></h2><div className="grid gap-3">{aftermarketParts.map((part: any) => (<PartRow key={part.part_id} part={part} />))}</div></section>)}<div className="flex gap-4 text-sm"><a href="/parts" className="text-slate-400 hover:text-white">← All Categories</a><a href="/rc" className="text-amber-400 hover:text-amber-300">Find parts for your vehicle →</a></div></div></div></main>);
}
function PartRow({ part }: { part: any }) {
  const isOem = part.is_oem === true || part.is_oem === "true";
  const links: any[] = part.purchase_links ?? [];
  const sorted = [...links].sort((a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99));
  return (<div className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700"><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2 mb-1">{isOem ? <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">OEM</span> : <span className="rounded-full bg-amber-950 border border-amber-800 px-2 py-0.5 text-xs text-amber-400">Upgrade</span>}<span className="text-xs text-slate-500">{part.manufacturer}</span></div><h3 className="text-sm font-medium text-white leading-snug">{part.part_name}</h3>{part.part_number && <p className="text-xs text-slate-500 mt-0.5">#{part.part_number}</p>}{part.description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{part.description}</p>}{(part.weighted_rating || part.total_reviews) && <div className="mt-2"><StarRating rating={Number(part.weighted_rating)} count={Number(part.total_reviews)} /></div>}</div>{part.best_price && <div className="text-right flex-shrink-0"><div className="text-lg font-semibold text-amber-400">{fmt(part.best_price)}</div><div className="text-xs text-slate-500">best price</div></div>}</div>{sorted.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{sorted.map((link: any) => (<a key={link.link_id ?? link.retailer_slug} href={link.url} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:border-amber-500 hover:text-amber-400"><span>{RETAILER_LABELS[link.retailer_slug] ?? link.retailer_name}</span>{fmt(link.price_usd) && <span className="text-amber-400 font-medium">{fmt(link.price_usd)}</span>}</a>))}</div>}</div>);
}
