import { describe, it, expect } from 'vitest';
import { evaluateAvailability, generatePlan } from '@/lib/transportEngine';
import type { PlanRequest } from '@noctra/contracts';

describe('Shift-Aware Transport Availability Engine (Client/Mock)', () => {
  it('evaluates metro running at 22:00 but ended at 02:15 and standby at 04:30', () => {
    const avail2200 = evaluateAvailability('22:00', '22:45');
    const avail0215 = evaluateAvailability('02:15', '03:00');
    const avail0430 = evaluateAvailability('04:30', '05:30');

    // 22:00 - Metro active
    expect(avail2200['metro'].operatingStatus).toBe('RUNNING');
    expect(avail2200['metro'].lastServiceCatchable).toBe(true);
    expect(avail2200['metro'].evidenceLabel).toBe('PROBABLE');

    // 02:15 - Metro ended
    expect(avail0215['metro'].operatingStatus).toBe('ENDED');
    expect(avail0215['metro'].lastServiceCatchable).toBe(false);
    expect(avail0215['metro'].statusDetail).toContain('Last train departed at 22:15');

    // 04:30 - Metro standby
    expect(avail0430['metro'].operatingStatus).toBe('NOT_STARTED');
    expect(avail0430['metro'].nextDeparture).toBe('06:00');
  });

  it('evaluates bus night feeder active until 01:30 and ended by 02:15', () => {
    const avail0000 = evaluateAvailability('00:00', '00:45');
    const avail0215 = evaluateAvailability('02:15', '03:00');

    expect(avail0000['bus'].operatingStatus).toBe('RUNNING');
    expect(avail0000['bus'].name).toContain('Night Feeder');

    expect(avail0215['bus'].operatingStatus).toBe('ENDED');
  });

  it('keeps private ride-hail cab strictly UNKNOWN and never fabricates wait time', () => {
    const avail = evaluateAvailability('02:15', '03:00');
    const cab = avail['cab'];
    expect(cab.operatingStatus).toBe('UNKNOWN_AVAILABILITY');
    expect(cab.evidenceLabel).toBe('UNKNOWN');
    expect(cab.confidence).toBe(0.0);
    expect(cab.boardingWaitMin).toBeUndefined();
  });

  it('generates deterministic candidates and rejects transit at 02:15', () => {
    const req: PlanRequest = {
      origin: { lat: 21.1497, lon: 79.0806 },
      destination: { lat: 21.1453, lon: 79.0588 },
      shift_end_iso: '2026-10-25T02:15:00+05:30',
      deadline_iso: '2026-10-25T03:00:00+05:30',
      modes: ['transit', 'auto', 'walk'],
    };

    const plan1 = generatePlan(req);
    const plan2 = generatePlan(req);

    expect(plan1).toEqual(plan2);
    expect(plan1.recommended_id).toBe('auto-fastest');

    const transit = plan1.candidates.find((c) => c.mode === 'transit');
    expect(transit?.rejected).toBe(true);
    expect(transit?.status).toBe('INFEASIBLE');
    expect(transit?.operating_note).toContain('service ended');

    const auto = plan1.candidates.find((c) => c.mode === 'auto');
    expect(auto?.rejected).toBe(false);
    expect(auto?.status).toBe('ROBUST');
    expect(auto?.plan_b).toBeDefined();
  });

  it('generates transit as feasible and recommended at 22:00', () => {
    const req: PlanRequest = {
      origin: { lat: 21.1497, lon: 79.0806 },
      destination: { lat: 21.1453, lon: 79.0588 },
      shift_end_iso: '2026-10-25T22:00:00+05:30',
      deadline_iso: '2026-10-25T22:45:00+05:30',
      modes: ['transit', 'auto', 'walk'],
    };

    const plan = generatePlan(req);
    const transit = plan.candidates.find((c) => c.mode === 'transit');
    expect(transit?.rejected).toBe(false);
    expect(transit?.status).toBe('ROBUST');
    expect(transit?.operating_note).toContain('Runs until 22:15');
    expect(plan.recommended_id).toBe('metro-express');
  });
});
