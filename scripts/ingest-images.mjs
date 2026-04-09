import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

const SUPABASE_URL = 'https://frphiluaykgrmvyvdzsp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_KEY) { console.error('SUPABASE_SERVICE_KEY required'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BUCKET = 'product-images'
const CDN_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
const BATCH_SIZE = 20
const DELAY_MS = 800

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── Source handlers ───────────────────────────────────────────────────────────

async function tryARRMA(fullName) {
  const modelPart = fullName.replace(/^ARRMA\s+/i, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const url = `https://www.arrma-rc.com/en/product/${modelPart}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage && ogImage.includes('arrma')) return { url: ogImage, confidence: 0.85, source: 'brand_site_arrma' }
    const mainImg = $('img.product-image, .product-hero img, .pdp-image img').first().attr('src')
    if (mainImg) return { url: mainImg.startsWith('http') ? mainImg : `https://www.arrma-rc.com${mainImg}`, confidence: 0.75, source: 'brand_site_arrma' }
  } catch (e) {}
  return null
}

async function tryHorizonHobby(fullName, mfrSlug) {
  const query = encodeURIComponent(fullName)
  const brandName = mfrSlug === 'losi' ? 'Losi' : mfrSlug === 'axial' ? 'Axial' : 'ARRMA'
  const searchUrl = `https://www.horizonhobby.com/search?q=${query}&prefn1=brand&prefv1=${encodeURIComponent(brandName)}`
  try {
    const res = await fetch(searchUrl, { headers: { 'User-Agent': UA } })
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)
    const firstImg = $('.product-tile img, .product-image img').first().attr('src') ||
                     $('.product-tile img, .product-image img').first().attr('data-src')
    if (firstImg && firstImg.length > 10) {
      const imgUrl = firstImg.startsWith('http') ? firstImg : `https://www.horizonhobby.com${firstImg}`
      return { url: imgUrl, confidence: 0.65, source: 'horizon_hobby' }
    }
  } catch (e) {}
  return null
}

async function tryLosi(fullName) {
  const modelPart = fullName.replace(/^Losi\s+/i, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const url = `https://www.losi.com/en_US/cars-trucks/product.html/${modelPart}.html`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage && ogImage.length > 10) return { url: ogImage, confidence: 0.85, source: 'brand_site_losi' }
  } catch (e) {}
  return null
}

async function tryAxial(fullName) {
  const modelPart = fullName.replace(/^Axial\s+/i, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const url = `https://www.axialracing.com/en_US/cars-trucks/product.html/${modelPart}.html`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage && ogImage.length > 10) return { url: ogImage, confidence: 0.85, source: 'brand_site_axial' }
  } catch (e) {}
  return null
}

async function tryTeamAssociated(fullName) {
  const query = encodeURIComponent(fullName)
  const url = `https://www.teamassociated.com/cars_and_trucks/?search=${query}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage && ogImage.length > 10) return { url: ogImage, confidence: 0.70, source: 'brand_site_associated' }
  } catch (e) {}
  return null
}

async function tryTraxxas(fullName) {
  const query = encodeURIComponent(fullName.replace(/^Traxxas\s+/i, ''))
  const url = `https://traxxas.com/search?q=${query}&type=product`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage && ogImage.length > 10) return { url: ogImage, confidence: 0.80, source: 'brand_site_traxxas' }
    const firstImg = $('.product-item img, .product-image img').first().attr('src')
    if (firstImg && firstImg.length > 10) {
      const imgUrl = firstImg.startsWith('http') ? firstImg : `https://traxxas.com${firstImg}`
      return { url: imgUrl, confidence: 0.65, source: 'brand_site_traxxas' }
    }
  } catch (e) {}
  return null
}

// ── Source dispatch ───────────────────────────────────────────────────────────

async function findImage(fullName, mfrSlug, triedSources) {
  const tried = new Set(triedSources || [])

  if (mfrSlug === 'arrma' && !tried.has('brand_site_arrma')) {
    const r = await tryARRMA(fullName); if (r) return r
  }
  if (mfrSlug === 'losi' && !tried.has('brand_site_losi')) {
    const r = await tryLosi(fullName); if (r) return r
  }
  if (mfrSlug === 'axial' && !tried.has('brand_site_axial')) {
    const r = await tryAxial(fullName); if (r) return r
  }
  if (mfrSlug === 'traxxas' && !tried.has('brand_site_traxxas')) {
    const r = await tryTraxxas(fullName); if (r) return r
  }
  if (mfrSlug === 'team-associated' && !tried.has('brand_site_associated')) {
    const r = await tryTeamAssociated(fullName); if (r) return r
  }

  if (['arrma', 'losi', 'axial', 'ecx', 'element-rc'].includes(mfrSlug) && !tried.has('horizon_hobby')) {
    const r = await tryHorizonHobby(fullName, mfrSlug); if (r) return r
  }

  return null
}

