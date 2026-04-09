import type { Metadata } from "next";
import Link from "next/link";
import VehicleIdentifier from "@/components/tools/VehicleIdentifier";

export const metadata: Metadata = {
  title: "Identify RC Vehicle by Photo | RC Data Vault",
  description: "Upload a photo of an RC car, truck, or crawler and we'll identify the model using image matching against our catalog.",
};

export default function IdentifyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/tools" className="hover:text-slate-300 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-300">Identify by Photo</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Identify RC Vehicle</h1>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-lg">
          Upload a photo of an RC vehicle and we'll match it against our catalog.
          Works best with a clear side-profile shot of the full vehicle.
        </p>
      </div>

      <VehicleIdentifier />

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Tips for best results</h3>
        <ul className="text-sm text-slate-400 space-y-1.5 list-disc list-inside">
          <li>Use a clear, well-lit photo with the full vehicle visible</li>
          <li>Side-profile or 3/4 angle shots work best</li>
          <li>Avoid photos that are cropped to just a wheel or body panel</li>
          <li>Stock/unmodified vehicles are easier to match</li>
        </ul>
        <p className="text-xs text-slate-500">
          This tool is in early access — matching accuracy will improve as our image catalog grows.
        </p>
      </div>
    </main>
  );
}
