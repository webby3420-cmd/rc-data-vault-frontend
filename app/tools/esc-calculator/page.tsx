import type { Metadata } from 'next'
import Link from 'next/link'
import EscCalculator from '@/components/tools/EscCalculator'

export const metadata: Metadata = {
  title: 'ESC Selector | RC Data Vault',
  description:
    'Choose your battery cell count and use case to get a recommended ESC amp rating, with matching ESCs from our parts catalog.',
}

export default function EscCalculatorPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Back to Tools
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">ESC Selector</h1>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed max-w-xl">
          Choose your battery cell count and use case to get a recommended amp
          rating — then see matching ESCs from our catalog.
        </p>
      </div>

      <EscCalculator />

      <p className="mt-8 text-xs text-slate-600 text-center">
        Amp ratings are general guidelines. Always verify compatibility with your
        specific motor and vehicle before purchasing.
      </p>
    </main>
  )
}
