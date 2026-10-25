/**
 * Primary scenario fixture: Nurse finishing night shift at AIIMS Nagpur.
 *
 * Context: 2:15 AM IST, heading to Dharampeth residential area.
 * Deadline: 3:00 AM. Decision by 2:30 AM.
 * 3 route candidates: auto-rickshaw, two-wheeler, walking.
 */
import type { PlanRequest, PlanResponse } from '@noctra/contracts';

// ── Request ────────────────────────────────────────────────────────

export const NURSE_PLAN_REQUEST: PlanRequest = {
  origin: { lat: 21.1497, lon: 79.0806 },       // AIIMS Nagpur, Medical Square
  destination: { lat: 21.1453, lon: 79.0588 },   // Dharampeth residential area
  shift_end_iso: '2026-10-25T02:15:00+05:30',
  deadline_iso: '2026-10-25T03:00:00+05:30',
  modes: ['auto', 'two_wheeler', 'walk'],
  now_iso: '2026-10-25T02:15:00+05:30',
};

// ── Response ───────────────────────────────────────────────────────

export const NURSE_PLAN_RESPONSE: PlanResponse = {
  generated_at: '2026-10-25T02:15:02+05:30',
  tier: 0,
  recommended_id: 'auto-fastest',
  missing_information: [
    'Real-time auto-rickshaw availability at AIIMS gate (no live feed)',
    'Streetlight operational status along Wardha Road underpass',
  ],
  candidates: [
    // ── Candidate 1: Auto-rickshaw (fastest, ROBUST) ────────────
    {
      id: 'auto-fastest',
      mode: 'auto',
      kind: 'fastest',
      distance_m: 4800,
      eta: {
        optimistic_min: 14,
        expected_min: 18,
        pessimistic_min: 27,
      },
      slack_min: {
        optimistic: 31,
        expected: 27,
        pessimistic: 18,
      },
      status: 'ROBUST',
      risk: {
        score: 0.22,
        max_gap_m: 380,
        basis: 'environmental_proxy',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0806, 21.1497],   // AIIMS gate
          [79.0792, 21.1488],   // Medical Square roundabout
          [79.0771, 21.1480],   // Wardha Road west turn
          [79.0735, 21.1475],   // Ramdaspeth crossing
          [79.0701, 21.1470],   // Central Avenue junction
          [79.0672, 21.1465],   // Near Variety Square
          [79.0648, 21.1460],   // LIC Square approach
          [79.0629, 21.1458],   // Law College Square
          [79.0611, 21.1455],   // West High Court Road
          [79.0588, 21.1453],   // Dharampeth destination
        ],
      },
      evidence: [
        {
          fact_type: 'ride_availability',
          subject: 'Auto-rickshaws at AIIMS gate',
          label: 'PROBABLE',
          confidence: 0.72,
          age_s: 180,
          source: 'Historical pattern analysis',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Auto stands near hospitals typically have 2-4 autos at night',
            'No live feed available; estimate based on historical patterns',
          ],
        },
        {
          fact_type: 'road_closure',
          subject: 'Wardha Road',
          label: 'KNOWN',
          confidence: 0.95,
          age_s: 45,
          source: 'Simulated traffic feed',
          source_class: 'simulated',
          simulated: true,
          reasons: ['No active closures reported on Wardha Road'],
        },
        {
          fact_type: 'traffic',
          subject: 'Medical Square to Dharampeth corridor',
          label: 'KNOWN',
          confidence: 0.88,
          age_s: 120,
          source: 'Simulated traffic model',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Minimal traffic at 2 AM on weeknight',
            'Signal lights on timer mode after midnight',
          ],
        },
        {
          fact_type: 'weather',
          subject: 'Nagpur city',
          label: 'KNOWN',
          confidence: 0.91,
          age_s: 600,
          source: 'Simulated weather service',
          source_class: 'simulated',
          simulated: true,
          reasons: ['Clear sky, 24°C, no precipitation expected'],
        },
      ],
      plan_b: {
        mode: 'two_wheeler',
        kind: 'balanced',
        eta: {
          optimistic_min: 17,
          expected_min: 22,
          pessimistic_min: 31,
        },
        description:
          'Switch to two-wheeler rental if auto not available within 10 minutes',
        trigger: 'No auto secured by 2:25 AM',
      },
      decision_by_iso: '2026-10-25T02:30:00+05:30',
      rejected: false,
      reject_reasons: [],
    },

    // ── Candidate 2: Two-wheeler (balanced, ROBUST) ─────────────
    {
      id: 'twowheeler-balanced',
      mode: 'two_wheeler',
      kind: 'balanced',
      distance_m: 5100,
      eta: {
        optimistic_min: 17,
        expected_min: 22,
        pessimistic_min: 31,
      },
      slack_min: {
        optimistic: 28,
        expected: 23,
        pessimistic: 14,
      },
      status: 'ROBUST',
      risk: {
        score: 0.35,
        max_gap_m: 520,
        basis: 'environmental_proxy',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0806, 21.1497],   // AIIMS gate
          [79.0795, 21.1492],   // Medical Square south exit
          [79.0778, 21.1502],   // Byramji Town detour
          [79.0752, 21.1510],   // Seminary Hills approach
          [79.0720, 21.1505],   // Seminary Hills Road
          [79.0693, 21.1492],   // Civil Lines crossing
          [79.0668, 21.1478],   // Temple Road
          [79.0645, 21.1468],   // Sadar area
          [79.0620, 21.1460],   // West approach
          [79.0600, 21.1455],   // Near Dharampeth
          [79.0588, 21.1453],   // Dharampeth destination
        ],
      },
      evidence: [
        {
          fact_type: 'ride_availability',
          subject: 'Two-wheeler rental near Medical Square',
          label: 'OUTDATED',
          confidence: 0.55,
          age_s: 1800,
          source: 'Simulated rental aggregator',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Last known availability was 30 min ago',
            'Night-time availability typically lower',
          ],
        },
        {
          fact_type: 'road_closure',
          subject: 'Seminary Hills Road',
          label: 'KNOWN',
          confidence: 0.92,
          age_s: 90,
          source: 'Simulated traffic feed',
          source_class: 'simulated',
          simulated: true,
          reasons: ['No closures on Seminary Hills Road segment'],
        },
        {
          fact_type: 'traffic',
          subject: 'Byramji Town to Civil Lines',
          label: 'PROBABLE',
          confidence: 0.78,
          age_s: 300,
          source: 'Simulated traffic model',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Residential area, very low traffic at 2 AM',
            'Some road surface uncertainty near Seminary Hills',
          ],
        },
        {
          fact_type: 'weather',
          subject: 'Nagpur city',
          label: 'KNOWN',
          confidence: 0.91,
          age_s: 600,
          source: 'Simulated weather service',
          source_class: 'simulated',
          simulated: true,
          reasons: ['Clear sky, 24°C, no precipitation expected'],
        },
      ],
      plan_b: null,
      decision_by_iso: '2026-10-25T02:30:00+05:30',
      rejected: false,
      reject_reasons: [],
    },

    // ── Candidate 3: Walking (safest, INFEASIBLE) ───────────────
    {
      id: 'walk-safest',
      mode: 'walk',
      kind: 'safest',
      distance_m: 4200,
      eta: {
        optimistic_min: 38,
        expected_min: 42,
        pessimistic_min: 52,
      },
      slack_min: {
        optimistic: 7,
        expected: 3,
        pessimistic: -7,
      },
      status: 'INFEASIBLE',
      risk: {
        score: 0.58,
        max_gap_m: 850,
        basis: 'environmental_proxy',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0806, 21.1497],   // AIIMS gate
          [79.0798, 21.1490],   // Medical Square footpath
          [79.0780, 21.1482],   // Wardha Road sidewalk
          [79.0755, 21.1477],   // Ramdaspeth residential
          [79.0730, 21.1473],   // Central Avenue crossing
          [79.0705, 21.1468],   // Shankar Nagar link
          [79.0675, 21.1462],   // Variety Square area
          [79.0650, 21.1458],   // LIC Square footpath
          [79.0625, 21.1455],   // Law College Road walk
          [79.0605, 21.1454],   // Near Dharampeth
          [79.0588, 21.1453],   // Dharampeth destination
        ],
      },
      evidence: [
        {
          fact_type: 'traffic',
          subject: 'Pedestrian route Medical Sq to Dharampeth',
          label: 'PROBABLE',
          confidence: 0.65,
          age_s: 300,
          source: 'Simulated pedestrian model',
          source_class: 'simulated',
          simulated: true,
          reasons: [
            'Footpath availability varies along Wardha Road',
            'Some stretches require walking on road shoulder',
          ],
        },
        {
          fact_type: 'weather',
          subject: 'Nagpur city',
          label: 'KNOWN',
          confidence: 0.91,
          age_s: 600,
          source: 'Simulated weather service',
          source_class: 'simulated',
          simulated: true,
          reasons: ['Clear sky, 24°C, comfortable for walking'],
        },
      ],
      plan_b: null,
      decision_by_iso: null,
      rejected: true,
      reject_reasons: [
        'Pessimistic ETA exceeds deadline by 7 minutes',
        'High environmental risk score (0.58) with 850m max gap between lit areas',
        'Walking alone at 2 AM on stretches without continuous footpath',
      ],
    },
  ],

  explanation: {
    why_chosen:
      'Auto-rickshaw via Wardha Road offers the fastest expected arrival (18 min) with comfortable slack (27 min expected, 18 min worst-case). Environmental risk proxy score is lowest among motorised options (0.22). A two-wheeler Plan B is available if no auto is secured by 2:25 AM.',
    why_rejected: [
      {
        id: 'walk-safest',
        reason:
          'Walking route exceeds deadline under pessimistic conditions (-7 min slack) and has the highest environmental risk proxy (0.58) with an 850m gap between lit service points.',
      },
    ],
    uncertainties: [
      'Auto-rickshaw availability at AIIMS gate is estimated from historical patterns (no live feed)',
      'Streetlight status along Wardha Road underpass section is unknown',
      'Two-wheeler rental availability data is 30 minutes stale',
    ],
  },
};
