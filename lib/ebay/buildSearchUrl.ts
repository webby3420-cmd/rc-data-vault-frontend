/**
 * eBay search URL builder for RC Data Vault recommendation cards.
 *
 * Design:
 *   parts.name is already a rich, product-targeted string for well-formed
 *   catalog entries (e.g. "Hobbywing EzRun MAX5 V3 200A 3-8S ESC"). We use
 *   it as the base query, prepend manufacturer only if it's not already
 *   present (common for servos like "Beast 2000 1/5th Scale Servo"), and
 *   append part_number as a uniqueness anchor.
 *
 * Examples:
 *   {manufacturer:'Hobbywing', name:'Hobbywing EzRun MAX5 V3 200A 3-8S ESC', part_number:'30104000'}
 *     → _nkw='Hobbywing EzRun MAX5 V3 200A 3-8S ESC 30104000'
 *   {manufacturer:'Reefs RC', name:'Beast 2000 1/5th Scale Servo', part_number:'REEFS103'}
 *     → _nkw='Reefs RC Beast 2000 1/5th Scale Servo REEFS103'
 */

export interface PartSearchRef {
  manufacturer: string
  name: string
  part_number: string
}

export function buildEbayKeyword(part: PartSearchRef): string {
  const tokens: string[] = []
  const nameLower = (part.name ?? '').toLowerCase()
  const mfrLower  = (part.manufacturer ?? '').toLowerCase()
  const pnLower   = (part.part_number ?? '').toLowerCase()

  // 1. Prepend manufacturer if missing from name (common for servos)
  if (part.manufacturer && !nameLower.includes(mfrLower)) {
    tokens.push(part.manufacturer)
  }

  // 2. Base query: the name is already product-targeted
  if (part.name) tokens.push(part.name)

  // 3. Append part_number if not already in name (uniqueness anchor)
  if (part.part_number && !nameLower.includes(pnLower)) {
    tokens.push(part.part_number)
  }

  return tokens.join(' ').trim()
}

export interface EbaySearchUrlOpts {
  customId?: string   // optional eBay Partner Network customid for click attribution
  buyItNow?: boolean  // default true
}

export function buildEbaySearchUrl(part: PartSearchRef, opts: EbaySearchUrlOpts = {}): string {
  const params = new URLSearchParams({
    _nkw:     buildEbayKeyword(part),
    _sacat:   '0',
    mkcid:    '1',
    mkrid:    '711-53200-19255-0',
    siteid:   '0',
    campid:   '5339148896',
    toolid:   '10001',
    mkevt:    '1',
    customid: opts.customId ?? '',
  })
  if (opts.buyItNow !== false) params.set('LH_BIN', '1')
  return `https://www.ebay.com/sch/i.html?${params.toString()}`
}
