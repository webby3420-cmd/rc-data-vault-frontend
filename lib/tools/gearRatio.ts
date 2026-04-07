export function calculateFinalDriveRatio(
  spurTeeth: number,
  pinionTeeth: number,
  internalDriveRatio: number
): number {
  if (pinionTeeth <= 0 || spurTeeth <= 0 || internalDriveRatio <= 0) return 0;
  return (spurTeeth / pinionTeeth) * internalDriveRatio;
}
