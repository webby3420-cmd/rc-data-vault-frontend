import type { BuyClickEvent } from '@/lib/trackBuyClick'

const BUY_TELEMETRY_URL = '/api/telemetry/buy-click'

export function sendBuyClickEvent(event: BuyClickEvent): void {
  if (typeof window === 'undefined') return

  const payload: Record<string, unknown> = {
    channel:     event.channel,
    surface:     event.surface,
    label:       event.label ?? null,
    pathname:    window.location.pathname,
    occurred_at: new Date().toISOString(),
    user_agent:  navigator.userAgent,
  }

  // fetch + keepalive: fire-and-forget, survives page navigation.
  // Explicit text/plain header (no charset) keeps this a CORS simple
  // request, avoiding the preflight that a Blob body would trigger.
  try {
    fetch(BUY_TELEMETRY_URL, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    }).catch(() => {})
  } catch {
    // fetch not available — silent no-op
  }
}
