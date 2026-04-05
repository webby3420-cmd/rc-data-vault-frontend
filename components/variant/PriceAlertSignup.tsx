"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type PriceAlertSignupProps = {
  variantId: string;
  variantSlug: string;
  modelName?: string;
};

type FormState = {
  email: string;
  targetPrice: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PriceAlertSignup({ variantId, variantSlug, modelName }: PriceAlertSignupProps) {
  const [form, setForm] = useState<FormState>({ email: "", targetPrice: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const helperCopy = useMemo(() => {
    if (!modelName) return "Set your target price and we will email you when the market drops below it.";
    return `Set your target price for ${modelName} and we will email you when the market drops below it.`;
  }, [modelName]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = form.email.trim();
    const parsedTargetPrice = Number.parseFloat(form.targetPrice);

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!Number.isFinite(parsedTargetPrice) || parsedTargetPrice <= 0) {
      setError("Enter a target price greater than 0.");
      return;
    }

    setIsSubmitting(true);

    const { error: insertError } = await supabase.from("alert_subscriptions").insert({
      variant_id: variantId,
      variant_slug: variantSlug,
      target_price_usd: parsedTargetPrice,
      email: trimmedEmail,
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message || "Unable to save your alert right now.");
      return;
    }

    setSuccess("Price alert saved. We will email you when this model drops below your target price.");
    setForm({ email: trimmedEmail, targetPrice: "" });
  };

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-white">Get notified when this model drops below your target price</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{helperCopy}</p>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_auto] md:items-end" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500"
            required
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
              value={form.targetPrice}
              onChange={(event) => handleChange("targetPrice", event.target.value)}
              placeholder="299.99"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-8 pr-4 text-sm text-white outline-none transition focus:border-amber-500"
              required
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-[46px] items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Create alert"}
        </button>
      </form>

      {(error || success) && (
        <div className="mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${error ? "border-red-900 bg-red-950/40 text-red-200" : "border-emerald-900 bg-emerald-950/40 text-emerald-200"}">
          {error ?? success}
        </div>
      )}
    </section>
  );
}
