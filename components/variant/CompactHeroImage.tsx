'use client'

import { useState } from 'react'
import { PLACEHOLDER_VARIANT_IMAGE, getCatalogImageUrl } from '@/lib/catalog-image'

interface CompactHeroImageProps {
  imageUrl: string | null
  imageAlt: string | null
  modelName: string
}

export default function CompactHeroImage({ imageUrl, imageAlt, modelName }: CompactHeroImageProps) {
  const [imgError, setImgError] = useState(false)

  const src = imgError ? PLACEHOLDER_VARIANT_IMAGE : getCatalogImageUrl(imageUrl)

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <img
        src={src}
        alt={imageAlt || `${modelName} reference image`}
        className="h-full w-full object-contain aspect-[16/9] max-h-56 sm:max-h-64"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => setImgError(true)}
      />
    </div>
  )
}
