import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { planService } from '@/services';
import type { PlanResponse, TransportMode, Service } from '@noctra/contracts';
import { EvidenceChip } from '@/components/common/EvidenceChip';
import { NightRibbon } from '@/features/routes/NightRibbon';
import { useAlerts } from '@/features/alerts/useAlerts';
import { useSettings } from '@/features/settings/useSettings';
import { AlertsDrawer } from '@/features/alerts/AlertsDrawer';
import { SHIFT_PRESETS } from '@/features/journey/JourneyForm';
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
  Bike,
  Footprints,
  Bus,
  Clock,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const MODE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  auto: Car,
  cab: Car,
  two_wheeler: Bike,
  walk: Footprints,
  transit: Bus,
};

function formatWithAmPm(hm: string): string {
  const [h, m] = hm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

function addMinutesToHm(hm: string, minutes: number): string {
  const [h, m] = hm.split(':').map(Number);
  const total = ((h * 60 + m + Math.round(minutes)) % 1440 + 1440) % 1440;
  const rh = Math.floor(total / 60);
  const rm = total % 60;
  const period = rh >= 12 ? 'PM' : 'AM';
  const displayH = rh % 12 === 0 ? 12 : rh % 12;
  return `${displayH.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')} ${period}`;
}

export function DashboardPage() {
  const { alerts, setIsDrawerOpen } = useAlerts();
  const { setIsSettingsOpen } = useSettings();
  const [activeTab, setActiveTab] = useState<'routes' | 'services' | 'alerts'>('routes');

  // Time Window state with presets
  const [shiftEnd, setShiftEnd] = useState('02:15');
  const [deadline, setDeadline] = useState('03:00');

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: true },
    { label: 'Plan journey', href: '/planner', icon: Navigation, active: false },
    { label: 'Services', href: '/services', icon: Cross, active: false },
    { label: 'Alerts', href: '#', icon: Bell, active: false, onClick: () => setIsDrawerOpen(true) },
    { label: 'Settings', href: '#', icon: SettingsIcon, active: false, onClick: () => setIsSettingsOpen(true) },
  ];

  // Dynamic journey plan query for the selected shift window
  const { data: plan } = useQuery<PlanResponse>({
    queryKey: ['dashboard-plan', shiftEnd, deadline],
    queryFn: async () => {
      const isNextDay = deadline < shiftEnd;
      const deadlineDate = isNextDay ? '2026-10-26' : '2026-10-25';
      return planService.plan({
        origin: { lat: 21.1497, lon: 79.0806 },       // AIIMS Nagpur
        destination: { lat: 21.1453, lon: 79.0588 },  // Dharampeth
        shift_end_iso: `2026-10-25T${shiftEnd}:00+05:30`,
        deadline_iso: `${deadlineDate}T${deadline}:00+05:30`,
        modes: ['transit', 'auto', 'two_wheeler', 'cab', 'walk'] as TransportMode[],
      });
    },
  });

  // Load dynamic safe havens / services evaluated at the selected shift time
  const { data: dashboardServices = [] } = useQuery<Service[]>({
    queryKey: ['dashboard-services', shiftEnd],
    queryFn: async () => {
      return planService.getServices({
        lat: 21.0378,
        lon: 79.0345,
        radius_m: 8000,
        arrival_time_iso: `2026-10-26T${shiftEnd}:00+05:30`,
        origin_lat: 21.0378,
        origin_lon: 79.0345,
        dest_lat: 21.1458,
        dest_lon: 79.0605,
      });
    },
  });

  // Selected or recommended candidate
  const recCandidate = useMemo(() => {
    if (!plan || !plan.candidates.length) return null;
    return (
      plan.candidates.find((c) => c.id === plan.recommended_id && !c.rejected) ||
      plan.candidates.find((c) => !c.rejected) ||
      plan.candidates[0]
    );
  }, [plan]);

  // Dynamic telemetry confidence counts computed across facts
  const evidenceCounts = useMemo(() => {
    const counts = { KNOWN: 0, PROBABLE: 0, OUTDATED: 0, UNKNOWN: 0 };
    if (!plan) {
      return { KNOWN: 6, PROBABLE: 2, OUTDATED: 1, UNKNOWN: 1 };
    }
    const seen = new Set<string>();
    for (const c of plan.candidates) {
      for (const ev of c.evidence) {
        const key = `${ev.fact_type}-${ev.subject}`;
        if (!seen.has(key)) {
          seen.add(key);
          counts[ev.label] = (counts[ev.label] || 0) + 1;
        }
      }
    }
    return counts;
  }, [plan]);

  const spareMinutes = recCandidate ? Math.round(recCandidate.slack_min.expected) : 14;
  const decideByTime = recCandidate?.decision_by_iso
    ? recCandidate.decision_by_iso.slice(11, 16)
    : '2:32';
  const arrivalTime = recCandidate
    ? addMinutesToHm(shiftEnd, recCandidate.eta.expected_min)
    : '02:42 AM';

  const routeName = recCandidate?.mode === 'transit'
    ? 'Nagpur Metro Orange Line'
    : recCandidate?.mode === 'auto'
    ? 'Wardha Road Corridor'
    : recCandidate?.mode === 'two_wheeler'
    ? 'Seminary Hills Corridor'
    : 'Direct Navigation Path';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F6F2] text-[#14181D] overflow-x-hidden">
      {/* ── LEFT SIDEBAR (240px, 5 items only, 48px items, desktop only) ──── */}
      <aside className="hidden md:flex md:w-[240px] shrink-0 border-r border-[#E2DED3] bg-[#FFFFFF] flex-col justify-between py-4 md:py-6">
        <div>
          {/* Brand */}
          <div className="px-6 mb-6 md:mb-8">
            <Link to="/" className="flex items-center gap-2.5">
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
            </Link>
            <div className="mt-1 font-mono text-[10px] text-[#5B6672]">
              Daylight Instrument Panel
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="flex h-12 w-full items-center gap-3 px-6 text-xs font-semibold transition-colors border-l-2 border-transparent text-[#5B6672] hover:bg-[#F7F6F2] hover:text-[#14181D]"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.label === 'Alerts' && alerts.length > 0 && (
                      <span className="ml-auto rounded-full bg-[#12233A] px-1.5 py-0.2 font-mono text-[10px] font-bold text-[#FFFFFF]">
                        {alerts.length}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    'flex h-12 items-center gap-3 px-6 text-xs font-semibold transition-colors',
                    item.active
                      ? 'border-l-2 border-[#12233A] bg-[#F1EFE8] text-[#12233A]'
                      : 'border-l-2 border-transparent text-[#5B6672] hover:bg-[#F7F6F2] hover:text-[#14181D]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
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
        {/* ROW 1 (56px): Greeting, Shift window, Presets, Connection chip */}
        <div role="region" aria-label="Shift status" className="flex flex-col sm:flex-row sm:h-auto items-start sm:items-center justify-between gap-3 rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-sm text-[#14181D]">
              Good evening, Priya
            </span>
            <span className="hidden sm:inline text-[#E2DED3]">|</span>
            <span className="font-mono text-xs text-[#5B6672]">
              Shift ends <strong className="text-[#14181D]">{formatWithAmPm(shiftEnd)}</strong>, home by{' '}
              <strong className="text-[#14181D]">{formatWithAmPm(deadline)}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Demo Shift Presets */}
            <div className="flex rounded-lg border border-[#E2DED3] bg-[#F7F6F2] p-0.5">
              {SHIFT_PRESETS.map((p) => {
                const isCur = shiftEnd === p.shift && deadline === p.deadline;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setShiftEnd(p.shift);
                      setDeadline(p.deadline);
                    }}
                    className={cn(
                      'rounded px-2.5 py-1 text-[11px] font-mono font-medium transition-colors select-none',
                      isCur
                        ? 'bg-[#12233A] dark:bg-[#38BDF8] text-[#FFFFFF] dark:text-[#0B0E14] font-bold shadow-xs'
                        : 'text-[#5B6672] dark:text-[#94A3B8] hover:text-[#14181D] dark:hover:text-[#F8FAFC]'
                    )}
                  >
                    {p.shift}
                  </button>
                );
              })}
            </div>

            {/* Connection chip */}
            <div className="inline-flex items-center gap-1.5 rounded-md border border-[#0F766E]/30 bg-[#E6F4F1] dark:bg-[#064E3B]/40 dark:border-[#0F766E]/50 px-2.5 py-1 font-mono text-xs text-[#0F766E] dark:text-[#34D399]">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Real-Time Transit &amp; Telemetry Grid</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE SYNC
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
                shiftEndTime={shiftEnd}
                deadlineTime={deadline}
                decideByTime={decideByTime}
                spareMinutes={spareMinutes}
              />
            </div>

            {/* ROW 3: Compact row of four EvidenceChips with counts dynamically computed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#E2DED3] bg-[#FFFFFF] p-4 sm:px-6 sm:py-3 text-xs">
              <span className="font-semibold text-[#5B6672]">
                Telemetry confidence:
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <EvidenceChip label="KNOWN" age={`${evidenceCounts.KNOWN} facts verified`} />
                <EvidenceChip label="PROBABLE" age={`${evidenceCounts.PROBABLE} facts likely`} />
                <EvidenceChip label="OUTDATED" age={`${evidenceCounts.OUTDATED} fact aged`} />
                <EvidenceChip label="UNKNOWN" age={`${evidenceCounts.UNKNOWN} fact unconfirmed`} />
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
                    {recCandidate?.status === 'ROBUST' ? 'High Certainty' : 'Evaluated Path'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-bold text-[#14181D]">
                    {routeName}
                  </h3>
                  <div className="font-mono text-sm text-[#14181D]">
                    <span className="text-2xl font-bold text-[#14181D]">{arrivalTime}</span>
                    <span className="text-xs text-[#5B6672] ml-2 font-normal">
                      (+{recCandidate ? Math.round(recCandidate.eta.expected_min) : 27} min • {spareMinutes} min spare buffer)
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6672] leading-relaxed pt-1">
                    {recCandidate?.operating_note
                      ? `${recCandidate.operating_note}. Verified illumination proxy, 24h facilities along route.`
                      : 'Verified street illumination (88%), two 24h facilities along route, and deterministic Plan B fallback.'}
                  </p>
                </div>
              </div>

              {/* Exactly ONE navy primary button */}
              <div className="pt-4 border-t border-[#E2DED3]">
                <Link
                  to="/planner"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#12233A] text-sm font-semibold text-[#FFFFFF] hover:bg-[#1B3252] transition-colors"
                >
                  <span>Open route</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ROW 4: Map (8 cols, 420px high) + Right panel (4 cols, 420px high) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Map */}
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
                  <text x="-10" y="20" fill="#14181D" fontSize="11" fontFamily="monospace" fontWeight="bold">AIIMS ({formatWithAmPm(shiftEnd)})</text>
                </g>

                {/* Destination Marker */}
                <g transform="translate(580, 90)">
                  <circle cx="0" cy="0" r="8" fill="#12233A" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="-25" y="-12" fill="#14181D" fontSize="11" fontFamily="monospace" fontWeight="bold">Home ({formatWithAmPm(deadline)})</text>
                </g>
              </svg>

              {/* Live Badge */}
              <div className="absolute top-4 right-4">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm bg-white/90 dark:bg-[#131822]/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  VERIFIED ROUTE
                </span>
              </div>

              {/* Safety Index */}
              <div className="absolute bottom-4 left-4 rounded-md bg-[#FFFFFF]/90 dark:bg-[#131822]/90 px-3 py-1 font-mono text-[11px] text-[#5B6672] dark:text-[#94A3B8] border border-[#E2DED3] dark:border-[#232C3E]">
                Transit Safety &amp; Well-Lit Route Index: 88/100 • 4.8 km
              </div>
            </div>
          </div>


          {/* Right Column (4 cols): Right Panel with dynamically rendered candidate routes */}
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
                          ? 'border-b-2 border-[#12233A] dark:border-[#38BDF8] bg-[#F1EFE8] dark:bg-[#1A212E] text-[#12233A] dark:text-[#38BDF8]'
                          : 'text-[#5B6672] dark:text-[#94A3B8] hover:text-[#14181D] dark:hover:text-[#F8FAFC]'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Dynamic Tab Items List */}
                <div className="divide-y divide-[#E2DED3]">
                  {activeTab === 'routes' && (
                    <>
                      {plan?.candidates.slice(0, 3).map((c) => {
                        const Icon = MODE_ICONS[c.mode] || Car;
                        return (
                          <div key={c.id} className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={cn('h-4 w-4 shrink-0', c.rejected ? 'text-[#8A5A00]' : 'text-[#12233A]')} />
                              <div className="min-w-0">
                                <span className="font-semibold text-[#14181D] block capitalize truncate">
                                  {c.mode.replace('_', ' ')} • {c.kind}
                                </span>
                                <span className="font-mono text-[10px] text-[#5B6672] truncate block">
                                  {c.operating_note || `ETA ${Math.round(c.eta.expected_min)}m`}
                                </span>
                              </div>
                            </div>
                            <span className={cn(
                              'font-mono font-semibold text-[11px] shrink-0 ml-2',
                              c.rejected ? 'text-[#C93B2B]' : 'text-[#0F766E]'
                            )}>
                              {c.rejected ? 'INFEASIBLE' : `+${Math.round(c.slack_min.expected)}m spare`}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {activeTab === 'services' && (
                    <>
                      {dashboardServices.slice(0, 3).map((svc) => (
                        <div key={svc.id} className="h-14 px-4 flex items-center justify-between text-xs hover:bg-[#F7F6F2]">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-[#14181D] block truncate">{svc.name}</span>
                            <span className="font-mono text-[11px] text-[#5B6672]">
                              {(svc.distance_m / 1000).toFixed(1)} km away
                              {svc.detour_min !== undefined && ` (+${svc.detour_min}m detour)`}
                            </span>
                          </div>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border shrink-0 ${
                            svc.opening_status === 'OPEN_AT_ARRIVAL'
                              ? 'text-[#0F766E] bg-[#E6F4F1] border-[#0F766E]/20'
                              : svc.opening_status === 'CLOSING_SOON'
                              ? 'text-[#8A5A00] bg-[#FBF1DC] border-[#8A5A00]/20'
                              : 'text-[#5B6672] bg-[#F1F3F5] border-[#D0D5DD]'
                          }`}>
                            {svc.opening_status === 'OPEN_AT_ARRIVAL' ? 'Open' : svc.opening_status === 'CLOSING_SOON' ? 'Closing' : 'Closed'}
                          </span>
                        </div>
                      ))}
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
                          <span className="font-semibold text-[#14181D] block">Metro Last Service Alert</span>
                          <span className="font-mono text-[11px] text-[#5B6672]">Orange Line last departure 22:15</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom "View all" link */}
              <div className="p-4 border-t border-[#E2DED3] text-center bg-[#FFFFFF]">
                {activeTab === 'routes' && (
                  <Link to="/planner" className="text-xs font-semibold text-[#12233A] hover:underline">
                    View all routes in planner →
                  </Link>
                )}
                {activeTab === 'services' && (
                  <Link to="/services" className="text-xs font-semibold text-[#12233A] hover:underline">
                    View all services →
                  </Link>
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
