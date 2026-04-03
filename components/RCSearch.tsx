"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SearchResult = {
  variant_id: string;
  variant_slug: string;
  manufacturer_slug: string;
  family_slug: string;
  display_name: string;
  match_type: string;
  score: number;
};

export default function RCSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const startTimeRef = useRef<number>(0);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    startTimeRef.current = Date.now();

    const { data, error } = await supabase.rpc("search_rc", {
      p_query: q,
      p_limit: 8,
    });

    const latencyMs = Date.now() - startTimeRef.current;
    const rows: SearchResult[] = error ? [] : (data ?? []);
    setResults(rows);
    setLoading(false);

    // Fire-and-forget telemetry
    try {
      await supabase.rpc("log_search_event", {
        p_query_text: q,
        p_normalized_query: q.toLowerCase().trim(),
        p_result_count: rows.length,
        p_latency_ms: latencyMs,
        p_top_result_variant_id: rows[0]?.variant_id ?? null,
        p_top_result_slug: rows[0]?.variant_slug ?? null,
        p_top_5_slugs: rows.slice(0, 5).map((r) => r.variant_slug),
        p_source_surface: "search_box",
      });
    } catch {
      // Telemetry never breaks UX
    }
  }

  async function handleClick(result: SearchResult) {
    const url = `/rc/${result.manufacturer_slug}/${result.family_slug}/${result.variant_slug}`;

    // Log the click before navigating
    try {
      await supabase.rpc("log_search_event", {
        p_query_text: query.trim(),
        p_normalized_query: query.toLowerCase().trim(),
        p_result_count: results.length,
        p_clicked_variant_id: result.variant_id,
        p_clicked_slug: result.variant_slug,
        p_top_result_slug: results[0]?.variant_slug ?? null,
        p_top_5_slugs: results.slice(0, 5).map((r) => r.variant_slug),
        p_source_surface: "search_click",
      });
    } catch {
      // Telemetry never blocks navigation
    }

    window.location.href = url;
  }

  return (
    <div className="mb-10">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search RC vehicles... (e.g. Traxxas X-Maxx, Kraton 6S)"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-amber-500 px-5 py-3 font-medium text-slate-950 transition-colors hover:bg-amber-400"
        >
          Search
        </button>
      </form>

      {loading && (
        <p className="mt-4 text-sm text-slate-400">Searching...</p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">No results found. Try a different search.</p>
      )}

      {!loading && results.length > 0 && (
        <ul className="mt-4 grid gap-2">
          {results.map((r) => (
            <li key={r.variant_id}>
              <button
                onClick={() => handleClick(r)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left transition-colors hover:border-amber-500"
              >
                <span className="font-medium text-white">{r.display_name}</span>
                <span className="ml-2 text-xs text-slate-500 capitalize">{r.match_type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
