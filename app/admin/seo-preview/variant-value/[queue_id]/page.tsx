// Admin-gated preview for variant_value SEO trust rendering.
//
// Not crawlable, not public. Reuses the shared-secret cookie set by
// /admin/agent-review?token=… (cookie path is /, so the same cookie works
// for any admin path). Does NOT activate variant_value pages.

import type { Metadata } from 'next';
import Link from 'next/link';
import { isAdminAuthorized } from '@/app/admin/agent-review/lib/admin-guard';
import { loadVariantValuePayload } from '@/lib/seo/variant-value-payload';
import VariantValueTrustBlock from '@/components/variant-value/VariantValueTrustBlock';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Variant Value Preview — Admin' },
  robots: 'noindex,nofollow',
};

export default async function VariantValuePreviewPage({
  params,
}: {
  params: Promise<{ queue_id: string }>;
}) {
  if (!(await isAdminAuthorized())) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="text-lg font-semibold">Not authorized</h1>
          <p className="mt-2 text-sm text-slate-400">
            Visit{' '}
            <Link
              href="/admin/agent-review"
              className="text-amber-400 underline"
            >
              /admin/agent-review?token=…
            </Link>{' '}
            once with the shared secret to set the admin cookie, then return
            to this URL.
          </p>
        </div>
      </main>
    );
  }

  const { queue_id } = await params;
  const parsed = Number(queue_id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="text-lg font-semibold">Invalid queue_id</h1>
          <p className="mt-2 text-sm text-slate-400">
            queue_id must be a positive integer.
          </p>
        </div>
      </main>
    );
  }

  const { payload, error, raw } = await loadVariantValuePayload(parsed);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <nav className="mb-4 text-xs text-slate-500">
          <span>/admin</span>
          <span className="mx-1">/</span>
          <span>seo-preview / variant-value / q{queue_id}</span>
        </nav>

        <header className="mb-4">
          <h1 className="text-lg font-semibold text-white">
            Variant Value Trust Preview
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Renders build_seo_page_payload(q={queue_id}).trust as it will
            appear on a future variant_value page. Not activated; not public.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-rose-700 bg-rose-950 px-3 py-2 text-sm text-rose-200"
          >
            <strong className="font-semibold">Load error:</strong> {error}
          </div>
        )}

        {payload ? (
          <VariantValueTrustBlock payload={payload} />
        ) : (
          <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-4 text-sm text-slate-400">
            No payload returned.
          </div>
        )}

        <details className="mt-6">
          <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300">
            Show raw payload JSON
          </summary>
          <pre className="mt-2 max-h-[40vh] overflow-auto rounded-md border border-slate-800 bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-300">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </details>
      </div>
    </main>
  );
}
