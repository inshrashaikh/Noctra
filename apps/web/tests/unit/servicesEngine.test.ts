import { describe, it, expect } from 'vitest';
import {
  parseOpeningHours,
  evaluateOpeningStatus,
  haversineDistanceM,
  findAndRankServices,
} from '@/lib/servicesEngine';

describe('servicesEngine (TypeScript offline parity)', () => {
  it('parses 24/7 and overnight ranges correctly', () => {
    const s1 = parseOpeningHours('24/7');
    expect(s1.is24x7).toBe(true);

    const s2 = parseOpeningHours('19:00-03:30');
    expect(s2.is24x7).toBe(false);
    expect(s2.dayIntervals[0][0].isOvernight).toBe(true);
    expect(s2.dayIntervals[0][0].startMin).toBe(1140);
    expect(s2.dayIntervals[0][0].endMin).toBe(210);
  });

  it('evaluates status at 22:00 vs 02:30 vs 04:45 accurately', () => {
    // Daytime pharmacy: 09:00-22:00
    const p2200 = evaluateOpeningStatus('09:00-22:00', 1320); // 22:00
    expect(p2200.openingStatus).toBe('CLOSED_AT_ARRIVAL');

    // Poojari Dhaba: 19:00-03:30
    const d0230 = evaluateOpeningStatus('19:00-03:30', 150); // 02:30
    expect(d0230.openingStatus).toBe('OPEN_AT_ARRIVAL');
    expect(d0230.openUntil).toBe('03:30');

    const d0445 = evaluateOpeningStatus('19:00-03:30', 285); // 04:45
    expect(d0445.openingStatus).toBe('CLOSED_AT_ARRIVAL');

    // Early morning chai: 04:00-23:00
    const c0230 = evaluateOpeningStatus('04:00-23:00', 150); // 02:30
    expect(c0230.openingStatus).toBe('OPENS_LATER');

    const c0445 = evaluateOpeningStatus('04:00-23:00', 285); // 04:45
    expect(c0445.openingStatus).toBe('OPEN_AT_ARRIVAL');
  });

  it('keeps listing evidence and opening evidence separate', () => {
    const res = findAndRankServices({
      lat: 21.0378,
      lon: 79.0345,
      radius_m: 1000,
      arrival_time_iso: '2026-10-26T02:30:00+05:30',
    });
    expect(res.total_found).toBeGreaterThan(0);
    const svc = res.services[0];
    expect(svc.listing_evidence).toBeDefined();
    expect(svc.opening_evidence).toBeDefined();
    expect(svc.listing_evidence?.subject).toContain('listing:');
    expect(svc.opening_evidence?.subject).toBe('opening_status');
  });

  it('computes haversine distance within expected geographical bounds', () => {
    // AIIMS to Sitabuldi ~13 km
    const d = haversineDistanceM(21.0378, 79.0345, 21.1466, 79.0833);
    expect(d).toBeGreaterThan(12000);
    expect(d).toBeLessThan(15000);
  });

  it('filters by need and ranks feasible open services first', () => {
    const res = findAndRankServices({
      lat: 21.1466,
      lon: 79.0833,
      radius_m: 3000,
      need: 'food',
      arrival_time_iso: '2026-10-26T02:30:00+05:30',
    });
    expect(res.services.length).toBeGreaterThan(0);
    for (const s of res.services) {
      expect(['restaurant', 'dhaba', 'chai_stall', 'canteen_24h']).toContain(s.kind);
    }
  });
});
