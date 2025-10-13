export const VEHICLE_RATES = {
  cycle: { timePerTile: 3, emissionPerTile: 0, capacity: 1 },
  auto:  { timePerTile: 2, emissionPerTile: 1, capacity: 3 },
  van:   { timePerTile: 1, emissionPerTile: 3, capacity: 5 },
} as const;

export const DAILY_GOALS = {
  timeLimitMin: 360, // 6 hours
  emissionLimit: 62,
} as const;

export const GRID_CONFIG = {
  cols: 9,
  rows: 9,
  depot: { x: 1, y: 4 }
} as const;
