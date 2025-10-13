export type VehicleType = "cycle" | "auto" | "van";

export interface Parcel {
  id: string;
  sizeUnits: 1|2|3; // 1=green,2=blue,3=red
  color: "green"|"blue"|"red";
  destination: { x: number; y: number };
  destinationType: 'school' | 'hospital' | 'home';
  urgency: 'urgent' | 'normal' | 'low';
  description?: string;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  capacity: number;
  loadedParcelIds: string[]; // parcel ids loaded
}

export interface Tile {
  id: string;
  type: "straight" | "curve" | "t" | "cross" | "empty";
  rotation: 0 | 90 | 180 | 270;
  x: number;
  y: number;
}

export interface TripResult {
  vehicleId: string;
  tilesUsed: number;
  timeCost: number; // minutes
  emissionCost: number;
}
