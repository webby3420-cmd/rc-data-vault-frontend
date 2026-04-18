'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

type AlertRecord = {
  variant_slug: string;
  variant_name: string;
  manufacturer: string;
  family_slug: string;
  target_price: number;
  created_at: string;
};

const KEY = 'rcdv_alerts';
const DISPLAY_LIMIT = 5;

function formatPrice(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function manufacturerDisplay(variantName: string): string {
  const first = variantName.split(' ')[0];
  return first || '';
}

function isValidAlert(x: unknown): x is AlertRecord {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.variant_slug === 'string' && r.variant_slug.length > 0 &&
    typeof r.variant_name === 'string' && r.variant_name.length > 0 &&
    typeof r.manufacturer === 'string' &&
    typeof r.family_slug === 'string' &&
    typeof r.target_price === 'number' && isFinite(r.target_price) &&
    typeof r.created_at === 'string'
  );
}

export function HomepageYourAlerts() {
  const [alerts, setAlerts] = useState<AlertRecord[] | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) { setAlerts([]); return; }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { setAlerts([]); return; }
      const valid = parsed.filter(isValidAlert);
      setAlerts(valid);
    } catch {
      setAlerts([]);
    }
  }, []);

  if (alerts === null) return null;
  if (alerts.length === 0) return null;

  const display = alerts.slice(0, DISPLAY_LIMIT);

  return (
    <section className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-400" />
          <h2 className="text-2xl font-semibold tracking-tight text-white">Your Alerts</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">Models you&apos;re tracking from this device</p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {display.map((a) => {
            const hasLink = a.manufacturer && a.family_slug;
            const href = hasLink
              ? `/rc/${a.manufacturer}/${a.family_slug}/${a.variant_slug}`
              : null;

            const cardInner = (
              <>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {manufacturerDisplay(a.variant_name)}
                </div>
                <div className="mt-1 text-sm font-medium text-white group-hover:text-amber-400 transition">
                  {a.variant_name}
                </div>
                <div className="mt-2 text-xs text-amber-400">
                  Watching for &le; {formatPrice(a.target_price)}
                </div>
              </>
            );

            if (href) {
              return (
                <Link
                  key={`${a.variant_slug}-${a.target_price}`}
                  href={href}
                  className="group rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-600"
                >
                  {cardInner}
                </Link>
              );
            }

            return (
              <div
                key={`${a.variant_slug}-${a.target_price}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                {cardInner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
