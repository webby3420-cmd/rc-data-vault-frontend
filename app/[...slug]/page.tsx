import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPayload, fetchPublishedRouteByPath } from "../../lib/api";
import type { Payload, PublishedRoute } from "../../lib/types";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

function buildPath(slug?: string[]) {
  if (!slug || slug.length === 0) return "/";
  return `/${slug.join("/")}`;
}

function getText(
  payload: Payload | null,
  keys: string[],
  fallback: string
): string {
  if (!payload) return fallback;

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return fallback;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const path = buildPath(resolvedParams.slug);
  const route = await fetchPublishedRouteByPath(path);

  if (!route) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const payload = await fetchPayload(route.entity_type, route.entity_id);

  const title = getText(payload, ["seo_title", "meta_title", "title", "name"], "RC Data Vault");
  const description = getText(
    payload,
    ["seo_description", "meta_description", "description", "summary"],
    "RC vehicle valuation, price guides, and sold market data."
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rcdatavault.com"}${route.canonical_path}`,
    },
    robots: route.is_indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

function JsonPage({
  route,
  payload,
}: {
  route: PublishedRoute;
  payload: Payload;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">{route.public_path}</nav>
        <h1 className="mb-6 text-3xl font-semibold text-white">
          {String(payload.seo_title || payload.title || payload.name || route.public_path)}
        </h1>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <pre className="text-sm text-slate-200 whitespace-pre-wrap break-words">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}

export default async function CatchAllPage({ params }: PageProps) {
  const resolvedParams = await params;
  const path = buildPath(resolvedParams.slug);

  const route = await fetchPublishedRouteByPath(path);
  if (!route) notFound();

  const payload = await fetchPayload(route.entity_type, route.entity_id);
  if (!payload) notFound();

  return <JsonPage route={route} payload={payload} />;
}
