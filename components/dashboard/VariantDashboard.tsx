import ScoreCard from './ScoreCard'
import PriceTrendChart from './PriceTrendChart'

export default function VariantDashboard({ data }: { data: any }) {
  if (!data?.found) return null

  const { market_score, demand, market, price_trends, buyer_intel, score_mode } = data

  const isCollectible = market_score?.score_type === 'collectibility'
  const scoreLabel = isCollectible ? 'Collectibility' : 'Popularity'
  const sectionTitle = isCollectible ? 'Collector Intelligence' : 'Market Intelligence'

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 mt-8">
      <h2 className="mb-1 text-2xl font-semibold text-white">{sectionTitle}</h2>
      {isCollectible && (
        <p className="mb-4 text-xs text-amber-400 uppercase tracking-wide">Vintage / Collector</p>
      )}
      {!isCollectible && (
        <p className="mb-4 text-xs text-slate-500 uppercase tracking-wide">Modern RC</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {market_score?.score != null && (
          <ScoreCard label={scoreLabel} score={market_score.score} tier={market_score.label ?? ''} />
        )}
        {demand?.score != null && !isCollectible && (
          <ScoreCard label="Demand" score={demand.score} tier={demand.label ?? ''} />
        )}
        {market?.total_sales != null && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Total Sales</div>
            <div className="text-3xl font-semibold text-slate-200">{market.total_sales}</div>
            <div className="text-sm text-slate-400 mt-0.5">observed</div>
          </div>
        )}
        {market?.market_depth != null && !isCollectible && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Market Depth</div>
            <div className="text-xl font-semibold text-slate-200 mt-1 capitalize">{market.market_depth}</div>
          </div>
        )}
      </div>
      {price_trends?.length >= 2 && (
        <div className="mb-4"><PriceTrendChart data={price_trends} /></div>
      )}
      {buyer_intel?.timing_signal && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            {isCollectible ? 'Collector Note' : 'Buyer Signal'}
          </div>
          <div className="text-slate-200 capitalize">{buyer_intel.timing_signal?.replace(/_/g, ' ')}</div>
          {buyer_intel.recommendation && (
            <p className="text-slate-400 mt-1 text-xs">{buyer_intel.recommendation}</p>
          )}
        </div>
      )}
    </section>
  )
}
