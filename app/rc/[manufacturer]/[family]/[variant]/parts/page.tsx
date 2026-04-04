import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type PageProps = { params: Promise<{ manufacturer: string; family: string; variant: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const { data } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });
  if (!data) return { title: "Parts | RC Data Vault" };
  return {
    title: `${data.identity.variant_full_name} Parts & Upgrades`,
    description: `OEM replacement parts and aftermarket upgrades for the ${data.identity.variant_full_name}.`,
  };
}

function fmtExact(n: number | null | undefined) { if (n == null) return null; return "$" + Number(n).toFixed(2); }

const RETAILER_LABELS: Record<string, string> = {
  traxxas_direct: "Traxxas", amain: "AMain Hobbies", amazon: "Amazon",
  tower: "Tower Hobbies", spektrum_direct: "Spektrum", gpm_direct: "GPM Racing",
  vitavon_direct: "Vitavon", hot_racing_direct: "Hot Racing", losi_direct: "Losi"
};

function BuyButton({ link }: { link: any }) {
  const label = RETAILER_LABELS[link.retailer_slug] ?? link.retailer_name;
  const price = fmtExact(link.price_usd);
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer sponsored"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:border-amber-500 hover:text-amber-400">
      <span>{label}</span>
      {price && <span className="text-amber-400 font-medium">{price}</span>}
    </a>
  );
}

function StarRating({ rating, count }: { rating: number | null; count: number | null }) {
  if (!rating) return null;
  const full = Math.floor(rating); const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex text-amber-400 text-xs">
        {Array.from({ length: 5 }, (_, i) => (<span key={i}>{i < full ? "★" : i === full && half ? "½" : "☆"}</span>))}
      </span>
      <span className="text-slate-400 text-xs">{rating.toFixed(1)}{count ? ` (${count.toLocaleString()})` : ""}</span>
    </span>
  );
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
            {isOem && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">OEM</span>}
            {isAftermarket && <span className="rounded-full bg-amber-950 border border-amber-800 px-2 py-0.5 text-xs text-amber-400">Upgrade</span>}
            {part.fit_confidence === "verified" && <span className="rounded-full bg-green-950 border border-green-800 px-2 py-0.5 text-xs text-green-400">✓ Verified Fit</span>}
          </div>
          <h3 className="text-sm font-medium text-white leading-snug">{part.part_name}</h3>
          {part.part_number && <p className="text-xs text-slate-500 mt-0.5">#{part.part_number}</p>}
          {part.description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{part.description}</p>}
          {part.replaces_part_number && <p className="text-xs text-slate-500 mt-1">Replaces OEM #{part.replaces_part_number}</p>}
          {part.spec_notes && <p className="text-xs text-slate-500 mt-1 italic">{part.spec_notes}</p>}
          {(part.weighted_rating || part.total_reviews) && (
            <div className="mt-2"><StarRating rating={Number(part.weighted_rating)} count={Number(part.total_reviews)} /></div>
          )}
        </div>
        {part.best_price && (
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-semibold text-amber-400">{fmtExact(part.best_price)}</div>
            <div className="text-xs text-slate-500">best price</div>
          </div>
        )}
      </div>
      {sortedLinks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sortedLinks.map((link: any) => <BuyButton key={link.link_id ?? link.retailer_slug} link={link} />)}
        </div>
      )}
    </div>
  );
}

export default async function VariantPartsPage({ params }: PageProps) {
  const { manufacturer, family, variant: variantSlug } = await params;
  const { data: payload } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });
  if (!payload) return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">Vehicle Not Found</h1>
        <a href="/rc" className="text-amber-400 hover:text-amber-300">Browse all RC values</a>
      </div>
    </main>
  );

  const variantId = payload.identity.variant_id;
  const { data: partsData } = await supabase.rpc("get_parts_for_vehicle", { p_variant_id: variantId });
  const parts: any[] = partsData ?? [];
  const partsByCategory: Record<string, any[]> = {};
  for (const part of parts) {
    const cat = part.category ?? "Other";
    if (!partsByCategory[cat]) partsByCategory[cat] = [];
    partsByCategory[cat].push(part);
  }
  const hasOemParts = parts.some(p => p.is_oem === true || p.is_oem === "true");
  const hasAftermarketParts = parts.some(p => p.part_type === "aftermarket_upgrade");
  const { identity } = payload;
  const variantUrl = `/rc/${manufacturer}/${family}/${variantSlug}`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href={`/rc/${identity.manufacturer_slug}`}>{identity.manufacturer_name}</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href={`/rc/${identity.manufacturer_slug}/${identity.model_family_slug}`}>{identity.model_family_name}</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href={variantUrl}>{identity.variant_name}</a>
          <span className="mx-2">/</span>
          <span>Parts & Upgrades</span>
        </nav>
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">{identity.variant_full_name}</h1>
            <p className="mt-1 text-slate-400">
              Parts & Upgrades — {parts.length} item{parts.length !== 1 ? "s" : ""}
              {hasOemParts && hasAftermarketParts && " · OEM + Aftermarket"}
              {hasOemParts && !hasAftermarketParts && " · OEM"}
              {!hasOemParts && hasAftermarketParts && " · Aftermarket"}
            </p>
          </div>
          <a href={variantUrl} className="flex-shrink-0 text-sm text-amber-400 hover:text-amber-300">← Back to value guide</a>
        </div>
        {parts.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-12 text-center">
            <p className="text-slate-400">No parts listed yet for this vehicle.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(partsByCategory).map(([category, categoryParts]) => (
              <div key={category}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2">{category}</h2>
                <div className="grid gap-3">
                  {categoryParts.map((part: any) => <PartCard key={part.part_id} part={part} />)}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-8 text-xs text-slate-600">Fitment verified against manufacturer specs. Purchase links may include affiliate referrals. Always verify fitment with your specific vehicle configuration before ordering.</p>
      </div>
    </main>
  );
}
