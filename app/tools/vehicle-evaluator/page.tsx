import type { Metadata } from "next";
import { Suspense } from "react";
import VehicleEvaluator from "@/components/tools/VehicleEvaluator";

export const metadata: Metadata = {
  title: "Vehicle Evaluator | RC Data Vault",
  description: "Estimate the adjusted market value of your RC vehicle based on condition and upgrades installed.",
};

export default function VehicleEvaluatorPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-10 text-sm text-slate-500">Loading...</div>}>
      <VehicleEvaluator />
    </Suspense>
  );
}
