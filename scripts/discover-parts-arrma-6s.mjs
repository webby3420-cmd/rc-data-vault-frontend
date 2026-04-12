import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://frphiluaykgrmvyvdzsp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const SERPER_KEY = process.env.SERPER_API_KEY
if (!SUPABASE_KEY || !SERPER_KEY) { console.error('Missing env vars'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ARRMA 6S 1/8 scale — fully interchangeable platform
const ARRMA_6S_18_VARIANT_IDS = [
  '745462e8-24e4-4e38-95a6-3296014e64e5', // Kraton 1/8 6S RTR
  'e007409f-3d5d-4db4-870b-41ed5b3e99fb', // Kraton 6S BLX EXB RTR
  '79665e65-f6fc-45b5-9c8c-3da7300f500a', // Kraton 6S EXB V6 RTR
  '43c15afb-7844-4041-b76c-65b7aff8b223', // Kraton Brushless 1/8 4X4 RTR 6S
  '3bfd8f84-75bb-4c61-adcf-847c548d7020', // Kraton Brushless EXB 1/8 4X4 RTR 6S
  'c410d4f7-245d-461d-9000-76ef1cd69d4e', // Notorious Brushless 1/8 4X4 RTR 6S
  '885ecd08-53e6-426f-b0a4-6dd6ceece54e', // Talion 6S BLX 4WD RTR
  '813fedf0-fadb-4c5f-be0b-4e255f92d748', // Talion 6S BLX EXB RTR
  'dd0dab71-ee02-4fae-8338-46f0aff36b4c', // Typhon 6S BLX 4x4 RTR
  '8d3e22fd-10b9-45f1-8d7a-0303e29231f5', // Typhon 6S V5 4WD BLX RTR
  '224c2904-a84d-4a63-8e6e-9f0616d3cd19', // Typhon Brushless BLACK 1/8 4X4 RTR 6S
  '47c9944b-685f-4216-9b89-e9567217155a', // Typhon Brushless TUNED TLR 6S
]

// ARRMA 6S 1/7 scale — separate platform, interchangeable within
const ARRMA_6S_17_VARIANT_IDS = [
  'a1514203-c36d-4649-92be-5feb209398d6', // Felony 6S BLX 1/7 RTR
  'e7a63dff-af63-4569-b37f-83e672878a35', // Felony Brushless 1/7 AVC 4X4 RTR 6S
  'fb3b6a44-c299-4054-8b92-36162d471b1a', // Infraction 6S BLX 4WD RTR
  '353736d2-7d29-4f1e-be1d-0d45d323ec82', // Infraction 6S BLX EXB RTR
  '078f145f-2e57-4223-bccc-677ec9342448', // Infraction Brushless 1/7 AVC 4X4 RTR 6S
  '20661725-8dbe-46fd-99d7-6c4eb255a576', // Limitless Brushless ROLLER CLEAR 1/7 4X4 6S
  '80a151f6-379a-41a6-9051-f1170d6dd483', // Mojave Brushless 1/7 4X4 RTR 6S
  '9d62c4b4-224e-4e28-9060-35a00c826128', // Fazon 6S BLX 4WD RTR
]

// Search targets with fitment scope
// scope: 'platform_18' = 1/8 explicit, 'platform_17' = 1/7 explicit, 'spec_based' = spec matching
const SEARCH_TARGETS = [
  // ── 1/8 PLATFORM SPECIFIC ──────────────────────────────────────────
  { query: 'ARRMA 6S 1/8 chassis brace skid plate aluminum upgrade',
    category: 'chassis', scope: 'platform_18',
    keywords: ['chassis','brace','skid','plate','frame'] },

  { query: 'ARRMA 6S 1/8 suspension arms a-arms aluminum upgrade',
    category: 'suspension-arms', scope: 'platform_18',
    keywords: ['arm','a-arm','suspension','lower','upper'] },

  { query: 'ARRMA 6S differential upgrade aluminum steel',
    category: 'differentials', scope: 'platform_18',
    keywords: ['diff','differential'] },

  { query: 'ARRMA 6S driveshaft CVD upgrade steel titanium',
    category: 'driveshafts', scope: 'platform_18',
    keywords: ['driveshaft','cvd','drive','shaft'] },

  { query: 'ARRMA 6S shock absorber upgrade aluminum',
    category: 'shocks', scope: 'platform_18',
    keywords: ['shock','damper','spring'] },

  { query: 'ARRMA 6S axle hub knuckle carrier upgrade aluminum',
    category: 'axles-hubs', scope: 'platform_18',
    keywords: ['axle','hub','knuckle','carrier'] },

  { query: 'ARRMA 6S gear set pinion spur upgrade steel',
    category: 'gear-sets', scope: 'platform_18',
    keywords: ['gear','pinion','spur'] },

  { query: 'ARRMA 6S links turnbuckle camber toe aluminum',
    category: 'links-rods', scope: 'platform_18',
    keywords: ['link','turnbuckle','camber','toe'] },

  // ── 1/7 PLATFORM SPECIFIC ──────────────────────────────────────────
  { query: 'ARRMA 1/7 Felony Infraction Limitless chassis upgrade aluminum',
    category: 'chassis', scope: 'platform_17',
    keywords: ['chassis','brace','skid','frame'] },

  { query: 'ARRMA 1/7 Felony Infraction suspension arms upgrade',
    category: 'suspension-arms', scope: 'platform_17',
    keywords: ['arm','suspension','lower','upper'] },

  // ── BODIES — wheelbase spec_based ──────────────────────────────────
  { query: 'ARRMA Kraton Typhon Notorious 1/8 body shell replacement',
    category: 'body-exterior', scope: 'spec_based',
    keywords: ['body','shell','cab'],
    partSpecs: { wheelbase_mm_min: 315, wheelbase_mm_max: 340, body_scale: '1/8', body_style: 'monster' } },

  { query: 'ARRMA Felony Infraction 1/7 body shell replacement',
    category: 'body-exterior', scope: 'spec_based',
    keywords: ['body','shell','sedan','muscle'],
    partSpecs: { wheelbase_mm_min: 400, wheelbase_mm_max: 440, body_scale: '1/7', body_style: 'car' } },

  // ── UNIVERSAL POWER SYSTEM — spec_based ───────────────────────────
  { query: 'ARRMA 6S ESC speed controller brushless upgrade',
    category: 'escs', scope: 'spec_based',
    keywords: ['esc','speed control','controller'],
    partSpecs: { cell_count_min: 6, cell_count_max: 8, fitment_notes: 'Fits any 6S-8S platform with physical clearance' } },

  { query: 'ARRMA 6S brushless motor upgrade replacement',
    category: 'motors', scope: 'spec_based',
    keywords: ['motor','kv','brushless'],
    partSpecs: { cell_count_min: 6, cell_count_max: 8 } },

  { query: 'ARRMA 6S LiPo battery hardcase 5000mah 6000mah',
    category: 'batteries', scope: 'spec_based',
    keywords: ['battery','lipo','mah','pack'],
    partSpecs: { cell_count_min: 6, cell_count_max: 6 } },

  { query: 'ARRMA 6S servo upgrade high torque metal gear',
    category: 'servos', scope: 'spec_based',
    keywords: ['servo','torque','steering'],
    partSpecs: { cell_count_min: 6, cell_count_max: 8 } },

  // ── UNIVERSAL WHEELS/TIRES — spec_based on hex ────────────────────
  { query: 'RC 17mm hex wheels beadlock aluminum 1/8 scale',
    category: 'wheels', scope: 'spec_based',
    keywords: ['wheel','rim','beadlock','17mm'],
    partSpecs: { hex_size_mm: 17 } },

  { query: 'RC 1/8 scale monster truck tires 3.8 17mm hex',
    category: 'tires', scope: 'spec_based',
    keywords: ['tire','tyre','tread'],
    partSpecs: { hex_size_mm: 17, tire_diameter_mm: 165 } },
]

const AFTERMARKET_BRANDS = [
  'vitavon','gpm','treal','m2c','yeah racing','hot racing','rpm','flyxm',
  'scorched','kebeilee','strc','integy','proline','pro-line','jconcepts',
  'castle','hobbywing','savox','hitec','futaba','spektrum','gens ace',
  'dynamite','traxxas','arrma','axial'
]

const TRUSTED_DOMAINS = [
  'amazon.com','amainhobbies.com','horizonhobby.com','rcplanet.com',
  'towerhobbies.com','ebay.com','vitavon-racing.com','m2cracing.net',
  'hot-racing.com','gpmparts.com','prolineracing.com'
]

async function searchSerper(query) {
  const res = await fetch('https://google.serper.dev/shopping', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 10 }),
  })
  if (!res.ok) throw new Error(`Serper error ${res.status}`)
  const data = await res.json()
  return data.shopping || []
}

