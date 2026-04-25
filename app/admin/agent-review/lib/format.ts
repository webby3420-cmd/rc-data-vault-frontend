// app/admin/agent-review/lib/format.ts
// Display helpers + defensive payload accessors for the Review Queue UI.
// JSONB payload shape is not declared in this repo (agents live elsewhere),
// so accessors try multiple key paths and fall back to null.

export function formatConfidencePercent(c: number | string | null): string {
  if (c == null) return '—';
  const n = typeof c === 'string' ? Number(c) : c;
  if (!Number.isFinite(n)) return '—';
  return `${Math.round(n * 100)}%`;
}

export function bucketPriority(
  p: number | string | null,
): 'Low' | 'Medium' | 'High' | '—' {
  if (p == null) return '—';
  const n = typeof p === 'string' ? Number(p) : p;
  if (!Number.isFinite(n)) return '—';
  if (n < 0.4) return 'Low';
  if (n < 0.7) return 'Medium';
  return 'High';
}

export function formatPriceUSD(
  amount: number | string | null,
  currency: string | null,
): string {
  if (amount == null) return 'Price not available';
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(n)) return 'Price not available';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function deriveSource(source: string | null, url: string | null): string {
  if (source && source.trim()) return source;
  if (!url) return 'Unknown source';
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('ebay')) return 'eBay';
    if (host.includes('facebook')) return 'Facebook Marketplace';
    if (host.includes('amain')) return 'AMain Hobbies';
    if (host.includes('horizonhobby')) return 'Horizon Hobby';
    if (host.includes('amazon')) return 'Amazon';
    return host;
  } catch {
    return 'Unknown source';
  }
}

export function capitalize(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}

type Payload = Record<string, unknown> | null | undefined;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function lookup(payload: Payload, path: readonly string[]): unknown {
  if (!payload) return undefined;
  let cur: unknown = payload;
  for (const k of path) {
    if (!isObject(cur)) return undefined;
    cur = cur[k];
  }
  return cur;
}

export function pickString(
  payloads: readonly Payload[],
  paths: readonly (readonly string[])[],
): string | null {
  for (const p of payloads) {
    for (const path of paths) {
      const v = lookup(p, path);
      if (typeof v === 'string' && v.trim().length > 0) return v;
    }
  }
  return null;
}

export function pickNumber(
  payloads: readonly Payload[],
  paths: readonly (readonly string[])[],
): number | null {
  for (const p of payloads) {
    for (const path of paths) {
      const v = lookup(p, path);
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string') {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
    }
  }
  return null;
}

export interface QueueRowContext {
  listingTitle: string | null;
  listingPriceUSD: number | null;
  listingCurrency: string | null;
  listingUrl: string | null;
  listingSource: string | null;
  listingCondition: string | null;
  listingImage: string | null;
  variantName: string | null;
  variantImage: string | null;
  variantUrlPath: string | null;
  familyName: string | null;
  familyImage: string | null;
  manufacturerName: string | null;
}

export function extractContext(payloads: readonly Payload[]): QueueRowContext {
  return {
    listingTitle: pickString(payloads, [
      ['listing', 'title'],
      ['listing', 'title_raw'],
      ['listing_title'],
      ['title_raw'],
      ['title'],
    ]),
    listingPriceUSD: pickNumber(payloads, [
      ['listing', 'price_usd_normalized'],
      ['listing', 'price_usd'],
      ['listing', 'price'],
      ['listing_price_usd'],
      ['price_usd_normalized'],
      ['price_usd'],
      ['price'],
    ]),
    listingCurrency: pickString(payloads, [
      ['listing', 'currency_code'],
      ['listing', 'currency'],
      ['listing_currency'],
      ['currency_code'],
      ['currency'],
    ]),
    listingUrl: pickString(payloads, [
      ['listing', 'listing_url'],
      ['listing', 'url'],
      ['listing_url'],
      ['url'],
    ]),
    listingSource: pickString(payloads, [
      ['listing', 'source_name'],
      ['listing', 'source'],
      ['listing_source'],
      ['source_name'],
      ['source'],
    ]),
    listingCondition: pickString(payloads, [
      ['listing', 'condition_raw'],
      ['listing', 'condition'],
      ['listing_condition'],
      ['condition_raw'],
      ['condition'],
    ]),
    listingImage: pickString(payloads, [
      ['listing', 'image_url'],
      ['listing', 'thumbnail_url'],
      ['listing', 'image'],
      ['listing_image_url'],
      ['image_url'],
      ['thumbnail_url'],
    ]),
    variantName: pickString(payloads, [
      ['variant', 'full_name'],
      ['variant', 'name'],
      ['variant_full_name'],
      ['variant_name'],
    ]),
    variantImage: pickString(payloads, [
      ['variant', 'box_art_url'],
      ['variant', 'image_url'],
      ['variant_box_art_url'],
      ['variant_image_url'],
    ]),
    variantUrlPath: pickString(payloads, [
      ['variant', 'url_path'],
      ['variant', 'path'],
      ['variant_url_path'],
      ['variant_url'],
    ]),
    familyName: pickString(payloads, [
      ['family', 'name'],
      ['family_name'],
    ]),
    familyImage: pickString(payloads, [
      ['family', 'image_url'],
      ['family_image_url'],
    ]),
    manufacturerName: pickString(payloads, [
      ['manufacturer', 'name'],
      ['manufacturer_name'],
      ['brand', 'name'],
      ['brand_name'],
    ]),
  };
}

export function pickFirstString(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c;
  }
  return null;
}
