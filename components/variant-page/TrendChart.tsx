import type { VariantPagePayload } from "@/types/variant-page";

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(new Date(value));
}

export function TrendChart({ payload }: { payload: VariantPagePayload }) {
  const points = payload.price_trends.filter((p) => p.median_price !== null);
  const values = points.map((p) => p.median_price as number);

  if (points.length === 0) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 520;
  const height = 140;
  const padding = 16;

  const chartPoints = points.map((point, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / Math.max(points.length - 1, 1);

    const ratio =
      max === min
        ? 0.5
        : ((point.median_price as number) - min) / (max - min);

    const y = height - padding - ratio * (height - padding * 2);

    return `${x},${y}`;
  });

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-4 text-2xl font-semibold text-white">Market Trend</h2>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mb-4 h-auto w-full rounded-xl bg-slate-950"
        role="img"
        aria-label="Price trend chart"
      >
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          points={chartPoints.join(" ")}
        />
        {chartPoints.map((point, idx) => {
          const [cx, cy] = point.split(",");
          return <circle key={idx} cx={cx} cy={cy} r="4" fill="#f59e0b" />;
        })}
      </svg>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 pr-4">Month</th>
              <th className="pb-3 pr-4">Median</th>
              <th className="pb-3 pr-4">Range</th>
              <th className="pb-3">Count</th>
            </tr>
          </thead>

          <tbody>
            {points.map((row) => (
              <tr key={row.month} className="border-t border-slate-800">
                <td className="py-3 pr-4">{formatMonth(row.month)}</td>
                <td className="py-3 pr-4 font-medium text-amber-400">
                  {formatCurrency(row.median_price)}
                </td>
                <td className="py-3 pr-4">
                  {formatCurrency(row.min_price)} –{" "}
                  {formatCurrency(row.max_price)}
                </td>
                <td className="py-3">{row.observation_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
