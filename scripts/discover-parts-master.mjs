import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://frphiluaykgrmvyvdzsp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const SERPER_KEY = process.env.SERPER_API_KEY
if (!SUPABASE_KEY || !SERPER_KEY) { console.error('Missing env vars'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const BUCKET = 'product-images'
const CDN_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
const DELAY_MS = 1200

// ══════════════════════════════════════════════════════════════════════
// PLATFORM DEFINITIONS
// ══════════════════════════════════════════════════════════════════════

const PLATFORMS = [
  {
    name: 'Traxxas Slash 4x4',
    platformTag: 'traxxas_slash_4x4',
    searchModel: 'Traxxas Slash 4x4',
    cellStock: 2, cellMax: 4, hexMm: 12,
    bodyWheelbase: 330,
    variantIds: [
      '281f2319-4e4a-45e5-bb76-f393cab264e5', // Traxxas Slash 4X4
      '02a0c52f-2970-4a5b-b94f-d75f0c33dabc', // Traxxas Slash 4X4 VXL
      '4ec56e3a-db29-4b49-b083-c8ee1ae5fd5f', // Traxxas Slash 4X4 VXL Ultimate
    ],
  },
  {
    name: 'Traxxas Sledge',
    platformTag: 'traxxas_sledge',
    searchModel: 'Traxxas Sledge',
    cellStock: 6, cellMax: 8, hexMm: 17,
    bodyWheelbase: 352,
    variantIds: [
      '2d6c96b1-abb4-422b-9eae-3255735fea2e', // Traxxas Sledge
    ],
  },
  {
    name: 'Traxxas Maxx',
    platformTag: 'traxxas_maxx',
    searchModel: 'Traxxas Maxx',
    cellStock: 4, cellMax: 6, hexMm: 17,
    bodyWheelbase: 352,
    variantIds: [
      'b46c82d5-bf6e-45d5-9eca-636a67d2511a', // Traxxas Maxx
      'f3d7dd1f-45a5-4a3d-8923-1532449281e5', // Traxxas Maxx Classic
      'fd6df12e-624e-40af-b709-119673794a5a', // Traxxas Maxx Ultimate
      '5ff45530-d28f-4a24-9ffa-c5fd52b8d51f', // Traxxas Maxx WideMaxx RTR
    ],
  },
  {
    name: 'Traxxas TRX-4',
    platformTag: 'traxxas_trx4',
    searchModel: 'Traxxas TRX-4',
    cellStock: 3, cellMax: 3, hexMm: 12,
    bodyWheelbase: 313,
    variantIds: [
      '8712f749-c804-41cc-999f-e98cd9a616b0', // Chevrolet Blazer High Trail
      '9a039489-c0fa-438b-afc2-ab98dbe07e3f', // Crawler Kit
      '334a27bb-b41b-4ef6-be9e-6d436c5763d0', // Ford Bronco
      '5caece3a-b9c8-40ce-b501-0e8572ac2329', // Ford F-150 High Trail
      'a2c8b08f-33cc-4fe4-92ef-e6a4bfcde09e', // Land Rover Defender
      '1c1b7a4a-961d-4896-be64-19f01a0cbaf4', // Nissan Pathfinder
      '4b3403a5-b5c2-40dc-8c5c-b058cf97b5f4', // Sport
      '1be96466-dcaa-49be-b683-d215045b0930', // Sport High Trail
    ],
  },
  {
    name: 'Losi LMT',
    platformTag: 'losi_lmt',
    searchModel: 'Losi LMT',
    cellStock: 4, cellMax: 6, hexMm: 17,
    bodyWheelbase: 330,
    variantIds: [
      '122817ea-a873-4e4b-8cb1-f04e281af993', // Losi LMT
      '20f4a736-add1-4b40-b649-c684d26975ba', // Losi LMT 2.0 1/8
      '86cdbc42-ae29-4bd7-a3be-e27f8e911ae9', // LMT 2.0 Grave Digger
      '151fcee1-554a-45fa-99a8-915275a076ab', // LMT 2.0 Son-Uva Digger
      '02d41f05-0887-4561-8db7-98c40b689465', // LMT 4WD Solid Axle RTR
      '268f1bfe-d74c-4f64-8aa2-72cf5597b0e2', // LMT 4WD Solid Axle RTR Mega
      '1bc2ab93-fc4e-43d4-bbef-fc9b45b0910a', // LMT Bog Hog RTR
      'fb0d2e96-d813-4045-a255-ce3c4ad4b518', // LMT Lasernut
      'f7733a0b-5532-4cb1-a873-175ee3b4f23c', // LMT MEGA
      '62b6e2ec-ae12-447c-904e-4dc9f4e6462d', // LMT TLR Tuned Roller
      'fbde244a-3e9c-4616-b8af-0e5298582885', // LMT TUNED Kit 1/8
    ],
  },
  {
    name: 'Axial SCX10',
    platformTag: 'axial_scx10',
    searchModel: 'Axial SCX10',
    cellStock: 2, cellMax: 3, hexMm: 12,
    bodyWheelbase: 313,
    variantIds: [
      '54cbe28c-6dbb-4d41-b5ec-5070b9fd42cf', // SCX10 2012 Jeep Wrangler
      '8857126d-5df5-4368-830b-3857cd5485ee', // SCX10 Dingo Builders Kit
      '9aa60050-53cb-4f5f-933c-9366ae4c97a1', // SCX10 II 2017 Jeep Wrangler
      '3e4d10a0-adc0-4d24-bbad-a29d2917d432', // SCX10 II Chevrolet K5
      'ef4e3ab7-4ab7-42e4-b15f-0271f9c1468e', // SCX10 II Deadbolt
      '62c57a1c-18b7-4f4e-a058-66720f5ffd66', // SCX10 II Jeep Cherokee
      '45bc66c9-54c9-4bd2-b819-a4ae3709ce38', // SCX10 II Raw Builders Kit
      'bef4cefc-afc6-4815-918f-9509a7767be3', // SCX10 II RTR
      'a1d9e0a8-c877-4fc8-a27a-66b2c86ce644', // SCX10 II Trail Honcho
      'd1c628ae-637f-4e12-abf6-7471c78d4626', // SCX10 II UMG10 4WD Kit
      'b983482e-a9d3-44e8-9aac-721c8370aea7', // SCX10 II UMG10 6x6 Kit
      '7eed9ff9-7267-4ea7-b41e-cb71039779db', // SCX10 III 1987 Toyota SR5
      '4b2744b8-a592-4af9-80dc-1110f849bc72', // SCX10 III Base Camp
      '58a7e3b8-6d9e-4bcc-868e-f49a54374bbc', // SCX10 III Early Ford Bronco
      '66d054c2-dd34-415f-a355-5c6163e46572', // SCX10 III Jeep JLU Wrangler
      '2e8a959a-6203-4141-b213-354a97eff51b', // SCX10 III RTR
      'e1310123-6fe1-4496-b687-57336004361b', // SCX10 Jeep Wrangler G6 Falken
      '4d2dbfd0-fe50-4454-9dff-69ad6e8b5fcd', // SCX10 Kit
      '97e153c6-21e1-414b-bd34-ddd87863da43', // SCX10 Ram Power Wagon
      'b412f5b3-51cc-4d3c-8810-bd0b873cd548', // SCX10 Trail Honcho
    ],
  },
  {
    name: 'Tekno MT410',
    platformTag: 'tekno_mt410',
    searchModel: 'Tekno MT410',
    cellStock: 4, cellMax: 4, hexMm: 17,
    bodyWheelbase: 330,
    variantIds: [
      'c520c40f-5aa8-406c-982c-93407d52f506', // MT410 2.0 Kit
      '166134b5-a911-40a1-b06f-5ac1b93a1016', // MT410 Kit
      'b7915417-fdb0-4e55-8c5e-a7e6e6b60d5b', // MT410 2.0 Kit (alt)
    ],
  },
]

// ══════════════════════════════════════════════════════════════════════
// SEARCH TARGET TEMPLATE — generates targets per platform
// ══════════════════════════════════════════════════════════════════════

function buildSearchTargets(platform) {
  const m = platform.searchModel
  return [
    // Platform-specific parts (explicit fitment)
    { query: `${m} chassis brace skid plate aluminum upgrade`, category: 'chassis', scope: 'explicit', keywords: ['chassis','brace','skid','plate','frame'] },
    { query: `${m} suspension arms a-arms aluminum upgrade`, category: 'suspension-arms', scope: 'explicit', keywords: ['arm','a-arm','suspension','lower','upper'] },
    { query: `${m} differential upgrade aluminum steel`, category: 'differentials', scope: 'explicit', keywords: ['diff','differential'] },
    { query: `${m} driveshaft CVD upgrade steel titanium`, category: 'driveshafts', scope: 'explicit', keywords: ['driveshaft','cvd','drive','shaft'] },
    { query: `${m} shock absorber upgrade aluminum`, category: 'shocks', scope: 'explicit', keywords: ['shock','damper','spring'] },
    { query: `${m} axle hub knuckle carrier upgrade aluminum`, category: 'axles-hubs', scope: 'explicit', keywords: ['axle','hub','knuckle','carrier'] },
    { query: `${m} gear set pinion spur upgrade steel`, category: 'gear-sets', scope: 'explicit', keywords: ['gear','pinion','spur'] },
    { query: `${m} links turnbuckle camber toe aluminum`, category: 'links-rods', scope: 'explicit', keywords: ['link','turnbuckle','camber','toe'] },

    // Bodies — spec_based on wheelbase
    { query: `${m} body shell replacement pre-painted`, category: 'body-exterior', scope: 'spec_based', keywords: ['body','shell','cab','wing'],
      partSpecs: { wheelbase_mm_min: platform.bodyWheelbase - 15, wheelbase_mm_max: platform.bodyWheelbase + 15 } },

    // Power system — spec_based on cell count
    { query: `${m} ESC speed controller brushless upgrade`, category: 'escs', scope: 'spec_based', keywords: ['esc','speed control','controller'],
      partSpecs: { cell_count_min: platform.cellStock, cell_count_max: platform.cellMax } },
    { query: `${m} brushless motor upgrade replacement`, category: 'motors', scope: 'spec_based', keywords: ['motor','kv','brushless'],
      partSpecs: { cell_count_min: platform.cellStock, cell_count_max: platform.cellMax } },
    { query: `${m} LiPo battery upgrade compatible`, category: 'batteries', scope: 'spec_based', keywords: ['battery','lipo','mah','pack'],
      partSpecs: { cell_count_min: platform.cellStock, cell_count_max: platform.cellMax } },
    { query: `${m} servo upgrade high torque metal gear`, category: 'servos', scope: 'spec_based', keywords: ['servo','torque','steering'],
      partSpecs: { cell_count_min: platform.cellStock, cell_count_max: platform.cellMax } },

    // Wheels/tires — spec_based on hex size
    { query: `${m} wheels upgrade aluminum ${platform.hexMm}mm hex`, category: 'wheels', scope: 'spec_based', keywords: ['wheel','rim','beadlock','hex'],
      partSpecs: { hex_size_mm: platform.hexMm } },
    { query: `${m} tires upgrade aftermarket`, category: 'tires', scope: 'spec_based', keywords: ['tire','tyre','tread'],
      partSpecs: { hex_size_mm: platform.hexMm } },
  ]
}

// ══════════════════════════════════════════════════════════════════════
// SHARED LOGIC (same as X-Maxx / ARRMA 6S scripts)
// ══════════════════════════════════════════════════════════════════════

const AFTERMARKET_BRANDS = [
  'vitavon','gpm','treal','m2c','yeah racing','hot racing','rpm','flyxm',
  'scorched','kebeilee','strc','integy','proline','pro-line','jconcepts',
  'castle','hobbywing','savox','hitec','futaba','spektrum','gens ace',
  'dynamite','traxxas','arrma','axial','losi','tekno'
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

function scoreResult(item, target, platform) {
  let confidence = 0.40
  const title = (item.title || '').toLowerCase()
  const source = (item.source || item.link || '').toLowerCase()

  // For explicit fitment, must mention the model name
  if (target.scope === 'explicit') {
    const modelWords = platform.searchModel.toLowerCase().split(/\s+/)
    const modelMatch = modelWords.some(w => w.length > 3 && title.includes(w))
    if (!modelMatch) return 0
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
  if (url.includes('amazon.com')) return { name: 'Amazon', slug: 'amazon', type: 'mass_market' }
  if (url.includes('ebay.com')) return { name: 'eBay', slug: 'ebay', type: 'marketplace' }
  if (url.includes('amainhobbies.com')) return { name: 'AMain Hobbies', slug: 'amain', type: 'hobby_specialist' }
  if (url.includes('horizonhobby.com')) return { name: 'Horizon Hobby', slug: 'horizon_hobby', type: 'hobby_specialist' }
  if (url.includes('vitavon')) return { name: 'Vitavon', slug: 'vitavon_direct', type: 'aftermarket_direct' }
  if (url.includes('m2cracing')) return { name: 'M2C Racing', slug: 'm2c_direct', type: 'aftermarket_direct' }
  if (url.includes('hot-racing')) return { name: 'Hot Racing', slug: 'hot_racing_direct', type: 'aftermarket_direct' }
  if (url.includes('gpmparts')) return { name: 'GPM Racing', slug: 'gpm_direct', type: 'aftermarket_direct' }
  return { name: 'Retailer', slug: 'other', type: 'hobby_specialist' }
}

async function insertLinks(partId, partName, partSlug, sourceUrl, retailer, price) {
  const encodedTitle = encodeURIComponent(partName)
  const amazonSearchUrl = `https://www.amazon.com/s?k=${encodedTitle}`
  const ebaySearchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodedTitle}&_sacat=0`

  // 1. Amazon (priority 5)
  const amazonProduct = retailer.slug === 'amazon' ? sourceUrl : amazonSearchUrl
  await supabase.from('part_purchase_links').insert({
    part_id: partId,
    retailer_name: 'Amazon', retailer_slug: 'amazon', retailer_type: 'mass_market',
    product_url: amazonProduct,
    affiliate_url: retailer.slug === 'amazon' && sourceUrl.includes('/dp/')
      ? (sourceUrl.includes('tag=') ? sourceUrl : sourceUrl + (sourceUrl.includes('?') ? '&' : '?') + 'tag=rcdatavault-20')
      : `${amazonSearchUrl}&tag=rcdatavault-20`,
    affiliate_program: 'amazon_associates',
    price_usd: retailer.slug === 'amazon' ? price : null,
    is_active: true, display_priority: 5,
  })

  // 2. eBay (priority 8)
  const ebayProduct = retailer.slug === 'ebay' ? sourceUrl : ebaySearchUrl
  await supabase.from('part_purchase_links').insert({
    part_id: partId,
    retailer_name: 'eBay', retailer_slug: 'ebay', retailer_type: 'marketplace',
    product_url: ebayProduct,
    affiliate_url: `${ebaySearchUrl}&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339148896&customid=${partSlug}&toolid=10001&mkevt=1`,
    affiliate_program: 'ebay_partner_network',
    price_usd: retailer.slug === 'ebay' ? price : null,
    is_active: true, display_priority: 8,
  })

  // 3. Source retailer (priority 15) — only if not already Amazon or eBay
  if (retailer.slug !== 'amazon' && retailer.slug !== 'ebay' && sourceUrl) {
    await supabase.from('part_purchase_links').insert({
      part_id: partId,
      retailer_name: retailer.name, retailer_slug: retailer.slug, retailer_type: retailer.type,
      product_url: sourceUrl,
      price_usd: price,
      is_active: true, display_priority: 15,
    })
  }
}

// ══════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ══════════════════════════════════════════════════════════════════════

// Get category IDs from DB
const { data: categories } = await supabase.from('part_categories').select('part_category_id, slug')
const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c.part_category_id]))

// Get existing part names to avoid duplicates
const { data: existingParts } = await supabase.from('parts').select('name, slug').eq('part_era', 'modern')
const existingNames = new Set(existingParts.map(p => p.name.toLowerCase()))
const existingSlugs = new Set(existingParts.map(p => p.slug))

// Optional: run only specific platform by CLI arg
const platformFilter = process.argv[2]
const platformsToRun = platformFilter
  ? PLATFORMS.filter(p => p.platformTag.includes(platformFilter))
  : PLATFORMS

if (platformFilter && platformsToRun.length === 0) {
  console.error(`No platform matching "${platformFilter}". Available:`, PLATFORMS.map(p => p.platformTag))
  process.exit(1)
}

let grandTotal = { added: 0, skipped: 0, lowConf: 0 }
const grandByCategory = {}

for (const platform of platformsToRun) {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`PLATFORM: ${platform.name} (${platform.variantIds.length} variants)`)
  console.log(`${'═'.repeat(60)}`)

  const targets = buildSearchTargets(platform)
  let platformAdded = 0

  for (const target of targets) {
    const scopeLabel = target.scope === 'explicit' ? 'explicit' : 'spec'
    console.log(`\n  [${scopeLabel}] ${target.category}: ${target.query.slice(0, 50)}...`)
    await new Promise(r => setTimeout(r, DELAY_MS))

    let results
    try {
      results = await searchSerper(target.query)
    } catch (e) {
      console.log(`    ERROR: ${e.message}`)
      continue
    }

    console.log(`    ${results.length} results`)
    let catAdded = 0

    for (const item of results) {
      const confidence = scoreResult(item, target, platform)
      if (confidence === 0) { grandTotal.skipped++; continue }

      const title = item.title || ''
      const url = item.link || item.source || ''
      const price = extractPrice(item)
      const brand = extractBrand(title)
      const retailer = detectRetailer(url)

      if (confidence < 0.60) {
        grandTotal.lowConf++
        continue
      }

      if (existingNames.has(title.toLowerCase())) {
        grandTotal.skipped++
        continue
      }

      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
      if (existingSlugs.has(slug)) slug = slug + '-' + Date.now().toString().slice(-4)

      const categoryId = categoryMap[target.category]
      if (!categoryId) continue

      // Build insert payload
      let fitmentType, variantIds, extraSpecs = {}
      if (target.scope === 'explicit') {
        fitmentType = 'explicit'
        variantIds = platform.variantIds
        extraSpecs = { chassis_platform: [platform.platformTag] }
      } else {
        fitmentType = 'spec_based'
        variantIds = []
        extraSpecs = target.partSpecs || {}
      }

      const { data: newPart, error: partErr } = await supabase
        .from('parts')
        .insert({
          name: title, slug,
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
        console.log(`    ERR: ${partErr.message.slice(0, 80)}`)
        continue
      }

      existingNames.add(title.toLowerCase())
      existingSlugs.add(slug)

      await insertLinks(newPart.id, title, slug, url, retailer, price)

      console.log(`    + (${confidence.toFixed(2)}) ${title.slice(0, 55)}`)
      catAdded++
      platformAdded++
      grandTotal.added++
      grandByCategory[target.category] = (grandByCategory[target.category] || 0) + 1
    }

    if (catAdded > 0) console.log(`    -> ${catAdded} added`)
  }

  console.log(`\n  ${platform.name} total: ${platformAdded} parts added`)
}

console.log(`\n${'═'.repeat(60)}`)
console.log(`GRAND TOTAL`)
console.log(`Added:       ${grandTotal.added}`)
console.log(`Low conf:    ${grandTotal.lowConf}`)
console.log(`Skipped:     ${grandTotal.skipped}`)
console.log(`By category:`, grandByCategory)
