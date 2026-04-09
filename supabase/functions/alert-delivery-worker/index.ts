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
  max_attempts: number;
  attempt_count: number;
  model_family_id: string | null;
  alert_scope: "variant" | "family";
}

interface Deal {
  listing_id: string;
  variant_name: string;
  manufacturer_name: string;
  manufacturer_slug?: string;
  family_slug?: string;
  variant_slug?: string;
  title_raw: string;
  price_amount: number;
  listing_url: string;
  deal_score: number;
  deal_label: string;
  condition_raw: string | null;
  pct_below_market?: number;
  active_supply_count?: number;
  sell_through_ratio?: number;
  sold_count_30d?: number;
  sold_median_price_90d?: number;
}

const CONTEXT_COPY: Record<string, string> = {
  priced_below_market: "listed below market value",
  limited_inventory: "inventory is limited",
  fast_moving_market: "selling fast right now",
  rising_market: "prices are trending up",
  new_supply: "new listing just appeared",
  new_listing: "new listing available",
};

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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildEmailHtml(
  deals: (Deal & { taggedUrl: string; contextCopy: string })[],
  unsubscribeUrl: string,
  variantPageUrl?: string
): string {
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
        <div style="margin-bottom:4px;">
          <span style="font-size:22px;font-weight:700;color:#f59e0b;">$${Math.round(d.price_amount).toLocaleString("en-US")}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin:4px 0 10px 0;">${capitalize(d.contextCopy)}</p>
        <a href="${escapeHtml(d.taggedUrl)}" style="display:inline-block;background:#f59e0b;color:#0f172a;font-size:13px;font-weight:600;padding:8px 18px;border-radius:8px;text-decoration:none;">
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
      ${variantPageUrl ? `<p style="margin:0 0 12px;"><a href="${escapeHtml(variantPageUrl)}" style="color:#f59e0b;font-size:13px;text-decoration:none;">View all listings on RC Data Vault &rarr;</a></p>` : ""}
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
  const stats = { processed: 0, sent: 0, skipped: 0, failed: 0, failed_permanent: 0, errors: [] as string[] };

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_KEY")!
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

        // 2c. Fatigue suppression — filter out recently-sent listings
        const unsuppressedDeals: Deal[] = [];
        for (const deal of newDeals as Deal[]) {
          const { data: suppressed } = await supabase.rpc(
            "should_suppress_alert_send",
            { p_alert_id: job.alert_id, p_listing_id: deal.listing_id, p_deal_score: deal.deal_score }
          );
          if (suppressed !== true) unsuppressedDeals.push(deal);
        }

        if (unsuppressedDeals.length === 0) {
          await supabase.rpc("mark_alert_job_sent", { p_job_id: job.job_id, p_matched: 0 });
          stats.skipped++;
          continue;
        }

        // 2d. Take top 3 and compute context labels
        const topDeals = unsuppressedDeals.slice(0, 3);
        const alertScope = job.alert_scope ?? "variant";

        const enrichedDeals = await Promise.all(
          topDeals.map(async (deal) => {
            const { data: ctxLabel } = await supabase.rpc(
              "compute_alert_context_label",
              {
                p_pct_below_market: deal.pct_below_market ?? 0,
                p_deal_score: deal.deal_score ?? 0,
                p_active_supply_count: deal.active_supply_count ?? 99,
                p_sell_through_ratio: deal.sell_through_ratio ?? 0,
                p_sold_count_30d: deal.sold_count_30d ?? 0,
                p_price_amount: deal.price_amount ?? 0,
                p_sold_median_90d: deal.sold_median_price_90d ?? 0,
              }
            );
            const contextLabel = ctxLabel ?? "new_listing";
            const contextCopy = CONTEXT_COPY[contextLabel] ?? "new listing available";
            const separator = deal.listing_url.includes("?") ? "&" : "?";
            const taggedUrl = `${deal.listing_url}${separator}src=alert&alert_scope=${alertScope}&alert_context=${contextLabel}`;
            return { ...deal, contextLabel, contextCopy, taggedUrl };
          })
        );

        // Best deal's context label used for subject line
        const bestContextLabel = enrichedDeals[0].contextLabel;
        const bestContextCopy = enrichedDeals[0].contextCopy;

        // 2e. Build and send email
        const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${job.unsubscribe_token}`;
        const variantName = topDeals[0].variant_name;
        const subject =
          enrichedDeals.length === 1
            ? `${variantName} — ${bestContextCopy}`
            : `${enrichedDeals.length} deals found — ${bestContextCopy}`;

        // Build variant page link for footer
        const firstDeal = topDeals[0];
        const variantPageUrl = firstDeal.manufacturer_slug && firstDeal.family_slug && firstDeal.variant_slug
          ? `${SITE_URL}/rc/${firstDeal.manufacturer_slug}/${firstDeal.family_slug}/${firstDeal.variant_slug}?src=alert&alert_scope=${alertScope}&alert_context=${bestContextLabel}`
          : undefined;

        const html = buildEmailHtml(enrichedDeals, unsubscribeUrl, variantPageUrl);
        const sendResult = await sendResendEmail(resendKey, job.email, subject, html);

        if (sendResult.error) {
          const reason = `resend_error: ${sendResult.error}`.slice(0, 500);
          await supabase.rpc("mark_alert_job_failed", {
            p_job_id: job.job_id,
            p_failure_reason: reason,
          });
          if (job.attempt_count + 1 >= job.max_attempts) {
            stats.failed_permanent++;
          } else {
            stats.failed++;
          }
          stats.errors.push(`job ${job.job_id}: ${reason}`);
          continue;
        }

        // 2f. Record delivery
        await supabase.from("alert_deliveries").insert({
          alert_id: job.alert_id,
          job_id: job.job_id,
          email: job.email,
          template_key: "daily_variant_alert",
          subject,
          payload_snapshot: { deals: enrichedDeals.map((d) => ({ listing_id: d.listing_id, price: d.price_amount, score: d.deal_score, context_label: d.contextLabel })) },
          matched_item_count: enrichedDeals.length,
          provider_message_id: sendResult.id ?? null,
          status: "sent",
          sent_at: new Date().toISOString(),
          context_label: bestContextLabel,
          alert_scope: alertScope,
        });

        // 2g. Record matches to prevent re-sending
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

        // 2h. Mark job complete
        await supabase.rpc("mark_alert_job_sent", {
          p_job_id: job.job_id,
          p_matched: topDeals.length,
        });

        stats.sent++;
      } catch (err: any) {
        const reason = `exception: ${err?.message ?? String(err)}`.slice(0, 500);
        try {
          await supabase.rpc("mark_alert_job_failed", {
            p_job_id: job.job_id,
            p_failure_reason: reason,
          });
        } catch {
          // If marking failed also fails, just log it
          console.error(`Failed to mark job ${job.job_id} as failed:`, reason);
        }
        if (job.attempt_count + 1 >= job.max_attempts) {
          stats.failed_permanent++;
        } else {
          stats.failed++;
        }
        stats.errors.push(`job ${job.job_id}: ${reason}`);
      }

      // Politeness delay between sends
      await new Promise((r) => setTimeout(r, 300));
    }

    // Falls through to final return
  } catch (err: any) {
    stats.errors.push(`worker_error: ${err?.message ?? String(err)}`);
  }

  return new Response(JSON.stringify(stats), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
