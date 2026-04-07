import { calculateFinalDriveRatio } from "./gearRatio";

export function estimateTopSpeedMph(params: {
  kv: number;
  batteryVolts: number;
  spurTeeth: number;
  pinionTeeth: number;
  internalDriveRatio: number;
  tireDiameterMm: number;
  drivetrainEfficiency: number;
}): { mph: number; wheelRpm: number; fdr: number } {
  const {
    kv, batteryVolts, spurTeeth, pinionTeeth,
    internalDriveRatio, tireDiameterMm, drivetrainEfficiency,
  } = params;

  if (
    kv <= 0 || batteryVolts <= 0 || spurTeeth <= 0 ||
    pinionTeeth <= 0 || internalDriveRatio <= 0 ||
    tireDiameterMm <= 0 || drivetrainEfficiency <= 0
  ) return { mph: 0, wheelRpm: 0, fdr: 0 };

  const motorRpm = kv * batteryVolts;
  const fdr = calculateFinalDriveRatio(spurTeeth, pinionTeeth, internalDriveRatio);
  const wheelRpm = motorRpm / fdr;
  const tireCircumferenceMeters = Math.PI * (tireDiameterMm / 1000);
  const metersPerMinute = wheelRpm * tireCircumferenceMeters * drivetrainEfficiency;
  const mph = metersPerMinute * 0.0372823;

  return { mph, wheelRpm, fdr };
}
