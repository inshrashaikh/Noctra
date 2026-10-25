import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { planService } from '@/services';
import type { Service, Evidence, NeedType, ServiceKind } from '@noctra/contracts';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { EvidenceDrawer } from '@/features/evidence/EvidenceDrawer';
import {
  ShieldAlert,
  Cross,
  Pill,
  Fuel,
  Search,
  Clock,
  MapPin,
  Utensils,
  Coffee,
  Droplet,
  Home,
  Landmark,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const KIND_CONFIG: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }> }
> = {
  hospital: { label: 'Hospital & Emergency', icon: Cross },
  pharmacy: { label: '24h Pharmacy', icon: Pill },
  police: { label: 'Police Assistance Booth', icon: ShieldAlert },
  fuel: { label: 'Fuel / EV Charging', icon: Fuel },
  restaurant: { label: 'Restaurant & Dining', icon: Utensils },
  dhaba: { label: 'All-Night Highway Dhaba', icon: Utensils },
  chai_stall: { label: 'Chai & Dawn Breakfast Stall', icon: Coffee },
  canteen_24h: { label: '24×7 In-Campus Canteen', icon: Coffee },
  water: { label: '24h Safe Drinking Water', icon: Droplet },
  shelter: { label: 'Night Safe Haven / Shelter', icon: Home },
  atm: { label: 'Guarded 24h ATM Lobby', icon: Landmark },
};

const NEED_PRESETS: { id: NeedType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Needs' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'food', label: 'Food / Dhaba' },
  { id: 'fuel', label: 'Fuel / EV' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'water', label: 'Water' },
  { id: 'cash', label: 'Cash / ATM' },
];

const SHIFT_PRESETS = [
  {
    id: 'evening',
    label: 'Evening (22:00)',
    time: '22:00',
    iso: '2026-10-25T22:00:00+05:30',
    deadline: '2026-10-25T23:00:00+05:30',
  },
  {
    id: 'midnight',
    label: 'Midnight (00:00)',
    time: '00:00',
    iso: '2026-10-26T00:00:00+05:30',
    deadline: '2026-10-26T01:00:00+05:30',
  },
  {
    id: 'night_shift',
    label: '2:30 AM (Night Shift)',
    time: '02:30',
    iso: '2026-10-26T02:30:00+05:30',
    deadline: '2026-10-26T03:30:00+05:30',
  },
  {
    id: 'early_dawn',
    label: 'Early Dawn (04:45)',
    time: '04:45',
    iso: '2026-10-26T04:45:00+05:30',
    deadline: '2026-10-26T05:45:00+05:30',
  },
];

