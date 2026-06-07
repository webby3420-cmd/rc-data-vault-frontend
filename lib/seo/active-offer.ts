// Server-side helpers for Product structured-data offers.
//
// HARD RULE: Product offers come ONLY from the read-only view
// `public.v_variant_active_offer` (one row per variant that has >= 1 clean,
// approved, ACTIVE, USD listing). Sold comps / valuation fields must NEVER
// populate Product offers. When a variant has no row, callers MUST omit the
// `offers` property entirely (see the gate in the variant page).
//
// Both the JSON-LD offer object and the visible on-page element are derived
// from the SAME row via the builders below, so the structured data always
// matches the visible content (a Google requirement).

export interface ActiveOfferRow {
  offer_count: number;
  // numeric columns may arrive from PostgREST as number or string.
  low_price: number | string;
  high_price: number | string;
  price_currency: string;
  offer_schema_type: "Offer" | "AggregateOffer";
  lowest_listing_url: string | null;
}

export type ActiveOfferSchema =
  | {
      "@type": "Offer";
      priceCurrency: "USD";
      price: number;
      availability: "https://schema.org/InStock";
      url: string;
    }
  | {
      "@type": "AggregateOffer";
      priceCurrency: "USD";
      lowPrice: number;
      highPrice: number;
      offerCount: number;
      availability: "https://schema.org/InStock";
    };

/**
 * Build the Product `offers` JSON-LD node from an active-offer row.
 * - `AggregateOffer` for two or more listings (low/high range).
 * - `Offer` for exactly one listing (single price; low === high).
 * `canonicalUrl` is used only as the Offer url fallback when the view did
 * not surface a lowest_listing_url.
 */
export function buildActiveOfferSchema(
  row: ActiveOfferRow,
  canonicalUrl: string
): ActiveOfferSchema {
  if (row.offer_schema_type === "AggregateOffer") {
    return {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Number(row.low_price),
      highPrice: Number(row.high_price),
      offerCount: row.offer_count,
      availability: "https://schema.org/InStock",
    };
  }

  return {
    "@type": "Offer",
    priceCurrency: "USD",
    price: Number(row.low_price),
    availability: "https://schema.org/InStock",
    url: row.lowest_listing_url || canonicalUrl,
  };
}

/**
 * Visible-content string for the gated "Current Active Listings" element.
 * Whole-dollar rounding of the same low/high used in the JSON-LD is fine —
 * the numbers still represent the same offers.
 */
export function formatActiveOfferLine(row: ActiveOfferRow): string {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const low = Number(row.low_price);

  if (row.offer_schema_type === "AggregateOffer") {
    const high = Number(row.high_price);
    return `${row.offer_count} listed for sale now · ${fmt(low)}–${fmt(high)}`;
  }

  return `1 listed for sale now · ${fmt(low)}`;
}
