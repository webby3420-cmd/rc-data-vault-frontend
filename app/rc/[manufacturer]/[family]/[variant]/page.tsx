import type { Metadata } from "next";
import { VariantPage } from "@/components/variant-page/VariantPage";
import { getVariantPagePayload } from "@/lib/variant-page";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    manufacturer: string;
    family: string;
    variant: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant } = await params;
  const payload = await getVariantPagePayload(variant);

  const robotsIndex = payload.seo.robots_directive.includes("index");
  const robotsFollow = payload.seo.robots_directive.includes("follow");

  return {
    title: payload.seo.title_tag,
    description: payload.seo.meta_description,
    alternates: {
      canonical: payload.seo.canonical_url,
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
  };
}

export default async function VariantRoutePage({ params }: Props) {
  const { variant } = await params;
  const payload = await getVariantPagePayload(variant);

  return <VariantPage payload={payload} />;
}
