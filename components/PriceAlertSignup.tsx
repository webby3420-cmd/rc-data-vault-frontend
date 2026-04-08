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
}: {
  variantId: string;
  variantSlug: string;
  modelName: string;
  mfrSlug?: string;
  familySlug?: string;
  modelFamilyId?: string;
}) {
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        is_active: true,
        ...(modelFamilyId ? { model_family_id: modelFamilyId } : {}),
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
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-white">
          Get notified when this model drops below your target price
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Set your target price for {modelName} and we'll email you when the market drops below it.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_auto] md:items-end">
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
      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}
      <p className="mt-3 text-xs text-slate-500">
        No account required. Unsubscribe anytime via your alert email.
      </p>
    </section>
  );
}
