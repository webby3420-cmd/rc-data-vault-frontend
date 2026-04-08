interface ConfidenceExplainerProps {
  confidenceLabel: string;
  valuationStatus: string;
  observationCount: number;
  hasOutliersPresent: boolean;
}

export default function ConfidenceExplainer({
  valuationStatus,
  observationCount,
  hasOutliersPresent,
}: ConfidenceExplainerProps) {
  if (valuationStatus === "no_data") return null;

  let text: string;

  if (valuationStatus === "high_confidence" && observationCount >= 10) {
    text = `Based on ${observationCount} verified sold listings. High confidence estimate.`;
  } else if (valuationStatus === "high_confidence") {
    text = `Based on ${observationCount} recent sales. Estimate is directionally reliable.`;
  } else if (valuationStatus === "low_confidence") {
    text = `Based on ${observationCount} sales with wider variance. Use as a general guide.`;
  } else if (valuationStatus === "insufficient") {
    text = "Not enough sold data for a confident estimate. Showing available data.";
  } else {
    return null;
  }

  if (hasOutliersPresent) {
    text += " (outliers excluded)";
  }

  return <p className="text-sm text-slate-400">{text}</p>;
}
