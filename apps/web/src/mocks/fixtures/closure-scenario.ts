/**
 * Closure scenario mutation fixture.
 *
 * Simulates a road closure on Wardha Road (primary auto route), causing:
 * - The auto-fastest candidate to become AT_RISK
 * - A new re-routed auto candidate via Seminary Hills
 * - Walking remains INFEASIBLE
 */
import type { PlanResponse } from '@noctra/contracts';
import { NURSE_PLAN_RESPONSE } from './nurse-2-15am';

/**
 * Deep-clone and mutate the base scenario to apply a Wardha Road closure.
 */
export function applyClosureScenario(): PlanResponse {
  const base = structuredClone(NURSE_PLAN_RESPONSE);

  // Update generation timestamp
  base.generated_at = '2026-10-25T02:22:15+05:30';

  // ── Mutate auto-fastest: closure makes it AT_RISK ──────────
  const auto = base.candidates.find((c) => c.id === 'auto-fastest');
  if (auto) {
    auto.status = 'AT_RISK';
    auto.eta = {
      optimistic_min: 22,
      expected_min: 28,
      pessimistic_min: 38,
    };
    auto.slack_min = {
      optimistic: 23,
      expected: 17,
      pessimistic: 7,
    };
    auto.risk.score = 0.41;

    // Add closure evidence
    auto.evidence.push({
      fact_type: 'road_closure',
      subject: 'Wardha Road near Ramdaspeth',
      label: 'KNOWN',
      confidence: 0.97,
      age_s: 30,
      source: 'Nagpur Traffic Police Live Advisory',
      source_class: 'simulated',
      simulated: false,
      reasons: [
        'Water main break reported at Ramdaspeth crossing',
        'Wardha Road blocked between Medical Square and Central Avenue',
        'Estimated clearance: 4:00 AM',
      ],
    });

    // Update existing road closure evidence
    const closureEvidence = auto.evidence.find(
      (e) => e.fact_type === 'road_closure' && e.subject === 'Wardha Road'
    );
    if (closureEvidence) {
      closureEvidence.label = 'KNOWN';
      closureEvidence.confidence = 0.97;
      closureEvidence.age_s = 30;
      closureEvidence.reasons = [
        'CLOSURE: Water main break at Ramdaspeth crossing',
        'Wardha Road blocked — detour via Seminary Hills required',
      ];
    }

    // Reroute geometry via Seminary Hills
    auto.geometry = {
      type: 'LineString',
      coordinates: [
        [79.0806, 21.1497],   // AIIMS gate
        [79.0795, 21.1492],   // Medical Square south
        [79.0780, 21.1510],   // Detour north
        [79.0752, 21.1520],   // Seminary Hills Road
        [79.0720, 21.1510],   // Seminary Hills west
        [79.0693, 21.1495],   // Civil Lines
        [79.0668, 21.1478],   // Temple Road
        [79.0645, 21.1465],   // Sadar
        [79.0620, 21.1458],   // West approach
        [79.0588, 21.1453],   // Dharampeth destination
      ],
    };
    auto.distance_m = 5600;
  }

  // ── Two-wheeler becomes recommended ────────────────────────
  base.recommended_id = 'twowheeler-balanced';

  const twoWheeler = base.candidates.find(
    (c) => c.id === 'twowheeler-balanced'
  );
  if (twoWheeler) {
    // Two-wheeler route via Seminary Hills unaffected by Wardha Rd closure
    twoWheeler.status = 'ROBUST';
  }

  // ── Update explanation ─────────────────────────────────────
  base.explanation = {
    why_chosen:
      'Wardha Road closure forces auto-rickshaw onto a longer detour via Seminary Hills (28 min expected). Two-wheeler via Seminary Hills is now faster (22 min) and unaffected by the closure. Switching recommendation to two-wheeler.',
    why_rejected: [
      {
        id: 'auto-fastest',
        reason:
          'Wardha Road closure at Ramdaspeth increases expected ETA to 28 min with only 7 min worst-case slack. Status downgraded to AT_RISK.',
      },
      {
        id: 'walk-safest',
        reason:
          'Walking route still exceeds deadline under pessimistic conditions and has highest environmental risk proxy.',
      },
    ],
    uncertainties: [
      'Closure clearance time is estimated (4:00 AM) — may vary',
      'Detour via Seminary Hills may have reduced lighting',
      'Two-wheeler rental availability data is stale (30+ minutes)',
    ],
  };

  base.missing_information = [
    'Exact closure clearance time for Wardha Road at Ramdaspeth',
    'Streetlight status on Seminary Hills detour route',
    'Two-wheeler rental real-time availability',
  ];

  return base;
}
