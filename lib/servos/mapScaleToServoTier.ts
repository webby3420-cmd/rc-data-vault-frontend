// Maps variant_specs.scale + variant_specs.vehicle_class to RPC params.
// vehicle_class values confirmed from DB: crawler, monster_truck, stadium_truck,
// short_course, buggy, truggy, rally, touring, desert_truck, rock_racer, etc.

export type ServoTierParams = {
  vehicleScale: 'micro' | '1_10' | 'crawler' | 'large_scale'
  useCase: 'bashing' | 'crawling' | 'racing' | 'high_performance'
} | null // null = skip section entirely

const SKIP_CLASSES = new Set([
  'boat', 'helicopter', 'motorcycle', 'tank', 'drone',
  'airplane', 'formula', 'drag',
])

const CRAWLER_CLASSES = new Set([
  'crawler', 'crawler / trail', 'trail', 'rock bouncer',
  'rock racer', 'rock_racer',
])

const RACING_CLASSES = new Set([
  'buggy', '8wd buggy', 'rally', 'touring', 'touring car',
  'oval', 'sprint car', 'short course', 'short_course',
  'truggy', 'drift', 'street',
])

export function mapScaleToServoTier(
  scale: string | null | undefined,
  vehicleClass: string | null | undefined
): ServoTierParams {
  const s = (scale ?? '').trim()
  const c = (vehicleClass ?? '').toLowerCase().trim()

  // Skip non-RC-car classes
  if (SKIP_CLASSES.has(c)) return null

  // Sub-1/10 → always micro
  if (/^1\/(12|14|16|18|24|28|30|32)/.test(s)) {
    return { vehicleScale: 'micro', useCase: 'racing' }
  }

  // 1/5, 1/6, 1/7 → large scale
  if (/^1\/(5|6|7)/.test(s)) {
    return {
      vehicleScale: 'large_scale',
      useCase: CRAWLER_CLASSES.has(c) ? 'crawling' : 'high_performance',
    }
  }

  // Crawler class at 1/8 or 1/10
  if (CRAWLER_CLASSES.has(c)) {
    return { vehicleScale: 'crawler', useCase: 'crawling' }
  }

  // Racing classes
  if (RACING_CLASSES.has(c)) {
    return { vehicleScale: '1_10', useCase: 'racing' }
  }

  // Everything else (monster truck, stadium truck, desert truck, short course, etc.)
  return { vehicleScale: '1_10', useCase: 'bashing' }
}
