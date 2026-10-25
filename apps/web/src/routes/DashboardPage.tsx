import { useState } from 'react';
import { EvidenceChip } from '@/components/common/EvidenceChip';
import { NightRibbon } from '@/features/routes/NightRibbon';
import { useAlerts } from '@/features/alerts/useAlerts';
import { useSettings } from '@/features/settings/useSettings';
import { AlertsDrawer } from '@/features/alerts/AlertsDrawer';
import {
  LayoutDashboard,
  Navigation,
  Cross,
  Bell,
  Settings as SettingsIcon,
  Check,
  ArrowRight,
  ShieldAlert,
  Car,
  Clock,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export function DashboardPage() {
  const { alerts, setIsDrawerOpen } = useAlerts();
  const { setIsSettingsOpen } = useSettings();
  const [activeTab, setActiveTab] = useState<'routes' | 'services' | 'alerts'>('routes');

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: true },
    { label: 'Plan journey', href: '/planner', icon: Navigation, active: false },
    { label: 'Services', href: '/services', icon: Cross, active: false },
    { label: 'Alerts', href: '#', icon: Bell, active: false, onClick: () => setIsDrawerOpen(true) },
    { label: 'Settings', href: '#', icon: SettingsIcon, active: false, onClick: () => setIsSettingsOpen(true) },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F6F2] text-[#14181D] overflow-x-hidden">
      {/* ── LEFT SIDEBAR (240px, 5 items only, 48px items) ──────────────── */}
      <aside className="w-full md:w-[240px] shrink-0 border-b md:border-b-0 md:border-r border-[#E2DED3] bg-[#FFFFFF] flex flex-col justify-between py-4 md:py-6">
        <div>
          {/* Brand */}
          <div className="px-6 mb-6 md:mb-8">
            <a href="/" className="flex items-center gap-2.5">
              <svg
                className="h-6 w-6 text-[#12233A]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 12.5A8.5 8.5 0 1 1 11.5 4 6.5 6.5 0 0 0 20 12.5Z" fill="#12233A" fillOpacity="0.12" />
                <circle cx="17.5" cy="8.5" r="2.5" fill="#F2B54A" stroke="#12233A" strokeWidth="1.5" />
              </svg>
              <span className="text-base font-semibold tracking-tight text-[#14181D]">
                Noctra
              </span>
            </a>
            <div className="mt-1 font-mono text-[10px] text-[#5B6672]">
              Daylight Instrument Panel
            </div>
          </div>

          {/* Nav List (5 items only, 48px high, active = raised bg + 2px navy left indicator) */}
          <nav className="space-y-1" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={cn(
                    'flex h-12 items-center gap-3 px-6 text-xs font-semibold transition-colors',
                    item.active
                      ? 'border-l-2 border-[#12233A] bg-[#F1EFE8] text-[#12233A]'
                      : 'border-l-2 border-transparent text-[#5B6672] hover:bg-[#F7F6F2] hover:text-[#14181D]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.label === 'Alerts' && alerts.length > 0 && (
                    <span className="ml-auto rounded-full bg-[#12233A] px-1.5 py-0.2 font-mono text-[10px] font-bold text-[#FFFFFF]">
                      {alerts.length}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="hidden md:block px-6 font-mono text-[11px] text-[#5B6672] space-y-1">
          <div>CASCADE &apos;26 • IIIT Nagpur</div>
          <div className="text-[10px]">Environmental risk proxy</div>
        </div>
      </aside>

      {/* ── MAIN CONTENT (32px page padding, 32px gaps, 12-col grid) ───── */}
      <main className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1280px] w-full min-w-0 overflow-x-hidden">
        {/* ROW 1 (56px): Greeting, Shift window, Connection chip */}
        <div role="region" aria-label="Shift status" className="flex flex-col sm:flex-row sm:h-14 items-start sm:items-center justify-between gap-3 rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-sm text-[#14181D]">
              Good evening, Priya
            </span>
            <span className="hidden sm:inline text-[#E2DED3]">|</span>
            <span className="font-mono text-xs text-[#5B6672]">
              Shift ends <strong className="text-[#14181D]">2:15 AM</strong>, home by{' '}
              <strong className="text-[#14181D]">3:00 AM</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection chip */}
            <div className="inline-flex items-center gap-1.5 rounded-md border border-[#0F766E]/30 bg-[#E6F4F1] px-2.5 py-1 font-mono text-xs text-[#0F766E]">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Tier 0, live data (simulated)</span>
            </div>
            <span className="rounded bg-[#FBF1DC] px-2 py-0.5 font-mono text-[10px] font-bold text-[#8A5A00] border border-[#8A5A00]/20">
              SIMULATED
            </span>
          </div>
        </div>

        {/* ROW 2: Night Ribbon (8 cols, 32px padding) + Recommended plan card (4 cols) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Night Ribbon (32px padding) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-[#5B6672] mb-4">
                Shift-to-deadline window
              </h2>
              <NightRibbon
                shiftEndTime="2:15"
                deadlineTime="3:00"
                decideByTime="2:32"
                spareMinutes={14}
              />
            </div>

            {/* ROW 3: Compact row of four EvidenceChips with counts under ribbon */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-4 sm:px-6 sm:py-3 text-xs">
              <span className="font-semibold text-[#5B6672]">
                Telemetry confidence:
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <EvidenceChip label="KNOWN" age="6 facts verified" />
                <EvidenceChip label="PROBABLE" age="2 facts likely" />
                <EvidenceChip label="OUTDATED" age="1 fact aged" />
                <EvidenceChip label="UNKNOWN" age="1 fact unconfirmed" />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Recommended Plan Card (24px padding) */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#5B6672]">
                    Recommended route
                  </h2>
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#0F766E]">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    High Certainty
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-bold text-[#14181D]">
                    Wardha Road Corridor
                  </h3>
                  <div className="font-mono text-sm text-[#14181D]">
                    <span className="text-2xl font-bold text-[#14181D]">02:42 AM</span>
                    <span className="text-xs text-[#5B6672] ml-2 font-normal">
                      (+27 min • 18 min spare buffer)
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6672] leading-relaxed pt-1">
                    Verified street illumination (88%), two 24h facilities along route, and deterministic Plan B fallback.
                  </p>
                </div>
              </div>

              {/* Exactly ONE navy primary button */}
              <div className="pt-4 border-t border-[#E2DED3]">
                <a
                  href="/planner"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#12233A] text-sm font-semibold text-[#FFFFFF] hover:bg-[#1B3252] transition-colors"
                >
                  <span>Open route</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ROW 4: Map (8 cols, 420px high) + Right panel (4 cols, 420px high) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Map (420px high, muted light basemap, 1 navy route line) */}
          <div className="lg:col-span-8">
            <div className="relative h-[420px] w-full rounded-xl border border-[#E2DED3] bg-[#FFFFFF] overflow-hidden">
              <svg
                className="h-full w-full select-none"
                viewBox="0 0 680 420"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Map view of route corridor"
              >
                {/* Muted warm grey basemap */}
                <rect width="680" height="420" fill="#F7F6F2" />

                {/* Park */}
                <path d="M 40,40 Q 140,20 200,80 T 260,180 T 160,260 T 60,180 Z" fill="#ECE8DC" />

                {/* River */}
                <path d="M 280,0 C 320,120 290,260 370,420" stroke="#DCE3EA" strokeWidth="22" strokeLinecap="round" fill="none" />

                {/* Streets Secondary */}
                <line x1="0" y1="110" x2="680" y2="110" stroke="#E5E0D4" strokeWidth="2" />
                <line x1="0" y1="210" x2="680" y2="210" stroke="#E5E0D4" strokeWidth="2" />
                <line x1="0" y1="310" x2="680" y2="310" stroke="#E5E0D4" strokeWidth="2" />
                <line x1="160" y1="0" x2="160" y2="420" stroke="#E5E0D4" strokeWidth="2" />
                <line x1="380" y1="0" x2="380" y2="420" stroke="#E5E0D4" strokeWidth="2" />
                <line x1="520" y1="0" x2="520" y2="420" stroke="#E5E0D4" strokeWidth="2" />

                {/* Streets Arterials */}
                <line x1="0" y1="160" x2="680" y2="160" stroke="#DDD6C7" strokeWidth="4" />
                <line x1="260" y1="0" x2="480" y2="420" stroke="#DDD6C7" strokeWidth="4" />

                {/* One Navy Route Line (3px, #12233A) */}
                <path
                  d="M 100,320 L 180,320 L 280,240 L 370,160 L 490,160 L 580,90"
                  stroke="#12233A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Facility Markers */}
                <g transform="translate(280, 240)">
                  <circle cx="0" cy="0" r="10" fill="#E6F4F1" stroke="#0F766E" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" fill="#0F766E" fontSize="10" fontWeight="bold">+</text>
                  <text x="14" y="3" fill="#5B6672" fontSize="10" fontFamily="monospace">GMC Hospital (24h)</text>
                </g>

                <g transform="translate(490, 160)">
                  <circle cx="0" cy="0" r="10" fill="#E8F0FA" stroke="#1D5FA8" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" fill="#1D5FA8" fontSize="9" fontWeight="bold">P</text>
                  <text x="14" y="3" fill="#5B6672" fontSize="10" fontFamily="monospace">Sitabuldi Police</text>
                </g>

                {/* Origin Marker */}
                <g transform="translate(100, 320)">
                  <circle cx="0" cy="0" r="8" fill="#FFFFFF" stroke="#12233A" strokeWidth="3" />
                  <text x="-10" y="20" fill="#14181D" fontSize="11" fontFamily="monospace" fontWeight="bold">AIIMS (2:15 AM)</text>
                </g>

                {/* Destination Marker */}
                <g transform="translate(580, 90)">
                  <circle cx="0" cy="0" r="8" fill="#12233A" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="-25" y="-12" fill="#14181D" fontSize="11" fontFamily="monospace" fontWeight="bold">Home (3:00 AM)</text>
                </g>
              </svg>

              {/* SIMULATED Badge */}
              <div className="absolute top-4 right-4">
                <span className="rounded bg-[#FBF1DC] px-2 py-0.5 font-mono text-[10px] font-bold text-[#8A5A00] border border-[#8A5A00]/20">
                  SIMULATED
                </span>
              </div>

              {/* Risk Proxy Disclaimer */}
              <div className="absolute bottom-4 left-4 rounded bg-[#FFFFFF]/90 px-3 py-1 font-mono text-[11px] text-[#5B6672] border border-[#E2DED3]">
                Environmental risk proxy (not crime data) • 5.2 km
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Right Panel with tabs (420px high, 56px rows, max 3 items) */}
          <div className="lg:col-span-4">
            <div className="flex h-[420px] flex-col justify-between rounded-xl border border-[#E2DED3] bg-[#FFFFFF] overflow-hidden">
              <div>
                {/* Tabs Header */}
                <div className="flex border-b border-[#E2DED3]">
                  {(['routes', 'services', 'alerts'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'flex-1 py-3 text-xs font-semibold capitalize transition-colors',
                        activeTab === tab
                          ? 'border-b-2 border-[#12233A] bg-[#F1EFE8] text-[#12233A]'
                          : 'text-[#5B6672] hover:text-[#14181D]'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Items List (56px rows, max 3 items) */}
                <div className="divide-y divide-[#E2DED3]">
                  {activeTab === 'routes' && (
                    <>
                      <div className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                        <div className="flex items-center gap-2.5">
                          <Car className="h-4 w-4 text-[#12233A]" />
                          <div>
                            <span className="font-semibold text-[#14181D] block">Primary Auto Corridor</span>
                            <span className="font-mono text-[11px] text-[#5B6672]">ETA 27m</span>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-[#0F766E] text-[11px]">+14m spare</span>
                      </div>

                      <div className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                        <div className="flex items-center gap-2.5">
                          <Car className="h-4 w-4 text-[#5B6672]" />
                          <div>
                            <span className="font-semibold text-[#14181D] block">Metro Feeder + Walk</span>
                            <span className="font-mono text-[11px] text-[#5B6672]">ETA 34m</span>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-[#0F766E] text-[11px]">+7m spare</span>
                      </div>

                      <div className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-4 w-4 text-[#8A5A00]" />
                          <div>
                            <span className="font-semibold text-[#14181D] block">Secondary Ring Road</span>
                            <span className="font-mono text-[11px] text-[#5B6672]">ETA 42m</span>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-[#8A5A00] text-[11px]">Plan B (Standby)</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'services' && (
                    <>
                      <div className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                        <div>
                          <span className="font-semibold text-[#14181D] block">GMC Hospital Emergency</span>
                          <span className="font-mono text-[11px] text-[#5B6672]">0.3 km away</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded border border-[#0F766E]/20">24×7</span>
                      </div>

                      <div className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                        <div>
                          <span className="font-semibold text-[#14181D] block">Sitabuldi Police Post</span>
                          <span className="font-mono text-[11px] text-[#5B6672]">0.5 km away</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded border border-[#0F766E]/20">24×7</span>
                      </div>

                      <div className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                        <div>
                          <span className="font-semibold text-[#14181D] block">Dharampeth 24h Pharmacy</span>
                          <span className="font-mono text-[11px] text-[#5B6672]">1.2 km away</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#8A5A00] bg-[#FBF1DC] px-2 py-0.5 rounded border border-[#8A5A00]/20">Open</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'alerts' && (
                    <>
                      <div className="h-14 px-4 flex items-center gap-3 text-xs hover:bg-[#F7F6F2]">
                        <Info className="h-4 w-4 text-[#1D5FA8] shrink-0" />
                        <div>
                          <span className="font-semibold text-[#14181D] block">Night Shift Monitoring Active</span>
                          <span className="font-mono text-[11px] text-[#5B6672]">AIIMS → Dharampeth corridor</span>
                        </div>
                      </div>

                      <div className="h-14 px-4 flex items-center gap-3 text-xs hover:bg-[#F7F6F2]">
                        <ShieldAlert className="h-4 w-4 text-[#8A5A00] shrink-0" />
                        <div>
                          <span className="font-semibold text-[#14181D] block">Wardha Rd Sensor Verified</span>
                          <span className="font-mono text-[11px] text-[#5B6672]">Street lighting 88% active</span>
                        </div>
                      </div>

                      <div className="h-14 px-4 flex items-center gap-3 text-xs hover:bg-[#F7F6F2]">
                        <Clock className="h-4 w-4 text-[#5B6672] shrink-0" />
                        <div>
                          <span className="font-semibold text-[#14181D] block">Feeder N7 Scheduled</span>
                          <span className="font-mono text-[11px] text-[#5B6672]">Departure 02:45 AM</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom "View all" link */}
              <div className="p-4 border-t border-[#E2DED3] text-center bg-[#FFFFFF]">
                {activeTab === 'routes' && (
                  <a href="/planner" className="text-xs font-semibold text-[#12233A] hover:underline">
                    View all routes →
                  </a>
                )}
                {activeTab === 'services' && (
                  <a href="/services" className="text-xs font-semibold text-[#12233A] hover:underline">
                    View all services →
                  </a>
                )}
                {activeTab === 'alerts' && (
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-xs font-semibold text-[#12233A] hover:underline"
                  >
                    View all alerts ({alerts.length}) →
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Alerts Drawer */}
      <AlertsDrawer />
    </div>
  );
}