export function ServicesPage() {
  const [selectedNeed, setSelectedNeed] = useState<NeedType | 'all'>('all');
  const [selectedKind, setSelectedKind] = useState<ServiceKind | 'all'>('all');
  const [selectedShiftPreset, setSelectedShiftPreset] = useState(SHIFT_PRESETS[2]); // Default 2:30 AM
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: [
      'services',
      selectedShiftPreset.iso,
      selectedNeed,
      selectedKind,
      selectedShiftPreset.deadline,
    ],
    queryFn: async () => {
      return planService.getServices({
        lat: 21.0944,
        lon: 79.0558,
        radius_m: 8000,
        need: selectedNeed !== 'all' ? selectedNeed : undefined,
        kinds: selectedKind !== 'all' ? [selectedKind] : undefined,
        arrival_time_iso: selectedShiftPreset.iso,
        deadline_iso: selectedShiftPreset.deadline,
        origin_lat: 21.0378,
        origin_lon: 79.0345,
        dest_lat: 21.1458,
        dest_lon: 79.0605,
      });
    },
  });

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kind.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVerified = !verifiedOnly || s.verified_hours;
      return matchesSearch && matchesVerified;
    });
  }, [services, searchQuery, verifiedOnly]);

  const openCount = filteredServices.filter(
    (s) => s.opening_status === 'OPEN_AT_ARRIVAL' || s.opening_status === 'CLOSING_SOON'
  ).length;

  return (
    <div className="flex flex-1 flex-col bg-noctra-bg text-noctra-text">
      {/* Page Header */}
      <section className="border-b border-noctra-border bg-noctra-surface py-6">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-noctra-text">
                  Essential Night Services Finder
                </h1>
                <SimulatedBadge size="sm" />
              </div>
              <p className="mt-1 text-xs text-noctra-muted max-w-2xl">
                Evaluates opening hours at your exact expected arrival time along the AIIMS → Dharampeth corridor.
                Environmental risk proxy (not crime data).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-noctra-accent font-semibold">
                {openCount} open at {selectedShiftPreset.time}
              </span>
              <span className="text-xs text-noctra-muted font-mono">
                ({filteredServices.length} total)
              </span>
            </div>
          </div>

          {/* Time & Shift Presets */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-noctra-muted mr-1">
              Expected Arrival:
            </span>
            {SHIFT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedShiftPreset(preset)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-mono font-medium transition-colors border select-none',
                  selectedShiftPreset.id === preset.id
                    ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent font-semibold'
                    : 'border-noctra-border bg-noctra-raised text-noctra-muted hover:text-noctra-text'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Need Tabs */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-noctra-muted mr-1">
              Need:
            </span>
            {NEED_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedNeed(preset.id);
                  setSelectedKind('all');
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors border select-none',
                  selectedNeed === preset.id
                    ? 'bg-noctra-accent text-noctra-bg border-noctra-accent'
                    : 'bg-noctra-raised text-noctra-muted border-noctra-border hover:text-noctra-text'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Category Filter & Search Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-noctra-border/60">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'hospital', label: 'Hospitals' },
                { id: 'pharmacy', label: 'Pharmacies' },
                { id: 'police', label: 'Police' },
                { id: 'fuel', label: 'Fuel' },
                { id: 'dhaba', label: 'Dhabas' },
                { id: 'restaurant', label: 'Restaurants' },
                { id: 'chai_stall', label: 'Chai Stalls' },
                { id: 'water', label: 'Water' },
                { id: 'atm', label: 'ATMs' },
              ].map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedKind(category.id as ServiceKind | 'all')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors select-none',
                    selectedKind === category.id
                      ? 'bg-noctra-raised text-noctra-text border border-noctra-accent'
                      : 'text-noctra-muted hover:text-noctra-text border border-transparent'
                  )}
                >
                  {category.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ml-2 select-none flex items-center gap-1',
                  verifiedOnly
                    ? 'border-teal-500 bg-teal-500/15 text-teal-400 font-semibold'
                    : 'border-noctra-border text-noctra-muted hover:text-noctra-text'
                )}
              >
                <Sparkles className="h-3 w-3" />
                Verified Hours Only
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-noctra-muted" />
              <input
                type="text"
                placeholder="Filter services by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-noctra-border bg-noctra-bg pl-8 pr-3 text-xs text-noctra-text placeholder:text-noctra-dim focus:border-noctra-accent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <div className="mx-auto flex-1 w-full max-w-[1280px] px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-noctra-muted font-mono">
            Evaluating arrival-time opening hours across Nagpur corridor...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-xl border border-noctra-border bg-noctra-surface p-8 text-center max-w-lg mx-auto space-y-2">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />
            <h3 className="text-sm font-bold text-noctra-text">
              No sufficiently supported options found
            </h3>
            <p className="text-xs text-noctra-muted">
              At {selectedShiftPreset.time}, no services matched your current filters within reachable radius.
              Try selecting another shift time or clearing filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const kindInfo = KIND_CONFIG[service.kind] || {
                label: service.kind,
                icon: MapPin,
              };
              const Icon = kindInfo.icon;
              const status = service.opening_status || 'UNKNOWN';

              const statusBadgeConfig = {
                OPEN_AT_ARRIVAL: {
                  text: service.open_until ? `Open until ${service.open_until}` : 'Open at Arrival',
                  classes: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
                },
                CLOSING_SOON: {
                  text: service.opening_note || 'Closing Soon',
                  classes: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
                },
                OPENS_LATER: {
                  text: service.opens_at ? `Opens at ${service.opens_at}` : 'Opens Later',
                  classes: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
                },
                CLOSED_AT_ARRIVAL: {
                  text: 'Closed at Arrival',
                  classes: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
                },
                UNKNOWN: {
                  text: 'Hours Unknown',
                  classes: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
                },
              }[status];

              return (
                <div
                  key={service.id}
                  className={cn(
                    'flex flex-col justify-between rounded-lg border border-noctra-border bg-noctra-surface p-4 space-y-3 transition-colors',
                    service.deadline_feasible === false && 'border-rose-500/30 bg-rose-950/10'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-noctra-muted">
                        <Icon className="h-3.5 w-3.5 text-noctra-accent" />
                        <span>{kindInfo.label}</span>
                      </div>
                      <span className="font-mono text-[10px] text-noctra-muted">
                        {(service.distance_m / 1000).toFixed(1)} km away
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-noctra-text">
                        {service.name}
                      </h3>
                      {service.verified_hours && (
                        <span className="rounded bg-teal-500/10 border border-teal-500/30 px-1 py-0.2 text-[9px] font-mono text-teal-400">
                          VERIFIED
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-noctra-muted line-clamp-2">
                      {service.why_ranked || service.source}
                    </p>

                    {/* Detour and Slack */}
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
                      {service.detour_min !== undefined && (
                        <span className="text-noctra-muted">
                          Detour: +{service.detour_min}m
                        </span>
                      )}
                      {service.slack_impact_min !== undefined && (
                        <span
                          className={cn(
                            'font-semibold flex items-center gap-1',
                            service.deadline_feasible === false
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          )}
                        >
                          {service.deadline_feasible === false && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          Slack: {service.slack_impact_min}m
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-noctra-border/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      {/* Arrival Status Badge */}
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-mono font-medium border',
                          statusBadgeConfig.classes
                        )}
                      >
                        {statusBadgeConfig.text}
                      </span>

                      {/* Scheduled Raw Hours */}
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-noctra-muted">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{service.hours_label || '24×7'}</span>
                      </span>
                    </div>

                    {/* Separate Listing & Opening Evidence */}
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-noctra-muted border-t border-noctra-border/40">
                      <button
                        type="button"
                        onClick={() => setSelectedEvidence(service.listing_evidence!)}
                        className="hover:text-noctra-accent transition-colors underline decoration-dotted flex items-center gap-1"
                      >
                        <span>Listing:</span>
                        <span className="font-semibold text-noctra-text">
                          {service.listing_evidence?.label || service.label}
                        </span>
                      </button>

                      {service.opening_evidence && (
                        <button
                          type="button"
                          onClick={() => setSelectedEvidence(service.opening_evidence!)}
                          className="hover:text-noctra-accent transition-colors underline decoration-dotted flex items-center gap-1"
                        >
                          <span>Hours:</span>
                          <span
                            className={cn(
                              'font-semibold',
                              service.opening_evidence.label === 'KNOWN'
                                ? 'text-noctra-known'
                                : service.opening_evidence.label === 'PROBABLE'
                                ? 'text-noctra-probable'
                                : 'text-noctra-unknown'
                            )}
                          >
                            {service.opening_evidence.label}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evidence Provenance Modal */}
      <EvidenceDrawer
        isOpen={Boolean(selectedEvidence)}
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}
