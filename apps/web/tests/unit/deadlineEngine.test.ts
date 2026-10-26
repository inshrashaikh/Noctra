import { describe, it, expect } from 'vitest';
import type { PlanRequest, ReplanRequest } from '@noctra/contracts';
import { planWithDeadlines, replanWithDeadlines } from '@/lib/deadlineEngine';

describe('Module 3 TypeScript Parity Deadline Engine', () => {
  const nurseReq: PlanRequest = {
    origin: { lat: 21.0378, lon: 79.0345 },
    destination: { lat: 21.1458, lon: 79.0882 },
    shift_end_iso: '2026-10-25T02:15:00+05:30',
    deadline_iso: '2026-10-25T03:00:00+05:30',
    modes: ['transit', 'auto', 'cab', 'two_wheeler', 'walk'],
  };

  it('generates multi-leg itineraries with timing bands and critical legs', () => {
    const plan = planWithDeadlines(nurseReq);
    expect(plan.candidates.length).toBeGreaterThanOrEqual(4);

    const autoCand = plan.candidates.find((c) => c.mode === 'auto');
    expect(autoCand).toBeDefined();
    expect(autoCand?.legs).toBeDefined();
    expect(autoCand?.legs?.length).toBeGreaterThanOrEqual(3);

    const critLegs = (autoCand?.legs || []).filter((l) => l.is_critical);
    expect(critLegs.length).toBe(1);
    expect(critLegs[0].mode).toBe('auto');
  });

  it('flags stranding points at 02:15 for transit and auto', () => {
    const plan = planWithDeadlines(nurseReq);

    const transitCand = plan.candidates.find((c) => c.mode === 'transit');
    expect(transitCand?.status).toBe('INFEASIBLE');
    expect(transitCand?.stranding_points).toBeDefined();
    expect(transitCand?.stranding_points?.length).toBeGreaterThanOrEqual(1);
    const spTransit = transitCand?.stranding_points?.[0];
    expect(spTransit?.node_name).toContain('Sitabuldi');
    expect(spTransit?.stranded_arrival_hm).toBe('06:22');

    const autoCand = plan.candidates.find((c) => c.mode === 'auto');
    expect(autoCand?.stranding_points).toBeDefined();
    const spAuto = autoCand?.stranding_points?.[0];
    expect(spAuto?.node_name).toContain('Hospital Gate');
    expect(spAuto?.trigger_condition).toContain('02:25');
  });

  it('computes decide-by time and supported recovery options', () => {
    const plan = planWithDeadlines(nurseReq);
    const autoCand = plan.candidates.find((c) => c.mode === 'auto');

    expect(autoCand?.decision_by_iso).toBeDefined();
    expect(autoCand?.decision_by_iso).toContain('02:25');
    expect(autoCand?.decide_by_rationale).toContain('Decide by 02:25');

    expect(autoCand?.recovery_options?.length).toBeGreaterThanOrEqual(2);
    const twOpt = autoCand?.recovery_options?.find((o) => o.mode === 'two_wheeler');
    expect(twOpt?.meets_deadline).toBe(true);
    expect(twOpt?.extra_cost_inr).toBeGreaterThan(0);
  });

  it('evaluates safe-haven handoff with verified 24/7 staffed refuge', () => {
    const plan = planWithDeadlines(nurseReq);
    expect(plan.safe_haven_handoff).toBeDefined();
    const haven = plan.safe_haven_handoff;

    expect(haven?.primary).toBeDefined();
    expect(haven?.primary.opening_status).toBe('OPEN_AT_ARRIVAL');
    expect(haven?.walk_time_min).toBeGreaterThan(0);
    expect(haven?.phone_or_contact).toBeDefined();
  });

  it('recomputes plan and generates diff upon road closure disruption', () => {
    const initialPlan = planWithDeadlines(nurseReq);

    const replanReq: ReplanRequest = {
      ...nurseReq,
      reason: 'Road closure near Ramdaspeth on Wardha Road',
      scenario_type: 'closure',
      previous_plan: initialPlan,
    };

    const replanned = replanWithDeadlines(replanReq);
    expect(replanned.verdict?.replan_diff).toBeDefined();
    const diff = replanned.verdict?.replan_diff;

    expect(diff?.slack_delta_min).toBe(-6);
    expect(diff?.decide_by_delta_min).toBe(-6);
    expect(diff?.explanation.toLowerCase()).toContain('detour adds 6m');
  });

  it('returns honest INFEASIBLE verdict when deadline is impossible', () => {
    const impossibleReq: PlanRequest = {
      ...nurseReq,
      deadline_iso: '2026-10-25T02:20:00+05:30', // only 5 min window for 4.8km
      modes: ['transit', 'walk'],
    };

    const plan = planWithDeadlines(impossibleReq);
    expect(plan.verdict?.status).toBe('INFEASIBLE');
    expect(plan.verdict?.meets_deadline_supported).toBe(false);
    expect(plan.verdict?.summary).toContain('No sufficiently supported plan meets the deadline');
    expect(plan.safe_haven_handoff).toBeDefined();
  });
});
