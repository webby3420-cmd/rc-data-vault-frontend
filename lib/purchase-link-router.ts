/**
 * purchase-link-router.ts
 * ────────────────────────
 * Shared routing resolver for RCDataVault "Where to Buy" links.
 *
 * Priority rules:
 *   1. Amazon  — primary when verify_status='ok', is_active=true
 *   2. eBay    — secondary when Amazon exists; primary when Amazon absent
 *   3. Mfr Direct — tertiary when Amazon+eBay; secondary when eBay primary;
 *                   primary only when neither Amazon nor eBay available
 *
 * Never surfaces: broken, mismatch, suppressed, or inactive links.
 *
 * Drop-in location: lib/purchase-link-router.ts
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PurchaseLinkRow = {
  link_id?: string
  retailer_slug: string
  retailer_name: string
  retailer_type: string
  product_url: string
  affiliate_url: string | null
  verify_status: string       // 'ok' | 'unverified' | 'broken' | 'mismatch' | 'suppressed' | 'redirect'
  is_active: boolean
  is_link_surfaceable?: boolean | null
  display_priority?: number | null
}

export type BuyChannel = 'amazon' | 'ebay' | 'manufacturer_direct' | 'hobby_retailer'

export type ResolvedLink = {
  channel: BuyChannel
  label: string
  sublabel: string
  href: string
  retailerName: string
  retailerSlug: string
  isPrimary: boolean
}

export type ResolvedPurchaseLinks = {
  primary: ResolvedLink | null
  secondaries: ResolvedLink[]
  hasAmazon: boolean
  hasEbay: boolean
  hasManufacturerDirect: boolean
  isEmpty: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCKED_STATUSES = new Set(['broken', 'mismatch', 'suppressed'])

const SLUG_TO_CHANNEL: Record<string, BuyChannel> = {
  amazon:         'amazon',
  ebay:           'ebay',
  castle_direct:  'manufacturer_direct',
  traxxas_direct: 'manufacturer_direct',
  arrma_direct:   'manufacturer_direct',
  kyosho_direct:  'manufacturer_direct',
  losi_direct:    'manufacturer_direct',
  axial_direct:   'manufacturer_direct',
  amain:          'hobby_retailer',
  horizon:        'hobby_retailer',
  tower:          'hobby_retailer',
}

const TYPE_TO_CHANNEL: Record<string, BuyChannel> = {
  mass_market:        'amazon',
  aftermarket_direct: 'manufacturer_direct',
  hobby_specialist:   'hobby_retailer',
}

function resolveChannel(link: PurchaseLinkRow): BuyChannel {
  return SLUG_TO_CHANNEL[link.retailer_slug] ?? TYPE_TO_CHANNEL[link.retailer_type] ?? 'hobby_retailer'
}

// ─── Label copy ───────────────────────────────────────────────────────────────

function getLabel(channel: BuyChannel, retailerName: string): { label: string; sublabel: string } {
  switch (channel) {
    case 'amazon':
      return { label: 'Buy on Amazon', sublabel: 'Free shipping on eligible orders' }
    case 'ebay':
      return { label: 'View deals on eBay', sublabel: 'New, used & open-box listings' }
    case 'manufacturer_direct':
      return { label: `View on ${retailerName}`, sublabel: 'Official product page' }
    default:
      return { label: `Buy at ${retailerName}`, sublabel: 'Authorized hobby retailer' }
  }
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function isUsable(link: PurchaseLinkRow): boolean {
  if (!link.is_active) return false
  if (BLOCKED_STATUSES.has(link.verify_status)) return false
  if (link.is_link_surfaceable === false) return false
  return true
}

function isVerifiedOk(link: PurchaseLinkRow): boolean {
  return isUsable(link) && link.verify_status === 'ok'
}

function toResolved(link: PurchaseLinkRow, isPrimary: boolean): ResolvedLink {
  const channel = resolveChannel(link)
  const { label, sublabel } = getLabel(channel, link.retailer_name)
  return {
    channel,
    label,
    sublabel,
    href: link.affiliate_url ?? link.product_url,
    retailerName: link.retailer_name,
    retailerSlug: link.retailer_slug,
    isPrimary,
  }
}

// ─── Main resolver ────────────────────────────────────────────────────────────

export function resolvePurchaseLinks(
  links: PurchaseLinkRow[],
  ebaySearchUrl?: string | null,
): ResolvedPurchaseLinks {
  const usable = links.filter(isUsable)

  const amazon = usable.find((l) => resolveChannel(l) === 'amazon' && isVerifiedOk(l))

  const ebayRow = usable.find((l) => resolveChannel(l) === 'ebay')
  const ebay: PurchaseLinkRow | null = ebayRow ?? (
    ebaySearchUrl
      ? {
          retailer_slug: 'ebay',
          retailer_name: 'eBay',
          retailer_type: 'mass_market',
          product_url: ebaySearchUrl,
          affiliate_url: ebaySearchUrl,
          verify_status: 'ok',
          is_active: true,
        }
      : null
  )

  const mfrDirect =
    usable.find((l) => resolveChannel(l) === 'manufacturer_direct' && isVerifiedOk(l)) ??
    usable.find((l) => resolveChannel(l) === 'manufacturer_direct')

  const hobbyRetailer = usable.find(
    (l) => resolveChannel(l) === 'hobby_retailer' && isVerifiedOk(l),
  )

  let primary: ResolvedLink | null = null
  const pool: ResolvedLink[] = []

  if (amazon) {
    primary = toResolved(amazon, true)
    if (ebay) pool.push(toResolved(ebay, false))
    if (mfrDirect) pool.push(toResolved(mfrDirect, false))
    if (hobbyRetailer && pool.length < 2) pool.push(toResolved(hobbyRetailer, false))
  } else if (ebay) {
    primary = toResolved(ebay, true)
    if (mfrDirect) pool.push(toResolved(mfrDirect, false))
    if (hobbyRetailer && pool.length < 2) pool.push(toResolved(hobbyRetailer, false))
  } else if (mfrDirect) {
    primary = toResolved(mfrDirect, true)
    if (hobbyRetailer) pool.push(toResolved(hobbyRetailer, false))
  } else if (hobbyRetailer) {
    primary = toResolved(hobbyRetailer, true)
  }

  return {
    primary,
    secondaries: pool.slice(0, 2),
    hasAmazon: !!amazon,
    hasEbay: !!ebay,
    hasManufacturerDirect: !!mfrDirect,
    isEmpty: !primary,
  }
}
