/**
 * Status fixture: Tier 0 — all feeds healthy.
 */
import type { StatusResponse } from '@noctra/contracts';

export const STATUS_FIXTURE: StatusResponse = {
  tier: 0,
  feeds: [
    {
      name: 'Traffic flow (Nagpur Smart Grid)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:14:30+05:30',
      label: 'KNOWN',
    },
    {
      name: 'Road closures (Nagpur Traffic Police)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:14:45+05:30',
      label: 'KNOWN',
    },
    {
      name: 'Weather & Visibility (IMD Radar)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:10:00+05:30',
      label: 'KNOWN',
    },
    {
      name: 'Ride availability (Night Transit Grid)',
      healthy: true,
      last_ok_iso: '2026-10-25T02:12:00+05:30',
      label: 'PROBABLE',
    },
    {
      name: 'Facility hours / OSM Safe Havens',
      healthy: true,
      last_ok_iso: '2026-10-24T22:00:00+05:30',
      label: 'KNOWN',
    },
  ],
  data_manifest: {
    osm_extract: '2026-10-20',
    weather_model: 'IMD-Live-v1',
    traffic_model: 'nagpur-smart-traffic-v2',
    note: 'All feeds active and verified across Nagpur municipal grid',
  },
};
