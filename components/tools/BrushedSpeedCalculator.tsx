"use client";
import { useState } from "react";

// Brushed motor RPM approximation:
// motorRpm ≈ (55000 / turns) × voltage
// Constant 55000 derived from typical 540-size brushed motor data:
//   27T @ 7.2V ≈ 14,700 RPM, 20T @ 7.2V ≈ 19,800 RPM, 35T @ 7.2V ≈ 11,300 RPM
// Varies by motor design. Use as a directional estimate only.

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

export default function BrushedSpeedCalculator() {
  const [turns, setTurns] = useState("27");
  const [voltage, setVoltage] = useState("7.4");
  const [pinion, setPinion] = useState("18");
  const [spur, setSpur] = useState("54");
  const [diffPinion, setDiffPinion] = useState("14");
  const [diffSpur, setDiffSpur] = useState("38");
  const [tireMm, setTireMm] = useState("110");

  const turnsVal = parseFloat(turns);
  const voltVal = parseFloat(voltage);
  const motorRpm = (55000 / turnsVal) * voltVal;
  const fdr = calcFdr(parseFloat(pinion), parseFloat(spur), parseFloat(diffPinion), parseFloat(diffSpur));
  const wheelRpm = motorRpm / fdr;
  const { speedKmh, speedMph } = calcSpeed(wheelRpm, parseFloat(tireMm));

  const valid =
    turnsVal > 0 &&
    voltVal > 0 &&
    parseFloat(pinion) > 0 &&
    parseFloat(spur) > 0 &&
    parseFloat(diffPinion) > 0 &&
    parseFloat(diffSpur) > 0 &&
    parseFloat(tireMm) > 0;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Brushed Motor Speed Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">
          Estimate top speed for brushed RC vehicles from motor turns, voltage, gearing, and tire size.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Motor Turns" help="Lower turns = faster. Common: 13T–21T sport, 27T stock, 35T–55T crawler.">
          <NumberInput value={turns} onChange={setTurns} min={1} step={1} placeholder="27" />
        </Field>
        <Field label="Voltage (V)" help="7.2V = 6-cell NiMH, 7.4V = 2S LiPo, 8.4V = 7-cell NiMH">
          <NumberInput value={voltage} onChange={setVoltage} min={0.1} step={0.1} placeholder="7.4" />
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
        <>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-amber-400">{speedKmh.toFixed(1)}</span>
              <span className="text-sm text-slate-400">km/h</span>
            </div>
            <div className="text-sm text-slate-300">{speedMph.toFixed(1)} mph</div>
            <div className="text-xs text-slate-500">
              FDR: {fdr.toFixed(2)} · Est. motor RPM: {motorRpm.toFixed(0)}
            </div>
            {/* TODO: <RecommendedParts specKey="kv" minValue={...} maxValue={...} /> */}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Brushed motor speed is a rough estimate. Real-world RPM varies significantly by motor design, wind, and condition. Use for directional planning only.
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">
          Enter valid values above to estimate speed
        </div>
      )}
    </div>
  );
}
