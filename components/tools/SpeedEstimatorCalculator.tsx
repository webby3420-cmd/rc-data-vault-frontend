"use client";
import { useState } from "react";
import { estimateTopSpeedMph } from "@/lib/tools/speedEstimator";
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

export default function SpeedEstimatorCalculator() {
  const [kv, setKv] = useState("2200");
  const [volts, setVolts] = useState("14.8");
  const [spur, setSpur] = useState("54");
  const [pinion, setPinion] = useState("18");
  const [idr, setIdr] = useState("2.72");
  const [tire, setTire] = useState("105");
  const [eff, setEff] = useState("0.85");

  const result = estimateTopSpeedMph({
    kv: parseFloat(kv), batteryVolts: parseFloat(volts),
    spurTeeth: parseFloat(spur), pinionTeeth: parseFloat(pinion),
    internalDriveRatio: parseFloat(idr),
    tireDiameterMm: parseFloat(tire),
    drivetrainEfficiency: parseFloat(eff),
  });

  const valid = result.mph > 0;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Speed Estimator</h2>
        <p className="mt-1 text-sm text-slate-400">Estimate theoretical top speed from motor, gearing, and tire size.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Motor KV" help="KV rating of your motor">
          <NumberInput value={kv} onChange={setKv} min={1} step={100} placeholder="2200" />
        </Field>
        <Field label="Battery Volts" help="e.g. 7.4, 11.1, 14.8">
          <NumberInput value={volts} onChange={setVolts} min={1} step={0.1} placeholder="14.8" />
        </Field>
        <Field label="Spur Teeth">
          <NumberInput value={spur} onChange={setSpur} min={1} step={1} placeholder="54" />
        </Field>
        <Field label="Pinion Teeth">
          <NumberInput value={pinion} onChange={setPinion} min={1} step={1} placeholder="18" />
        </Field>
        <Field label="Internal Drive Ratio" help="From your vehicle's manual">
          <NumberInput value={idr} onChange={setIdr} min={0.1} step={0.01} placeholder="2.72" />
        </Field>
        <Field label="Tire Diameter (mm)" help="Measure inflated outer diameter">
          <NumberInput value={tire} onChange={setTire} min={10} step={1} placeholder="105" />
        </Field>
        <Field label="Drivetrain Efficiency" help="0.80–0.90 is typical">
          <NumberInput value={eff} onChange={setEff} min={0.1} max={1} step={0.01} placeholder="0.85" />
        </Field>
      </div>
      {valid ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">{result.mph.toFixed(1)}</span>
            <span className="text-sm text-slate-400">mph (theoretical)</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-800 px-3 py-2">
              <p className="text-xs text-slate-500">Final Drive Ratio</p>
              <p className="font-semibold text-white">{result.fdr.toFixed(2)}:1</p>
            </div>
            <div className="rounded-lg bg-slate-800 px-3 py-2">
              <p className="text-xs text-slate-500">Wheel RPM</p>
              <p className="font-semibold text-white">{Math.round(result.wheelRpm).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            ⚠ Theoretical estimate only. Real-world speed varies with terrain, sag voltage, temperature, and mechanical losses.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">
          Enter valid values above to estimate speed
        </div>
      )}
      {valid && parseFloat(kv) > 0 && (
        <RecommendedParts
          specKey="kv"
          minValue={Math.round(parseFloat(kv) * 0.85)}
          maxValue={Math.round(parseFloat(kv) * 1.15)}
          label="Motors in this KV range"
        />
      )}
    </div>
  );
}
