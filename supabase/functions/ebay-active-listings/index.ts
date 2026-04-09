import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EBAY_SOURCE_ID = "8a833c0d-2484-49cd-b689-2065fe0d1ba8";

async function getEbayToken(): Promise<string> {
  const clientId = Deno.env.get("EBAY_CLIENT_ID");
  const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Missing eBay credentials");
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  });
  if (!res.ok) { const text = await res.text(); throw new Error(`eBay OAuth failed: ${res.status} ${text}`); }
  const data = await res.json();
  return data.access_token;
}

async function searchEbayActive(token: string, query: string, limit = 20): Promise<any[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    "filter": "buyingOptions:{FIXED_PRICE},price:[80..5000],priceCurrency:USD",
    "sort": "price",
    "fieldgroups": "MATCHING_ITEMS",
  });
  const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) { console.error(`eBay Browse API error: ${res.status} for query "${query}"`); return []; }
  const data = await res.json();
  return data.itemSummaries ?? [];
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_KEY")!
    );

    const { data: searchQueue } = await supabase
      .from("ebay_search_queue_view")
      .select("search_term, variant_id")
      .limit(30);

    if (!searchQueue || searchQueue.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No search terms" }), { status: 200 });
    }

    const token = await getEbayToken();
    let ingested = 0;
    let skipped = 0;

    for (const { search_term, variant_id } of searchQueue) {
      const items = await searchEbayActive(token, search_term, 10);

      for (const item of items) {
        const price = item.price?.value ? parseFloat(item.price.value) : null;
        if (!price || price < 50) { skipped++; continue; }
        const listingUrl = item.itemWebUrl;
        if (!listingUrl) { skipped++; continue; }
        const externalId = item.itemId;
        if (!externalId) { skipped++; continue; }

        // Check if already stored
        const { data: existing } = await supabase
          .from("marketplace_listings")
          .select("listing_id, price_amount, listing_status")
          .eq("external_listing_id", externalId)
          .maybeSingle();

        if (existing) {
          if (existing.listing_status !== "active" || Math.abs(Number(existing.price_amount) - price) > 0.01) {
            await supabase.from("marketplace_listings").update({
              price_amount: price,
              listing_status: "active",
              updated_at: new Date().toISOString(),
            }).eq("listing_id", existing.listing_id);
          }
          skipped++;
          continue;
        }

        // Insert new active listing
        const { data: inserted, error: insertErr } = await supabase
          .from("marketplace_listings")
          .insert({
            source_id: EBAY_SOURCE_ID,
            source_name: "ebay",
            external_listing_id: externalId,
            listing_url: listingUrl,
            title_raw: item.title ?? "",
            price_amount: price,
            currency_code: item.price?.currency ?? "USD",
            shipping_cost: parseFloat(item.shippingOptions?.[0]?.shippingCost?.value ?? "0") || 0,
            condition_raw: item.condition ?? null,
            listing_status: "active",
            is_sold: false,
            listing_purpose: "sale",
            is_vehicle_match_eligible: true,
            first_seen_at: new Date().toISOString(),
          })
          .select("listing_id")
          .single();

        if (insertErr || !inserted) {
          console.error("Insert error:", insertErr?.message);
          continue;
        }

        // Match to variant — ignore duplicate key errors
        const { error: matchErr } = await supabase
          .from("listing_matches")
          .insert({
            listing_id: inserted.listing_id,
            variant_id: variant_id,
            match_method: "search_queue",
            match_score: 75,
            match_confidence: 0.75,
            is_primary_match: true,
            is_primary: true,
            verification_status: "auto",
          });

        if (matchErr && !matchErr.message.includes("duplicate")) {
          console.error("Match insert error:", matchErr.message);
        }

        ingested++;
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    // Mark listings not seen in 2 hours as ended
    await supabase.from("marketplace_listings")
      .update({ listing_status: "ended" })
      .eq("listing_status", "active")
      .eq("is_sold", false)
      .lt("updated_at", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    return new Response(
      JSON.stringify({ success: true, ingested, skipped, searched: searchQueue.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("ebay-active-listings error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
});
