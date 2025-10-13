import type { Parcel, Vehicle } from './models';
import { VEHICLE_RATES, GRID_CONFIG } from './constants';

interface Suggestion { assignment: Record<string, string[]>; score: number }

// Manhattan distance from depot
function manhattan(ax: number, ay: number, bx: number, by: number) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function estimateTilesForGroup(destinations: { x: number; y: number }[]): number {
  // crude heuristic: sum of min distances to depot and neighbors
  const depot = GRID_CONFIG.depot;
  if (destinations.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < destinations.length; i++) {
    total += manhattan(depot.x, depot.y, destinations[i].x, destinations[i].y);
  }
  // encourage consolidation by adding small penalty per destination hop
  total += Math.max(0, destinations.length - 1);
  return total;
}

export function suggestOptimalPack(parcels: Parcel[], vehicles: Vehicle[]): Suggestion {
  const vehIds = vehicles.map(v => v.id);
  let best: Suggestion = { assignment: Object.fromEntries(vehIds.map(id => [id, []])), score: Number.POSITIVE_INFINITY };

  function backtrack(i: number, curr: Record<string, string[]>) {
    if (i === parcels.length) {
      // capacity check
      for (const v of vehicles) {
        const size = (curr[v.id] ?? []).reduce((s, pid) => s + (parcels.find(p => p.id === pid)?.sizeUnits ?? 0), 0);
        if (size > v.capacity) return;
      }
      // score: sum of estimated tiles for each vehicle's destinations
      let score = 0;
      for (const v of vehicles) {
        const ps = (curr[v.id] ?? []).map(pid => parcels.find(p => p.id === pid)!).filter(Boolean);
        const tiles = estimateTilesForGroup(ps.map(p => p.destination));
        score += tiles;
      }
      if (score < best.score) {
        best = { assignment: JSON.parse(JSON.stringify(curr)), score };
      }
      return;
    }
    const p = parcels[i];
    for (const v of vehicles) {
      curr[v.id] = curr[v.id] || [];
      curr[v.id].push(p.id);
      backtrack(i + 1, curr);
      curr[v.id].pop();
    }
  }

  backtrack(0, Object.fromEntries(vehIds.map(id => [id, []])) as Record<string, string[]>);
  return best;
}
