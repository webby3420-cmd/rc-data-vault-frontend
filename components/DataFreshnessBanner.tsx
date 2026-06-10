// Honest data-freshness disclosure for the deal feed.
// Sold-comp ingestion (eBay Finding API) is externally paused; the deal feed
// leans more heavily on current active listings until it resumes. Tone-matched
// to /rc/methodology's "Current data limitation" section. No restore-date promises.
// When the sold feed resumes, the CL/DB lane updates NEWEST_SOLD_COMP_LABEL.

const NEWEST_SOLD_COMP_LABEL = "April 18, 2026";

export default function DataFreshnessBanner() {
  return (
    <div
      role="note"
      className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-amber-200/90"
    >
      <span className="font-semibold text-amber-300">A note on data freshness.</span>{" "}
      Sold-comp ingestion is externally paused while we work around a vendor-side
      eBay limitation, so the newest sold comparable we can show is from{" "}
      {NEWEST_SOLD_COMP_LABEL}. Until it resumes, the comparisons below lean more
      heavily on current active listings than on completed sales — each card
      states the basis it was scored against.
    </div>
  );
}
