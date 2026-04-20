"use client";
import { useState } from "react";
import RecommendedParts from "@/components/tools/RecommendedParts";

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      {help && <span className="mb-2 block text-xs text-slate-500">{help}</span>}
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, min, step, placeholder }: {
  value: string; onChange: (v: string) => void;
  min?: number; step?: number; placeholder?: string;
}) {
  return (
    <input
      type="number" inputMode="decimal"
      value={value} onChange={e => onChange(e.target.value)}
      min={min} step={step} placeholder={placeholder}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition"
    />
  );
}

export default function BatteryRuntimeCalculator() {
  const [capacity, setCapacity] = useState("5000");
  const [current, setCurrent] = useState("50");
  const [cells, setCells] = useState<number | null>(null);

  const capVal = parseFloat(capacity);
  const curVal = parseFloat(current);
  const valid = capVal > 0 && curVal > 0;
  const runtimeMin = valid ? (capVal / 1000 / curVal) * 60 : 0;
  const hours = Math.floor(runtimeMin / 60);
  const minutes = runtimeMin % 60;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Battery Runtime Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">Estimate how long your battery will last based on capacity and current draw.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Battery Capacity (mAh)" help="Printed on your battery label">
          <NumberInput value={capacity} onChange={setCapacity} min={1} step={100} placeholder="5000" />
        </Field>
        <Field label="Average Current Draw (A)" help="Typical range: 20–80A for most RC vehicles">
          <NumberInput value={current} onChange={setCurrent} min={0.1} step={1} placeholder="50" />
        </Field>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Cell count <span className="text-xs font-normal text-slate-500">(optional — required for battery suggestions)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4, 6, 8].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setCells(cells === s ? null : s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                cells === s
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {s}S
            </button>
          ))}
        </div>
      </div>
      {valid ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">{runtimeMin.toFixed(1)}</span>
            <span className="text-sm text-slate-400">minutes</span>
          </div>
          {hours > 0 && (
            <p className="text-sm text-slate-300">
              {hours}h {Math.round(minutes)}m total runtime
            </p>
          )}
          <p className="text-sm text-slate-300">
            {runtimeMin < 5
              ? "Very short runtime — consider a higher capacity battery or lower gearing."
              : runtimeMin < 10
              ? "Short session. Good for speed runs but you'll swap batteries often."
              : runtimeMin < 20
              ? "Solid run time for most bashing and racing sessions."
              : "Long runtime — great for extended sessions and crawling."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">
          Enter valid values above to calculate
        </div>
      )}
      {cells !== null && (
        <RecommendedParts
          specKey="cells"
          minValue={cells}
          maxValue={cells}
          label="Matching batteries for this cell count"
        />
      )}
    </div>
  );
}
