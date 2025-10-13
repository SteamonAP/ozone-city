import { describe, it, expect } from 'vitest';
import { VEHICLE_RATES } from '../src/game/constants';

function canLoad(capacity: number, sizes: number[]) {
  return sizes.reduce((a, b) => a + b, 0) <= capacity;
}

describe('capacity enforcement', () => {
  it('blocks overfill', () => {
    const cap = VEHICLE_RATES.auto.capacity; // 3
    expect(canLoad(cap, [1,2])).toBe(true);
    expect(canLoad(cap, [2,2])).toBe(false);
  });
});
