// app/rc/methodology/page.tsx
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Methodology — RC Data Vault",
  description:
    "How RC Data Vault calculates valuation confidence from sold comps.",
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-white">
        How we calculate confidence
      </h1>
      <div className="mt-6 space-y-4 text-slate-200">
        <p>
          RC Data Vault values are calculated from completed sales (sold comps)
          on eBay and other marketplaces. We treat verified sold prices — not
          asking prices — as the truth layer for what an RC vehicle is currently
          worth.
        </p>
        <p>
          Listings are filtered before they reach a valuation. Parts, body
          shells, accessories, and bundles are excluded. Outliers and
          contamination are removed where detected.
        </p>
        <p>
          Prices shown are the listed sale price as posted on the marketplace.
          Shipping costs are tracked separately and are not added to the
          valuation. Marketplace fees such as eBay&apos;s seller fees are paid
          by the seller out of their proceeds and don&apos;t change what the
          buyer paid, so they don&apos;t affect our valuations.
        </p>
        <p>Confidence depends on three things over the most recent 90 days:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>How many clean sold comps we have (sample size)</li>
          <li>How recent the most recent sale is (freshness)</li>
          <li>How wide the price range is relative to the median (spread)</li>
        </ul>
        <p>
          A model with many recent, tightly-clustered sales earns High
          confidence. Wider spreads, older comps, or thin samples bring
          confidence down.
        </p>
        <p className="text-sm text-slate-400">
          Values shown on RC Data Vault are estimates derived from public sales
          data and are not guarantees of price or appraisals.
        </p>
      </div>
    </main>
  );
}
