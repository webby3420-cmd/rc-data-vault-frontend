import { ArrowUpRight } from "lucide-react";

interface SoldListing {
  listing_title: string | null;
  sale_price: number;
  observed_at: string | null;
  source: string | null;
  condition_grade_id: string | null;
  listing_url: string | null;
}

interface BestDealsProps {
  soldListings: SoldListing[];
  fairValue: number | null;
  variantImageUrl: string | null;
  modelName: string;
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function sourceLabel(source: string | null): string {
  if (!source) return "Marketplace";
  const map: Record<string, string> = { ebay: "eBay", facebook: "Facebook", amazon: "Amazon" };
  return map[source.toLowerCase()] ?? source.charAt(0).toUpperCase() + source.slice(1);
}

const CONDITION_COLOR: Record<string, string> = {
  nib: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  new: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  used_complete: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  used: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  roller: "bg-slate-500/15 text-slate-400 border-slate-600/25",
};

export default function BestDeals({ soldListings, fairValue, variantImageUrl, modelName }: BestDealsProps) {
  if (!fairValue || soldListings.length === 0) return null;

  // Sort by value gap descending (biggest bargain first), take top 6
  const ranked = [...soldListings]
    .filter((l) => l.sale_price > 0)
    .sort((a, b) => (fairValue - a.sale_price) - (fairValue - b.sale_price))
    .reverse()
    .slice(0, 6);

  if (ranked.length === 0) return null;

  return (
    <section id="deals">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
        Recent Deals
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((listing, i) => {
          const savings = fairValue - listing.sale_price;
          const isLink = !!listing.listing_url;
          const Tag = isLink ? "a" : "div";
          const linkProps = isLink
            ? { href: listing.listing_url!, target: "_blank" as const, rel: "noopener noreferrer" }
            : {};
          const conditionKey = listing.condition_grade_id?.toLowerCase().replace(/[\s-]/g, "_") ?? "";
          const condColor = CONDITION_COLOR[conditionKey] ?? "bg-slate-500/15 text-slate-400 border-slate-600/25";

          return (
            <Tag
              key={i}
              {...linkProps}
              className="flex gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3 hover:border-slate-500 transition-colors group cursor-pointer"
            >
              {/* Thumbnail fallback */}
              <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                {variantImageUrl ? (
                  <img src={variantImageUrl} alt={modelName} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-[10px] text-slate-600 text-center leading-tight px-1">No img</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-amber-400 leading-tight">{fmt(listing.sale_price)}</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {listing.condition_grade_id && (
                    <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] ${condColor}`}>
                      {listing.condition_grade_id}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {sourceLabel(listing.source)}
                  </span>
                  {listing.observed_at && (
                    <span className="text-[10px] text-slate-600">{fmtDate(listing.observed_at)}</span>
                  )}
                </div>
                {savings > 0 && (
                  <div className="text-[11px] text-emerald-500 mt-1">{fmt(savings)} below median</div>
                )}
              </div>

              {isLink && (
                <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 shrink-0 mt-0.5 transition-colors" />
              )}
            </Tag>
          );
        })}
      </div>
    </section>
  );
}
