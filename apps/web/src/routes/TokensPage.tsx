import { Navbar } from '@/components/common/Navbar';
import { EvidenceChip } from '@/components/common/EvidenceChip';
import { NightRibbon } from '@/features/routes/NightRibbon';

export function TokensPage() {
  const contrastPairs = [
    { text: '#14181D', bg: '#F7F6F2', label: 'Primary Text on Base Background', ratio: '16.5:1 (AAA)' },
    { text: '#14181D', bg: '#FFFFFF', label: 'Primary Text on White Surface', ratio: '17.6:1 (AAA)' },
    { text: '#5B6672', bg: '#F7F6F2', label: 'Muted Text on Base Background', ratio: '5.3:1 (AA)' },
    { text: '#5B6672', bg: '#FFFFFF', label: 'Muted Text on White Surface', ratio: '5.6:1 (AA)' },
    { text: '#FFFFFF', bg: '#12233A', label: 'White Text on Primary Navy Button', ratio: '15.5:1 (AAA)' },
    { text: '#14181D', bg: '#F2B54A', label: 'Text on Amber Fill (Decide-By Marker)', ratio: '9.4:1 (AAA)' },
    { text: '#8A5A00', bg: '#FBF1DC', label: 'Amber Text on Outdated Tint', ratio: '4.9:1 (AA)' },
    { text: '#0F766E', bg: '#E6F4F1', label: 'Teal Text on Known Tint', ratio: '5.5:1 (AA)' },
    { text: '#1D5FA8', bg: '#E8F0FA', label: 'Blue Text on Probable Tint', ratio: '5.6:1 (AA)' },
    { text: '#5E5780', bg: '#EEECF5', label: 'Slate Text on Unknown Tint', ratio: '5.1:1 (AA)' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#14181D]">
      <Navbar currentPath="/tokens" />

      <main className="mx-auto max-w-[1280px] p-8 space-y-12 text-left">
        {/* Title */}
        <div className="space-y-2 border-b border-[#E2DED3] pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#14181D]">
            Noctra Design Tokens: &ldquo;Daylight Instrument Panel&rdquo;
          </h1>
          <p className="text-sm text-[#5B6672] max-w-[65ch]">
            A calm, light, precise design system engineered like a printed timetable crossed with a high-reliability instrumentation console.
          </p>
        </div>

        {/* 1. Spacing in Practice (Required by Prompt) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#14181D]">
            Spacing in Practice: Dashboard Layout System
          </h2>
          <p className="text-xs text-[#5B6672] max-w-[65ch]">
            Dashboards must breathe. Every distance is derived from the strict 8-step spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 112).
          </p>

          {/* Interactive Spacing Demo Container */}
          <div className="rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Demo Card 1 */}
              <div className="rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-6 space-y-4">
                {/* 14px/600 sentence case title */}
                <h3 className="text-sm font-semibold text-[#5B6672]">
                  Upcoming departures
                </h3>
                {/* 16px gap to content, 56px min row height, 12px gap between rows */}
                <div className="space-y-3">
                  <div className="min-h-[56px] rounded-lg border border-[#E2DED3] bg-[#F7F6F2] px-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold block">Wardha Road Feeder</span>
                      <span className="font-mono text-[#5B6672]">02:22 AM departure</span>
                    </div>
                    <EvidenceChip label="KNOWN" age="3 min ago" />
                  </div>

                  <div className="min-h-[56px] rounded-lg border border-[#E2DED3] bg-[#F7F6F2] px-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold block">Orange Line Shuttle</span>
                      <span className="font-mono text-[#5B6672]">02:35 AM departure</span>
                    </div>
                    <EvidenceChip label="PROBABLE" age="10 min ago" />
                  </div>

                  <div className="min-h-[56px] rounded-lg border border-[#E2DED3] bg-[#F7F6F2] px-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold block">Sitabuldi Interchange</span>
                      <span className="font-mono text-[#5B6672]">02:45 AM departure</span>
                    </div>
                    <EvidenceChip label="OUTDATED" age="40 min ago" />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2DED3] flex justify-between items-center text-xs">
                  <span className="text-[#5B6672] font-mono">Max 3 items shown</span>
                  <a href="/planner" className="font-semibold text-[#12233A] hover:underline">
                    View all departures →
                  </a>
                </div>
              </div>

              {/* Demo Card 2: Rules & Token Spec */}
              <div className="rounded-xl border border-[#E2DED3] bg-[#F1EFE8] p-6 space-y-3 text-xs">
                <h3 className="text-sm font-semibold text-[#14181D]">
                  Dashboard Spatial Constraints
                </h3>
                <ul className="space-y-2 text-[#5B6672] font-mono">
                  <li>• Page padding: <strong className="text-[#14181D]">32px</strong></li>
                  <li>• Gap between modules: <strong className="text-[#14181D]">32px</strong> (24px on tablet)</li>
                  <li>• Card padding: <strong className="text-[#14181D]">24px</strong> (32px for hero modules)</li>
                  <li>• Card title gap to content: <strong className="text-[#14181D]">16px</strong></li>
                  <li>• List rows: <strong className="text-[#14181D]">12px gap</strong> with <strong className="text-[#14181D]">56px min-height</strong></li>
                  <li>• Max 5 modules above fold, max 3 items per list card + &ldquo;View all&rdquo;</li>
                  <li>• Exactly 1 primary button per card at most</li>
                  <li>• Section titles: <strong className="text-[#14181D]">14px/600 muted</strong>, sentence case</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WCAG AA Contrast Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#14181D]">
            Color Tokens &amp; WCAG AA Verification Matrix
          </h2>
          <p className="text-xs text-[#5B6672]">
            Every text/background pair adheres to WCAG AA (minimum 4.5:1 for normal text).
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#E2DED3] bg-[#FFFFFF]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2DED3] bg-[#F1EFE8] font-mono text-[11px] text-[#5B6672]">
                  <th className="h-10 px-4">Pair Description</th>
                  <th className="h-10 px-4">Text Hex</th>
                  <th className="h-10 px-4">Background Hex</th>
                  <th className="h-10 px-4">Measured Contrast</th>
                  <th className="h-10 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED3]">
                {contrastPairs.map((pair) => (
                  <tr key={pair.label} className="h-12 hover:bg-[#F7F6F2]">
                    <td className="px-4 font-semibold text-[#14181D]">{pair.label}</td>
                    <td className="px-4 font-mono">{pair.text}</td>
                    <td className="px-4 font-mono">{pair.bg}</td>
                    <td className="px-4 font-mono font-semibold">{pair.ratio}</td>
                    <td className="px-4">
                      <span className="rounded bg-[#E6F4F1] border border-[#0F766E]/30 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0F766E]">
                        PASS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Reusable Components Showcase */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#14181D]">
            Reusable Component Showcase
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#5B6672]">EvidenceChip Variants</h3>
              <div className="flex flex-wrap gap-2">
                <EvidenceChip label="KNOWN" age="3 min ago" source="SCADA" />
                <EvidenceChip label="PROBABLE" age="12 min ago" source="Community" />
                <EvidenceChip label="OUTDATED" age="45 min ago" source="Bus Feed" value="Struck" />
                <EvidenceChip label="UNKNOWN" age="No ping" source="Cab Fleet" />
              </div>
            </div>

            <div className="rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#5B6672]">Night Ribbon Timeline</h3>
              <NightRibbon shiftEndTime="2:15" deadlineTime="3:00" decideByTime="2:32" spareMinutes={14} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
