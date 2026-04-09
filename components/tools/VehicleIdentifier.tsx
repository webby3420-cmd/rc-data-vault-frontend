"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface IdentifyMatch {
  variant_id: string;
  variant_slug: string;
  variant_name: string;
  manufacturer_name: string;
  canonical_url: string;
  image_url: string | null;
  confidence: number | null;
  fair_value: number | null;
}

function formatValue(v: number | null): string {
  if (v == null) return "—";
  return "$" + Math.round(v).toLocaleString("en-US");
}

function confidenceLabel(score: number | null): { text: string; cls: string } | null {
  if (score == null) return null;
  if (score >= 0.75) return { text: "Strong match", cls: "text-emerald-400" };
  if (score >= 0.55) return { text: "Good match", cls: "text-amber-400" };
  if (score >= 0.4) return { text: "Possible match", cls: "text-slate-400" };
  return { text: "Weak match", cls: "text-slate-500" };
}

export default function VehicleIdentifier() {
  const [preview, setPreview] = useState<string | null>(null);
  const [matches, setMatches] = useState<IdentifyMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setMatches([]);
      setSearched(false);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleIdentify() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setMatches([]);
    setDescription(null);
    setCoverage(null);
    setSearched(true);

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.message ?? "Identification failed — try a different photo.");
        return;
      }

      setMatches(data.results ?? []);
      setDescription(data.description ?? null);
      setCoverage(data.embedding_coverage ?? null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-8 text-center transition-colors hover:border-slate-500"
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Uploaded RC vehicle"
              className="mx-auto max-h-64 rounded-xl object-contain"
            />
            <div className="flex justify-center gap-3">
              <button
                onClick={handleIdentify}
                disabled={loading}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? "Identifying..." : "Identify Vehicle"}
              </button>
              <button
                onClick={() => {
                  setPreview(null);
                  setMatches([]);
                  setSearched(false);
                  setError(null);
                  setDescription(null);
                  setCoverage(null);
                }}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📷</div>
            <p className="text-sm text-slate-300">
              Drop a photo of an RC vehicle here, or{" "}
              <button
                onClick={() => inputRef.current?.click()}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-slate-500">JPG, PNG, or WebP · Max 10 MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
          Analyzing image...
        </div>
      )}

      {/* Results */}
      {!loading && searched && matches.length === 0 && !error && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-6 text-center">
          <p className="text-sm text-slate-400">
            No match found — try a clearer photo with the full vehicle visible.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Or{" "}
            <Link href="/rc" className="text-amber-400 hover:text-amber-300">
              search by name
            </Link>{" "}
            instead.
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-3">
          {description && (
            <p className="text-xs text-slate-500">Identified as: {description}</p>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {matches.length} possible match{matches.length !== 1 ? "es" : ""}
          </p>
          {matches.map((m, i) => {
            const conf = confidenceLabel(m.confidence);
            return (
              <Link
                key={m.variant_id}
                href={m.canonical_url}
                className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 transition-colors hover:border-slate-500"
              >
                {m.image_url ? (
                  <img
                    src={m.image_url}
                    alt={m.variant_name}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-2xl text-slate-600">
                    🚗
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{m.variant_name}</span>
                    {i === 0 && matches.length > 1 && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">Best</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{m.manufacturer_name}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    {m.fair_value != null && (
                      <span className="font-semibold text-amber-400">{formatValue(m.fair_value)}</span>
                    )}
                    {conf && <span className={conf.cls}>{conf.text}</span>}
                  </div>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">View →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
