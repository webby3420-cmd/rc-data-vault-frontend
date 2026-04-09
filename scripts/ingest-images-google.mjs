import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://frphiluaykgrmvyvdzsp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const GOOGLE_KEY = process.env.GOOGLE_SEARCH_API_KEY
const GOOGLE_CX = process.env.GOOGLE_SEARCH_CX

if (!SUPABASE_KEY || !GOOGLE_KEY || !GOOGLE_CX) {
  console.error('Missing required env vars: SUPABASE_SERVICE_KEY, GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BUCKET = 'product-images'
const CDN_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
const BATCH_SIZE = parseInt(process.argv[2] || '20')
const DELAY_MS = 1200
const MIN_CONFIDENCE = 0.55

// ── Query builder ──────────────────────────────────────────────────────────

function buildSearchQuery(fullName, mfrSlug, mfrName) {
  const cleanName = fullName.replace(new RegExp(`^${mfrName}\\s+`, 'i'), '').trim()

  const brandSite = {
    'arrma': 'site:arrma-rc.com OR site:horizonhobby.com',
    'losi': 'site:losi.com OR site:horizonhobby.com',
    'axial': 'site:axialracing.com OR site:horizonhobby.com',
    'traxxas': 'site:traxxas.com',
    'team-associated': 'site:teamassociated.com',
    'kyosho': 'site:kyosho.com OR site:kyoshoamerica.com',
    'hpi-racing': 'site:hpieurope.com OR site:hpiracing.com',
    'tekno-rc': 'site:teknorc.com',
    'redcat-racing': 'site:redcatracing.com',
    'element-rc': 'site:elementrc.com',
  }[mfrSlug]

  const siteFilter = brandSite ? `(${brandSite})` : ''
  return `${mfrName} ${cleanName} RC car ${siteFilter}`.trim()
}

// ── Confidence scorer ──────────────────────────────────────────────────────

function scoreCandidate(item, fullName, mfrName) {
  let confidence = 0.40
  let qualityScore = 0.50

  const title = (item.title || '').toLowerCase()
  const link = (item.link || '').toLowerCase()
  const snippet = (item.snippet || '').toLowerCase()
  const nameLower = fullName.toLowerCase()
  const mfrLower = mfrName.toLowerCase()

  const trustedDomains = [
    'arrma-rc.com', 'losi.com', 'axialracing.com', 'traxxas.com',
    'teamassociated.com', 'kyosho.com', 'kyoshoamerica.com',
    'teknorc.com', 'redcatracing.com', 'elementrc.com', 'horizonhobby.com',
  ]
  const retailerDomains = ['amainhobbies.com', 'rcplanet.com', 'towerhobbies.com', 'horizonhobby.com']

  if (trustedDomains.some(d => link.includes(d))) confidence += 0.25
  else if (retailerDomains.some(d => link.includes(d))) confidence += 0.10

  if (title.includes(mfrLower)) confidence += 0.05

  const modelWords = nameLower.split(/\s+/).filter(w => w.length > 3 &&
    !['with', 'and', 'the', 'for', 'rtr', 'kit', 'bnf', 'pnp', 'arr'].includes(w))
  const matchedWords = modelWords.filter(w => title.includes(w) || snippet.includes(w))
  const wordMatchRatio = modelWords.length > 0 ? matchedWords.length / modelWords.length : 0
  confidence += wordMatchRatio * 0.20

  const img = item.image || {}
  const width = img.width || 0
  const height = img.height || 0

  if (width >= 800 && height >= 600) qualityScore += 0.25
  else if (width >= 400 && height >= 300) qualityScore += 0.10

  const badSignals = ['logo', 'banner', 'icon', 'avatar', 'thumb', 'diagram', 'schematic']
  if (badSignals.some(s => link.includes(s) || title.includes(s))) {
    confidence -= 0.20
    qualityScore -= 0.20
  }

  if (width > 0 && width < 200) qualityScore -= 0.20

  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    qualityScore: Math.max(0, Math.min(1, qualityScore)),
  }
}

// ── Google CSE image search ────────────────────────────────────────────────

async function searchGoogleImages(query) {
  const params = new URLSearchParams({
    key: GOOGLE_KEY,
    cx: GOOGLE_CX,
    q: query,
    searchType: 'image',
    num: '10',
    imgType: 'photo',
    imgSize: 'large',
    safe: 'off',
  })
  const url = `https://www.googleapis.com/customsearch/v1?${params}`
  const res = await fetch(url)
  if (res.status === 429) throw new Error('Google API rate limit hit')
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google API error ${res.status}: ${err.error?.message || res.statusText}`)
  }
  const data = await res.json()
  return data.items || []
}

// ── Upload to Supabase Storage ─────────────────────────────────────────────

async function uploadToStorage(imageUrl, slug) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RCDataVault/1.0)' },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) return null
    const buffer = await res.arrayBuffer()
    if (buffer.byteLength < 8000) return null
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const filename = `auto/${slug}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, { contentType, upsert: false })
    if (error) return null
    return `${CDN_BASE}/${filename}`
  } catch (e) {
    clearTimeout(timeout)
    return null
  }
}

