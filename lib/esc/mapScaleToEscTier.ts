// Maps variant_specs.scale + variant_specs.vehicle_class to ESC RPC params.
// ESC tiers are amps-band based (see get_esc_recommendations RPC):
//   micro       → amps ≤ 60
//   crawler     → amps 40–100
//   1_10        → amps 60–130
//   1_8         → amps 100–200
//   large_scale → amps ≥ 120

export type EscTierParams = {
  vehicleScale: 'micro' | '1_10' | 'crawler' | '1_8' | 'large_scale'
  useCase: 'bashing' | 'crawling' | 'racing' | 'high_performance'
} | null // null = skip section entirely

const SKIP_CLASSES = new Set([
  'boat', 'helicopter', 'motorcycle', 'tank', 'drone',
  'airplane', 'formula',
])

const CRAWLER_CLASSES = new Set([
  'crawler', 'crawler / trail', 'trail', 'rock bouncer',
  'rock racer', 'rock_racer',
])

const RACING_CLASSES = new Set([
  'buggy', '8wd buggy', 'rally', 'touring', 'touring car',
  'oval', 'sprint car', 'short course', 'short_course',
  'truggy', 'drift',
])

export function mapScaleToEscTier(
  scale: string | null | undefined,
  vehicleClass: string | null | undefined
): EscTierParams {
  const s = (scale ?? '').trim()
  const c = (vehicleClass ?? '').toLowerCase().trim()

  if (SKIP_CLASSES.has(c)) return null

  // Sub-1/10 scale → micro ESCs
  if (/^1\/(12|14|16|18|24|28|30|32)/.test(s)) {
    return { vehicleScale: 'micro', useCase: 'racing' }
  }

  // 1/5, 1/6, 1/7 → large scale (extreme current)
  if (/^1\/(5|6|7)/.test(s)) {
    return { vehicleScale: 'large_scale', useCase: 'high_performance' }
  }

  // 1/8 scale → performance ESC tier
  if (/^1\/8/.test(s)) {
    const isRace = RACING_CLASSES.has(c)
    return { vehicleScale: '1_8', useCase: isRace ? 'racing' : 'bashing' }
  }

  // 1/10 crawler
  if (CRAWLER_CLASSES.has(c)) {
    return { vehicleScale: 'crawler', useCase: 'crawling' }
  }

  // 1/10 racing classes
  if (RACING_CLASSES.has(c)) {
    return { vehicleScale: '1_10', useCase: 'racing' }
  }

  // 1/10 default
  return { vehicleScale: '1_10', useCase: 'bashing' }
}
