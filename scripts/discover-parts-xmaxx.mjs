import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://frphiluaykgrmvyvdzsp.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const SERPER_KEY = process.env.SERPER_API_KEY
if (!SUPABASE_KEY || !SERPER_KEY) { console.error('Missing env vars'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const XMAXX_VARIANT_IDS = [
  'cbe7ade1-c8cb-4d0c-8543-bc6a149d9488',
  'a322507b-aeb7-40eb-8aa0-41001a25325d',
  '75aec42b-82a4-4b91-aaa4-0716fe386e04',
  '164dd400-de29-4c56-8176-6cf77a6f38a7',
]

const SEARCH_TARGETS = [
  { query: 'Traxxas X-Maxx chassis brace skid plate aftermarket aluminum', category: 'chassis', keywords: ['chassis','brace','skid','plate','frame'] },
  { query: 'Traxxas X-Maxx suspension arms a-arms aluminum aftermarket upgrade', category: 'suspension-arms', keywords: ['arm','a-arm','suspension','lower','upper'] },
  { query: 'Traxxas X-Maxx differential upgrade aluminum aftermarket', category: 'differentials', keywords: ['diff','differential'] },
  { query: 'Traxxas X-Maxx driveshaft CVD upgrade titanium steel', category: 'driveshafts', keywords: ['driveshaft','cvd','drive','shaft'] },
  { query: 'Traxxas X-Maxx shock absorber upgrade aluminum GTX', category: 'shocks', keywords: ['shock','damper','spring','absorber'] },
  { query: 'Traxxas X-Maxx servo upgrade high torque metal gear', category: 'servos', keywords: ['servo','steering','torque'] },
  { query: 'Traxxas X-Maxx wheels beadlock aluminum 3.8 17mm', category: 'wheels', keywords: ['wheel','rim','beadlock','hex'] },
  { query: 'Traxxas X-Maxx tires 3.8 monster truck aftermarket', category: 'tires', keywords: ['tire','tyre','tread','compound'] },
  { query: 'Traxxas X-Maxx axle hub knuckle upgrade aluminum', category: 'axles-hubs', keywords: ['axle','hub','knuckle','carrier'] },
  { query: 'Traxxas X-Maxx motor upgrade brushless replacement', category: 'motors', keywords: ['motor','kv','brushless','winding'] },
  { query: 'Traxxas X-Maxx ESC speed controller upgrade 8S', category: 'escs', keywords: ['esc','speed control','controller','amp'] },
  { query: 'Traxxas X-Maxx LiPo battery 8S 4S 6S', category: 'batteries', keywords: ['battery','lipo','mah','cell'] },
  { query: 'Traxxas X-Maxx gear set pinion spur upgrade steel', category: 'gear-sets', keywords: ['gear','pinion','spur','tooth'] },
  { query: 'Traxxas X-Maxx links turnbuckle camber toe aluminum', category: 'links-rods', keywords: ['link','turnbuckle','camber','toe','rod'] },
  { query: 'Traxxas X-Maxx body shell replacement pre-painted', category: 'body-exterior', keywords: ['body','shell','wing','bumper','fender'] },
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

  if (!title.includes('x-maxx') && !title.includes('xmaxx')) return 0

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

function buildAffiliateUrl(url, retailerSlug, partName, partSlug) {
  if (retailerSlug === 'amazon') {
    if (url.includes('/dp/') || url.includes('/gp/')) {
      return url.includes('tag=') ? url : url + (url.includes('?') ? '&' : '?') + 'tag=rcdatavault-20'
    }
    return `https://www.amazon.com/s?k=${encodeURIComponent(partName)}&tag=rcdatavault-20`
  }
  if (retailerSlug === 'ebay') {
    return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(partName)}&_sacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339148896&customid=${partSlug}&toolid=10001&mkevt=1`
  }
  return url
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
  console.log(`\n${target.category}: ${target.query.slice(0, 60)}...`)
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
        fitment_type: 'explicit',
        compatible_variant_ids: XMAXX_VARIANT_IDS,
        is_oem: false,
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

    // 1. Amazon (priority 5) — use source URL if Amazon, otherwise search link
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

    // 2. eBay (priority 8) — use source URL if eBay, otherwise search link
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

    console.log(`  ADDED (${confidence.toFixed(2)}): ${title.slice(0, 55)}`)
    totalAdded++
    categoryAdded++
    byCategory[target.category] = (byCategory[target.category] || 0) + 1
  }

  console.log(`  -> ${categoryAdded} added for ${target.category}`)
}

console.log(`\n${'='.repeat(50)}`)
console.log(`Total added: ${totalAdded}`)
console.log(`Low confidence skipped: ${totalLowConfidence}`)
console.log(`Already existed: ${totalSkipped}`)
console.log(`By category:`, byCategory)
