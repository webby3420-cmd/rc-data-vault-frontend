/* Skeleton loaders for variant page Suspense boundaries.
   Every skeleton matches the exact dimensions of its real component
   to guarantee zero layout shift (CLS). */

const pulse = "animate-pulse bg-slate-800 rounded";

/* ─── PricingPillRow skeleton (horizontal scroll row of 3–4 pill cards) ─── */
export function PricingPillRowSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden pb-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 shrink-0"
        >
          <div className={`h-7 w-7 rounded-lg ${pulse}`} />
          <div className="space-y-1.5">
            <div className={`h-2.5 w-10 ${pulse}`} />
            <div className={`h-4 w-14 ${pulse}`} />
            <div className={`h-2 w-12 ${pulse}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SignalStrip skeleton (chips row) ─── */
export function SignalStripSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-7 w-24 rounded-full ${pulse}`} />
        ))}
      </div>
      <div className="flex gap-2">
        <div className={`h-8 w-24 rounded-lg ${pulse}`} />
        <div className={`h-8 w-20 rounded-lg ${pulse}`} />
        <div className={`h-8 w-24 rounded-lg ${pulse}`} />
      </div>
    </div>
  );
}

/* ─── Combined Hero Decision Surface skeleton ─── */
export function HeroDecisionSurfaceSkeleton() {
  return (
    <div className="space-y-3">
      <PricingPillRowSkeleton />
      <SignalStripSkeleton />
    </div>
  );
}

/* ─── PricingSnapshot skeleton (2x2 / 4-col card grid) ─── */
export function PricingSnapshotSkeleton() {
  return (
    <section>
      <div className={`h-4 w-32 mb-3 ${pulse}`} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-6 w-6 rounded-md ${pulse}`} />
              <div className={`h-3 w-12 ${pulse}`} />
            </div>
            <div className={`h-6 w-16 ${pulse}`} />
            <div className={`h-3 w-20 mt-1 ${pulse}`} />
            <div className={`h-2.5 w-14 mt-1 ${pulse}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── MarketIntelligenceCard skeleton (4-col metric strip + text rows) ─── */
export function MarketIntelligenceCardSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className={`h-4 w-36 mb-4 ${pulse}`} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5">
            <div className={`h-2.5 w-12 ${pulse}`} />
            <div className={`h-4 w-16 mt-1.5 ${pulse}`} />
          </div>
        ))}
      </div>
      <div className={`h-4 w-3/4 mt-3 ${pulse}`} />
      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
        <div className={`h-3 w-2/3 ${pulse}`} />
      </div>
    </section>
  );
}

/* ─── BestDeals skeleton (2x3 grid of deal cards) ─── */
export function BestDealsSkeleton() {
  return (
    <section>
      <div className={`h-4 w-28 mb-3 ${pulse}`} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
            <div className={`h-14 w-14 shrink-0 rounded-lg ${pulse}`} />
            <div className="flex-1 space-y-1.5">
              <div className={`h-5 w-16 ${pulse}`} />
              <div className="flex gap-1.5">
                <div className={`h-4 w-12 rounded-full ${pulse}`} />
                <div className={`h-4 w-10 rounded-full ${pulse}`} />
              </div>
              <div className={`h-3 w-24 ${pulse}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Price History Chart skeleton ─── */
export function PriceHistoryChartSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className={`h-[200px] w-full rounded-lg ${pulse}`} />
    </section>
  );
}

/* ─── Alert signup skeleton ─── */
export function AlertSignupSkeleton() {
  return (
    <div id="alert">
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-6">
        <div className={`h-6 w-64 ${pulse}`} />
        <div className={`h-4 w-48 mt-2 ${pulse}`} />
        <div className={`h-14 w-full mt-5 rounded-xl ${pulse}`} />
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className={`h-12 w-full rounded-xl ${pulse}`} />
          <div className={`h-12 w-24 rounded-xl ${pulse}`} />
        </div>
      </section>
    </div>
  );
}

/* ─── Secondary section skeleton (specs + where to buy + content) ─── */
export function SecondarySkeleton() {
  return (
    <div className="space-y-6">
      {/* verified content */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className={`h-4 w-full ${pulse}`} />
        <div className={`h-4 w-3/4 mt-2 ${pulse}`} />
      </section>
      {/* specs */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className={`h-5 w-28 mb-3 ${pulse}`} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className={`h-2.5 w-14 ${pulse}`} />
              <div className={`h-4 w-20 mt-1 ${pulse}`} />
            </div>
          ))}
        </div>
      </section>
      {/* where to buy */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className={`h-4 w-24 mb-3 ${pulse}`} />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-12 w-full rounded-xl ${pulse}`} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Full page skeleton for loading.tsx ─── */
export function VariantPageSkeleton() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex gap-2">
          <div className={`h-4 w-16 ${pulse}`} />
          <div className={`h-4 w-4 ${pulse}`} />
          <div className={`h-4 w-20 ${pulse}`} />
          <div className={`h-4 w-4 ${pulse}`} />
          <div className={`h-4 w-32 ${pulse}`} />
        </div>
        {/* Title */}
        <div className="mb-6">
          <div className={`h-9 w-72 sm:h-10 sm:w-96 ${pulse}`} />
        </div>
        {/* Hero image */}
        <section className="mb-8">
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            <div className={`w-full aspect-[4/3] ${pulse}`} />
          </div>
        </section>
        {/* Content */}
        <div className="space-y-6">
          <HeroDecisionSurfaceSkeleton />
          <PricingSnapshotSkeleton />
          <MarketIntelligenceCardSkeleton />
          <PriceHistoryChartSkeleton />
          <BestDealsSkeleton />
          <AlertSignupSkeleton />
        </div>
      </div>
    </main>
  );
}
