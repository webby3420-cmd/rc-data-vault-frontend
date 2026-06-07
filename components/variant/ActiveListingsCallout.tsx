import { formatActiveOfferLine, type ActiveOfferRow } from "@/lib/seo/active-offer";

/**
 * Gated visible element for CURRENT ACTIVE LISTINGS.
 *
 * Rendered only when the variant has an active-offer row (the caller gates on
 * presence). Its numbers come from the same row as the Product `offers`
 * JSON-LD, so visible content matches structured data. It is intentionally
 * labeled and styled distinctly from the sold-comp market value so the trust
 * boundary (live listings vs. sold valuation) is visible to users too.
 */
export default function ActiveListingsCallout({ offer }: { offer: ActiveOfferRow }) {
  return (
    <section className="rounded-2xl border border-emerald-700/40 bg-emerald-950/20 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-400 mb-2">
        Current Active Listings
      </h2>
      <p className="text-base font-medium text-white">{formatActiveOfferLine(offer)}</p>
      <p className="mt-2 text-xs text-slate-400">
        Live marketplace listings available now — separate from the sold-comp market value below.
      </p>
    </section>
  );
}
