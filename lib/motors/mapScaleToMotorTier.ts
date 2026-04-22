// lib/motors/mapScaleToMotorTier.ts
//
// Maps variant_specs.scale + vehicle_class into motor-RPC params.
// Returns null for unsupported classes (boat, heli, drone, plane) so the
// RecommendedMotors section can hide cleanly on non-RC-car pages.
//
// Mirrors lib/esc/mapScaleToEscTier + lib/servos/mapScaleToServoTier.

export type MotorTierParams = {
  vehicleScale: 'micro' | 'crawler' | '1_10' | '1_8' | 'large_scale'
  useCase:      'crawling' | 'racing' | 'bashing' | 'high_performance'
}

export function mapScaleToMotorTier(
  scale?: string | null,
  vehicleClass?: string | null,
): MotorTierParams | null {
  const s = (scale || '').toLowerCase().trim()
  const c = (vehicleClass || '').toLowerCase().trim()

  // Hide section for non-RC-car classes
  if (/(boat|heli|helicopter|drone|quad|plane|aircraft|fpv)/.test(c)) return null

  // No signal at all → bail
  if (!s && !c) return null

  // Crawler routing: class overrides scale (TRX-4, SCX10, Capra, etc.)
  if (/crawler|rock/.test(c)) {
    return { vehicleScale: 'crawler', useCase: 'crawling' }
  }

  // Micro: 1/18 and smaller, or explicit "micro"/"mini" class
  if (/1\/(18|24|28|36)/.test(s) || /^(micro|mini)/.test(c)) {
    return { vehicleScale: 'micro', useCase: 'bashing' }
  }

  // Large scale: 1/5, 1/6, or explicit 8S / large-scale platforms (X-Maxx, XRT)
  if (/1\/[56]/.test(s) || /8s|large[-\s]?scale/.test(c)) {
    return { vehicleScale: 'large_scale', useCase: 'high_performance' }
  }

  // 1/8, 1/7 performance class (Kraton 6S, Typhon 6S, Notorious, etc.)
  if (/1\/[78]/.test(s)) {
    if (/(race|tourer|touring|on[-\s]?road|formula|f1)/.test(c)) {
      return { vehicleScale: '1_8', useCase: 'racing' }
    }
    return { vehicleScale: '1_8', useCase: 'bashing' }
  }

  // 1/10 default (Slash, Rustler, Stampede, Senton, Granite, most basher-SCT)
  if (/1\/10/.test(s) || c) {
    if (/(race|tourer|touring|on[-\s]?road|formula|f1|drift|pan car)/.test(c)) {
      return { vehicleScale: '1_10', useCase: 'racing' }
    }
    return { vehicleScale: '1_10', useCase: 'bashing' }
  }

  return null
}
