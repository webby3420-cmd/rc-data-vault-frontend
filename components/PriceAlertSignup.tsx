"use client";
import { useState } from "react";

export default function PriceAlertSignup({
  variantId,
  variantSlug,
  modelName,
}: {
  variantId: string;
  variantSlug: string;
  modelName: string;
}) {
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!email || !price) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-slate-300">
          Alert set. We will email you when {modelName} drops below ${price}.
        </p>
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
          Set your target price for {modelName} and we will email you when the market drops below it.
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
            />
          </div>
        </label>
        <button
          onClick={handleSubmit}
          className="inline-flex h-[46px] items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Create alert
        </button>
      </div>
    </section>
  );
}
