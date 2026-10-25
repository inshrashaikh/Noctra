import { format, differenceInSeconds } from 'date-fns';

const TIMEZONE = 'Asia/Kolkata';

/**
 * Format an ISO string to a display time like "2:15 AM".
 */
export function formatTime(iso: string): string {
  return format(new Date(iso), 'h:mm a');
}

/**
 * Format an ISO string to "HH:mm" (24h).
 */
export function formatTime24(iso: string): string {
  return format(new Date(iso), 'HH:mm');
}

/**
 * Relative time: "12 min ago", "2 hours ago".
 */
export function formatAge(ageSeconds: number): string {
  if (ageSeconds < 60) return `${ageSeconds}s ago`;
  if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)} min ago`;
  if (ageSeconds < 86400) return `${Math.floor(ageSeconds / 3600)}h ago`;
  return `${Math.floor(ageSeconds / 86400)}d ago`;
}

/**
 * Countdown: "12:45" (mm:ss) or "2h 15m".
 */
export function formatCountdown(targetIso: string, nowIso: string): string {
  const diff = differenceInSeconds(new Date(targetIso), new Date(nowIso));
  if (diff <= 0) return 'NOW';
  if (diff < 3600) {
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
  const hours = Math.floor(diff / 3600);
  const min = Math.floor((diff % 3600) / 60);
  return `${hours}h ${min}m`;
}

/**
 * Format minutes to a human string: "23 min", "1h 5m".
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format distance in meters: "450 m" or "2.3 km".
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export { TIMEZONE };
