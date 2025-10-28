import type { Point } from './pathChecker';

export interface Obstacle {
  x: number;
  y: number;
  type: 'building' | 'water' | 'construction';
}

export function generateObstacles(seed: number, gridSize: number, depot: Point, destinations: Point[]): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const occupiedCells = new Set([
    `${depot.x},${depot.y}`,
    ...destinations.map(d => `${d.x},${d.y}`)
  ]);

  // Generate random obstacles based on seed
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const numObstacles = Math.floor(gridSize * gridSize * 0.22); // 22% of grid → harder

  for (let i = 0; i < numObstacles; i++) {
    let attempts = 0;
    while (attempts < 50) {
      const x = Math.floor(rng() * gridSize);
      const y = Math.floor(rng() * gridSize);
      const key = `${x},${y}`;
      
      if (!occupiedCells.has(key)) {
        const types: Obstacle['type'][] = ['building', 'water', 'construction'];
        const type = types[Math.floor(rng() * types.length)];
        obstacles.push({ x, y, type });
        occupiedCells.add(key);
        break;
      }
      attempts++;
    }
  }

  return obstacles;
}

export function isObstacle(obstacles: Obstacle[], x: number, y: number): boolean {
  return obstacles.some(obs => obs.x === x && obs.y === y);
}

export function getObstacleAt(obstacles: Obstacle[], x: number, y: number): Obstacle | null {
  return obstacles.find(obs => obs.x === x && obs.y === y) || null;
}
