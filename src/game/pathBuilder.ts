import type { Point } from './pathChecker';

export interface PathSegment {
  from: Point;
  to: Point;
  direction: 'horizontal' | 'vertical';
}

export interface PathNetwork {
  segments: PathSegment[];
  cells: Set<string>; // "x,y" keys of all cells in the network
}

export function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

export function keyToPoint(key: string): Point {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

export function areAdjacent(a: Point, b: Point): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

export function addPathSegment(network: PathNetwork, from: Point, to: Point): PathNetwork {
  if (!areAdjacent(from, to)) return network;
  
  const direction = from.y === to.y ? 'horizontal' : 'vertical';
  const segment: PathSegment = { from, to, direction };
  
  // Check if this segment already exists
  const exists = network.segments.some(s => 
    (pointKey(s.from) === pointKey(from) && pointKey(s.to) === pointKey(to)) ||
    (pointKey(s.from) === pointKey(to) && pointKey(s.to) === pointKey(from))
  );
  
  if (exists) return network;
  
  return {
    segments: [...network.segments, segment],
    cells: new Set([...network.cells, pointKey(from), pointKey(to)])
  };
}

export function removePathSegment(network: PathNetwork, from: Point, to: Point): PathNetwork {
  const segments = network.segments.filter(s => 
    !(
      (pointKey(s.from) === pointKey(from) && pointKey(s.to) === pointKey(to)) ||
      (pointKey(s.from) === pointKey(to) && pointKey(s.to) === pointKey(from))
    )
  );
  
  // Rebuild cells set
  const cells = new Set<string>();
  segments.forEach(s => {
    cells.add(pointKey(s.from));
    cells.add(pointKey(s.to));
  });
  
  return { segments, cells };
}

export function isConnected(network: PathNetwork, start: Point, targets: Point[]): { connected: Point[], total: number } {
  if (targets.length === 0) return { connected: [], total: 0 };
  
  // BFS to find all reachable points from start
  const visited = new Set<string>();
  const queue = [start];
  visited.add(pointKey(start));
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = pointKey(current);
    
    // Find all segments connected to current point
    network.segments.forEach(segment => {
      const fromKey = pointKey(segment.from);
      const toKey = pointKey(segment.to);
      
      if (fromKey === currentKey && !visited.has(toKey)) {
        visited.add(toKey);
        queue.push(segment.to);
      } else if (toKey === currentKey && !visited.has(fromKey)) {
        visited.add(fromKey);
        queue.push(segment.from);
      }
    });
  }
  
  // Debug logging
  console.log('Connectivity check:', {
    startKey: pointKey(start),
    visited: Array.from(visited),
    targets: targets.map(t => pointKey(t)),
    segments: network.segments.map(s => `${pointKey(s.from)}->${pointKey(s.to)}`)
  });
  
  const connected = targets.filter(target => {
    const targetKey = pointKey(target);
    const isConnected = visited.has(targetKey);
    console.log(`Target ${targetKey}: ${isConnected ? 'CONNECTED' : 'NOT CONNECTED'}`);
    return isConnected;
  });
  
  return { connected, total: targets.length };
}

export function getPathLength(network: PathNetwork): number {
  return network.segments.length;
}
