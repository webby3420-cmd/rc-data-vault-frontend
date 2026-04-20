"use client";
import { useState } from "react";

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      {help && <span className="mb-2 block text-xs text-slate-500">{help}</span>}
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, min, max, step, placeholder }: {
  value: string; onChange: (v: string) => void;
  min?: number; max?: number; step?: number; placeholder?: string;
}) {
  return (
    <input
      type="number" inputMode="decimal"
      value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step} placeholder={placeholder}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition"
    />
  );
}

export default function GasMixCalculator() {
  const [liters, setLiters] = useState("1");
  const [ratio, setRatio] = useState("25");

  const litersVal = parseFloat(liters);
  const ratioVal = parseFloat(ratio);
  const valid = litersVal > 0 && ratioVal > 0;
  const oilMl = valid ? (litersVal * 1000) / ratioVal : 0;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Gas Mix Ratio Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">
          Calculate how much 2-stroke oil to add to your RC fuel for any mix ratio.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fuel Amount (L)" help="Volume of gasoline">
          <NumberInput value={liters} onChange={setLiters} min={0.01} step={0.1} placeholder="1" />
        </Field>
        <Field label="Mix Ratio (X:1)" help="Enter just the number. 25 = 25:1, 32 = 32:1, 40 = 40:1">
          <NumberInput value={ratio} onChange={setRatio} min={1} step={1} placeholder="25" />
        </Field>
      </div>
      {valid ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">{oilMl.toFixed(1)}</span>
            <span className="text-sm text-slate-400">mL</span>
          </div>
          <div className="text-sm text-slate-300">of 2-stroke oil to add</div>
          <div className="text-xs text-slate-500">
            For {litersVal}L of fuel at {ratioVal}:1 ratio
          </div>
          <div className="text-xs text-slate-500">
            {(oilMl / 1000).toFixed(4)}L · {(oilMl * 0.033814).toFixed(2)} fl oz
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">
          Enter valid values above to calculate
        </div>
      )}
      <p className="text-xs text-slate-500">
        Always verify your engine manufacturer&apos;s recommended mix ratio. Over-oiling reduces power; under-oiling risks engine damage.
      </p>
    </div>
  );
}
