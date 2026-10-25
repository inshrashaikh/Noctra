/**
 * Status fixture: Tier 0 — all feeds healthy.
 */
import type { StatusResponse } from '@noctra/contracts';

export const STATUS_FIXTURE: StatusResponse = {
  tier: 0,
  feeds: [
    {
      name: 'Traffic flow (simulated)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:14:30+05:30',
      label: 'KNOWN',
    },
    {
      name: 'Road closures (simulated)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:14:45+05:30',
      label: 'KNOWN',
    },
    {
      name: 'Weather (simulated)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:10:00+05:30',
      label: 'KNOWN',
    },
    {
      name: 'Ride availability (simulated)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:12:00+05:30',
      label: 'PROBABLE',
    },
    {
      name: 'Facility hours / OSM (simulated)',
      healthy: true,
      last_ok_iso: '2026-10-24T22:00:00+05:30',
      label: 'KNOWN',
    },
  ],
  data_manifest: {
    osm_extract: '2026-10-20',
    weather_model: 'simulated-IMD-v1',
    traffic_model: 'simulated-nagpur-night',
    note: 'All data is simulated for demonstration purposes',
  },
};
