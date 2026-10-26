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
    source: 'IMD & Local Sensor Mesh',
    status: 'PROBABLE',
    note: 'Real-time temperature, visibility, and precipitation tracking.',
  },
  {
    data: 'Route Safety Index',
    source: 'Lighting & Refuge Network',
    status: 'KNOWN',
    note: 'High-density street lighting and verified 24/7 staffed safe havens.',
  },
  {
    data: 'Incidents & Closures',
    source: 'Nagpur Police & Traffic Feed',
    status: 'KNOWN',
    note: 'Active municipal night work zones and verified diversions.',
  },
  {
    data: 'Ride Availability',
    source: 'Auto Stand & Fleet Telemetry',
    status: 'PROBABLE',
    note: 'Active auto-rickshaw stands and verified night fleet corridors.',
  },
  {
    data: 'Transit Schedules',
    source: 'Nagpur Metro & Aapli Bus',
    status: 'KNOWN',
    note: 'Official verified metro timetable with last-mile connection window.',
  },
];

export function RealVsSimulated() {
  return (
    <section id="night-grid" className="border-b border-[#E2DED3] dark:border-[#232C3E] bg-[#F7F6F2] dark:bg-[#0B0E14] py-16 sm:py-24 lg:py-28 transition-colors">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="max-w-[65ch] space-y-3 text-left mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE MULTI-MODAL GRID
          </div>
          <h2 className="text-3xl sm:text-[40px] font-bold tracking-[-0.01em] leading-[1.15] text-[#14181D] dark:text-[#F8FAFC]">
            Multi-Source Telemetry Grid
          </h2>
          <p className="text-base text-[#5B6672] dark:text-[#94A3B8] leading-relaxed">
            Every input to the Noctra decision engine is verified and classified. We provide predictable, high-safety transit routing with guaranteed decision fallback windows.
          </p>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E2DED3] dark:border-[#232C3E] bg-[#FFFFFF] dark:bg-[#131822] shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2DED3] dark:border-[#232C3E] bg-[#F1EFE8] dark:bg-[#1A212E] font-mono text-xs font-semibold text-[#14181D] dark:text-[#F8FAFC]">
                <th className="py-3.5 px-4 sm:px-6">Domain Data</th>
                <th className="py-3.5 px-4 sm:px-6">Active Source</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6">Operational Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DED3] dark:divide-[#232C3E] text-[#14181D] dark:text-[#F8FAFC]">
              {TABLE_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F7F6F2] dark:hover:bg-[#1A212E]/50 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold whitespace-nowrap">
                    {row.data}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-[#5B6672] dark:text-[#94A3B8]">
                    {row.source}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <EvidenceChip status={row.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs text-[#5B6672] dark:text-[#94A3B8]">
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
