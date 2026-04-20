'use client'

import { useState } from 'react'
import RecommendedParts from '@/components/tools/RecommendedParts'

type UseCase = 'crawler' | 'sport' | 'performance'

const USE_CASE_LABEL: Record<UseCase, string> = {
  crawler: 'Crawler / Trail',
  sport: 'Sport / Bash',
  performance: 'Performance / Race',
}

const AMP_TABLE: Record<number, Record<UseCase, { min: number; max: number }>> = {
  2: { crawler: { min: 20, max: 40 }, sport: { min: 30, max: 60 }, performance: { min: 40, max: 80 } },
  3: { crawler: { min: 40, max: 60 }, sport: { min: 60, max: 80 }, performance: { min: 80, max: 120 } },
  4: { crawler: { min: 60, max: 80 }, sport: { min: 80, max: 120 }, performance: { min: 120, max: 160 } },
  6: { crawler: { min: 80, max: 120 }, sport: { min: 120, max: 160 }, performance: { min: 160, max: 200 } },
  8: { crawler: { min: 120, max: 160 }, sport: { min: 160, max: 200 }, performance: { min: 160, max: 200 } },
}

export default function EscCalculator() {
  const [cells, setCells] = useState<number | ''>('')
  const [useCase, setUseCase] = useState<UseCase>('sport')
  const [result, setResult] = useState<{ minAmps: number; maxAmps: number } | null>(null)

  const calculateResult = () => {
    if (cells === '') return
    const entry = AMP_TABLE[cells]?.[useCase]
    if (!entry) return
    setResult({ minAmps: entry.min, maxAmps: entry.max })
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Battery cell count
        </label>
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4, 6, 8].map((s) => (
            <button
              key={s}
              onClick={() => {
                setCells(s)
                setResult(null)
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                cells === s
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}S
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Use case</label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['crawler', 'Crawler / Trail'],
              ['sport', 'Sport / Bash'],
              ['performance', 'Performance / Race'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => {
                setUseCase(val)
                setResult(null)
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                useCase === val
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={calculateResult}
        disabled={cells === ''}
        className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Find ESCs
      </button>

      {result && (
        <div className="mt-6 border-t border-slate-700 pt-6">
          <div className="rounded-xl bg-slate-800 px-4 py-4 flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                Recommended amp rating
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {result.minAmps}–{result.maxAmps}A
              </div>
              <div className="text-xs text-slate-500 mt-1">
                for {cells}S · {USE_CASE_LABEL[useCase]}
              </div>
            </div>
          </div>

          <RecommendedParts
            specKey="amps"
            minValue={result.minAmps}
            maxValue={result.maxAmps}
            label="Recommended ESCs for this setup"
          />
        </div>
      )}
    </div>
  )
}
