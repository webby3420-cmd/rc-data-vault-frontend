interface ScoreCardProps {
  label: string
  score: number
  tier: string
  description?: string
}

export default function ScoreCard({ label, score, tier, description }: ScoreCardProps) {
  const color = score >= 70 ? 'text-green-400' : score >= 45 ? 'text-amber-400' : 'text-slate-400'
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <div className={`text-3xl font-semibold ${color}`}>{score}</div>
      <div className="text-sm text-slate-300 mt-0.5 capitalize">{tier}</div>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  )
}
