import { Search, BarChart2, CircleCheck, ChevronRight } from 'lucide-react'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-0">

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
              <Search className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-white">
              Search a model
            </span>
          </div>

          <ChevronRight className="hidden sm:block mx-4 h-4 w-4 text-slate-600" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
              <BarChart2 className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-white">
              See market data
            </span>
          </div>

          <ChevronRight className="hidden sm:block mx-4 h-4 w-4 text-slate-600" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
              <CircleCheck className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-white">
              Make your call
            </span>
          </div>

        </div>
      </div>
    </section>
  )
}
