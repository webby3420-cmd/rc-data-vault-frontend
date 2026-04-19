'use client'

import { useState } from 'react'

interface CompactHeroImageProps {
  imageUrl: string | null
  imageAlt: string | null
  modelName: string
}

export default function CompactHeroImage({ imageUrl, imageAlt, modelName }: CompactHeroImageProps) {
  const [imgError, setImgError] = useState(false)

  if (imageUrl && !imgError) {
    return (
      <div className="mb-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <img
          src={imageUrl}
          alt={imageAlt || `${modelName} reference image`}
          className="h-full w-full object-cover aspect-[16/9] max-h-56 sm:max-h-64"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }
  return <p className="mb-4 text-xs text-slate-600">Reference image pending review</p>
}
