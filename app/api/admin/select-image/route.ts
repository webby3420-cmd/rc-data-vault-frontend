import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'product-images'
const CDN_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const queueId = formData.get('queue_id') as string
  const variantId = formData.get('variant_id') as string
  const imageUrl = formData.get('image_url') as string
  const confidence = parseFloat(formData.get('confidence') as string || '0.7')
  const source = formData.get('source') as string

  if (!queueId || !variantId || !imageUrl) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Download and upload to Supabase Storage
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RCDataVault/1.0)' },
  })
  if (!res.ok) return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 })

  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const buffer = await res.arrayBuffer()
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
  const filename = `admin/${variantId}-${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET).upload(filename, buffer, { contentType, upsert: false })
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const cdnUrl = `${CDN_BASE}/${filename}`

  // Demote existing primary
  await supabase.from('variant_images')
    .update({ is_primary: false })
    .eq('variant_id', variantId).eq('is_primary', true)

  // Insert new primary
  await supabase.from('variant_images').insert({
    variant_id: variantId,
    image_url: cdnUrl,
    image_source: source,
    image_source_type: 'admin_selected',
    rights_status: 'approved',
    license_type: 'affiliate_product_image',
    is_primary: true,
    status: 'active',
    added_by: 'admin_manual_select',
    source_priority: 3,
    match_confidence: confidence,
    quality_score: 0.80,
    selection_reason: 'admin_manually_selected_from_google_candidates',
    last_verified_at: new Date().toISOString(),
  })

  // Mark queue complete
  await supabase.from('image_ingestion_queue').update({
    status: 'complete',
    resolved_source: 'admin_manual',
    resolved_url: cdnUrl,
    confidence_score: confidence,
    updated_at: new Date().toISOString(),
  }).eq('queue_id', queueId)

  // Redirect back to admin page
  return NextResponse.redirect(new URL('/admin/images', request.url))
}
