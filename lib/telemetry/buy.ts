import type { BuyClickEvent } from '@/lib/trackBuyClick'

const BUY_TELEMETRY_URL =
  'https://frphiluaykgrmvyvdzsp.supabase.co/functions/v1/buy-click-telemetry'

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

  // sendBeacon: fire-and-forget, survives page navigation
  const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' })
  try {
    navigator.sendBeacon(BUY_TELEMETRY_URL, blob)
  } catch {
    // sendBeacon not available (e.g. SSR context) — silent no-op
  }
}
