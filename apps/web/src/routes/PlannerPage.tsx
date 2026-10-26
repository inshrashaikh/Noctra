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

export function PlannerPage() {
  const isDemo = typeof window !== 'undefined' && window.location.search.includes('demo=1');
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
    <div className="flex flex-1 flex-col w-full bg-noctra-bg">
      {/* Planner Sub-header / Constraints Strip */}
      <div className="border-b border-noctra-border bg-noctra-surface/80 backdrop-blur-sm px-4 sm:px-6 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 font-medium text-xs text-noctra-text">
              <span className="text-noctra-muted font-normal">Active Shift Window:</span>
              <span className="font-mono text-noctra-accent font-bold px-2 py-0.5 rounded bg-noctra-accent/10 border border-noctra-accent/20">
                {formData.shiftEndTime} &rarr; {formData.deadlineTime}
              </span>
              <span className="text-[11px] font-mono text-noctra-muted hidden sm:inline">IST (+05:30)</span>
            </div>
            {selectedCandidate?.plan_b && selectedCandidate.decision_by_iso && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="h-3 w-3" />
                <span>Decide by {selectedCandidate.decision_by_iso.slice(11, 16)} before fallback</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SimulatedBadge size="sm" />
          </div>
        </div>
      </div>

      {/* Main Content Area: Unified Clean Layout with Compact Map Block */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Journey Constraints, Form & Alerts */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Journey Form Card */}
            <div className="rounded-2xl border border-noctra-border bg-noctra-surface p-4 sm:p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-noctra-text flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-noctra-accent" />
                  Shift Travel Constraints
                </h2>
                <span className="text-[10px] font-mono text-noctra-muted">Nagpur Night Grid</span>
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
            </div>

            {/* Situational Alerts Card */}
            <div className="rounded-2xl border border-noctra-border bg-noctra-surface p-4 sm:p-5 shadow-sm">
              <AlertCenter />
            </div>

            {/* En-route Services (shown here on desktop) */}
            <div className="hidden lg:block">
              <ServicesPanel services={services} />
            </div>
          </div>

          {/* Right Column: Compact Map Block, Route Cards & Safety Insights */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
            
            {/* 🗺️ Compact Map Card Block */}
            <div className="rounded-2xl border border-noctra-border bg-noctra-surface overflow-hidden shadow-sm">
              {/* Night Ribbon at top of Map */}
              <div className="p-3 sm:p-4 border-b border-noctra-border bg-noctra-surface">
                <NightRibbon
                  candidate={selectedCandidate}
                  shiftEndTime={formData.shiftEndTime}
                  deadlineTime={formData.deadlineTime}
                />
              </div>

              {/* Compact Map View */}
              <div className="relative h-[280px] sm:h-[340px] md:h-[380px] w-full bg-noctra-bg">
                <MapView
                  candidates={plan?.candidates || []}
                  selectedId={selectedRouteId}
                  services={services}
                  origin={{ lat: formData.originLat, lon: formData.originLon }}
                  destination={{ lat: formData.destinationLat, lon: formData.destinationLon }}
                  onMapClick={handleMapClick}
                />

                {pickMode !== 'none' && (
                  <div className="absolute top-3 left-3 right-3 z-20 rounded-lg bg-noctra-accent p-2.5 text-center text-xs font-semibold text-noctra-bg border border-noctra-border shadow-lg">
                    Click anywhere on the map to set your {pickMode.toUpperCase()} location
                  </div>
                )}
              </div>
            </div>

            {/* Loading & Error States */}
            {isLoading && <LoadingState count={3} />}

            {isError && (
              <ErrorState
                error={error as Error}
                onRetry={() => refetch()}
              />
            )}

            {/* Results Section */}
            {plan && !isLoading && (
              <>
                {/* Route Candidate List */}
                <RouteList candidates={plan.candidates} />

                {/* En-Route Waypoint Safety Timeline for Selected Candidate */}
                {selectedCandidate && (
                  <div className="rounded-2xl border border-noctra-border bg-noctra-surface p-4 sm:p-5 shadow-sm">
                    <RouteStageTimeline
                      candidate={selectedCandidate}
                      shiftEndTime={formData.shiftEndTime}
                      deadlineTime={formData.deadlineTime}
                    />
                  </div>
                )}

                {/* Freshness Audit Meter */}
                <div className="rounded-2xl border border-noctra-border bg-noctra-surface p-4 sm:p-5 shadow-sm">
                  <FreshnessMeter evidenceList={allEvidence} />
                </div>

                {/* Selected Candidate Claims / Evidence Chips */}
                {selectedCandidate && (
                  <div className="rounded-2xl border border-noctra-border bg-noctra-surface p-4 sm:p-5 space-y-3 shadow-sm">
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
                <div className="rounded-2xl border border-noctra-border bg-noctra-surface p-4 sm:p-5 shadow-sm">
                  <ExplanationPanel
                    explanation={plan.explanation}
                    missingInformation={plan.missing_information}
                  />
                </div>

                {/* En-route Services on Mobile (only below routes on mobile) */}
                <div className="block lg:hidden">
                  <ServicesPanel services={services} />
                </div>
              </>
            )}
          </div>
        </div>
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

