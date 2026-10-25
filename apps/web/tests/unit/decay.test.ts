import { describe, it, expect } from 'vitest';
import { computeLabel, FACT_TTL } from '@noctra/contracts';

describe('Evidence Decay Logic (computeLabel)', () => {
  it('preserves KNOWN when age is within TTL', () => {
    // Ride TTL is 300s
    expect(computeLabel('KNOWN', 150, 'ride_availability')).toBe('KNOWN');
    expect(computeLabel('KNOWN', 300, 'ride_availability')).toBe('KNOWN');
  });

  it('degrades to OUTDATED between TTL and 6x TTL', () => {
    // Ride TTL is 300s, 6x TTL is 1800s
    expect(computeLabel('KNOWN', 301, 'ride_availability')).toBe('OUTDATED');
    expect(computeLabel('KNOWN', 1200, 'ride_availability')).toBe('OUTDATED');
    expect(computeLabel('KNOWN', 1800, 'ride_availability')).toBe('OUTDATED');
  });

  it('degrades to UNKNOWN beyond 6x TTL', () => {
    expect(computeLabel('KNOWN', 1801, 'ride_availability')).toBe('UNKNOWN');
    expect(computeLabel('KNOWN', 5000, 'ride_availability')).toBe('UNKNOWN');
  });

  it('never improves label without new observation', () => {
    // If original was PROBABLE, it should never become KNOWN even if age is 0
    expect(computeLabel('PROBABLE', 0, 'weather')).toBe('PROBABLE');
    expect(computeLabel('OUTDATED', 0, 'weather')).toBe('OUTDATED');
    expect(computeLabel('UNKNOWN', 0, 'weather')).toBe('UNKNOWN');
  });

  it('correctly handles different fact TTLs', () => {
    // Transit schedule TTL is 600s
    expect(computeLabel('KNOWN', 500, 'transit_schedule')).toBe('KNOWN');
    expect(computeLabel('KNOWN', 700, 'transit_schedule')).toBe('OUTDATED');

    // Road closure TTL is 1800s
    expect(computeLabel('KNOWN', 1500, 'road_closure')).toBe('KNOWN');
    expect(computeLabel('KNOWN', 2000, 'road_closure')).toBe('OUTDATED');
  });
});
