import { createClient } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────────────

export type SearchEventPayload = {
  event_name: string;
  query_raw?: string;
  results_count?: number;
  search_request_id?: string;
  search_latency_ms?: number;
  result_rank?: number;
  result_type?: string;
  result_variant_id?: string;
  result_slug?: string;
  result_entity_id?: string;
  result_family_id?: string;
  result_brand_id?: string;
  page_type?: string;
  page_path?: string;
  referrer_path?: string;
  search_context?: string;
  metadata?: Record<string, unknown>;
};

// ─── Legacy compat type used by HomepageSearch ───────────────────────

type SearchTelemetryEvent =
  | {
      type: "search_submit";
      query: string;
      query_length: number;
      source: "homepage";
      had_prefetched_results: boolean;
      results_count: number;
      pathname: string;
    }
  | {
      type: "search_result_click";
      query: string;
      query_length: number;
      source: "homepage";
      result_rank: number;
      results_count: number;
      variant_id: string;
      canonical_path: string;
      pathname: string;
    }
  | {
      type: "search_zero_results";
      query: string;
      query_length: number;
      source: "homepage";
      pathname: string;
    };

// ─── Anonymous ID (persistent) ───────────────────────────────────────

const ANON_KEY = "rcdv_anon_id";

function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

// ─── Session ID (30-min rolling window) ──────────────────────────────

const SESSION_KEY = "rcdv_session_id";
const SESSION_EXPIRY_KEY = "rcdv_session_expiry";
const SESSION_TTL_MS = 30 * 60 * 1000;

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const now = Date.now();
    const expiry = Number(localStorage.getItem(SESSION_EXPIRY_KEY) || "0");
    let id = localStorage.getItem(SESSION_KEY);

    if (!id || now > expiry) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }

    localStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_TTL_MS));
    return id;
  } catch {
    return "";
  }
}

// ─── Device type detection ───────────────────────────────────────────

function getDeviceType(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

// ─── Supabase client (lazy singleton) ────────────────────────────────

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    _supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}

// ─── Core logger ─────────────────────────────────────────────────────

export function logSearchEvent(payload: SearchEventPayload): void {
  if (typeof window === "undefined") return;

  try {
    const enriched = {
      ...payload,
      anonymous_id: getOrCreateAnonymousId(),
      session_id: getOrCreateSessionId(),
      device_type: getDeviceType(),
      page_path: payload.page_path ?? window.location.pathname,
      referrer_path: payload.referrer_path ?? document.referrer || undefined,
      user_agent: navigator.userAgent,
      occurred_at: new Date().toISOString(),
    };

    // Try Supabase RPC first
    const sb = getSupabase();
    if (sb) {
      // Use sendBeacon with fallback API route for reliability
      const beaconPayload = JSON.stringify(enriched);
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([beaconPayload], { type: "application/json" });
          const sent = navigator.sendBeacon("/api/telemetry/search", blob);
          if (sent) return;
        }
      } catch {
        // fall through
      }

      // Fallback: fire-and-forget RPC
      sb.rpc("log_search_event", { p_payload: enriched }).then(() => {}, () => {});
      return;
    }

    // Final fallback: POST to API route
    const body = JSON.stringify(enriched);
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/telemetry/search", blob);
        return;
      }
    } catch {
      // fall through
    }

    void fetch("/api/telemetry/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Telemetry must never affect UX
  }
}

// ─── Convenience wrappers ────────────────────────────────────────────

export function logSearchClick(params: {
  search_request_id: string;
  query_raw: string;
  results_count: number;
  result_variant_id: string;
  result_slug: string;
  result_rank: number;
  result_type: "variant" | "family" | "brand";
  page_type: string;
}): void {
  logSearchEvent({ event_name: "search_result_clicked", ...params });
}

export function logSearchPerformed(params: {
  query_raw: string;
  results_count: number;
  search_request_id: string;
  search_latency_ms: number;
  page_type: string;
}): void {
  logSearchEvent({ event_name: "search_performed", ...params });
}

export function logZeroResults(params: {
  query_raw: string;
  results_count: number;
  search_request_id: string;
  search_latency_ms: number;
  page_type: string;
}): void {
  logSearchEvent({ event_name: "search_zero_results", ...params });
}

// ─── Legacy wrapper (used by HomepageSearch) ─────────────────────────

export function trackSearchEvent(event: SearchTelemetryEvent): void {
  const base: SearchEventPayload = {
    event_name: event.type,
    query_raw: event.query,
    page_type: event.source,
    page_path: event.pathname,
    metadata: { query_length: event.query_length },
  };

  if (event.type === "search_submit") {
    base.results_count = event.results_count;
    base.metadata = {
      ...base.metadata,
      had_prefetched_results: event.had_prefetched_results,
    };
  } else if (event.type === "search_result_click") {
    base.result_rank = event.result_rank;
    base.results_count = event.results_count;
    base.result_variant_id = event.variant_id;
    base.result_slug = event.canonical_path;
    base.result_type = "variant";
  }

  logSearchEvent(base);
}
