import { describe, it, expect } from 'vitest';
import { isSolved, type Point } from '../src/game/pathChecker';
import type { Tile } from '../src/game/models';

function makeGrid(w: number, h: number): (Tile | null)[][] {
  return Array.from({ length: h }).map((_, y) => Array.from({ length: w }).map((__, x) => null));
}

describe('pathChecker', () => {
  it('solves a simple straight horizontal path', () => {
    const grid = makeGrid(5, 3);
    const depot: Point = { x: 0, y: 1 };
    const dest: Point = { x: 4, y: 1 };

    // Place straights horizontally from (0,1) to (4,1)
    for (let x = 0; x <= 4; x++) {
      const tile: Tile = { id: `t${x}`, type: 'straight', rotation: 90, x, y: 1 };
      grid[1][x] = tile;
    }

    const res = isSolved(grid, depot, [dest]);
    expect(res.solved).toBe(true);
    expect(res.tilesUsed).toBe(5);
  });
});
