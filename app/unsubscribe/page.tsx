import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h1 className="text-2xl font-semibold text-white">Invalid unsubscribe link</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">This unsubscribe link is missing a token. Please use the link from your email.</p>
            <Link href="/" className="mt-6 inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400">Return to RC Data Vault</Link>
          </div>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase.rpc("unsubscribe_price_alert", { p_token: token });
  const result = Array.isArray(data) ? data[0] : null;
  const success = Boolean(result?.success) && !error;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${success ? "border border-emerald-800 bg-emerald-950/40 text-emerald-200" : "border border-amber-800 bg-amber-950/40 text-amber-200"}`}>
            {success ? "Unsubscribed" : "Unable to complete"}
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-white">
            {success ? "Price alert cancelled" : "Unsubscribe issue"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {result?.message || error?.message || "We could not process this unsubscribe request."}
          </p>
          <div className="mt-6">
            <Link href="/" className="inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400">Return to RC Data Vault</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
