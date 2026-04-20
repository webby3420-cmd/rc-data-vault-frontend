"use client";
import { useState } from "react";
import RecommendedParts from "@/components/tools/RecommendedParts";

const NOMINAL_VOLTAGE: Record<number, number> = {
  2: 7.4,
  3: 11.1,
  4: 14.8,
  6: 22.2,
  8: 29.6,
};

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
  const [cells, setCells] = useState<number | null>(null);
  const [capacity, setCapacity] = useState("5000");
  const [watts, setWatts] = useState("500");

  const capVal = parseFloat(capacity);
  const avgWatts = parseFloat(watts);
  const valid = cells !== null && capVal > 0 && avgWatts > 0;

  const nominalV = cells !== null ? NOMINAL_VOLTAGE[cells] : 0;
  const Ah = capVal / 1000;
  const Wh = nominalV * Ah;
  const runtimeMin = valid ? (Wh / avgWatts) * 60 : 0;
  const hours = Math.floor(runtimeMin / 60);
  const minutes = runtimeMin % 60;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Battery Runtime Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">Estimate how long your battery will last based on cell count, capacity, and power draw.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Battery cell count (S rating)
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Battery Capacity (mAh)" help="Printed on your battery label">
          <NumberInput value={capacity} onChange={setCapacity} min={1} step={100} placeholder="5000" />
        </Field>
        <Field label="Average power draw (W)" help="Typical: 200–500W for 3S–4S, 500–1200W for 6S, 1000–2500W for 8S">
          <NumberInput value={watts} onChange={setWatts} min={10} step={50} placeholder="500" />
        </Field>
      </div>
      {valid ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">{runtimeMin.toFixed(1)}</span>
            <span className="text-sm text-slate-400">minutes (estimated)</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Battery energy: {Wh.toFixed(1)} Wh ({cells}S · {nominalV}V nominal · {Ah.toFixed(2)} Ah)
          </div>
          {hours > 0 && (
            <p className="text-sm text-slate-300">
              {hours}h {Math.round(minutes)}m total runtime
            </p>
          )}
          <p className="text-sm text-slate-300">
            {runtimeMin < 5 && "Very short session. Expect frequent battery swaps."}
            {runtimeMin >= 5 && runtimeMin < 10 && "Short session. Good for speed runs."}
            {runtimeMin >= 10 && runtimeMin < 20 && "Typical bashing session."}
            {runtimeMin >= 20 && runtimeMin < 35 && "Good runtime. You'll get a solid run in."}
            {runtimeMin >= 35 && "Long runtime. Efficient setup or light driving style."}
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
