// app/admin/agent-review/components/QueueFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface Props {
  agentNames: string[];
  entityTypes: string[];
  proposedActions: string[];
}

const RISK_OPTIONS = [
  { value: '', label: 'any risk' },
  { value: 'low', label: 'low' },
  { value: 'medium', label: 'medium' },
  { value: 'high', label: 'high' },
  { value: 'production_blocking', label: 'production blocking' },
];

const AGE_OPTIONS = [
  { value: '', label: 'any age' },
  { value: '1', label: 'last 24h' },
  { value: '7', label: 'last 7d' },
  { value: '30', label: 'last 30d' },
  { value: '90', label: 'last 90d' },
];

export default function QueueFilters({
  agentNames,
  entityTypes,
  proposedActions,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  function update(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/agent-review?${next.toString()}`);
  }

  function reset() {
    const tab = sp.get('tab');
    const next = new URLSearchParams();
    if (tab) next.set('tab', tab);
    router.push(`/admin/agent-review?${next.toString()}`);
  }

  const controls = (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="search">
        <input
          type="text"
          defaultValue={sp.get('q') ?? ''}
          placeholder="entity_id / note / action"
          className={inputClass}
          onBlur={(e) => update('q', e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value.trim());
          }}
        />
      </Field>
      <Field label="agent_name">
        <select
          className={inputClass}
          value={sp.get('agent_name') ?? ''}
          onChange={(e) => update('agent_name', e.target.value)}
        >
          <option value="">any agent</option>
          {agentNames.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Field>
      <Field label="entity_type">
        <select
          className={inputClass}
          value={sp.get('entity_type') ?? ''}
          onChange={(e) => update('entity_type', e.target.value)}
        >
          <option value="">any entity</option>
          {entityTypes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Field>
      <Field label="proposed_action">
        <select
          className={inputClass}
          value={sp.get('proposed_action') ?? ''}
          onChange={(e) => update('proposed_action', e.target.value)}
        >
          <option value="">any action</option>
          {proposedActions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Field>
      <Field label="risk_label">
        <select
          className={inputClass}
          value={sp.get('risk_label') ?? ''}
          onChange={(e) => update('risk_label', e.target.value)}
        >
          {RISK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="age">
        <select
          className={inputClass}
          value={sp.get('age_days') ?? ''}
          onChange={(e) => update('age_days', e.target.value)}
        >
          {AGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="confidence ≥">
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          defaultValue={sp.get('confidence_min') ?? ''}
          className={inputClass}
          onBlur={(e) => update('confidence_min', e.target.value)}
        />
      </Field>
      <Field label="confidence ≤">
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          defaultValue={sp.get('confidence_max') ?? ''}
          className={inputClass}
          onBlur={(e) => update('confidence_max', e.target.value)}
        />
      </Field>
      <div className="flex items-end">
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
        >
          Reset filters
        </button>
      </div>
    </div>
  );

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm text-slate-300 sm:hidden"
      >
        <span>Filters</span>
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>
      <div className={`${open ? 'mt-3 block' : 'hidden'} sm:mt-0 sm:block`}>
        {controls}
      </div>
    </section>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-600';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}
