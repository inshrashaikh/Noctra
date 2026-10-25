/**
 * decay.ts — Evidence label decay function.
 *
 * Rules:
 * - Each fact type has a TTL (time-to-live) in seconds.
 * - age <= TTL → label is capped at the original label (no improvement).
 * - TTL < age <= 6×TTL → OUTDATED.
 * - age > 6×TTL → UNKNOWN.
 * - Labels never improve without a new observation.
 */

import type { EvidenceLabel, FactType } from './schemas.js';

export interface DecayConfig {
  readonly ttl_s: number;
}

/** TTL per fact type in seconds */
export const FACT_TTL: Record<FactType, DecayConfig> = {
  ride_availability: { ttl_s: 300 },
  transit_schedule: { ttl_s: 600 },
  road_closure: { ttl_s: 1800 },
  weather: { ttl_s: 3600 },
  facility_hours: { ttl_s: 30 * 24 * 3600 }, // 30 days
  traffic: { ttl_s: 300 },
} as const;

const LABEL_RANK: Record<EvidenceLabel, number> = {
  KNOWN: 0,
  PROBABLE: 1,
  OUTDATED: 2,
  UNKNOWN: 3,
};

/**
 * Compute the effective label for a piece of evidence given its age.
 *
 * @param originalLabel - The label assigned at observation time.
 * @param age_s - Seconds since the observation was made.
 * @param factType - The type of fact (determines TTL).
 * @returns The decayed label. Never better than originalLabel.
 */
export function computeLabel(
  originalLabel: EvidenceLabel,
  age_s: number,
  factType: FactType
): EvidenceLabel {
  const { ttl_s } = FACT_TTL[factType];

  let decayed: EvidenceLabel;

  if (age_s <= ttl_s) {
    // Within TTL: keep original label
    decayed = originalLabel;
  } else if (age_s <= ttl_s * 6) {
    // Between TTL and 6×TTL: OUTDATED
    decayed = 'OUTDATED';
  } else {
    // Beyond 6×TTL: UNKNOWN
    decayed = 'UNKNOWN';
  }

  // Labels never improve: pick the worse of original and decayed
  if (LABEL_RANK[decayed] < LABEL_RANK[originalLabel]) {
    return originalLabel;
  }

  return decayed;
}
