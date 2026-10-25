/**
 * Ride-unknown mutation fixture.
 *
 * Simulates ride availability becoming UNKNOWN for both auto and two-wheeler,
 * degrading confidence across motorised candidates.
 */
import type { PlanResponse } from '@noctra/contracts';
import { NURSE_PLAN_RESPONSE } from './nurse-2-15am';

/**
 * Apply ride-unknown mutation: all ride evidence becomes UNKNOWN.
 */
export function applyRideUnknownScenario(): PlanResponse {
  const base = structuredClone(NURSE_PLAN_RESPONSE);

  base.generated_at = '2026-10-25T02:20:30+05:30';

  // ── Degrade ride availability evidence on all candidates ───
  for (const candidate of base.candidates) {
    for (const ev of candidate.evidence) {
      if (ev.fact_type === 'ride_availability') {
        ev.label = 'UNKNOWN';
        ev.confidence = 0.15;
        ev.age_s = 900;
        ev.reasons = [
          'Ride availability feed unresponsive for 15 minutes',
          'Cannot confirm any ride options near AIIMS at this time',
        ];
      }
    }
  }

  // ── Auto becomes AT_RISK ───────────────────────────────────
  const auto = base.candidates.find((c) => c.id === 'auto-fastest');
  if (auto) {
    auto.status = 'AT_RISK';
    auto.eta = {
      optimistic_min: 14,
      expected_min: 18,
      pessimistic_min: 35,
    };
    auto.slack_min = {
      optimistic: 31,
      expected: 27,
      pessimistic: 10,
    };
  }

  // ── Two-wheeler becomes AT_RISK ────────────────────────────
  const twoWheeler = base.candidates.find(
    (c) => c.id === 'twowheeler-balanced'
  );
  if (twoWheeler) {
    twoWheeler.status = 'AT_RISK';
    twoWheeler.eta = {
      optimistic_min: 17,
      expected_min: 22,
      pessimistic_min: 40,
    };
    twoWheeler.slack_min = {
      optimistic: 28,
      expected: 23,
      pessimistic: 5,
    };
  }

  // ── Update explanation ─────────────────────────────────────
  base.explanation = {
    why_chosen:
      'Auto-rickshaw remains the fastest option but ride availability is now UNKNOWN. Both motorised options are AT_RISK. Auto is still recommended due to lower ETA, but the plan-B trigger time has been moved earlier.',
    why_rejected: [
      {
        id: 'walk-safest',
        reason:
          'Walking still exceeds deadline under pessimistic conditions and has highest environmental risk proxy.',
      },
    ],
    uncertainties: [
      'Ride availability feed has been unresponsive for 15 minutes — all ride data is stale',
      'Cannot confirm auto-rickshaw or two-wheeler presence near AIIMS',
      'If no ride is secured by 2:25 AM, walking may become the only option despite infeasibility',
    ],
  };

  base.missing_information = [
    'Live ride availability at AIIMS gate (feed offline)',
    'Alternative ride sources (app-based services) not in current feed set',
    'Peer reports of ride availability near Medical Square',
  ];

  // Move plan-B trigger earlier
  if (auto?.plan_b) {
    auto.plan_b.trigger = 'No auto secured by 2:22 AM (moved earlier due to uncertainty)';
  }

  return base;
}
