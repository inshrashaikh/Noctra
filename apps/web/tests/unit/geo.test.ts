import { describe, it, expect } from 'vitest';
import { isInsideNagpur, haversineDistance, NAGPUR_CENTER } from '@/lib/geo';

describe('Geo Utilities', () => {
  it('correctly validates Nagpur bounding box', () => {
    // Center of Nagpur
    expect(isInsideNagpur(NAGPUR_CENTER.lat, NAGPUR_CENTER.lon)).toBe(true);

    // AIIMS Nagpur
    expect(isInsideNagpur(21.1497, 79.0806)).toBe(true);

    // Out of bounds: Mumbai
    expect(isInsideNagpur(19.076, 72.8777)).toBe(false);

    // Out of bounds: Delhi
    expect(isInsideNagpur(28.6139, 77.209)).toBe(false);
  });

  it('calculates plausible haversine distances', () => {
    // AIIMS to Dharampeth (~2.5 to 3.5 km)
    const dist = haversineDistance(21.1497, 79.0806, 21.1453, 79.0588);
    expect(dist).toBeGreaterThan(2000);
    expect(dist).toBeLessThan(3500);
  });
});
