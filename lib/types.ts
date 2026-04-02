export type EntityType = "manufacturer" | "model_family" | "variant";

export type PublishedRoute = {
  entity_type: EntityType;
  entity_id: string;
  public_path: string;
  canonical_path: string;
  is_indexable: boolean;
  include_in_sitemap: boolean;
  payload_type: EntityType;
  last_modified: string | null;
};

export type RedirectRule = {
  source_path: string;
  target_path: string;
  status_code: 301 | 308;
};

export type CacheInvalidationRow = {
  entity_type: EntityType;
  entity_id: string;
  public_path: string | null;
  created_at?: string | null;
};

export type Payload = Record<string, unknown>;
