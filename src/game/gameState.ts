import { create } from 'zustand';
import type { Parcel, Vehicle, VehicleType } from './models';
import { VEHICLE_RATES, DAILY_GOALS, GRID_CONFIG } from './constants';
import { PathNetwork, pointKey, isConnected, getPathLength } from './pathBuilder';
import { generateObstacles, type Obstacle } from './obstacles';

export interface DailyTotals {
  time: number;
  emissions: number;
}

export interface GameState {
  daySeed: number;
  tutorialDone: boolean;
  parcels: Parcel[];
  vehicles: Vehicle[];
  totals: DailyTotals;
  gridSize: { cols: number; rows: number };
  depot: { x: number; y: number };
  currentPath: PathNetwork;
  obstacles: Obstacle[];
  maxPathSegments: number;
  dispatchedVehicles: Set<string>; // Track which vehicles have been dispatched
  startNewDay: (seed?: number) => void;
  setTutorialDone: () => void;
  assignParcelToVehicle: (parcelId: string, vehicleId: string) => void;
  removeParcelFromVehicle: (parcelId: string, vehicleId: string) => void;
  dispatchVehicle: (vehicleId: string) => void;
  recordTrip: (vehicleId: string, pathLength: number) => void;
  setCurrentPath: (path: PathNetwork) => void;
  checkConnectivity: (destinations: { x: number; y: number }[]) => { connected: number; total: number; solved: boolean };
  isDayComplete: () => boolean;
  getUndispatchedVehicles: () => Vehicle[];
}

function sumLoadForVehicle(veh: Vehicle, parcels: Parcel[]): number {
  const map = new Map(parcels.map((p) => [p.id, p.sizeUnits] as const));
  return veh.loadedParcelIds.reduce((acc, id) => acc + (map.get(id) ?? 0), 0);
}

export const useGameState = create<GameState>((set, get) => ({
  daySeed: 1,
  tutorialDone: false,
  parcels: [],
  vehicles: [
    { id: 'veh-cycle', type: 'cycle', capacity: VEHICLE_RATES.cycle.capacity, loadedParcelIds: [] },
    { id: 'veh-auto', type: 'auto', capacity: VEHICLE_RATES.auto.capacity, loadedParcelIds: [] },
    { id: 'veh-van', type: 'van', capacity: VEHICLE_RATES.van.capacity, loadedParcelIds: [] }
  ],
  totals: { time: 0, emissions: 0 },
  gridSize: { cols: GRID_CONFIG.cols, rows: GRID_CONFIG.rows },
  depot: { ...GRID_CONFIG.depot },
  currentPath: { segments: [], cells: new Set() },
  obstacles: [],
  maxPathSegments: 25,
  dispatchedVehicles: new Set(),
  startNewDay: (seed = Math.floor(Math.random() * 1_000_000)) => {
    // Placeholder parcel generation; will be replaced by generator.ts
    const parcels: Parcel[] = Array.from({ length: 5 }).map((_, i) => {
      const sizes: (1|2|3)[] = [1,2,3];
      const size = sizes[(seed + i) % sizes.length];
      const color = size === 1 ? 'green' : size === 2 ? 'blue' : 'red';
      return {
        id: `p${i+1}`,
        sizeUnits: size,
        color,
        destination: { x: 3 + ((seed + i) % 5), y: 2 + ((seed * (i + 3)) % 5) },
        destinationType: i % 3 === 0 ? 'school' : i % 3 === 1 ? 'hospital' : 'home',
        urgency: size === 3 ? 'urgent' : size === 2 ? 'normal' : 'low'
      };
    });
    const obstacles = generateObstacles(seed, GRID_CONFIG.cols, GRID_CONFIG.depot, parcels.map(p => p.destination));
    const maxSegments = 20 + Math.floor((seed % 10)); // 20-29 segments based on difficulty
    set({ 
      daySeed: seed, 
      parcels, 
      totals: { time: 0, emissions: 0 }, 
      vehicles: get().vehicles.map(v => ({ ...v, loadedParcelIds: [] })), 
      currentPath: { segments: [], cells: new Set() },
      obstacles,
      maxPathSegments: maxSegments,
      dispatchedVehicles: new Set()
    });
  },
  setTutorialDone: () => set({ tutorialDone: true }),
  assignParcelToVehicle: (parcelId, vehicleId) => set((state) => {
    const parcel = state.parcels.find((p) => p.id === parcelId);
    if (!parcel) return {} as any;

    // Remove from all vehicles first to keep uniqueness
    let vehicles = state.vehicles.map((v) => ({ ...v, loadedParcelIds: v.loadedParcelIds.filter((id) => id !== parcelId) }));

    // Find target vehicle and check capacity
    const idx = vehicles.findIndex((v) => v.id === vehicleId);
    if (idx === -1) return { vehicles } as any;
    const target = vehicles[idx];
    const used = sumLoadForVehicle(target, state.parcels);
    const wouldBe = used + parcel.sizeUnits;
    if (wouldBe > target.capacity) {
      // Capacity overflow: do nothing
      return { vehicles } as any;
    }
    vehicles[idx] = { ...target, loadedParcelIds: Array.from(new Set([...target.loadedParcelIds, parcelId])) };
    return { vehicles };
  }),
  removeParcelFromVehicle: (parcelId, vehicleId) => set((state) => ({
    vehicles: state.vehicles.map((v) => v.id === vehicleId ? { ...v, loadedParcelIds: v.loadedParcelIds.filter(id => id !== parcelId) } : v)
  })),
  dispatchVehicle: (vehicleId) => set((state) => {
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.loadedParcelIds.length === 0) return {} as any;
    
    const newDispatched = new Set(state.dispatchedVehicles);
    newDispatched.add(vehicleId);
    
    return { dispatchedVehicles: newDispatched };
  }),
  recordTrip: (vehicleId, pathLength) => set((state) => {
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return {} as any;
    const rate = VEHICLE_RATES[vehicle.type as VehicleType];
    
    // Clear the path for next trip
    return {
      totals: {
        time: state.totals.time + pathLength * rate.timePerTile,
        emissions: state.totals.emissions + pathLength * rate.emissionPerTile
      },
      currentPath: { segments: [], cells: new Set() }
    };
  }),
  setCurrentPath: (path) => set({ currentPath: path }),
  checkConnectivity: (destinations) => {
    const state = get();
    const result = isConnected(state.currentPath, state.depot, destinations);
    return {
      connected: result.connected.length,
      total: result.total,
      solved: result.connected.length === result.total && result.total > 0
    };
  },
  isDayComplete: () => {
    const state = get();
    // Day is complete when all parcels have been delivered (assigned AND dispatched)
    const allParcelsDelivered = state.parcels.every(p => {
      const assignedVehicle = state.vehicles.find(v => v.loadedParcelIds.includes(p.id));
      return assignedVehicle && state.dispatchedVehicles.has(assignedVehicle.id);
    });
    return allParcelsDelivered;
  },
  getUndispatchedVehicles: () => {
    const state = get();
    return state.vehicles.filter(v => 
      v.loadedParcelIds.length > 0 && !state.dispatchedVehicles.has(v.id)
    );
  }
}));
