"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-800 transition"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </section>
  );
}
