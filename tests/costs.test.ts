import { describe, it, expect } from 'vitest';
import { computeTripCost } from '../src/game/costs';

describe('costs', () => {
  it('computes cycle cost', () => {
    const c = computeTripCost('cycle', 10);
    expect(c.time).toBe(30);
    expect(c.emissions).toBe(0);
  });
  it('computes auto cost', () => {
    const c = computeTripCost('auto', 10);
    expect(c.time).toBe(20);
    expect(c.emissions).toBe(10);
  });
  it('computes van cost', () => {
    const c = computeTripCost('van', 10);
    expect(c.time).toBe(10);
    expect(c.emissions).toBe(30);
  });
});
