import { useState } from 'react';
import type { Candidate } from '@noctra/contracts';
import {
  ChevronDown,
  Navigation,
  AlertTriangle,
  Clock,
  ArrowRight,
  Car,
  Bike,
  Footprints,
  Bus,
  LifeBuoy,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface RouteStageTimelineProps {
  candidate: Candidate;
  shiftEndTime?: string;
  deadlineTime?: string;
}

const LEG_MODE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  auto: Car,
  cab: Car,
  two_wheeler: Bike,
  walk: Footprints,
  transit: Bus,
};

export function RouteStageTimeline({
  candidate,
  shiftEndTime: _shiftEndTime = '02:15',
  deadlineTime = '03:00',
}: RouteStageTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const legs = candidate.legs || [];
  const strandingPoints = candidate.stranding_points || [];
  const recoveryOptions = candidate.recovery_options || [];

  return (
    <div className="rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-noctra-accent" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-noctra-text">
            Physical Multi-Leg Journey & Stranding Analysis
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-noctra-muted hover:text-noctra-text p-1"
          aria-label="Toggle waypoint details"
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      <p className="text-[11px] text-noctra-muted">
        Deterministic physical legs, connection wait buffers, lighting conditions, and stranding thresholds before deadline {deadlineTime}.
      </p>

      {/* Decide-By Rationale Banner */}
      {candidate.decide_by_rationale && candidate.decision_by_iso && (
        <div className="flex items-start gap-2.5 rounded-lg border border-noctra-accent/40 bg-noctra-accent/10 p-2.5 text-xs text-noctra-text">
          <Clock className="h-4 w-4 text-noctra-accent shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-noctra-accent">Decision Point Gateway: </span>
            <span>{candidate.decide_by_rationale}</span>
          </div>
        </div>
      )}

      {/* Stranding Warnings Callout */}
      {strandingPoints.length > 0 && (
        <div className="space-y-2">
          {strandingPoints.map((sp, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded-lg border border-noctra-at-risk/40 bg-noctra-at-risk/10 p-2.5 text-xs text-noctra-text"
            >
              <AlertTriangle className="h-4 w-4 text-noctra-at-risk shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-noctra-at-risk uppercase tracking-wider text-[10px]">
                    Stranding Risk Point: {sp.node_name}
                  </span>
                  {sp.missed_deadline_min > 0 && (
                    <span className="font-mono text-[10px] bg-noctra-infeasible/20 text-noctra-infeasible px-1.5 py-0.2 rounded border border-noctra-infeasible/30">
                      +{Math.round(sp.missed_deadline_min)}m past deadline
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-noctra-muted">{sp.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Multi-Leg Timeline */}
      {isExpanded && legs.length > 0 && (
        <div className="relative pl-6 space-y-4 pt-2 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-noctra-border">
          {legs.map((leg, idx) => {
            const LegIcon = LEG_MODE_ICONS[leg.mode] || Car;
            const isEnded = leg.operating_status === 'ENDED';
            const isUnknown = leg.operating_status === 'UNKNOWN_AVAILABILITY';

            return (
              <div key={idx} className="relative group">
                {/* Dot / Icon */}
                <span
                  className={cn(
                    'absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[9px] font-bold',
                    isEnded
                      ? 'border-noctra-infeasible bg-noctra-infeasible text-white'
                      : leg.is_critical
                      ? 'border-noctra-accent bg-noctra-raised text-noctra-accent'
                      : 'border-noctra-border bg-noctra-surface text-noctra-muted'
                  )}
                >
                  {idx + 1}
                </span>

                <div className="rounded-lg border border-noctra-border/60 bg-noctra-surface/70 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LegIcon className="h-4 w-4 text-noctra-accent" />
                      <span className="font-bold text-xs text-noctra-text">
                        {leg.service_name}
                      </span>
                      {leg.is_critical && (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-noctra-accent/15 text-noctra-accent font-semibold border border-noctra-accent/30">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-noctra-accent font-semibold">{leg.depart_time_hm}</span>
                      <ArrowRight className="h-3 w-3 text-noctra-muted" />
                      <span className="text-noctra-text font-semibold">{leg.arrive_time_hm}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-noctra-muted flex items-center justify-between">
                    <span>{leg.origin_name} &rarr; {leg.destination_name}</span>
                    <span className="font-mono">
                      {(leg.distance_m / 1000).toFixed(1)} km · {leg.transit_duration_min.expected_min}m
                      {leg.wait_min > 0 ? ` (+${leg.wait_min}m wait)` : ''}
                    </span>
                  </div>

                  {/* Safety & Refuge details */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-noctra-border/40 text-[10px]">
                    <div className="text-noctra-muted">
                      <span className="font-semibold text-noctra-text">Lighting: </span>
                      {leg.lighting_quality || 'Standard street illumination'}
                    </div>
                    <div className="text-noctra-muted">
                      <span className="font-semibold text-noctra-text">Refuge: </span>
                      {leg.refuge_nearby || 'On-corridor lit points'}
                    </div>
                  </div>

                  {/* Operating status callout */}
                  {isEnded && (
                    <div className="text-[10px] text-noctra-infeasible font-mono font-semibold bg-noctra-infeasible/10 p-1.5 rounded border border-noctra-infeasible/20">
                      Service closed overnight. Next departure at 06:00 AM.
                    </div>
                  )}
                  {isUnknown && (
                    <div className="text-[10px] text-noctra-unknown font-mono bg-noctra-unknown/10 p-1.5 rounded border border-noctra-unknown/20">
                      Unmonitored driver dispatch telemetry. Acceptance not guaranteed.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recovery Options Strip */}
      {recoveryOptions.length > 0 && (
        <div className="pt-2 border-t border-noctra-border/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-noctra-text">
            <LifeBuoy className="h-3.5 w-3.5 text-noctra-accent" />
            <span>Supported Recovery Options (Plan B Actions)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recoveryOptions.map((opt) => (
              <div
                key={opt.id}
                className="rounded-lg border border-noctra-border bg-noctra-raised p-2.5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-noctra-text">{opt.title}</span>
                  <span className="font-mono text-[10px] text-noctra-accent">
                    Trigger: {opt.trigger_time_hm}
                  </span>
                </div>
                <p className="text-[11px] text-noctra-muted">{opt.description}</p>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-noctra-muted border-t border-noctra-border/40">
                  <span>Arrives: {opt.arrival_time_hm}</span>
                  <span className={opt.extra_cost_inr > 0 ? 'text-noctra-text' : 'text-noctra-known'}>
                    {opt.extra_cost_inr !== 0 ? `+₹${opt.extra_cost_inr}` : 'Free safe haven'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
