"use client";
import { useState } from "react";
import { calculateFinalDriveRatio } from "@/lib/tools/gearRatio";
import RecommendedParts from "@/components/tools/RecommendedParts";

type GearPitch = 'mod1' | 'mod1_5';

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

export default function GearRatioCalculator() {
  const [spur, setSpur] = useState("54");
  const [pinion, setPinion] = useState("18");
  const [idr, setIdr] = useState("2.72");
  const [pitch, setPitch] = useState<GearPitch>('mod1');

  const fdr = calculateFinalDriveRatio(parseFloat(spur), parseFloat(pinion), parseFloat(idr));
  const valid = fdr > 0;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Gear Ratio Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">Calculate your final drive ratio from spur, pinion, and internal drive ratio.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Spur Teeth" help="Count on the spur gear">
          <NumberInput value={spur} onChange={setSpur} min={1} step={1} placeholder="54" />
        </Field>
        <Field label="Pinion Teeth" help="Count on the pinion gear">
          <NumberInput value={pinion} onChange={setPinion} min={1} step={1} placeholder="18" />
        </Field>
        <Field label="Internal Drive Ratio" help="From your vehicle's manual">
          <NumberInput value={idr} onChange={setIdr} min={0.1} step={0.01} placeholder="2.72" />
        </Field>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Gear pitch
        </label>
        <div className="flex gap-2">
          {([
            ['mod1',   'MOD 1'],
            ['mod1_5', 'MOD 1.5'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setPitch(val)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                pitch === val
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {valid ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">{fdr.toFixed(2)}</span>
            <span className="text-sm text-slate-400">:1 final drive ratio</span>
          </div>
          <div className="text-xs text-slate-500">
            {pitch === 'mod1' ? 'MOD 1' : 'MOD 1.5'} pitch
          </div>
          <p className="text-sm text-slate-300">
            {fdr > 8
              ? "High FDR — more torque and acceleration, lower top speed. Good for technical terrain."
              : fdr > 5
              ? "Balanced FDR — good mix of acceleration and speed."
              : "Low FDR — more top speed, less torque multiplication. Best for high-speed runs."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">
          Enter valid values above to calculate
        </div>
      )}
      {valid && parseFloat(spur) > 0 && (
        <RecommendedParts
          specKey="teeth"
          minValue={parseFloat(spur)}
          maxValue={parseFloat(spur)}
          label="Matching spur gears for this tooth count"
          pitchFilter={pitch}
        />
      )}
    </div>
  );
}
