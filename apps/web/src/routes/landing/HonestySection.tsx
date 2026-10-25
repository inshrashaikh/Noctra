import { SimulatedBadge } from '@/components/common/SimulatedBadge';

interface ComparisonRow {
  domain: string;
  inPrototype: string;
  realBackendPlanned: string;
  evidenceType: 'KNOWN' | 'PROBABLE' | 'OUTDATED' | 'UNKNOWN';
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    domain: 'Road Network & Routing Graph',
    inPrototype: 'Nagpur local GeoJSON road graph + synthetic travel times (simulated).',
    realBackendPlanned: 'OSRM / Valhalla multimodal graph with OpenStreetMap pedestrian ways.',
    evidenceType: 'KNOWN',
  },
  {
    domain: 'Transit Schedules & Night Buses',
    inPrototype: 'Simulated Aapli Bus N7 timetable with injected 2:45 AM scenario departure.',
    realBackendPlanned: 'Nagpur Metro Rail GTFS-RT feed + NMC smart city transit telemetry.',
    evidenceType: 'PROBABLE',
  },
  {
    domain: 'Environmental Lighting & Safety Proxy',
    inPrototype: 'Environmental risk proxy (not crime data) based on street lamp density fixtures.',
    realBackendPlanned: 'OSM lit-tags combined with municipal SCADA smart street-pole sensor feeds.',
    evidenceType: 'PROBABLE',
  },
  {
    domain: '24×7 Safe Refuges (Police, Pharmacy, Fuel)',
    inPrototype: 'Curated dataset of 12 verified Nagpur 24×7 facilities with mock status.',
    realBackendPlanned: 'Live Google Places API hours + verified Nagpur Police assistance registry.',
    evidenceType: 'KNOWN',
  },
  {
    domain: 'Ride-Hail & Auto Availability',
    inPrototype: 'Explicitly marked UNKNOWN. Never fake wait times or fabricated driver counts.',
    realBackendPlanned: 'Deep-linking to Uber/Ola/Rapido SDKs; falls back to UNKNOWN when no ping.',
    evidenceType: 'UNKNOWN',
  },
  {
    domain: 'Safe Arrival Tracking & SMS Alerts',
    inPrototype: 'Browser state only. Simulated in this prototype, nothing was sent.',
    realBackendPlanned: 'Twilio SMS / WhatsApp Business Cloud API with cellular fallback.',
    evidenceType: 'KNOWN',
  },
];

export function HonestySection() {
  return (
    <section id="verification" className="border-b border-noctra-border bg-noctra-bg py-16 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="max-w-[65ch] space-y-4 text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-noctra-accent">
              04 / Complete Honesty
            </span>
            <SimulatedBadge size="sm" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-noctra-text sm:text-3xl">
            Real vs Simulated: Capability Transparency
          </h2>
          <p className="text-sm leading-relaxed text-noctra-muted">
            Noctra will never present synthetic data as live truth. Every fixture in this prototype carries an explicit source class and confidence label. Risk is strictly reported as: <strong className="text-noctra-text">Environmental risk proxy (not crime data)</strong>.
          </p>
        </div>

        {/* Real vs Simulated Comparison Matrix */}
        <div className="mt-12 overflow-x-auto rounded-md border border-noctra-border bg-noctra-surface">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-noctra-border bg-noctra-raised font-mono text-[11px] text-noctra-muted">
                <th className="py-3 px-4 font-semibold">Subsystem / Signal</th>
                <th className="py-3 px-4 font-semibold">In This Prototype</th>
                <th className="py-3 px-4 font-semibold">Planned Production Backend</th>
                <th className="py-3 px-4 font-semibold text-right">Default Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noctra-border">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-noctra-raised/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-noctra-text">
                    {row.domain}
                  </td>
                  <td className="py-3 px-4 text-noctra-muted leading-relaxed">
                    {row.inPrototype}
                  </td>
                  <td className="py-3 px-4 text-noctra-text leading-relaxed">
                    {row.realBackendPlanned}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        row.evidenceType === 'KNOWN'
                          ? 'border-noctra-known/40 bg-noctra-known/10 text-noctra-known'
                          : row.evidenceType === 'PROBABLE'
                          ? 'border-noctra-probable/40 bg-noctra-probable/10 text-noctra-probable'
                          : row.evidenceType === 'OUTDATED'
                          ? 'border-noctra-outdated/40 bg-noctra-outdated/10 text-noctra-outdated'
                          : 'border-dashed border-noctra-unknown/50 bg-noctra-unknown/10 text-noctra-unknown'
                      }`}
                    >
                      {row.evidenceType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
