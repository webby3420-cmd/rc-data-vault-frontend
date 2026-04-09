import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export default async function AdminImagesPage() {
  const { data: queue } = await supabase
    .from('image_ingestion_queue')
    .select(`
      queue_id, variant_id, priority, status, confidence_score,
      google_candidates, search_query_used, last_error, attempt_count,
      tried_sources
    `)
    .in('status', ['unresolved_low_confidence', 'failed'])
    .order('priority', { ascending: true })
    .limit(50)

  const variantIds = (queue || []).map(q => q.variant_id)
  const { data: variants } = variantIds.length > 0
    ? await supabase
        .from('variants')
        .select('variant_id, full_name, slug')
        .in('variant_id', variantIds)
    : { data: [] }

  const variantMap = Object.fromEntries((variants || []).map((v: any) => [v.variant_id, v]))

  const pending = queue?.filter(q => q.status === 'unresolved_low_confidence') || []
  const failedItems = queue?.filter(q => q.status === 'failed') || []

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Image Admin — Manual Review</h1>
      <p className="text-slate-400 mb-8 text-sm">
        {pending.length} unresolved · {failedItems.length} failed · Review candidates and select correct image
      </p>

      {(!queue || queue.length === 0) && (
        <p className="text-slate-500">No items to review.</p>
      )}

      <div className="space-y-8">
        {(queue || []).map((item: any) => {
          const variant = variantMap[item.variant_id] as any
          const candidates: any[] = item.google_candidates || []
          return (
            <div key={item.queue_id} className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{variant?.full_name || item.variant_id}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Status: <span className={item.status === 'failed' ? 'text-red-400' : 'text-amber-400'}>{item.status}</span>
                    {' · '}Priority: {item.priority}
                    {' · '}Attempts: {item.attempt_count}
                  </p>
                  {item.search_query_used && (
                    <p className="text-xs text-slate-600 mt-1">Query: &quot;{item.search_query_used}&quot;</p>
                  )}
                  {item.last_error && (
                    <p className="text-xs text-red-500 mt-1">Error: {item.last_error}</p>
                  )}
                </div>
              </div>

              {candidates.length > 0 ? (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Google Candidates</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {candidates.map((c: any, i: number) => (
                      <div key={i} className="rounded-xl border border-slate-700 bg-slate-950 p-2">
                        <div className="aspect-[4/3] bg-slate-800 rounded-lg overflow-hidden mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.url}
                            alt={c.title || ''}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-slate-400 truncate mb-1">{c.source}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-amber-400">conf: {c.confidence?.toFixed(2)}</span>
                          <span className="text-xs text-slate-500">q: {c.qualityScore?.toFixed(2)}</span>
                        </div>
                        <form action="/api/admin/select-image" method="POST">
                          <input type="hidden" name="queue_id" value={item.queue_id} />
                          <input type="hidden" name="variant_id" value={item.variant_id} />
                          <input type="hidden" name="image_url" value={c.url} />
                          <input type="hidden" name="confidence" value={c.confidence} />
                          <input type="hidden" name="source" value={c.source} />
                          <button
                            type="submit"
                            className="w-full text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-1.5 rounded-lg transition-colors"
                          >
                            Use This
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">No candidates found — needs manual URL entry</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
