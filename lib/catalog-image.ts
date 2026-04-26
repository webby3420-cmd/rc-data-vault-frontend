/**
 * Catalog identity image helpers.
 *
 * These helpers are ONLY for catalog identity surfaces — variant cards, family
 * variant lists, queue rows showing the *proposed* variant image, etc. The
 * helper substitutes a neutral placeholder when the catalog's image fields
 * (box_art_url, primary curated variant_images URL, family.primary_image_url,
 * representative_image_url, proposed_variant_image_url) are NULL or empty.
 *
 * DO NOT use these helpers for:
 *   - recent-sales listing thumbnails
 *   - admin listing thumbnails (the actual listing image)
 *   - marketplace listing image / evidence image surfaces
 *   - parts salvage listing image
 * Those surfaces intentionally show real listing images because they are
 * evidence/context, not catalog identity.
 *
 * Backend contract (Phase A, live):
 *   public.variant_representative_image_url() returns NULL for 545 of 1,039
 *   variants. NULL signals "render placeholder per locked catalog image policy".
 *   Marketplace fallback has been removed entirely from the backend.
 */

export const PLACEHOLDER_VARIANT_IMAGE = "/placeholder-variant.svg";

/** Returns the input URL if non-empty, otherwise the catalog placeholder. */
export function getCatalogImageUrl(imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return PLACEHOLDER_VARIANT_IMAGE;
}

/** True iff a value would resolve to the placeholder. Useful for alt-text. */
export function isCatalogImageMissing(imageUrl?: string | null): boolean {
  return !imageUrl || imageUrl.trim().length === 0;
}
