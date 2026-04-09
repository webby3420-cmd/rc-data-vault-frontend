import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://frphiluaykgrmvyvdzsp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_KEY) { console.error('SUPABASE_SERVICE_KEY required'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BUCKET = 'product-images'
const CDN_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

// Horizon Hobby brands — their CDN hosts ARRMA, Losi, Axial, ECX images
const HORIZON_PREFIXES = ['ara', 'los', 'axi', 'ecx', 'spm']

// Extract potential SKU from AMain image URL filename
// e.g. "ara-ara7615v4.jpg" → "ARA7615V4"
// e.g. "los04020t1.jpg" → "LOS04020T1"
// e.g. "tra68086-24-red.jpg" → "TRA68086-24" (but Traxxas isn't on Horizon)
function extractSkuFromAmainUrl(url) {
  const filename = new URL(url).pathname.split('/').pop()?.replace(/\.jpg$/i, '') ?? ''
  // Remove manufacturer prefix duplication (e.g. "ara-ara7615v4" → "ara7615v4")
  const cleaned = filename.replace(/^(\w{3})-\1/, '$1')
  // Remove color suffix (e.g. "-red", "-blue", "-orng", "-grn", "-pink", "-grnx", "-brwn")
  const noColor = cleaned.replace(/-(red|blue|blk|orng|grn|grnx|pink|brwn|slvr|wht|ylw|purp)$/i, '')
  return noColor.toUpperCase()
}

// Try multiple Horizon Hobby URL patterns
async function tryHorizonImage(sku) {
  const patterns = [
    `https://www.horizonhobby.com/dw/image/v2/BFBQ_PRD/on/demandware.static/-/Sites-horizon-master/default/images/large/${sku.toLowerCase()}.jpg`,
    `https://assets.horizonhobby.com/is/image/horizon/${sku}_Web`,
  ]

  for (const url of patterns) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
      if (res.ok) {
        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.startsWith('image/')) return url
      }
    } catch {}
  }
  return null
}

async function downloadAndUpload(sourceUrl, filename) {
  // Check if already in storage
  const { data: existing } = await supabase.storage.from(BUCKET).list('', { search: filename })
  if (existing && existing.length > 0) {
    return `${CDN_BASE}/${filename}`
  }

  const res = await fetch(sourceUrl)
  if (!res.ok) return null

  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'

  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType,
    upsert: true,
  })

  if (error) {
    console.warn(`  UPLOAD ERROR: ${error.message}`)
    return null
  }

  return `${CDN_BASE}/${filename}`
}

// --- Main ---
console.log('=== FETCHING MISSING VARIANT IMAGES ===\n')

const { data: rows } = await supabase
  .from('variant_images')
  .select('image_id, image_url, variant_id')
  .not('image_url', 'is', null)
  .ilike('image_url', '%amainhobbies.com%')

console.log(`Found ${rows.length} variant images still on AMain\n`)

let migrated = 0, skipped = 0, notHorizon = 0

for (const row of rows) {
  const sku = extractSkuFromAmainUrl(row.image_url)
  const prefix = sku.slice(0, 3).toLowerCase()
  const label = `[${migrated + skipped + notHorizon + 1}/${rows.length}]`

  if (!HORIZON_PREFIXES.includes(prefix)) {
    console.log(`${label} ${sku} — not a Horizon brand, skipping`)
    notHorizon++
    continue
  }

  process.stdout.write(`${label} ${sku} — trying Horizon... `)
  const horizonUrl = await tryHorizonImage(sku)

  if (!horizonUrl) {
    console.log('not found on Horizon CDN')
    skipped++
    await new Promise(r => setTimeout(r, 50))
    continue
  }

  const filename = `${sku.toLowerCase()}.jpg`
  const newUrl = await downloadAndUpload(horizonUrl, filename)

  if (newUrl) {
    await supabase.from('variant_images').update({ image_url: newUrl }).eq('image_id', row.image_id)
    console.log(`OK → ${filename}`)
    migrated++
  } else {
    console.log('download/upload failed')
    skipped++
  }

  await new Promise(r => setTimeout(r, 100))
}

console.log(`\n=== DONE ===`)
console.log(`Migrated: ${migrated}`)
console.log(`Not found on Horizon: ${skipped}`)
console.log(`Non-Horizon brands (need manual sourcing): ${notHorizon}`)
