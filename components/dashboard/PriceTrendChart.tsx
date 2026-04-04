'use client'

interface DataPoint {
  month: string
  median_price: number
  observation_count: number
}

export default function PriceTrendChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length < 2) return null

  const prices = data.map((d) => d.median_price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const w = 100 / (data.length - 1)

  const points = data
    .map((d, i) => {
      const x = i * w
      const y = 100 - ((d.median_price - min) / range) * 80 - 10
      return `${x},${y}`
    })
    .join(' ')

  const latest = data[data.length - 1]
  const earliest = data[0]
  const pctChange = ((latest.median_price - earliest.median_price) / earliest.median_price) * 100
  const trendColor = pctChange >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wide text-slate-500">Price Trend</div>
        <div className={`text-sm font-medium ${trendColor}`}>
          {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%
        </div>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-20" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between mt-1 text-xs text-slate-600">
        <span>{data[0].month?.slice(0, 7)}</span>
        <span>{latest.month?.slice(0, 7)}</span>
      </div>
    </div>
  )
}
