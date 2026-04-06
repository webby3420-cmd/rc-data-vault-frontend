type SearchTelemetryEvent =
  | {
      type: 'search_submit'
      query: string
      query_length: number
      source: 'homepage'
      had_prefetched_results: boolean
      results_count: number
      pathname: string
    }
  | {
      type: 'search_result_click'
      query: string
      query_length: number
      source: 'homepage'
      result_rank: number
      results_count: number
      variant_id: string
      canonical_path: string
      pathname: string
    }
  | {
      type: 'search_zero_results'
      query: string
      query_length: number
      source: 'homepage'
      pathname: string
    }

const TELEMETRY_URL = process.env.NEXT_PUBLIC_SEARCH_TELEMETRY_URL

function buildPayload(event: SearchTelemetryEvent) {
  return {
    ...event,
    occurred_at: new Date().toISOString(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  }
}

export function trackSearchEvent(event: SearchTelemetryEvent) {
  if (!TELEMETRY_URL || typeof window === 'undefined') return

  const payload = JSON.stringify(buildPayload(event))

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(TELEMETRY_URL, blob)
      return
    }
  } catch {
    // fall through to fetch
  }

  void fetch(TELEMETRY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // telemetry must never affect UX
  })
}
