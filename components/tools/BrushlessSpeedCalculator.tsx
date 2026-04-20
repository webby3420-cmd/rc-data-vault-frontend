"use client";
import { useState } from "react";

function calcSpeed(wheelRpm: number, tireDiamMm: number) {
  const circumMm = Math.PI * tireDiamMm;
  const speedKmh = (wheelRpm * circumMm * 60) / 1_000_000;
  const speedMph = speedKmh * 0.621371;
  return { speedKmh, speedMph };
}

function calcFdr(pinion: number, spur: number, diffPinion: number, diffSpur: number) {
  return (spur / pinion) * (diffSpur / diffPinion);
}

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

export default function BrushlessSpeedCalculator() {
  const [kv, setKv] = useState("2200");
  const [cells, setCells] = useState("3");
  const [pinion, setPinion] = useState("18");
  const [spur, setSpur] = useState("54");
  const [diffPinion, setDiffPinion] = useState("14");
  const [diffSpur, setDiffSpur] = useState("38");
  const [tireMm, setTireMm] = useState("110");

  const kvVal = parseFloat(kv);
  const cellsVal = parseFloat(cells);
  const voltage = cellsVal * 3.7;
  const motorRpm = kvVal * voltage;
  const fdr = calcFdr(parseFloat(pinion), parseFloat(spur), parseFloat(diffPinion), parseFloat(diffSpur));
  const wheelRpm = motorRpm / fdr;
  const { speedKmh, speedMph } = calcSpeed(wheelRpm, parseFloat(tireMm));

  const valid =
    kvVal > 0 &&
    cellsVal > 0 &&
    parseFloat(pinion) > 0 &&
    parseFloat(spur) > 0 &&
    parseFloat(diffPinion) > 0 &&
    parseFloat(diffSpur) > 0 &&
    parseFloat(tireMm) > 0;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Advanced Brushless Speed Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">
          Estimate theoretical top speed from motor KV, LiPo cells, gearing, and tire diameter.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Motor KV" help="kV = RPM per volt. Higher kV = faster motor.">
          <NumberInput value={kv} onChange={setKv} min={1} step={100} placeholder="2200" />
        </Field>
        <Field label="LiPo Cells" help="e.g. 2S, 3S, 4S, 6S">
          <NumberInput value={cells} onChange={setCells} min={1} step={1} placeholder="3" />
        </Field>
        <Field label="Pinion Teeth">
          <NumberInput value={pinion} onChange={setPinion} min={1} step={1} placeholder="18" />
        </Field>
        <Field label="Spur Teeth">
          <NumberInput value={spur} onChange={setSpur} min={1} step={1} placeholder="54" />
        </Field>
        <Field label="Diff Pinion Teeth">
          <NumberInput value={diffPinion} onChange={setDiffPinion} min={1} step={1} placeholder="14" />
        </Field>
        <Field label="Diff Spur Teeth">
          <NumberInput value={diffSpur} onChange={setDiffSpur} min={1} step={1} placeholder="38" />
        </Field>
        <Field label="Tire Diameter (mm)" help="Measure inflated outer diameter">
          <NumberInput value={tireMm} onChange={setTireMm} min={10} step={1} placeholder="110" />
        </Field>
      </div>
      {valid ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-400">{speedKmh.toFixed(1)}</span>
            <span className="text-sm text-slate-400">km/h</span>
          </div>
          <div className="text-sm text-slate-300">{speedMph.toFixed(1)} mph</div>
          <div className="text-xs text-slate-500">
            FDR: {fdr.toFixed(2)} · Motor RPM: {motorRpm.toFixed(0)} · {cellsVal}S · {voltage.toFixed(1)}V nominal
          </div>
          <p className="text-xs text-slate-500">
            Theoretical maximum — real speeds vary with sag voltage, terrain, and mechanical losses.
          </p>
          {/* TODO: <RecommendedParts specKey="kv" minValue={...} maxValue={...} /> */}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">
          Enter valid values above to estimate speed
        </div>
      )}
    </div>
  );
}
