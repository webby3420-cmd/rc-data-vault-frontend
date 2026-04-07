import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      modelName,
      targetPrice,
      variantSlug,
      mfrSlug,
      familySlug,
      unsubscribeToken,
    } = body;

    if (!email || !modelName || !targetPrice || !unsubscribeToken) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
      });
    }

    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://rcdatavault.com"}/unsubscribe?token=${unsubscribeToken}`;

    const variantUrl =
      mfrSlug && familySlug && variantSlug
        ? `https://rcdatavault.com/rc/${mfrSlug}/${familySlug}/${variantSlug}`
        : `https://rcdatavault.com`;

    const formattedPrice = Number(targetPrice).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    const { error: sendError } = await resend.emails.send({
      from: "RC Data Vault <alerts@rcdatavault.com>",
      to: email,
      subject: `Price alert set for ${modelName}`,
      html: `
        <div style="background:#0f172a;padding:32px 16px;font-family:Arial,sans-serif;color:#e2e8f0;">
          <div style="max-width:520px;margin:0 auto;">

            <p style="font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin:0 0 8px;">
              RC Data Vault
            </p>

            <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 20px;line-height:1.3;">
              Price alert confirmed
            </h1>

            <div style="background:#1e293b;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Model</p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#ffffff;">${modelName}</p>

              <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Your target price</p>
              <p style="margin:0;font-size:28px;font-weight:700;color:#f59e0b;">${formattedPrice}</p>
            </div>

            <p style="font-size:14px;color:#cbd5e1;line-height:1.6;margin:0 0 24px;">
              We'll email you when a sold listing for this model drops below your target price. Alerts are based on eBay sold listing data.
            </p>

            <a href="${variantUrl}"
               style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:32px;">
              View model on RC Data Vault →
            </a>

            <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 20px;" />

            <p style="font-size:12px;color:#475569;line-height:1.6;margin:0 0 8px;">
              You are receiving this email because you signed up for a price alert on RC Data Vault.
            </p>

            <p style="font-size:12px;margin:0;">
              <a href="${unsubscribeUrl}" style="color:#f59e0b;text-decoration:underline;">
                Unsubscribe from this alert
              </a>
            </p>

          </div>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return new Response(JSON.stringify({ success: false, error: sendError.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Alert confirm error:", err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
