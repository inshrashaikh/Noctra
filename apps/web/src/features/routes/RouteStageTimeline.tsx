import { useState } from 'react';
import type { Candidate } from '@noctra/contracts';
import {
  ChevronDown,
  Navigation,
  AlertTriangle,
  Clock,
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
  deadlineTime: _deadlineTime = '03:00',
}: RouteStageTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const legs = candidate.legs || [];
  const strandingPoints = candidate.stranding_points || [];
  const recoveryOptions = candidate.recovery_options || [];

  return (
    <div className="rounded-xl border border-noctra-border bg-noctra-surface p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 text-noctra-accent" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-noctra-text">
            Waypoints & Transfer Leg Timing
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-noctra-muted hover:text-noctra-text p-1 transition-colors"
          aria-label="Toggle waypoints details"
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      {/* Decide-By Rationale Pill */}
      {candidate.decide_by_rationale && candidate.decision_by_iso && (
        <div className="flex items-center gap-2 rounded-lg border border-noctra-accent/30 bg-noctra-accent/5 px-2.5 py-1.5 text-xs">
          <Clock className="h-3.5 w-3.5 text-noctra-accent shrink-0" />
          <span className="font-mono text-[11px] text-noctra-text">
            <strong className="text-noctra-accent">Decide by {candidate.decision_by_iso.slice(11, 16)}:</strong>{' '}
            {candidate.decide_by_rationale.split(':')[1]?.trim() || candidate.decide_by_rationale}
          </span>
        </div>
      )}

      {/* Stranding Warnings */}
      {strandingPoints.length > 0 && (
        <div className="space-y-1.5">
          {strandingPoints.map((sp, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">Stranding Risk at {sp.node_name}</span>
                  {sp.missed_deadline_min > 0 && (
                    <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 px-1.5 rounded">
                      +{Math.round(sp.missed_deadline_min)}m past deadline
                    </span>
                  )}
                </div>
                <p className="text-noctra-muted leading-tight">{sp.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clean Timeline Track */}
      {isExpanded && legs.length > 0 && (
        <div className="relative pl-5 space-y-3 pt-1 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-noctra-border">
          {legs.map((leg, idx) => {
            const LegIcon = LEG_MODE_ICONS[leg.mode] || Car;
            const isEnded = leg.operating_status === 'ENDED';
            const isUnknown = leg.operating_status === 'UNKNOWN_AVAILABILITY';

            return (
              <div key={idx} className="relative group">
                {/* Node Dot */}
                <span
                  className={cn(
                    'absolute -left-5 top-1 flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-mono font-bold',
                    isEnded
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : leg.is_critical
                      ? 'border-noctra-accent bg-noctra-raised text-noctra-accent'
                      : 'border-noctra-border bg-noctra-surface text-noctra-muted'
                  )}
                >
                  {idx + 1}
                </span>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-noctra-text">
                      <LegIcon className="h-3.5 w-3.5 text-noctra-accent" />
                      <span>{leg.service_name}</span>
                      {leg.is_critical && (
                        <span className="text-[9px] font-mono px-1 rounded bg-noctra-accent/15 text-noctra-accent font-semibold">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-noctra-muted">
                      <span className="text-noctra-accent font-semibold">{leg.depart_time_hm}</span>
                      <span className="mx-1">&rarr;</span>
                      <span className="text-noctra-text font-semibold">{leg.arrive_time_hm}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-noctra-muted">
                    <span>{leg.origin_name} &rarr; {leg.destination_name}</span>
                    <span className="font-mono text-[10px]">
                      {(leg.distance_m / 1000).toFixed(1)} km · {leg.transit_duration_min.expected_min}m
                      {leg.wait_min > 0 ? ` (+${leg.wait_min}m wait)` : ''}
                    </span>
                  </div>

                  {/* Concise Lighting & Refuge meta */}
                  <div className="flex items-center justify-between text-[10px] text-noctra-muted pt-0.5">
                    <span>💡 {leg.lighting_quality || 'Standard lighting'}</span>
                    <span>🛡️ {leg.refuge_nearby || 'On-corridor refuge'}</span>
                  </div>

                  {isEnded && (
                    <div className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                      Service closed overnight. Next departure: 06:00 AM.
                    </div>
                  )}
                  {isUnknown && (
                    <div className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Zero live driver telemetry. Boarding unverified.
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
        <div className="pt-2 border-t border-noctra-border/60 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-noctra-text">
            <LifeBuoy className="h-3 w-3 text-noctra-accent" />
            <span>Fallback Options (Plan B Actions)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {recoveryOptions.map((opt) => (
              <div
                key={opt.id}
                className="rounded-lg border border-noctra-border bg-noctra-raised p-2 text-[11px] space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-noctra-text">
                  <span>{opt.title}</span>
                  <span className="font-mono text-[10px] text-noctra-accent">{opt.trigger_time_hm}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-noctra-muted">
                  <span>Arrives {opt.arrival_time_hm}</span>
                  <span className={opt.extra_cost_inr > 0 ? 'text-noctra-text' : 'text-emerald-400'}>
                    {opt.extra_cost_inr !== 0 ? `+₹${opt.extra_cost_inr}` : 'Free'}
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
