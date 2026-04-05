export type RecentlyViewedItem = {
  canonicalPath: string
  fullName: string
  manufacturerName: string
}

const STORAGE_KEY = 'rcdv_recently_viewed'
const MAX_ITEMS = 6

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
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
