import { VEHICLE_RATES } from './constants';
import type { VehicleType } from './models';

export function computeTripCost(vehicleType: VehicleType, tilesUsed: number) {
  const rates = VEHICLE_RATES[vehicleType];
  return {
    time: tilesUsed * rates.timePerTile,
    emissions: tilesUsed * rates.emissionPerTile
  };
}
