import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

interface ResendWebhookPayload {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    bounce?: { type: "hard" | "soft"; message: string };
  };
}

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const authHeader = req.headers.get("authorization");
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret || authHeader !== secret) {
    console.error("resend-webhook: invalid authorization");
    // Still return 200 to prevent Resend from retrying with bad auth
    return NextResponse.json({ received: true });
  }

  let body: ResendWebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ received: true });
  }

  const { type, data } = body;
  const recipientEmail = data?.to?.[0];

  if (!recipientEmail) {
    return NextResponse.json({ received: true });
  }

  try {
    if (type === "email.bounced") {
      const bounceType = data.bounce?.type === "hard" ? "hard" : "soft";
      const bounceReason = data.bounce?.message ?? "unknown bounce";

      await supabase.rpc("mark_email_bounced", {
        p_email: recipientEmail,
        p_bounce_type: bounceType,
        p_bounce_reason: bounceReason,
      });

      console.log(
        `resend-webhook: bounce ${bounceType} for ${recipientEmail}`
      );
    } else if (type === "email.complained") {
      await supabase.rpc("mark_email_bounced", {
        p_email: recipientEmail,
        p_bounce_type: "complaint",
        p_bounce_reason: "spam complaint",
      });

      console.log(`resend-webhook: complaint for ${recipientEmail}`);
    } else if (type === "email.delivery_delayed") {
      console.log(`resend-webhook: delivery delayed for ${recipientEmail}`);
    }
  } catch (err: any) {
    console.error(
      `resend-webhook: error processing ${type}:`,
      err?.message ?? err
    );
  }

  // Always return 200 — Resend retries on non-200
  return NextResponse.json({ received: true });
}
