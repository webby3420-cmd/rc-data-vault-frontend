import { sendBuyClickEvent } from '@/lib/telemetry/buy'

export interface BuyClickEvent {
  channel: string   // 'amazon' | 'ebay' | 'manufacturer' | 'manufacturer_direct' | 'hobby_retailer' | 'unknown'
  surface: string   // 'variant_part_card' | 'tool_result' | 'variant_retail_block'
  label?: string    // part_number or variant_slug
}

export function trackBuyClick(event: BuyClickEvent): void {
  if (typeof window === 'undefined') return
  const w = window as any
  // Vercel Analytics
  w.va?.track?.('buy_click', event)
  // Google Analytics 4
  w.gtag?.('event', 'buy_click', {
    event_category: 'commerce',
    ...event,
  })
  // Plausible
  w.plausible?.('buy_click', { props: event })
  // First-party capture (fire-and-forget via sendBeacon)
  sendBuyClickEvent(event)
}