// ── Upload to Supabase Storage ────────────────────────────────────────────────

async function uploadToStorage(imageUrl, variantSlug) {
  const res = await fetch(imageUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) return null
  const buffer = await res.arrayBuffer()
  if (buffer.byteLength < 5000) return null
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
  const filename = `auto/${variantSlug}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, { contentType, upsert: false })
  if (error) return null
  return `${CDN_BASE}/${filename}`
}

// ── Store result in DB ────────────────────────────────────────────────────────

async function storeImage(variantId, mfrSlug, cdnUrl, candidate) {
  const { data: existing } = await supabase
    .from('variant_images')
    .select('image_id, source_priority')
    .eq('variant_id', variantId)
    .eq('is_primary', true)
    .eq('status', 'active')
    .maybeSingle()

  const newPriority = 3

  if (existing && existing.source_priority != null && existing.source_priority < newPriority) {
    console.log(`  Keeping existing higher-priority image`)
    return false
  }

  if (existing) {
    await supabase.from('variant_images')
      .update({ is_primary: false })
      .eq('image_id', existing.image_id)
  }

  const { error } = await supabase.from('variant_images').insert({
    variant_id: variantId,
    image_url: cdnUrl,
    image_source: candidate.source,
    image_source_type: 'auto_ingested',
    rights_status: 'approved',
    license_type: 'affiliate_product_image',
    is_primary: true,
    status: 'active',
    added_by: 'auto_ingest_v1',
    source_priority: newPriority,
    match_confidence: candidate.confidence,
    quality_score: 0.75,
    selection_reason: `auto_ingested_from_${candidate.source}`,
    last_verified_at: new Date().toISOString(),
  })
  return !error
}

// ── Main loop ─────────────────────────────────────────────────────────────────

const { data: batch, error: batchErr } = await (supabase.rpc)('claim_image_ingestion_batch', { batch_size: BATCH_SIZE })
if (batchErr) { console.error('Failed to claim batch:', batchErr); process.exit(1) }
if (!batch || batch.length === 0) { console.log('Queue empty — nothing to process'); process.exit(0) }

console.log(`\nProcessing ${batch.length} items from queue\n`)

let resolved = 0, failed = 0, unresolved = 0
const bySource = {}

for (const item of batch) {
  const label = `[${item.mfr_slug}] ${item.full_name}`
  process.stdout.write(`${label}... `)

  try {
    const candidate = await findImage(item.full_name, item.mfr_slug, item.tried_sources)

    if (!candidate) {
      await supabase.from('image_ingestion_queue').update({
        status: 'unresolved_low_confidence',
        last_error: 'no_source_found',
        updated_at: new Date().toISOString(),
      }).eq('queue_id', item.queue_id)
      console.log('UNRESOLVED - no source found')
      unresolved++
      continue
    }

    const slugPart = (item.mfr_slug + '-' + item.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).slice(0, 60)
    const cdnUrl = await uploadToStorage(candidate.url, slugPart)

    if (!cdnUrl) {
      await supabase.from('image_ingestion_queue').update({
        status: 'failed',
        last_error: `upload_failed_from_${candidate.source}`,
        tried_sources: [...(item.tried_sources || []), candidate.source],
        updated_at: new Date().toISOString(),
      }).eq('queue_id', item.queue_id)
      console.log(`FAILED - upload failed (${candidate.source})`)
      failed++
      continue
    }

    await storeImage(item.variant_id, item.mfr_slug, cdnUrl, candidate)

    await supabase.from('image_ingestion_queue').update({
      status: 'complete',
      resolved_source: candidate.source,
      resolved_url: cdnUrl,
      confidence_score: candidate.confidence,
      updated_at: new Date().toISOString(),
    }).eq('queue_id', item.queue_id)

    bySource[candidate.source] = (bySource[candidate.source] || 0) + 1
    console.log(`OK (${candidate.source}, conf=${candidate.confidence})`)
    resolved++
  } catch (err) {
    await supabase.from('image_ingestion_queue').update({
      status: 'failed',
      last_error: err.message?.slice(0, 200),
      updated_at: new Date().toISOString(),
    }).eq('queue_id', item.queue_id)
    console.log(`ERROR: ${err.message}`)
    failed++
  }

  await new Promise(r => setTimeout(r, DELAY_MS))
}

console.log(`\n=== RESULTS ===`)
console.log(`Resolved: ${resolved}`)
console.log(`Failed:   ${failed}`)
console.log(`Unresolved: ${unresolved}`)
console.log(`By source:`, bySource)
