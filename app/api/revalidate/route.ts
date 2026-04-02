import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.REVALIDATE_SECRET || ""}`;

  if (!process.env.REVALIDATE_SECRET || authHeader !== expected) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/cache-invalidations/pending`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json({ ok: false, error: "failed_to_load_invalidations" }, { status: 500 });
  }

  const rows = await res.json();

  for (const row of rows) {
    if (row.public_path) {
      revalidatePath(row.public_path);

      await fetch(`${baseUrl}/api/cache-invalidations/mark-processed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: row.entity_type,
          entity_id: row.entity_id,
        }),
      });
    }
  }

  return Response.json({ ok: true, count: rows.length });
}
