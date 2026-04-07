import { calculateFinalDriveRatio } from "./gearRatio";

export function compareGearChange(params: {
  currentSpur: number;
  currentPinion: number;
  newSpur: number;
  newPinion: number;
  internalDriveRatio: number;
}) {
  const currentFdr = calculateFinalDriveRatio(
    params.currentSpur, params.currentPinion, params.internalDriveRatio
  );
  const newFdr = calculateFinalDriveRatio(
    params.newSpur, params.newPinion, params.internalDriveRatio
  );
  const deltaPct = currentFdr > 0 ? ((newFdr - currentFdr) / currentFdr) * 100 : 0;

  return {
    currentFdr,
    newFdr,
    deltaPct,
    gearingDirection: deltaPct < -0.5 ? "taller" : deltaPct > 0.5 ? "shorter" : "same" as "taller" | "shorter" | "same",
  };
}
