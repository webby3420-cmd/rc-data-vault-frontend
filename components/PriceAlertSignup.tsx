"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bell, CheckCircle2, ChevronDown, Sparkles } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getFraming(referencePrice: number | null, referenceLabel: string | null): { headline: string; detail: string } | null {
  if (!referencePrice) return null;
  const fmtRef = "$" + Math.round(referencePrice).toLocaleString("en-US");
  const label = referenceLabel ?? "resale";
  return {
    headline: `Typical ${label} price is around ${fmtRef}.`,
    detail: "Set a target below that and we\u2019ll email you when a matching listing appears.",
  };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const prefix = local.length > 2 ? local.slice(0, 2) + "..." : local;
  return `${prefix}@${domain}`;
}

export default function PriceAlertSignup({
  variantId,
  variantSlug,
  modelName,
  mfrSlug,
  familySlug,
  modelFamilyId,
  signupSource,
  referencePrice,
  referenceLabel,
}: {
  variantId: string;
  variantSlug: string;
  modelName: string;
  mfrSlug?: string;
  familySlug?: string;
  modelFamilyId?: string;
  signupSource?: string;
  referencePrice?: number | null;
  referenceLabel?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryPref, setDeliveryPref] = useState<"shipping_only" | "shipping_or_local" | "local_only">("shipping_or_local");
  const [userZip, setUserZip] = useState("");
  const [userCountry, setUserCountry] = useState("US");
  const [userRadiusMiles, setUserRadiusMiles] = useState(50);
  const [allowInternational, setAllowInternational] = useState(false);
  const [showLocationOptions, setShowLocationOptions] = useState(false);

  const suggestedPrice = referencePrice ? Math.round(referencePrice * 0.85 / 10) * 10 : null;
  const framing = getFraming(referencePrice ?? null, referenceLabel ?? null);

  async function handleSubmit() {
    if (!email || !price) return;

    const targetPrice = parseFloat(price);
    if (isNaN(targetPrice) || targetPrice <= 0) {
      setError("Please enter a valid target price.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: insertedRow, error: insertError } = await supabase
      .from("alert_subscriptions")
      .insert({
        subscriber_email: email.trim().toLowerCase(),
        variant_id: variantId,
        slug: variantSlug,
        alert_name: `Price alert for ${modelName}`,
        max_total_price: targetPrice,
        frequency,
        is_active: true,
        ...(modelFamilyId ? { model_family_id: modelFamilyId } : {}),
        criteria: { source: signupSource ?? "unknown" },
        delivery_pref: deliveryPref,
        user_zip: deliveryPref !== "shipping_only" && userZip ? userZip : null,
        user_country: userCountry,
        user_radius_miles: deliveryPref !== "shipping_only" ? userRadiusMiles : 50,
        buyer_country: userCountry,
        location_type: deliveryPref !== "shipping_only" && userZip ? "zip" : "none",
        require_shipping: deliveryPref !== "local_only",
        require_local: deliveryPref === "local_only",
        allow_international: allowInternational,
      })
      .select("unsubscribe_token")
      .single();

    if (insertError) {
      setLoading(false);
      if (insertError.code === "23505") {
        setSubmitted(true);
        return;
      }
      setError("Something went wrong. Please try again.");
      console.error("Alert insert error:", insertError);
      return;
    }

    try {
      await fetch("/api/alerts/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          modelName,
          targetPrice,
          variantSlug,
          mfrSlug: mfrSlug ?? null,
          familySlug: familySlug ?? null,
          unsubscribeToken: insertedRow?.unsubscribe_token ?? null,
        }),
      });
    } catch (emailErr) {
      console.error("Confirmation email error:", emailErr);
    }

    // Persist to localStorage for homepage "Your Alerts" section
    try {
      if (typeof window !== "undefined") {
        const STORAGE_KEY = "rcdv_alerts";
        const MAX_ENTRIES = 10;
        const targetPriceNum = parseFloat(price);
        const hasValidIdentity =
          typeof variantSlug === "string" && variantSlug.length > 0 &&
          typeof modelName === "string" && modelName.length > 0 &&
          isFinite(targetPriceNum);

        if (hasValidIdentity) {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          let existing: Array<{ variant_slug: string; variant_name: string; manufacturer: string; family_slug: string; target_price: number; created_at: string }> = [];
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) existing = parsed;
            } catch { /* malformed — treat as empty */ }
          }
          const newEntry = {
            variant_slug: variantSlug,
            variant_name: modelName,
            manufacturer: mfrSlug ?? "",
            family_slug: familySlug ?? "",
            target_price: targetPriceNum,
            created_at: new Date().toISOString(),
          };
          const deduped = existing.filter(
            (e) => !(e.variant_slug === newEntry.variant_slug && e.target_price === newEntry.target_price)
          );
          const updated = [newEntry, ...deduped].slice(0, MAX_ENTRIES);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      }
    } catch {
      // localStorage unavailable — fail silently
    }

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-200">Alert set for {modelName}</p>
            <p className="mt-1 text-sm text-slate-400">
              We&apos;ll email <span className="text-slate-300">{maskEmail(email)}</span> when a listing lands at or below{" "}
              <span className="text-slate-300">${parseFloat(price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Check back here anytime — new sold comps update this page&apos;s pricing data.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-sm">
      {framing && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 mb-5 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">{framing.headline}</p>
            <p className="text-xs text-slate-400 mt-0.5">{framing.detail}</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-white">
          <Bell className="h-5 w-5 text-amber-400" />
          Watch this model for a better buy
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pick a target price. We&apos;ll email you when a new {modelName} listing comes in at or below it.
        </p>
      </div>

      {/* Target price — hero input */}
      <div className="mt-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Your target price</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-lg text-slate-500">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder={suggestedPrice ? String(suggestedPrice) : "299"}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-4 pl-10 pr-4 text-lg font-semibold text-white outline-none transition focus:border-amber-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={loading}
            />
          </div>
          {referencePrice && (
            <p className="mt-1.5 text-xs text-slate-500">
              Typical {referenceLabel ?? "resale"} price is <strong className="text-white">${Math.round(referencePrice).toLocaleString("en-US")}</strong>. Set your target below that.
            </p>
          )}
        </label>
      </div>

      {/* Email + submit */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </label>
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !price}
          className="inline-flex h-[46px] items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Saving…" : "Set alert"}
        </button>
      </div>

      {/* Frequency */}
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="frequency" value="daily" checked={frequency === "daily"} onChange={() => setFrequency("daily")} className="accent-amber-500" disabled={loading} />
          <span className="text-sm text-slate-300">Daily — one email per day if matching listings appear</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="frequency" value="weekly" checked={frequency === "weekly"} onChange={() => setFrequency("weekly")} className="accent-amber-500" disabled={loading} />
          <span className="text-sm text-slate-300">Weekly — a digest of matching listings from the past week</span>
        </label>
      </div>

      {/* Collapsed shipping & location options */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowLocationOptions(!showLocationOptions)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
          disabled={loading}
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationOptions ? "rotate-0" : "-rotate-90"}`} />
          Shipping &amp; location options
        </button>

        {showLocationOptions && (
          <div className="mt-3 space-y-3 pl-5">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Delivery Preference</label>
              <div className="flex gap-2">
                {([
                  { value: "shipping_only" as const, label: "Shipping Only" },
                  { value: "shipping_or_local" as const, label: "Local + Shipping" },
                  { value: "local_only" as const, label: "Local Only" },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDeliveryPref(value)}
                    className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                      deliveryPref === value
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-semibold"
                        : "bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-500"
                    }`}
                    disabled={loading}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {deliveryPref !== "shipping_only" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="block text-xs font-medium text-slate-300 mb-1">ZIP Code</span>
                  <input type="text" inputMode="numeric" maxLength={10} value={userZip} onChange={(e) => setUserZip(e.target.value)} placeholder="e.g. 90210" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500" disabled={loading} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-300 mb-1">Country</span>
                    <select value={userCountry} onChange={(e) => setUserCountry(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500" disabled={loading}>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-300 mb-1">Search Radius</span>
                    <select value={userRadiusMiles} onChange={(e) => setUserRadiusMiles(Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500" disabled={loading}>
                      <option value={25}>25 miles</option>
                      <option value={50}>50 miles</option>
                      <option value={100}>100 miles</option>
                      <option value={200}>200 miles</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input id="allow-international" type="checkbox" checked={allowInternational} onChange={(e) => setAllowInternational(e.target.checked)} className="mt-0.5 accent-amber-500" disabled={loading} />
              <label htmlFor="allow-international" className="text-xs text-slate-400">
                Include international listings
                <span className="block text-slate-500">Allow listings from outside your country (shipping eligibility may vary)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      <p className="mt-3 text-xs text-slate-500">
        No account needed. Every email includes an unsubscribe link.
      </p>
    </section>
  );
}
