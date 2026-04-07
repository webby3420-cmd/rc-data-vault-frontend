export type RecentlyViewedItem = {
  canonicalPath: string
  fullName: string
  manufacturerName: string
}

const STORAGE_KEY = 'rcdv_recently_viewed'
const MAX_ITEMS = 6

function isValidItem(v: unknown): v is RecentlyViewedItem {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as any).canonicalPath === 'string' &&
    typeof (v as any).fullName === 'string' &&
    typeof (v as any).manufacturerName === 'string'
  )
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('not an array')
    const valid = parsed.filter(isValidItem)
    if (valid.length !== parsed.length) {
      // Some items were corrupt — rewrite with only valid ones
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(valid))
    }
    return valid
  } catch {
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    return []
  }
}

export function addRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentlyViewed()
    const merged = [item, ...existing.filter(i => i.canonicalPath !== item.canonicalPath)].slice(0, MAX_ITEMS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // silent
  }
}
