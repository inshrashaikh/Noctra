import { EvidenceChip } from '@/components/common/EvidenceChip';

interface TableRow {
  data: string;
  source: string;
  status: 'KNOWN' | 'PROBABLE' | 'OUTDATED' | 'UNKNOWN';
  note: string;
}

const TABLE_DATA: TableRow[] = [
  {
    data: 'Roads & Facilities',
    source: 'OpenStreetMap',
    status: 'KNOWN',
    note: 'Cached vector street grid and verified facility landmarks.',
  },
  {
    data: 'Weather Telemetry',
    source: 'Open-Meteo / Local Sensor',
    status: 'PROBABLE',
    note: 'Cached when offline; precipitation affects visibility proxies.',
  },
  {
    data: 'Route Risk Proxy',
    source: 'Street Lighting & Safe Haven Density',
    status: 'PROBABLE',
    note: 'Environmental risk proxy (not crime data).',
  },
  {
    data: 'Incidents & Closures',
    source: 'Scenario Generator (Demo)',
    status: 'OUTDATED',
    note: 'Simulated in demo environment for testing fallback replanning.',
  },
  {
    data: 'Ride Availability',
    source: 'Auto Stand / Cab Fleet Ping',
    status: 'UNKNOWN',
    note: 'Unknown unless live ping injected; never fabricated.',
  },
  {
    data: 'Transit Schedules',
    source: 'Aapli Bus / Metro Timetable',
    status: 'KNOWN',
    note: 'Shown only with a verified schedule source, else unknown.',
  },
];

export function RealVsSimulated() {
  return (
    <section id="real-vs-simulated" className="border-b border-[#E2DED3] bg-[#F7F6F2] py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="max-w-[65ch] space-y-3 text-left mb-12">
          <h2 className="text-3xl sm:text-[40px] font-bold tracking-[-0.01em] leading-[1.15] text-[#14181D]">
            What is real, and what is not.
          </h2>
          <p className="text-base text-[#5B6672] leading-relaxed">
            Every input to the decision engine is transparently classified. We do not invent wait times, fake active drivers, or conceal missing signals.
          </p>
        </div>

        {/* 4-Column Table, 56px rows, hairline dividers, scrollable on mobile */}
        <div className="overflow-x-auto rounded-xl border border-[#E2DED3] bg-[#FFFFFF]">
          <table className="w-full text-left text-xs border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[#E2DED3] bg-[#F1EFE8] font-mono text-[11px] text-[#5B6672]">
                <th className="h-12 px-5 font-semibold">Data</th>
                <th className="h-12 px-5 font-semibold">Source</th>
                <th className="h-12 px-5 font-semibold">Status</th>
                <th className="h-12 px-5 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DED3]">
              {TABLE_DATA.map((row) => (
                <tr key={row.data} className="h-14 hover:bg-[#F7F6F2] transition-colors">
                  <td className="px-5 font-semibold text-[#14181D]">
                    {row.data}
                  </td>
                  <td className="px-5 text-[#5B6672] font-mono">
                    {row.source}
                  </td>
                  <td className="px-5">
                    <EvidenceChip label={row.status} />
                  </td>
                  <td className="px-5 text-[#5B6672] leading-relaxed">
                    {row.note}
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
