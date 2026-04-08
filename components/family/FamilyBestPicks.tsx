import Link from "next/link";

interface FamilyBestPicksProps {
  bestVariantSlug: string | null;
  bestVariantName: string | null;
  mostActiveSlug: string | null;
  mostActiveName: string | null;
  manufacturerSlug: string;
  familySlug: string;
}

export default function FamilyBestPicks({
  bestVariantSlug,
  bestVariantName,
  mostActiveSlug,
  mostActiveName,
  manufacturerSlug,
  familySlug,
}: FamilyBestPicksProps) {
  if (!bestVariantSlug && !mostActiveSlug) return null;

  const showMostActive = mostActiveSlug && mostActiveSlug !== bestVariantSlug;

  return (
    <div className="space-y-1 text-sm text-slate-400">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Start with these variants</p>
      {bestVariantSlug && bestVariantName && (
        <p>
          Most data:{" "}
          <Link
            href={`/rc/${manufacturerSlug}/${familySlug}/${bestVariantSlug}`}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {bestVariantName} →
          </Link>
        </p>
      )}
      {showMostActive && mostActiveName && (
        <p>
          Most recent activity:{" "}
          <Link
            href={`/rc/${manufacturerSlug}/${familySlug}/${mostActiveSlug}`}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {mostActiveName} →
          </Link>
        </p>
      )}
    </div>
  );
}
