export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://rcdatavault.com",
  apiBaseUrl: process.env.RC_API_BASE_URL || "",
  revalidateSecret: process.env.REVALIDATE_SECRET || "",
};

if (!env.apiBaseUrl) {
  throw new Error("Missing RC_API_BASE_URL");
}
