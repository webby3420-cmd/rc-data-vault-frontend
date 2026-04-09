import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://frphiluaykgrmvyvdzsp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_KEY) { console.error('SUPABASE_SERVICE_KEY required'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BUCKET = 'product-images'
const CDN_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

const FETCH_HEADERS = {
  'Referer': 'https://www.amainhobbies.com/',
  'Origin': 'https://www.amainhobbies.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
}

async function migrateImage(sourceUrl) {
  const urlPath = new URL(sourceUrl).pathname
  const filename = urlPath.replace(/^\/images\/(large|small|medium)\//, '').replace(/\//g, '-')
  const storagePath = filename

  const { data: existing } = await supabase.storage.from(BUCKET).list('', { search: filename })
  if (existing && existing.length > 0) {
    return `${CDN_BASE}/${storagePath}`
  }

  const res = await fetch(sourceUrl, { headers: FETCH_HEADERS })
  if (!res.ok) {
    console.warn(`  SKIP ${filename} — upstream ${res.status}`)
    return null
  }

  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  })

  if (error) {
    console.warn(`  ERROR ${filename} — ${error.message}`)
    return null
  }

  return `${CDN_BASE}/${storagePath}`
}

// --- Variant images ---
console.log('\n=== VARIANT IMAGES ===')
const { data: variantImages } = await supabase
  .from('variant_images')
  .select('image_id, image_url')
  .not('image_url', 'is', null)
  .ilike('image_url', '%amainhobbies.com%')

console.log(`Found ${variantImages.length} variant images to migrate`)
let variantOk = 0, variantSkip = 0

for (const img of variantImages) {
  process.stdout.write(`[${variantOk + variantSkip + 1}/${variantImages.length}] `)
  const newUrl = await migrateImage(img.image_url)
  if (newUrl) {
    await supabase.from('variant_images').update({ image_url: newUrl }).eq('image_id', img.image_id)
    console.log(`OK → ${newUrl.split('/').pop()}`)
    variantOk++
  } else {
    variantSkip++
  }
  await new Promise(r => setTimeout(r, 100))
}

// --- Part images ---
console.log('\n=== PART IMAGES ===')
const { data: partImages } = await supabase
  .from('part_images')
  .select('image_id, image_url')
  .not('image_url', 'is', null)
  .ilike('image_url', '%amainhobbies.com%')

console.log(`Found ${partImages.length} part images to migrate`)
let partOk = 0, partSkip = 0

for (const img of partImages) {
  process.stdout.write(`[${partOk + partSkip + 1}/${partImages.length}] `)
  const newUrl = await migrateImage(img.image_url)
  if (newUrl) {
    await supabase.from('part_images').update({ image_url: newUrl }).eq('image_id', img.image_id)
    console.log(`OK → ${newUrl.split('/').pop()}`)
    partOk++
  } else {
    partSkip++
  }
  await new Promise(r => setTimeout(r, 100))
}

console.log(`\n=== DONE ===`)
console.log(`Variant images: ${variantOk} migrated, ${variantSkip} skipped (404/dead)`)
console.log(`Part images: ${partOk} migrated, ${partSkip} skipped`)
