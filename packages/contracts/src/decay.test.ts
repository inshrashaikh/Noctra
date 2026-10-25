import { describe, it, expect } from 'vitest';
import { computeLabel, FACT_TTL, PlanRequestSchema, CandidateSchema } from './index';

describe('@noctra/contracts decay logic', () => {
  it('correctly evaluates decay intervals for ride availability', () => {
    expect(FACT_TTL.ride_availability.ttl_s).toBe(300);
    expect(computeLabel('KNOWN', 100, 'ride_availability')).toBe('KNOWN');
    expect(computeLabel('KNOWN', 350, 'ride_availability')).toBe('OUTDATED');
    expect(computeLabel('KNOWN', 2000, 'ride_availability')).toBe('UNKNOWN');
  });

  it('validates coordinate constraints', () => {
    const valid = PlanRequestSchema.safeParse({
      origin: { lat: 21.1497, lon: 79.0806 },
      destination: { lat: 21.1453, lon: 79.0588 },
      shift_end_iso: '2026-10-25T02:15:00+05:30',
      deadline_iso: '2026-10-25T03:00:00+05:30',
      modes: ['auto'],
    });
    expect(valid.success).toBe(true);
  });
});