// ── Store winning image in variant_images ──────────────────────────────────

async function storeImage(variantId, cdnUrl, candidate) {
  await supabase.from('variant_images')
    .update({ is_primary: false })
    .eq('variant_id', variantId)
    .eq('is_primary', true)

  const { error } = await supabase.from('variant_images').insert({
    variant_id: variantId,
    image_url: cdnUrl,
    image_source: candidate.source,
    image_source_type: 'auto_ingested',
    rights_status: 'approved',
    license_type: 'affiliate_product_image',
    is_primary: true,
    status: 'active',
    added_by: 'google_cse_ingest_v1',
    source_priority: 3,
    match_confidence: candidate.confidence,
    quality_score: candidate.qualityScore,
    selection_reason: `google_cse_top_result_conf_${candidate.confidence.toFixed(2)}`,
    last_verified_at: new Date().toISOString(),
  })
  return !error
}

// ── Main processing loop ───────────────────────────────────────────────────

const { data: batch, error: batchErr } = await supabase.rpc('claim_image_ingestion_batch', { batch_size: BATCH_SIZE })
if (batchErr) { console.error('Batch claim failed:', batchErr); process.exit(1) }
if (!batch?.length) { console.log('Queue empty — nothing to process'); process.exit(0) }

console.log(`\nProcessing ${batch.length} items | min_confidence=${MIN_CONFIDENCE}\n`)

let resolved = 0, failed = 0, unresolved = 0, rateLimitHit = false
const bySource = {}
const stats = { byManufacturer: {} }

for (const item of batch) {
  if (rateLimitHit) {
    await supabase.from('image_ingestion_queue')
      .update({ status: 'pending', attempt_count: Math.max(0, item.attempt_count - 1), updated_at: new Date().toISOString() })
      .eq('queue_id', item.queue_id)
    continue
  }

  const label = `[${item.mfr_slug}] ${item.full_name}`
  process.stdout.write(`${label}... `)

  try {
    const query = buildSearchQuery(item.full_name, item.mfr_slug, item.mfr_name)
    const results = await searchGoogleImages(query)

    const candidates = results.map(r => ({
      url: r.link,
      title: r.title,
      source: new URL(r.link).hostname,
      ...scoreCandidate(r, item.full_name, item.mfr_name),
    })).sort((a, b) => b.confidence - a.confidence)

    await supabase.from('image_ingestion_queue').update({
      google_candidates: candidates.slice(0, 5),
      search_query_used: query,
    }).eq('queue_id', item.queue_id)

    const best = candidates[0]

    if (!best || best.confidence < MIN_CONFIDENCE) {
      await supabase.from('image_ingestion_queue').update({
        status: 'unresolved_low_confidence',
        last_error: best ? `best_confidence_${best.confidence.toFixed(2)}_below_threshold` : 'no_results',
        tried_sources: [...(item.tried_sources || []), 'google_images'],
        updated_at: new Date().toISOString(),
      }).eq('queue_id', item.queue_id)
      console.log(`UNRESOLVED (best conf=${best?.confidence?.toFixed(2) || 'none'})`)
      unresolved++
      continue
    }

    const slugBase = `${item.mfr_slug}-${item.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`
    const cdnUrl = await uploadToStorage(best.url, slugBase)

    if (!cdnUrl) {
      await supabase.from('image_ingestion_queue').update({
        status: 'failed',
        last_error: `upload_failed_url_${best.url.slice(0, 100)}`,
        tried_sources: [...(item.tried_sources || []), 'google_images'],
        updated_at: new Date().toISOString(),
      }).eq('queue_id', item.queue_id)
      console.log(`FAILED (upload failed, conf was ${best.confidence.toFixed(2)})`)
      failed++
      continue
    }

    await storeImage(item.variant_id, cdnUrl, best)

    await supabase.from('image_ingestion_queue').update({
      status: 'complete',
      resolved_source: 'google_images',
      resolved_url: cdnUrl,
      confidence_score: best.confidence,
      tried_sources: [...(item.tried_sources || []), 'google_images'],
      updated_at: new Date().toISOString(),
    }).eq('queue_id', item.queue_id)

    bySource[best.source] = (bySource[best.source] || 0) + 1
    stats.byManufacturer[item.mfr_slug] = (stats.byManufacturer[item.mfr_slug] || 0) + 1
    console.log(`OK (conf=${best.confidence.toFixed(2)}, src=${best.source})`)
    resolved++

  } catch (err) {
    if (err.message?.includes('rate limit')) {
      console.log(`RATE LIMIT HIT — stopping batch`)
      rateLimitHit = true
      await supabase.from('image_ingestion_queue').update({
        status: 'pending',
        attempt_count: Math.max(0, item.attempt_count - 1),
        updated_at: new Date().toISOString(),
      }).eq('queue_id', item.queue_id)
      continue
    }
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

console.log(`\n${'='.repeat(50)}`)
console.log(`RESULTS: resolved=${resolved} failed=${failed} unresolved=${unresolved}`)
console.log(`By image source domain:`, bySource)
console.log(`By manufacturer:`, stats.byManufacturer)
if (rateLimitHit) console.log(`Google API daily quota reached — re-run tomorrow`)
