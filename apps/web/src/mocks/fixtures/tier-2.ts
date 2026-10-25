/**
 * Tier 2 offline scenario fixture.
 *
 * Simulates complete feed outage: all feeds unhealthy, tier = 2.
 * Plan is a cached version from the last successful query.
 */
import type { PlanResponse, StatusResponse } from '@noctra/contracts';
import { NURSE_PLAN_RESPONSE } from './nurse-2-15am';

// ── Tier 2 Status ──────────────────────────────────────────────────

export const TIER_2_STATUS: StatusResponse = {
  tier: 2,
  feeds: [
    {
      name: 'Traffic flow (simulated)',
      healthy: false,
      last_ok_iso: '2026-10-25T01:45:00+05:30',
      label: 'UNKNOWN',
    },
    {
      name: 'Road closures (simulated)',
      healthy: false,
      last_ok_iso: '2026-10-25T01:42:00+05:30',
      label: 'UNKNOWN',
    },
    {
      name: 'Weather (simulated)',
      healthy: false,
      last_ok_iso: '2026-10-25T01:30:00+05:30',
      label: 'UNKNOWN',
    },
    {
      name: 'Ride availability (simulated)',
      healthy: false,
      last_ok_iso: '2026-10-25T01:40:00+05:30',
      label: 'UNKNOWN',
    },
    {
      name: 'Facility hours / OSM (simulated)',
      healthy: false,
      last_ok_iso: '2026-10-24T22:00:00+05:30',
      label: 'OUTDATED',
    },
  ],
  data_manifest: {
    osm_extract: '2026-10-20',
    weather_model: 'simulated-IMD-v1',
    traffic_model: 'simulated-nagpur-night',
    note: 'ALL FEEDS OFFLINE — showing cached data',
  },
};

// ── Tier 2 Cached Plan ─────────────────────────────────────────────

export function getTier2CachedPlan(): PlanResponse {
  const plan = structuredClone(NURSE_PLAN_RESPONSE);

  plan.tier = 2;
  plan.generated_at = '2026-10-25T01:45:00+05:30';

  // Degrade ALL evidence to UNKNOWN across all candidates
  for (const candidate of plan.candidates) {
    candidate.status = 'AT_RISK';
    candidate.decision_by_iso = null;

    for (const ev of candidate.evidence) {
      ev.label = 'UNKNOWN';
      ev.confidence = 0.1;
      ev.age_s = 1800; // 30 min stale
      ev.reasons = [
        'Feed offline — data is from last successful query (30+ min ago)',
        'Cannot verify current conditions',
      ];
    }
  }

  // Walking remains INFEASIBLE (never changes)
  const walk = plan.candidates.find((c) => c.id === 'walk-safest');
  if (walk) {
    walk.status = 'INFEASIBLE';
  }

  plan.recommended_id = null; // No recommendation in Tier 2

  plan.explanation = {
    why_chosen:
      'UNABLE TO RECOMMEND — All data feeds are offline (Tier 2). Showing cached plan from 01:45 AM. All evidence is stale and unverified. Please use your own judgment or wait for connectivity to restore.',
    why_rejected: [],
    uncertainties: [
      'All data feeds have been offline for 30+ minutes',
      'Road conditions, ride availability, and weather are unverified',
      'Cached plan may not reflect current reality',
      'This is a demonstration of degraded-mode behaviour',
    ],
  };

  plan.missing_information = [
    'All live feeds (traffic, closures, weather, ride availability)',
    'Current road conditions along any route',
    'Real-time ride availability at any location',
  ];

  return plan;
}

export const TIER_2_PLAN_RESPONSE = getTier2CachedPlan();

