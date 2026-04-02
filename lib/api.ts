import { env } from "./env";
import type {
  CacheInvalidationRow,
  Payload,
  PublishedRoute,
  RedirectRule,
  EntityType,
} from "./types";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchPublishedRouteByPath(
  publicPath: string
): Promise<PublishedRoute | null> {
  return apiFetch<PublishedRoute | null>(
    `/api/routes/resolve?path=${encodeURIComponent(publicPath)}`
  );
}

export async function fetchPayload(
  entityType: EntityType,
  entityId: string
): Promise<Payload | null> {
  return apiFetch<Payload | null>(
    `/api/payload/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`
  );
}

export async function fetchRedirectByPath(
  publicPath: string
): Promise<RedirectRule | null> {
  return apiFetch<RedirectRule | null>(
    `/api/routes/redirect?path=${encodeURIComponent(publicPath)}`
  );
}

export async function fetchSitemapRows(): Promise<PublishedRoute[]> {
  return apiFetch<PublishedRoute[]>(`/api/routes/sitemap`);
}

export async function fetchPendingCacheInvalidations(): Promise<CacheInvalidationRow[]> {
  return apiFetch<CacheInvalidationRow[]>(`/api/cache-invalidations/pending`);
}
