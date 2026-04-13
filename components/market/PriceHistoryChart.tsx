'use client'

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type TrendBucket = {
  month: string
  median: number
  low: number
  high: number
  count: number
}

interface PriceHistoryChartProps {
  trendRows: TrendBucket[] | null | undefined
}

function formatMonth(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`
}

function formatPrice(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-white">{formatMonth(d.month)}</p>
      <p className="text-amber-400 mt-1">Median: {formatPrice(d.median)}</p>
      <p className="text-slate-400">Range: {formatPrice(d.low)} – {formatPrice(d.high)}</p>
      <p className="text-slate-500">{d.count} sale{d.count !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function PriceHistoryChart({ trendRows }: PriceHistoryChartProps) {
  if (!trendRows || trendRows.length < 2) return null

  const totalSales = trendRows.reduce((sum, r) => sum + r.count, 0)

  // Compute range band as stacked areas: low base + (high - low) band
  const chartData = trendRows.map(r => ({
    ...r,
    rangeBand: r.high - r.low,
  }))

  return (
    <div>
      <div className="mt-4 -mx-1">
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="#1e293b"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => formatPrice(v)}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              dataKey="low"
              type="monotone"
              stackId="range"
              fill="transparent"
              stroke="none"
            />
            <Area
              dataKey="rangeBand"
              type="monotone"
              stackId="range"
              fill="rgba(251, 191, 36, 0.08)"
              stroke="none"
            />
            <Line
              dataKey="median"
              type="monotone"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#f59e0b', strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Based on {totalSales} sale{totalSales !== 1 ? 's' : ''} across {trendRows.length} months
      </p>
    </div>
  )
}
