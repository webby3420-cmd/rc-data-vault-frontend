import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function sitemap() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("v_variant_valuations_clean")
    .select(`
      variant_slug,
      manufacturer_slug,
      model_family_slug,
      observation_count,
      valuation_status
    `)
    .not("variant_slug", "is", null);

  if (error) {
    throw new Error("Failed to generate sitemap");
  }

  const baseUrl = "https://rcdatavault.com";

  const urls = (data || [])
    .filter((row) => {
      // Only index good pages
      return (
        row.observation_count >= 3 &&
        row.valuation_status !== "no_data"
      );
    })
    .map((row) => ({
      url: `${baseUrl}/rc/${row.manufacturer_slug}/${row.model_family_slug}/${row.variant_slug}`,
      lastModified: new Date(),
    }));

  return urls;
}
