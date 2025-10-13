import type { Tile } from './models';

export type Direction = 'N' | 'E' | 'S' | 'W';

export const OPPOSITE: Record<Direction, Direction> = {
  N: 'S',
  E: 'W',
  S: 'N',
  W: 'E'
};

export const CONNECTOR_MAP: Record<Exclude<Tile['type'], 'empty'>, Record<Tile['rotation'], Record<Direction, boolean>>> = {
  straight: {
    0: { N: true, S: true, E: false, W: false },
    90: { E: true, W: true, N: false, S: false },
    180: { N: true, S: true, E: false, W: false },
    270: { E: true, W: true, N: false, S: false }
  },
  curve: {
    0: { N: true, E: true, S: false, W: false },
    90: { E: true, S: true, N: false, W: false },
    180: { S: true, W: true, N: false, E: false },
    270: { N: true, W: true, E: false, S: false }
  },
  t: {
    0: { N: true, E: true, S: true, W: false },
    90: { N: false, E: true, S: true, W: true },
    180: { N: true, E: false, S: true, W: true },
    270: { N: true, E: true, S: false, W: true }
  },
  cross: {
    0: { N: true, E: true, S: true, W: true },
    90: { N: true, E: true, S: true, W: true },
    180: { N: true, E: true, S: true, W: true },
    270: { N: true, E: true, S: true, W: true }
  }
};

export interface Point { x: number; y: number }

export function tileConnectors(tile?: Tile | null): Record<Direction, boolean> {
  if (!tile || tile.type === 'empty') return { N: false, E: false, S: false, W: false };
  return CONNECTOR_MAP[tile.type][tile.rotation];
}

export function inBounds(grid: (Tile | null)[][], p: Point): boolean {
  return p.y >= 0 && p.y < grid.length && p.x >= 0 && p.x < grid[0].length;
}

export function neighborPoint(p: Point, dir: Direction): Point {
  switch (dir) {
    case 'N': return { x: p.x, y: p.y - 1 };
    case 'E': return { x: p.x + 1, y: p.y };
    case 'S': return { x: p.x, y: p.y + 1 };
    case 'W': return { x: p.x - 1, y: p.y };
  }
}

export function countPlacedTiles(grid: (Tile | null)[][]): number {
  let count = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const t = grid[y][x];
      if (t && t.type !== 'empty') count++;
    }
  }
  return count;
}

export function isSolved(grid: (Tile | null)[][], depot: Point, destinations: Point[]): { solved: boolean; tilesUsed: number; visited: Set<string> } {
  const visited = new Set<string>();
  const queue: Point[] = [];
  const startKey = `${depot.x},${depot.y}`;
  const destKeys = new Set(destinations.map((d) => `${d.x},${d.y}`));
  visited.add(startKey);
  queue.push(depot);

  while (queue.length) {
    const p = queue.shift()!;
    const tile = grid[p.y][p.x];
    const isDepot = p.x === depot.x && p.y === depot.y;
    const connectors = isDepot ? { N: true, E: true, S: true, W: true } : tileConnectors(tile);
    (['N','E','S','W'] as Direction[]).forEach((dir) => {
      if (!connectors[dir]) return;
      const n = neighborPoint(p, dir);
      if (!inBounds(grid, n)) return;
      const k = `${n.x},${n.y}`;
      const neighborTile = grid[n.y][n.x];
      const neighborIsDest = destKeys.has(k);
      if (neighborIsDest) {
        if (!visited.has(k)) { visited.add(k); queue.push(n); }
        return;
      }
      const nCon = tileConnectors(neighborTile);
      if (!nCon[OPPOSITE[dir]]) return;
      if (!visited.has(k)) {
        visited.add(k);
        queue.push(n);
      }
    });
  }

  const allReached = destinations.every((d) => visited.has(`${d.x},${d.y}`));
  return { solved: allReached, tilesUsed: countPlacedTiles(grid), visited };
}
