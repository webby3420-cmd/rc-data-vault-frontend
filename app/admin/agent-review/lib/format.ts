// app/admin/agent-review/lib/format.ts
// Display helpers for the Review Queue UI.

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

// Listing image isn't exposed as a top-level column on
// v_agent_review_queue_enriched — marketplace_listings.raw_payload_json
// shape varies per source (eBay vs Facebook vs AMain). Dig into the JSONB
// payloads defensively until the view exposes a coalesced column.
type Payload = Record<string, unknown> | null | undefined;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function pickListingImage(payloads: readonly Payload[]): string | null {
  const paths: readonly (readonly string[])[] = [
    ['listing', 'image_url'],
    ['listing', 'thumbnail_url'],
    ['listing', 'image'],
    ['listing_image_url'],
    ['image_url'],
    ['thumbnail_url'],
  ];
  for (const p of payloads) {
    if (!p) continue;
    for (const path of paths) {
      let cur: unknown = p;
      let ok = true;
      for (const k of path) {
        if (!isObject(cur)) {
          ok = false;
          break;
        }
        cur = cur[k];
      }
      if (ok && typeof cur === 'string' && cur.trim().length > 0) return cur;
    }
  }
  return null;
}