function scoreResult(item, target) {
  let confidence = 0.40
  const title = (item.title || '').toLowerCase()
  const source = (item.source || item.link || '').toLowerCase()

  // For spec_based targets (universal wheels/tires/batteries), don't require ARRMA mention
  const isSpecBased = target.scope === 'spec_based'
  const arrmaMatch = title.includes('arrma') || title.includes('kraton') ||
    title.includes('typhon') || title.includes('notorious') || title.includes('talion') ||
    title.includes('felony') || title.includes('infraction') || title.includes('limitless') ||
    title.includes('mojave')
  if (!isSpecBased && !arrmaMatch) return 0

  // Must be 6S-relevant (not 3S-only or 8S-only) for platform targets
  if (!isSpecBased) {
    if (title.includes('3s') && !title.includes('6s')) return 0
    if (title.includes('8s') && !title.includes('6s')) return 0
  }

  const categoryMatches = target.keywords.filter(k => title.includes(k))
  confidence += (categoryMatches.length / target.keywords.length) * 0.25

  const brandMatch = AFTERMARKET_BRANDS.find(b => title.includes(b) || source.includes(b))
  if (brandMatch) confidence += 0.20

  if (TRUSTED_DOMAINS.some(d => source.includes(d))) confidence += 0.15

  if (item.price) confidence += 0.10

  return Math.min(0.98, confidence)
}

