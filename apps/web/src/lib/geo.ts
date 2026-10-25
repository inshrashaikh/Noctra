/**
 * Geo utilities for Noctra.
 * Nagpur bounding box for validation.
 */

/** Nagpur metro area bounding box */
export const NAGPUR_BBOX = {
  minLat: 21.05,
  maxLat: 21.25,
  minLon: 78.95,
  maxLon: 79.2,
} as const;

/** Nagpur center */
export const NAGPUR_CENTER = {
  lat: 21.1458,
  lon: 79.0882,
} as const;

/**
 * Check if coordinates fall within the Nagpur bounding box.
 */
export function isInsideNagpur(lat: number, lon: number): boolean {
  return (
    lat >= NAGPUR_BBOX.minLat &&
    lat <= NAGPUR_BBOX.maxLat &&
    lon >= NAGPUR_BBOX.minLon &&
    lon <= NAGPUR_BBOX.maxLon
  );
}

/**
 * Haversine distance between two coordinates in meters.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
