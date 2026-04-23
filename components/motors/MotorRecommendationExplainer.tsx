import { Info } from 'lucide-react';

export function MotorRecommendationExplainer() {
  return (
    <aside
      aria-label="Why these motors were recommended"
      className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
          aria-hidden="true"
        />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-slate-100">Why these motors?</p>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <span className="text-slate-300">
                Larger, heavier 1/8 and 1/5 vehicles
              </span>{' '}
              generally run best with lower-kV motors paired with higher
              voltage and a larger motor can.
            </li>
            <li>
              <span className="text-slate-300">Going up in voltage</span>{' '}
              usually means the recommended kV should come down.
            </li>
            <li>
              <span className="text-slate-300">Gearing fine-tunes speed</span>{' '}
              once voltage, kV, and motor size are chosen.
            </li>
          </ul>
          <p className="pt-1 text-xs text-slate-500">
            General guidance, not rigid specs — individual builds vary.
          </p>
        </div>
      </div>
    </aside>
  );
}