function extractBrand(title) {
  for (const brand of AFTERMARKET_BRANDS) {
    if (title.toLowerCase().includes(brand)) {
      return brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
  }
  return null
}

function extractPrice(item) {
  if (!item.price) return null
  const match = item.price.toString().replace(/[^0-9.]/g, '')
  const num = parseFloat(match)
  return isNaN(num) ? null : num
}

function detectRetailer(url) {
  if (url.includes('amazon.com')) return { name: 'Amazon', slug: 'amazon', type: 'mass_market', priority: 5 }
  if (url.includes('ebay.com')) return { name: 'eBay', slug: 'ebay', type: 'marketplace', priority: 8 }
  if (url.includes('amainhobbies.com')) return { name: 'AMain Hobbies', slug: 'amain', type: 'hobby_specialist', priority: 10 }
  if (url.includes('horizonhobby.com')) return { name: 'Horizon Hobby', slug: 'horizon_hobby', type: 'hobby_specialist', priority: 10 }
  if (url.includes('vitavon')) return { name: 'Vitavon', slug: 'vitavon_direct', type: 'aftermarket_direct', priority: 20 }
  if (url.includes('m2cracing')) return { name: 'M2C Racing', slug: 'm2c_direct', type: 'aftermarket_direct', priority: 20 }
  if (url.includes('hot-racing')) return { name: 'Hot Racing', slug: 'hot_racing_direct', type: 'aftermarket_direct', priority: 20 }
  if (url.includes('gpmparts')) return { name: 'GPM Racing', slug: 'gpm_direct', type: 'aftermarket_direct', priority: 20 }
  return { name: 'Retailer', slug: 'other', type: 'hobby_specialist', priority: 30 }
}

function getScopeConfig(target) {
  if (target.scope === 'platform_18') {
    return {
      variantIds: ARRMA_6S_18_VARIANT_IDS,
      fitmentType: 'explicit',
      extraSpecs: { chassis_platform: ['arrma_6s_18'] },
    }
  }
  if (target.scope === 'platform_17') {
    return {
      variantIds: ARRMA_6S_17_VARIANT_IDS,
      fitmentType: 'explicit',
      extraSpecs: { chassis_platform: ['arrma_6s_17'] },
    }
  }
  // spec_based
  return {
    variantIds: [],
    fitmentType: 'spec_based',
    extraSpecs: target.partSpecs || {},
  }
}

// Get category IDs from DB
const { data: categories } = await supabase
  .from('part_categories')
  .select('part_category_id, slug')

const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c.part_category_id]))

// Get existing part names to avoid duplicates
const { data: existingParts } = await supabase
  .from('parts')
  .select('name, slug')
  .eq('part_era', 'modern')
const existingNames = new Set(existingParts.map(p => p.name.toLowerCase()))
const existingSlugs = new Set(existingParts.map(p => p.slug))

let totalAdded = 0, totalSkipped = 0, totalLowConfidence = 0
const byCategory = {}

