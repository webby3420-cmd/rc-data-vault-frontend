export interface GearRatioInputs {
  spurTeeth: number;
  pinionTeeth: number;
  internalDriveRatio: number;
}

export interface SpeedEstimatorInputs {
  kv: number;
  batteryVolts: number;
  spurTeeth: number;
  pinionTeeth: number;
  internalDriveRatio: number;
  tireDiameterMm: number;
  drivetrainEfficiency: number;
}

export interface GearChangeComparatorInputs {
  currentSpur: number;
  currentPinion: number;
  newSpur: number;
  newPinion: number;
  internalDriveRatio: number;
}

export interface ResourceLink {
  id: string;
  resource_type:
    | "manual"
    | "exploded_view"
    | "interactive_exploded_view"
    | "parts_diagram"
    | "parts_list"
    | "cross_reference"
    | "support_page"
    | "setup_sheet"
    | "product_page";
  title: string;
  url: string;
  scope_level: "manufacturer" | "family" | "variant";
  sort_order: number;
  is_official: boolean;
  source_label?: string | null;
}
