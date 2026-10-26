import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { planService } from '@/services';
import type { PlanResponse, Evidence, Service, Candidate } from '@noctra/contracts';
import { JourneyForm } from '@/features/journey/JourneyForm';
import { useJourneyStore, type JourneyFormData, DEFAULT_JOURNEY_VALUES } from '@/features/journey/useJourneyForm';
import { MapView } from '@/features/map/MapView';
import { RouteList } from '@/features/routes/RouteList';
import { NightRibbon } from '@/features/routes/NightRibbon';
import { RouteStageTimeline } from '@/features/routes/RouteStageTimeline';
import { useRouteSelection } from '@/features/routes/useRouteSelection';
import { LiveTripModal } from '@/features/routes/LiveTripModal';

import { ServicesPanel } from '@/features/services/ServicesPanel';
import { FreshnessMeter } from '@/features/evidence/FreshnessMeter';
import { EvidenceDrawer } from '@/features/evidence/EvidenceDrawer';
import { EvidenceChip } from '@/features/evidence/EvidenceChip';
import { AlertCenter } from '@/features/alerts/AlertCenter';
import { useAlerts } from '@/features/alerts/useAlerts';
import { DemoPanel } from '@/features/demo/DemoPanel';
import { ExplanationPanel } from '@/features/routes/ExplanationPanel';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

