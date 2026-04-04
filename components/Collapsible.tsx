'use client'
import { useState } from 'react'

export default function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-800 transition">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </section>
  )
}
