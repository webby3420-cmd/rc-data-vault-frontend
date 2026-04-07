"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type ViewedVariant = {
  path: string;
  name: string;
  manufacturer: string;
  viewedAt: number;
};

const STORAGE_KEY = "rcdv_recently_viewed";

function readRecentlyViewed(): ViewedVariant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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
    const existing = readRecentlyViewed();
    const updated = [
      { path: canonicalPath, name: fullName, manufacturer: manufacturerName, viewedAt: Date.now() },
      ...existing.filter((v) => v.path !== canonicalPath),
    ].slice(0, 5);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // safe fallback
    }
    setViewed(updated.filter((v) => v.path !== canonicalPath));
    return () => { setViewed([]); };
  }, [canonicalPath, fullName, manufacturerName]);

  if (viewed.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-base font-semibold text-white mb-3">Recently viewed</h2>
      <div className="grid gap-2">
        {viewed.map((v) => (
          <Link key={v.path} href={v.path} className="text-sm text-slate-300 hover:text-white transition">
            <span className="text-slate-500">{v.manufacturer}</span> {v.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
