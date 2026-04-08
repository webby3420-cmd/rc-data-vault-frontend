'use client'

import { useState } from 'react'
import PriceAlertSignup from '@/components/PriceAlertSignup'

interface FamilyWatchCTAProps {
  familyName: string
  manufacturerName: string
  modelFamilyId: string
  familySlug: string
  manufacturerSlug: string
  totalVariants: number
}

export default function FamilyWatchCTA({
  familyName,
  manufacturerName,
  modelFamilyId,
  familySlug,
  manufacturerSlug,
  totalVariants,
}: FamilyWatchCTAProps) {
  const [showSignup, setShowSignup] = useState(false)

  if (totalVariants < 2) return null

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-200">
            Track the {manufacturerName} {familyName} market
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Covers all {totalVariants} variants in this family
          </p>
        </div>
        <button
          onClick={() => setShowSignup(!showSignup)}
          className="flex-shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Get deal alerts &rarr;
        </button>
      </div>

      {showSignup && (
        <div className="mt-4">
          <PriceAlertSignup
            variantId={modelFamilyId}
            variantSlug={familySlug}
            modelName={`${manufacturerName} ${familyName}`}
            mfrSlug={manufacturerSlug}
            familySlug={familySlug}
            modelFamilyId={modelFamilyId}
          />
        </div>
      )}
    </div>
  )
}
