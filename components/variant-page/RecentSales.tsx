import type { VariantPagePayload } from "@/types/variant-page";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function RecentSales({ payload }: { payload: VariantPagePayload }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-4 text-2xl font-semibold text-white">Recent Sold Listings</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 pr-4">Price</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Source</th>
              <th className="pb-3">Title</th>
            </tr>
          </thead>

          <tbody>
            {payload.recent_sales.slice(0, 12).map((sale, idx) => (
              <tr key={`${sale.title}-${idx}`} className="border-t border-slate-800">
                <td className="py-3 pr-4 font-medium text-amber-400">
                  {formatCurrency(sale.price)}
                </td>
                <td className="py-3 pr-4">{formatDate(sale.price_date)}</td>
                <td className="py-3 pr-4 uppercase text-slate-400">
                  {sale.source ?? "—"}
                </td>
                <td className="py-3">{sale.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
