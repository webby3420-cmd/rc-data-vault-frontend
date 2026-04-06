"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type ViewedVariant = {
  path: string;
  name: string;
  manufacturer: string;
  viewedAt: number;
};

export default function RecentlyViewedVariants({
  canonicalPath,
  fullName,
  manufacturerName,
}: {
  canonicalPath: string;
  fullName: string;
  manufacturerName: string;
}) {
  const [viewed, setViewed] = useState<ViewedVariant[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("rcdv_recently_viewed");
    const existing: ViewedVariant[] = stored ? JSON.parse(stored) : [];
    const updated = [
      { path: canonicalPath, name: fullName, manufacturer: manufacturerName, viewedAt: Date.now() },
      ...existing.filter((v) => v.path !== canonicalPath),
    ].slice(0, 5);
    localStorage.setItem("rcdv_recently_viewed", JSON.stringify(updated));
    setViewed(updated.filter((v) => v.path !== canonicalPath));
  }, [canonicalPath, fullName, manufacturerName]);

  if (viewed.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-base font-semibold text-white mb-3">Recently viewed</h2>
      <div className="grid gap-2">
        {viewed.map((v) => (
          <Link
            key={v.path}
            href={v.path}
            className="text-sm text-slate-300 hover:text-white transition"
          >
            <span className="text-slate-500">{v.manufacturer}</span>{" "}{v.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