export function PlannerPage() {
  const isDemo = typeof window !== 'undefined' && window.location.search.includes('demo=1');
  const [activeTabMobile, setActiveTabMobile] = useState<'routes' | 'map' | 'details'>('routes');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [activeTrip, setActiveTrip] = useState<Candidate | null>(null);

  const { selectedRouteId, setSelectedRouteId } = useRouteSelection();
  const { pickMode, setPickMode } = useJourneyStore();

  const [formData, setFormData] = useState<JourneyFormData>(DEFAULT_JOURNEY_VALUES);

  // Subscribe to real-time & live alerts
  useEffect(() => {
    const unsub = planService.subscribeAlerts((alert) => {
      useAlerts.getState().addAlert(alert);
    });
    return unsub;
  }, []);

  // Listen for navigation trip start
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Candidate>;
      if (customEvent.detail) {
        setActiveTrip(customEvent.detail);
      }
    };
    window.addEventListener('noctra:start-trip', handler);
    return () => window.removeEventListener('noctra:start-trip', handler);
  }, []);

  // Load plan query
  const {
    data: plan,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PlanResponse>({
    queryKey: ['plan', formData],
    queryFn: async () => {
      const isNextDay = formData.deadlineTime < formData.shiftEndTime;
      const deadlineDate = isNextDay ? '2026-10-26' : '2026-10-25';
      return planService.plan({
        origin: { lat: formData.originLat, lon: formData.originLon },
        destination: { lat: formData.destinationLat, lon: formData.destinationLon },
        shift_end_iso: `2026-10-25T${formData.shiftEndTime}:00+05:30`,
        deadline_iso: `${deadlineDate}T${formData.deadlineTime}:00+05:30`,
        modes: formData.modes,
      });
    },
  });

  // Load en-route services query evaluated against shift departure and corridor
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: [
      'services',
      formData.originLat,
      formData.originLon,
      formData.shiftEndTime,
      formData.deadlineTime,
      formData.destinationLat,
      formData.destinationLon,
    ],
    queryFn: async () => {
      const shiftDate = '2026-10-26';
      const deadlineDate = '2026-10-26';
      return planService.getServices({
        lat: formData.originLat,
        lon: formData.originLon,
        radius_m: 8000,
        arrival_time_iso: `${shiftDate}T${formData.shiftEndTime}:00+05:30`,
        deadline_iso: `${deadlineDate}T${formData.deadlineTime}:00+05:30`,
        origin_lat: formData.originLat,
        origin_lon: formData.originLon,
        dest_lat: formData.destinationLat,
        dest_lon: formData.destinationLon,
      });
    },
  });

  // Selected candidate object
  const selectedCandidate = useMemo(() => {
    if (!plan || !plan.candidates.length) return null;
    return (
      plan.candidates.find((c) => c.id === selectedRouteId) ||
      plan.candidates[0]
    );
  }, [plan, selectedRouteId]);

  // Sync selectedRouteId if not set
  useEffect(() => {
    if (plan && plan.candidates.length && !selectedRouteId) {
      setSelectedRouteId(plan.recommended_id || plan.candidates[0].id);
    }
  }, [plan, selectedRouteId, setSelectedRouteId]);

  // Collect all evidence across candidates for freshness audit
  const allEvidence = useMemo(() => {
    if (!plan) return [];
    const evMap = new Map<string, Evidence>();
    plan.candidates.forEach((c) => {
      c.evidence.forEach((e) => evMap.set(`${e.fact_type}-${e.subject}`, e));
    });
    return Array.from(evMap.values());
  }, [plan]);

  const handleMapClick = (lat: number, lon: number) => {
    if (pickMode === 'origin') {
      setFormData((prev: JourneyFormData) => ({
        ...prev,
        originLat: lat,
        originLon: lon,
        originAddress: `Pinned Origin (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      }));
      setPickMode('none');
    } else if (pickMode === 'destination') {
      setFormData((prev: JourneyFormData) => ({
        ...prev,
        destinationLat: lat,
        destinationLon: lon,
        destinationAddress: `Pinned Destination (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      }));
      setPickMode('none');
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full overflow-hidden bg-noctra-bg">
      {/* Planner Sub-header / Constraints Strip */}
      <div className="flex h-11 sm:h-12 shrink-0 items-center justify-between border-b border-noctra-border bg-noctra-surface px-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-noctra-text">
            <span className="text-noctra-muted">Shift:</span>
            <span className="font-mono text-noctra-accent font-bold">{formData.shiftEndTime}</span>
            <span className="text-noctra-muted">&rarr;</span>
            <span className="font-mono text-noctra-text font-bold">{formData.deadlineTime}</span>
          </div>
          {selectedCandidate?.plan_b && selectedCandidate.decision_by_iso && (
            <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-noctra-accent bg-noctra-raised px-2.5 py-1 rounded border border-noctra-border">
              <Clock className="h-3 w-3" />
              <span>Decide by {selectedCandidate.decision_by_iso.slice(11, 16)} before fallback</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile View Switcher */}
          <div className="flex rounded-lg border border-noctra-border bg-noctra-raised p-0.5 md:hidden">
            <button
              type="button"
              onClick={() => setActiveTabMobile('routes')}
              className={cn(
                'rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors',
                activeTabMobile === 'routes' ? 'bg-[#12233A] dark:bg-[#38BDF8] text-white dark:text-[#0B0E14]' : 'text-noctra-muted'
              )}
            >
              Routes
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMobile('map')}
              className={cn(
                'rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors',
                activeTabMobile === 'map' ? 'bg-[#12233A] dark:bg-[#38BDF8] text-white dark:text-[#0B0E14]' : 'text-noctra-muted'
              )}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMobile('details')}
              className={cn(
                'rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors',
                activeTabMobile === 'details' ? 'bg-[#12233A] dark:bg-[#38BDF8] text-white dark:text-[#0B0E14]' : 'text-noctra-muted'
              )}
            >
              Inputs
            </button>
          </div>
          <SimulatedBadge size="sm" />
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-12 min-h-0">
        {/* Left Column: Journey Form & Inputs (cols 1-3) */}
        <aside className={cn(
          'flex-col border-r border-noctra-border bg-noctra-surface/50 p-4 overflow-y-auto md:col-span-3',
          activeTabMobile === 'details' ? 'flex' : 'hidden md:flex'
        )}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-noctra-text">
              Shift Travel Constraints
            </h3>
            <span className="text-[10px] font-mono text-noctra-muted">IST (+05:30)</span>
          </div>

          <JourneyForm
            onSubmit={(data) => setFormData(data)}
            isLoading={isLoading}
          />

          {/* Interactive Demo Panel if ?demo=1 */}
          {isDemo && (
            <div className="mt-4 pt-4 border-t border-noctra-border">
              <DemoPanel onScenarioTriggered={() => refetch()} />
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-noctra-border">
            <AlertCenter />
          </div>
        </aside>

        {/* Center Column: Map & Night Ribbon (cols 4-8) */}
        <section className={cn(
          'relative flex flex-col overflow-hidden bg-noctra-bg md:col-span-5',
          activeTabMobile === 'map' ? 'flex' : 'hidden md:flex'
        )}>
          {/* Night Ribbon at top of Map */}
          <div className="p-3 border-b border-noctra-border/60 z-10 bg-noctra-bg/95">
            <NightRibbon
              candidate={selectedCandidate}
              shiftEndTime={formData.shiftEndTime}
              deadlineTime={formData.deadlineTime}
            />
          </div>

          {/* Interactive Map */}
          <div className="relative flex-1 min-h-[300px]">
            <MapView
              candidates={plan?.candidates || []}
              selectedId={selectedRouteId}
              services={services}
              origin={{ lat: formData.originLat, lon: formData.originLon }}
              destination={{ lat: formData.destinationLat, lon: formData.destinationLon }}
              onMapClick={handleMapClick}
            />

            {pickMode !== 'none' && (
              <div className="absolute top-4 left-4 right-4 z-20 rounded-md bg-noctra-accent p-2.5 text-center text-xs font-semibold text-noctra-bg border border-noctra-border">
                Click anywhere on the map to set your {pickMode.toUpperCase()} location
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Route Options, Evidence & Intelligence (cols 9-12) */}
        <aside className={cn(
          'flex-col border-l border-noctra-border bg-noctra-surface/40 p-4 overflow-y-auto space-y-4 md:col-span-4',
          activeTabMobile === 'routes' ? 'flex' : 'hidden md:flex'
        )}>
          {isLoading && <LoadingState count={3} />}

          {isError && (
            <ErrorState
              error={error as Error}
              onRetry={() => refetch()}
            />
          )}

          {plan && !isLoading && (
            <>
              {/* Route Candidate List */}
              <RouteList candidates={plan.candidates} />

              {/* En-Route Waypoint Safety Timeline for Selected Candidate */}
              {selectedCandidate && (
                <RouteStageTimeline
                  candidate={selectedCandidate}
                  shiftEndTime={formData.shiftEndTime}
                  deadlineTime={formData.deadlineTime}
                />
              )}

              {/* Freshness Audit Meter */}
              <FreshnessMeter evidenceList={allEvidence} />

              {/* Selected Candidate Claims / Evidence Chips */}
              {selectedCandidate && (
                <div className="rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-noctra-text">
                      Epistemic Evidence Base ({selectedCandidate.evidence.length})
                    </span>
                    <span className="text-[10px] text-noctra-muted">Click for provenance</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.evidence.map((ev, i) => (
                      <EvidenceChip
                        key={i}
                        evidence={ev}
                        onClick={() => setSelectedEvidence(ev)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Explanation Engine */}
              <ExplanationPanel
                explanation={plan.explanation}
                missingInformation={plan.missing_information}
              />

              {/* En-route Services */}
              <ServicesPanel services={services} />
            </>
          )}
        </aside>
      </div>

      {/* Slide-over Evidence Provenance Drawer */}
      <EvidenceDrawer
        evidence={selectedEvidence}
        isOpen={selectedEvidence !== null}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* Live Turn-by-Turn Navigation Modal */}
      <LiveTripModal
        candidate={activeTrip}
        onClose={() => setActiveTrip(null)}
      />
    </div>
  );
}

