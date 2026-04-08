import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "alerts@rcdatavault.com";
const SITE_URL = "https://rcdatavault.com";

interface Job {
  job_id: string;
  alert_id: number;
  email: string;
  unsubscribe_token: string;
  variant_id: string | null;
  variant_slug: string | null;
  frequency: string;
  criteria: Record<string, unknown> | null;
  last_sent_at: string | null;
}

interface Deal {
  listing_id: string;
  variant_name: string;
  manufacturer_name: string;
  title_raw: string;
  price_amount: number;
  listing_url: string;
  deal_score: number;
  deal_label: string;
  condition_raw: string | null;
}

function dealLabelText(label: string): string {
  if (label === "strong_buy") return "Strong Buy";
  if (label === "good_deal") return "Good Deal";
  return "Fair";
}

function dealLabelColor(label: string): string {
  if (label === "strong_buy") return "#10b981";
  if (label === "good_deal") return "#f59e0b";
  return "#94a3b8";
}

function buildEmailHtml(deals: Deal[], unsubscribeUrl: string): string {
  const dealRows = deals
    .map(
      (d) => `
    <tr>
      <td style="padding:16px 20px;border-bottom:1px solid #1e293b;">
        <div style="margin-bottom:6px;">
          <span style="display:inline-block;background:${dealLabelColor(d.deal_label)};color:#000;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;">
            ${dealLabelText(d.deal_label)}
          </span>
          <span style="color:#94a3b8;font-size:12px;margin-left:8px;">Score: ${d.deal_score}/100</span>
        </div>
        <div style="font-size:14px;color:#e2e8f0;margin-bottom:4px;">${escapeHtml(d.title_raw)}</div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">${escapeHtml(d.manufacturer_name)} &middot; ${escapeHtml(d.variant_name)}${d.condition_raw ? ` &middot; ${escapeHtml(d.condition_raw)}` : ""}</div>
        <div style="margin-bottom:10px;">
          <span style="font-size:22px;font-weight:700;color:#f59e0b;">$${Math.round(d.price_amount).toLocaleString("en-US")}</span>
        </div>
        <a href="${escapeHtml(d.listing_url)}" style="display:inline-block;background:#f59e0b;color:#0f172a;font-size:13px;font-weight:600;padding:8px 18px;border-radius:8px;text-decoration:none;">
          View listing &rarr;
        </a>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:18px;font-weight:700;color:#f59e0b;">RC Data Vault</span>
      <span style="color:#64748b;font-size:13px;margin-left:8px;">Deal Alert</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;">
      ${dealRows}
    </table>
    <div style="text-align:center;margin-top:24px;padding:16px;">
      <p style="color:#64748b;font-size:12px;margin:0 0 8px;">
        You're receiving this because you subscribed to deal alerts on RC Data Vault.
      </p>
      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#94a3b8;font-size:12px;text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendResendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<{ id?: string; error?: string }> {
  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data?.message ?? `Resend ${res.status}` };
    return { id: data.id };
  } catch (err) {
    return { error: String(err) };
  }
}

Deno.serve(async (_req) => {
  const stats = { processed: 0, sent: 0, skipped: 0, failed: 0 };

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("Missing RESEND_API_KEY");

    // 1. Get pending jobs
    const { data: jobs, error: jobErr } = await supabase.rpc(
      "get_pending_alert_jobs",
      { p_batch_size: 20 }
    );

    if (jobErr || !jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, ...stats, message: jobErr?.message ?? "No pending jobs" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    for (const job of jobs as Job[]) {
      stats.processed++;

      try {
        // 2a. Fetch matching deals
        let dealQuery = supabase
          .from("top_deals_live")
          .select("listing_id, variant_name, manufacturer_name, title_raw, price_amount, listing_url, deal_score, deal_label, condition_raw")
          .gte("deal_score", 55)
          .order("deal_score", { ascending: false })
          .limit(10);

        if (job.variant_id) {
          dealQuery = dealQuery.eq("variant_id", job.variant_id);
        }

        const { data: allDeals } = await dealQuery;

        if (!allDeals || allDeals.length === 0) {
          await supabase.rpc("mark_alert_job_sent", { p_job_id: job.job_id, p_matched: 0 });
          stats.skipped++;
          continue;
        }

        // 2b. Filter out already-sent listings
        const listingIds = allDeals.map((d: Deal) => d.listing_id);
        const { data: existingMatches } = await supabase
          .from("subscription_alert_matches")
          .select("listing_id")
          .eq("alert_id", job.alert_id)
          .in("listing_id", listingIds);

        const sentIds = new Set((existingMatches ?? []).map((m: { listing_id: string }) => m.listing_id));
        const newDeals = allDeals.filter((d: Deal) => !sentIds.has(d.listing_id));

        if (newDeals.length === 0) {
          await supabase.rpc("mark_alert_job_sent", { p_job_id: job.job_id, p_matched: 0 });
          stats.skipped++;
          continue;
        }

        // 2c. Take top 3 for email
        const topDeals = newDeals.slice(0, 3) as Deal[];

        // 2d. Build and send email
        const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${job.unsubscribe_token}`;
        const subject =
          topDeals.length === 1
            ? `Price alert: ${topDeals[0].variant_name} from $${Math.round(topDeals[0].price_amount)} on eBay`
            : `${topDeals.length} deals found for your RC watchlist`;

        const html = buildEmailHtml(topDeals, unsubscribeUrl);
        const sendResult = await sendResendEmail(resendKey, job.email, subject, html);

        if (sendResult.error) {
          console.error(`Send failed for job ${job.job_id}: ${sendResult.error}`);
          stats.failed++;
          continue;
        }

        // 2e. Record delivery
        await supabase.from("alert_deliveries").insert({
          alert_id: job.alert_id,
          job_id: job.job_id,
          email: job.email,
          template_key: "daily_variant_alert",
          subject,
          payload_snapshot: { deals: topDeals.map((d) => ({ listing_id: d.listing_id, price: d.price_amount, score: d.deal_score })) },
          matched_item_count: topDeals.length,
          provider_message_id: sendResult.id ?? null,
          status: "sent",
          sent_at: new Date().toISOString(),
        });

        // 2f. Record matches to prevent re-sending
        for (const deal of topDeals) {
          await supabase.from("subscription_alert_matches").upsert(
            {
              alert_id: job.alert_id,
              listing_id: deal.listing_id,
              variant_id: job.variant_id,
              match_type: "deal_alert",
              price_at_match: deal.price_amount,
              deal_score_at_match: deal.deal_score,
              first_seen_at: new Date().toISOString(),
              last_sent_at: new Date().toISOString(),
              send_count: 1,
              suppressed: false,
            },
            { onConflict: "alert_id,listing_id" }
          );
        }

        // 2g. Mark job complete
        await supabase.rpc("mark_alert_job_sent", {
          p_job_id: job.job_id,
          p_matched: topDeals.length,
        });

        stats.sent++;
      } catch (err) {
        console.error(`Job ${job.job_id} error:`, err);
        stats.failed++;
      }

      // Politeness delay between sends
      await new Promise((r) => setTimeout(r, 300));
    }

    return new Response(JSON.stringify({ success: true, ...stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("alert-delivery-worker error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err), ...stats }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
