// app/admin/agent-review/lib/filters.ts
// Translates tab + searchParams into FetchQueueOptions.

import type { FetchQueueOptions } from './supabase-admin';
import type { TabKey } from './types';

export function resolveOptionsFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): { tab: TabKey; options: FetchQueueOptions } {
  const tabParam = (Array.isArray(sp.tab) ? sp.tab[0] : sp.tab) || 'all_pending';
  const tab = tabParam as TabKey;

  const base: FetchQueueOptions = { limit: 100 };

  switch (tab) {
    case 'approved':
      base.status = 'approved';
      break;
    case 'rejected':
      base.status = 'rejected';
      break;
    default:
      base.status = 'pending';
  }

  // Tab-derived filters (on top of status)
  switch (tab) {
    case 'listing_matches':
      base.entity_type = 'listing';
      break;
    case 'purchase_links':
      base.entity_type = 'purchase_link';
      break;
    case 'specs':
      base.entity_type = 'variant_spec';
      break;
    // catalog_issues and vintage_discontinued are filtered by agent_name
    // but we don't hard-code agent names here; those tabs rely on the
    // filter dropdown once agents actually populate rows.
  }

  const pick = (k: string) =>
    Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined);

  const agent_name = pick('agent_name');
  const entity_type = pick('entity_type');
  const proposed_action = pick('proposed_action');
  const risk_label = pick('risk_label');
  const confidence_min = pick('confidence_min');
  const confidence_max = pick('confidence_max');
  const age_days = pick('age_days');
  const q = pick('q');

  if (agent_name) base.agent_name = agent_name;
  if (entity_type) base.entity_type = entity_type;
  if (proposed_action) base.proposed_action = proposed_action;
  if (risk_label) base.risk_label = risk_label;
  if (confidence_min) {
    const n = parseFloat(confidence_min);
    if (!Number.isNaN(n)) base.confidence_min = n;
  }
  if (confidence_max) {
    const n = parseFloat(confidence_max);
    if (!Number.isNaN(n)) base.confidence_max = n;
  }
  if (age_days) {
    const n = parseInt(age_days, 10);
    if (!Number.isNaN(n)) base.age_days = n;
  }
  if (q) base.search = q;

  return { tab, options: base };
}