for (const target of SEARCH_TARGETS) {
  const scopeLabel = target.scope === 'platform_18' ? '1/8' : target.scope === 'platform_17' ? '1/7' : 'spec'
  console.log(`\n[${scopeLabel}] ${target.category}: ${target.query.slice(0, 55)}...`)
  await new Promise(r => setTimeout(r, 1200))

  let results
  try {
    results = await searchSerper(target.query)
  } catch (e) {
    console.log(`  ERROR: ${e.message}`)
    continue
  }

  console.log(`  Found ${results.length} shopping results`)
  let categoryAdded = 0
  const { variantIds, fitmentType, extraSpecs } = getScopeConfig(target)

  for (const item of results) {
    const confidence = scoreResult(item, target)
    if (confidence === 0) { totalSkipped++; continue }

    const title = item.title || ''
    const url = item.link || item.source || ''
    const price = extractPrice(item)
    const brand = extractBrand(title)
    const retailer = detectRetailer(url)

    if (confidence < 0.60) {
      console.log(`  LOW CONF ${confidence.toFixed(2)}: ${title.slice(0, 50)}`)
      totalLowConfidence++
      continue
    }

    if (existingNames.has(title.toLowerCase())) {
      console.log(`  EXISTS: ${title.slice(0, 50)}`)
      totalSkipped++
      continue
    }

    let slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)
    if (existingSlugs.has(slug)) slug = slug + '-' + Date.now().toString().slice(-4)

    const categoryId = categoryMap[target.category]
    if (!categoryId) { console.log(`  SKIP: no category for ${target.category}`); continue }

    const { data: newPart, error: partErr } = await supabase
      .from('parts')
      .insert({
        name: title,
        slug,
        part_type: 'aftermarket_upgrade',
        part_category_id: categoryId,
        aftermarket_brand: brand,
        msrp: price,
        part_era: 'modern',
        fitment_type: fitmentType,
        compatible_variant_ids: variantIds,
        is_oem: false,
        ...extraSpecs,
      })
      .select('id')
      .single()

    if (partErr) {
      console.log(`  ERROR inserting part: ${partErr.message}`)
      continue
    }

    existingNames.add(title.toLowerCase())
    existingSlugs.add(slug)

    const encodedTitle = encodeURIComponent(title)
    const amazonSearchUrl = `https://www.amazon.com/s?k=${encodedTitle}`
    const ebaySearchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodedTitle}&_sacat=0`

    // 1. Amazon (priority 5)
    const amazonProduct = retailer.slug === 'amazon' ? url : amazonSearchUrl
    const { error: e1 } = await supabase.from('part_purchase_links').insert({
      part_id: newPart.id,
      retailer_name: 'Amazon',
      retailer_slug: 'amazon',
      retailer_type: 'mass_market',
      product_url: amazonProduct,
      affiliate_url: retailer.slug === 'amazon' && url.includes('/dp/')
        ? (url.includes('tag=') ? url : url + (url.includes('?') ? '&' : '?') + 'tag=rcdatavault-20')
        : `${amazonSearchUrl}&tag=rcdatavault-20`,
      affiliate_program: 'amazon_associates',
      price_usd: retailer.slug === 'amazon' ? price : null,
      is_active: true,
      display_priority: 5,
    })
    if (e1) console.log(`    LINK ERR (amazon): ${e1.message}`)

    // 2. eBay (priority 8)
    const ebayProduct = retailer.slug === 'ebay' ? url : ebaySearchUrl
    const { error: e2 } = await supabase.from('part_purchase_links').insert({
      part_id: newPart.id,
      retailer_name: 'eBay',
      retailer_slug: 'ebay',
      retailer_type: 'marketplace',
      product_url: ebayProduct,
      affiliate_url: `${ebaySearchUrl}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339148896&customid=${slug}&toolid=10001&mkevt=1`,
      affiliate_program: 'ebay_partner_network',
      price_usd: retailer.slug === 'ebay' ? price : null,
      is_active: true,
      display_priority: 8,
    })
    if (e2) console.log(`    LINK ERR (ebay): ${e2.message}`)

    // 3. Source retailer (priority 15) — only if not already Amazon or eBay
    if (retailer.slug !== 'amazon' && retailer.slug !== 'ebay' && url) {
      const { error: e3 } = await supabase.from('part_purchase_links').insert({
        part_id: newPart.id,
        retailer_name: retailer.name,
        retailer_slug: retailer.slug,
        retailer_type: retailer.type,
        product_url: url,
        price_usd: price,
        is_active: true,
        display_priority: 15,
      })
      if (e3) console.log(`    LINK ERR (${retailer.slug}): ${e3.message}`)
    }

    console.log(`  ADDED (${confidence.toFixed(2)}, ${scopeLabel}): ${title.slice(0, 55)}`)
    totalAdded++
    categoryAdded++
    byCategory[target.category] = (byCategory[target.category] || 0) + 1
  }

  console.log(`  -> ${categoryAdded} added for ${target.category} [${scopeLabel}]`)
}

console.log(`\n${'='.repeat(50)}`)
console.log(`Total added: ${totalAdded}`)
console.log(`Low confidence skipped: ${totalLowConfidence}`)
console.log(`Already existed: ${totalSkipped}`)
console.log(`By category:`, byCategory)
