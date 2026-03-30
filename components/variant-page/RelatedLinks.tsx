import Link from "next/link";
import type { VariantPagePayload } from "@/types/variant-page";

export function RelatedLinks({ payload }: { payload: VariantPagePayload }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-4 text-2xl font-semibold text-white">Related Models</h2>

      <div className="mb-6 grid gap-3">
        {payload.related.siblings.map((sibling) => (
          <Link
            key={sibling.variant_id}
            href={sibling.canonical_url}
            className="rounded-xl border border-slate-800 p-4 transition hover:border-slate-600"
          >
            <div className="font-medium text-white">{sibling.full_name}</div>
            <div className="text-sm text-slate-400">
              {sibling.obs_count} sold listings
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={payload.related.model_family.canonical_url}
          className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500"
        >
          {payload.related.model_family.name} family
        </Link>

        <Link
          href={payload.related.manufacturer.canonical_url}
          className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500"
        >
          {payload.related.manufacturer.name}
        </Link>
      </div>
    </section>
  );
}
