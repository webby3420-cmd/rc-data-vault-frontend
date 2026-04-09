export function proxyImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.includes('images.amainhobbies.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`
  }
  return url
}
