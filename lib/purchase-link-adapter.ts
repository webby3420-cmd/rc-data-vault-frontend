/**
 * purchase-link-adapter.ts
 * ─────────────────────────
 * Minimal adapter between the DB RPC shape and PurchaseLinkRow.
 *
 * Both get_variant_parts and get_parts_for_vehicle return purchase_links
 * with a slightly different shape than what the router expects:
 *
 *   DB returns:   { url, priority, ... }
 *   Router wants: { product_url, affiliate_url, display_priority, verify_status, is_active, ... }
 *
 * The DB pre-filters: only rows where is_link_surfaceable = true pass through,
 * so we can safely set verify_status='ok' and is_active=true on adapted rows.
 *
 * Drop-in location: lib/purchase-link-adapter.ts
 */

import type { PurchaseLinkRow } from './purchase-link-router'

/** Shape returned by get_variant_parts and get_parts_for_vehicle RPCs */
export type DbPartLink = {
  link_id?: string
  retailer_name: string
  retailer_slug: string
  retailer_type: string
  url: string                    // COALESCE(affiliate_url, product_url) from DB
  price_usd?: number | null
  in_stock?: boolean | null
  priority?: number | null       // display_priority from part_purchase_links
}

/**
 * Adapt DB part links array to the shape expected by resolvePurchaseLinks().
 * Safe to call with null/undefined (returns empty array).
 */
export function adaptDbPartLinks(
  raw: DbPartLink[] | null | undefined,
): PurchaseLinkRow[] {
  if (!raw || raw.length === 0) return []
  return raw.map((link) => ({
    link_id:             link.link_id,
    retailer_name:       link.retailer_name,
    retailer_slug:       link.retailer_slug,
    retailer_type:       link.retailer_type,
    product_url:         link.url,
    affiliate_url:       link.url,  // url is already the merged affiliate/product URL
    // DB pre-filters is_link_surfaceable = true, so all rows here are safe to surface:
    verify_status:       'ok' as const,
    is_active:           true,
    is_link_surfaceable: true,
    display_priority:    link.priority ?? 50,
  }))
}
