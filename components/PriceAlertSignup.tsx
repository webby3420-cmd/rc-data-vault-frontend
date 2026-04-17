"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PriceAlertSignup({
  variantId,
  variantSlug,
  modelName,
  mfrSlug,
  familySlug,
  modelFamilyId,
  signupSource,
}: {
  variantId: string;
  variantSlug: string;
  modelName: string;
  mfrSlug?: string;
  familySlug?: string;
  modelFamilyId?: string;
  signupSource?: string;
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

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 text-emerald-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-200">Price alert set</p>
            <p className="mt-1 text-sm text-slate-400">
              We'll email <span className="text-slate-300">{email}</span> when {modelName} drops below{" "}
              <span className="text-slate-300">${parseFloat(price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.
              Check your inbox for a confirmation.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              You can unsubscribe anytime via the link in any alert email.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-sm">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-white">
          Get notified when this model drops below your target price
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Set your target price for {modelName} and we'll email you when the market drops below it.
        </p>
      </div>
      <div className="mt-5 sm:mt-6 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_auto] md:items-end">
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
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Target price</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-500">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="299.99"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-8 pr-4 text-sm text-white outline-none transition focus:border-amber-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={loading}
            />
          </div>
        </label>
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !price}
          className="inline-flex h-[46px] items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Saving…" : "Create alert"}
        </button>
      </div>
      <div className="mt-4 flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="frequency"
            value="daily"
            checked={frequency === "daily"}
            onChange={() => setFrequency("daily")}
            className="accent-amber-500"
            disabled={loading}
          />
          <span className="text-sm text-slate-300">Daily — get alerts when new deals appear</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="frequency"
            value="weekly"
            checked={frequency === "weekly"}
            onChange={() => setFrequency("weekly")}
            className="accent-amber-500"
            disabled={loading}
          />
          <span className="text-sm text-slate-300">Weekly — get a summary of the week&apos;s best deals</span>
        </label>
      </div>
      <div className="mt-4">
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
        <p className="text-xs text-slate-500 mt-1">
          {deliveryPref === "shipping_only" && "Alerts for listings that ship to you"}
          {deliveryPref === "shipping_or_local" && "Alerts for any accessible listing"}
          {deliveryPref === "local_only" && "Alerts for pickup listings near you"}
        </p>
      </div>

      {deliveryPref !== "shipping_only" && (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="block text-xs font-medium text-slate-300 mb-1">ZIP Code</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={userZip}
              onChange={(e) => setUserZip(e.target.value)}
              placeholder="e.g. 90210"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
              disabled={loading}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-300 mb-1">Country</span>
              <select
                value={userCountry}
                onChange={(e) => setUserCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
                disabled={loading}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-300 mb-1">Search Radius</span>
              <select
                value={userRadiusMiles}
                onChange={(e) => setUserRadiusMiles(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500"
                disabled={loading}
              >
                <option value={25}>25 miles</option>
                <option value={50}>50 miles</option>
                <option value={100}>100 miles</option>
                <option value={200}>200 miles</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-start gap-2">
        <input
          id="allow-international"
          type="checkbox"
          checked={allowInternational}
          onChange={(e) => setAllowInternational(e.target.checked)}
          className="mt-0.5 accent-amber-500"
          disabled={loading}
        />
        <label htmlFor="allow-international" className="text-xs text-slate-400">
          Include international listings
          <span className="block text-slate-500">Allow listings from outside your country (shipping eligibility may vary)</span>
        </label>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}
      <p className="mt-3 text-xs text-slate-500">
        No account required. Unsubscribe anytime via your alert email.
      </p>
    </section>
  );
}
