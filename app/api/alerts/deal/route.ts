import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Fetch pending notifications with full deal context
    const { data: pending, error } = await supabase
      .from("alert_notifications")
      .select(`
        notification_id,
        recipient_email,
        delivery_channel,
        alert_match_id,
        alert_matches (
          alert_id,
          listing_id,
          total_price,
          fair_value,
          deal_score,
          alert_subscriptions (
            alert_name,
            unsubscribe_token
          )
        )
      `)
      .eq("delivery_status", "pending")
      .eq("delivery_channel", "email")
      .limit(50);

    if (error) throw error;
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), { status: 200 });
    }

    let sent = 0;
    let failed = 0;

    for (const notif of pending) {
      const match = notif.alert_matches as any;
      const sub = match?.alert_subscriptions as any;
      const email = notif.recipient_email;
      if (!email) continue;

      // Get listing details
      const { data: listing } = await supabase
        .from("marketplace_listings")
        .select("title_raw, listing_url, price_amount, source_name")
        .eq("listing_id", match.listing_id)
        .single();

      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://rcdatavault.com"}/unsubscribe?token=${sub?.unsubscribe_token ?? ""}`;
      const price = listing?.price_amount ?? match.total_price;
      const fairValue = match.fair_value;
      const savings = fairValue && price ? (fairValue - price).toFixed(0) : null;
      const sourceLabel = listing?.source_name === "ebay" ? "eBay" : listing?.source_name ?? "Marketplace";
      const formattedPrice = Number(price).toLocaleString("en-US", { style: "currency", currency: "USD" });
      const formattedFair = fairValue ? Number(fairValue).toLocaleString("en-US", { style: "currency", currency: "USD" }) : null;
      const modelName = sub?.alert_name?.replace("Price alert for ", "") ?? "RC Model";

      const { error: sendError } = await resend.emails.send({
        from: "RC Data Vault <alerts@rcdatavault.com>",
        to: email,
        subject: `Deal found: ${modelName} at ${formattedPrice}`,
        html: `
          <div style="background:#0f172a;padding:32px 16px;font-family:Arial,sans-serif;color:#e2e8f0;">
            <div style="max-width:520px;margin:0 auto;">
              <p style="font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin:0 0 8px;">RC Data Vault · Deal Alert</p>
              <h1 style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 20px;line-height:1.3;">A deal was found for ${modelName}</h1>

              <div style="background:#1e293b;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:14px;color:#cbd5e1;line-height:1.5;">${listing?.title_raw ?? modelName}</p>
                <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#f59e0b;">${formattedPrice}</p>
                ${formattedFair ? `<p style="margin:0 0 4px;font-size:13px;color:#64748b;">Market value: ${formattedFair}${savings ? ` · Save ~$${savings}` : ""}</p>` : ""}
                <p style="margin:0 0 16px;font-size:12px;color:#475569;">Source: ${sourceLabel}</p>
                ${listing?.listing_url ? `
                <a href="${listing.listing_url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                  View Deal →
                </a>` : ""}
              </div>

              <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 20px;" />
              <p style="font-size:12px;color:#475569;line-height:1.6;margin:0 0 8px;">You are receiving this because you set a price alert on RC Data Vault.</p>
              <p style="font-size:12px;margin:0;"><a href="${unsubscribeUrl}" style="color:#f59e0b;text-decoration:underline;">Unsubscribe from this alert</a></p>
            </div>
          </div>
        `,
      });

      if (sendError) {
        console.error(`Failed to send to ${email}:`, sendError);
        await supabase
          .from("alert_notifications")
          .update({ delivery_status: "failed", error_message: sendError.message })
          .eq("notification_id", notif.notification_id);
        failed++;
      } else {
        await supabase
          .from("alert_notifications")
          .update({ delivery_status: "sent", sent_at: new Date().toISOString() })
          .eq("notification_id", notif.notification_id);
        await supabase
          .from("alert_subscriptions")
          .update({ last_notified_at: new Date().toISOString() })
          .eq("alert_id", match.alert_id);
        sent++;
      }
    }

    return new Response(JSON.stringify({ success: true, sent, failed }), { status: 200 });
  } catch (err) {
    console.error("Deal alert route error:", err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
