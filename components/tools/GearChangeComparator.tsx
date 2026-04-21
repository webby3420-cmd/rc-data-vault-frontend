"use client";
import { useState } from "react";
import { compareGearChange } from "@/lib/tools/gearChangeComparator";

type GearPitch = 'mod1' | 'mod1_5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      type="number" inputMode="decimal" value={value}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition"
    />
  );
}

export default function GearChangeComparator() {
  const [curSpur, setCurSpur] = useState("54");
  const [curPinion, setCurPinion] = useState("18");
  const [newSpur, setNewSpur] = useState("54");
  const [newPinion, setNewPinion] = useState("20");
  const [idr, setIdr] = useState("2.72");
  const [pitch, setPitch] = useState<GearPitch>('mod1');

  const result = compareGearChange({
    currentSpur: parseFloat(curSpur), currentPinion: parseFloat(curPinion),
    newSpur: parseFloat(newSpur), newPinion: parseFloat(newPinion),
    internalDriveRatio: parseFloat(idr),
  });

  const valid = result.currentFdr > 0 && result.newFdr > 0;

  const directionColor = result.gearingDirection === "taller"
    ? "text-blue-400" : result.gearingDirection === "shorter"
    ? "text-orange-400" : "text-slate-400";

  const directionDesc: Record<string, string> = {
    taller: "Taller gearing — more top speed potential, more load on motor.",
    shorter: "Shorter gearing — more punch and acceleration, lower top speed.",
    same: "No change — FDR is effectively the same.",
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Gear Change Comparator</h2>
        <p className="mt-1 text-sm text-slate-400">Compare your current gearing to a proposed change.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Setup</p>
          <Field label="Current Spur Teeth">
            <NumberInput value={curSpur} onChange={setCurSpur} placeholder="54" />
          </Field>
          <Field label="Current Pinion Teeth">
            <NumberInput value={curPinion} onChange={setCurPinion} placeholder="18" />
          </Field>
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Proposed Setup</p>
          <Field label="New Spur Teeth">
            <NumberInput value={newSpur} onChange={setNewSpur} placeholder="54" />
          </Field>
          <Field label="New Pinion Teeth">
            <NumberInput value={newPinion} onChange={setNewPinion} placeholder="20" />
          </Field>
        </div>
      </div>
      <Field label="Internal Drive Ratio">
        <NumberInput value={idr} onChange={setIdr} placeholder="2.72" />
      </Field>
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
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-slate-800 px-3 py-3">
              <p className="text-xs text-slate-500 mb-1">Current FDR</p>
              <p className="text-lg font-bold text-white">{result.currentFdr.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className={`text-2xl font-bold ${directionColor}`}>
                {result.gearingDirection === "taller" ? "→" : result.gearingDirection === "shorter" ? "←" : "="}
              </span>
            </div>
            <div className="rounded-lg bg-slate-800 px-3 py-3">
              <p className="text-xs text-slate-500 mb-1">New FDR</p>
              <p className="text-lg font-bold text-white">{result.newFdr.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold capitalize ${directionColor}`}>{result.gearingDirection}</span>
            <span className="text-sm text-slate-400">
              ({result.deltaPct > 0 ? "+" : ""}{result.deltaPct.toFixed(1)}% FDR change)
            </span>
          </div>
          <p className="text-sm text-slate-300">{directionDesc[result.gearingDirection]}</p>
          <div className="text-xs text-slate-500">
            {pitch === 'mod1' ? 'MOD 1' : 'MOD 1.5'} pitch
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5 text-center text-sm text-slate-500">
          Enter valid values above to compare
        </div>
      )}
      {/* TODO: filter RecommendedParts by pitch when coverage improves
          <RecommendedParts specKey="pitch" minValue={pitch} ... /> */}
    </div>
  );
}
