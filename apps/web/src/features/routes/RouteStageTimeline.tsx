import { useState } from 'react';
import type { Candidate } from '@noctra/contracts';
import {
  Shield,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface RouteStageTimelineProps {
  candidate: Candidate;
  shiftEndTime?: string;
  deadlineTime?: string;
}

export function RouteStageTimeline({
  candidate,
  shiftEndTime = '02:15',
  deadlineTime = '03:00',
}: RouteStageTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Derive dynamic waypoints from candidate mode and risk
  const isTransit = candidate.mode === 'transit';
  const isAuto = candidate.mode === 'auto';

  const stages = [
    {
      time: shiftEndTime,
      label: 'Departure: Shift Concludes',
      description: 'Exit workplace corridor. Pinned departure point.',
      status: 'KNOWN',
      lighting: 'Well-lit perimeter',
      refuge: 'On-site facility security',
      isDecisionPoint: false,
    },
    {
      time: '02:22',
      label: isTransit
        ? 'Board Orange Line Metro Feeder'
        : isAuto
        ? 'Wardha Road Arterial Corridor'
        : 'Medical Square Lit Pedestrian Way',
      description: isTransit
        ? 'Sitabuldi Interchange station platform'
        : 'Broad illuminated road with active sensor lighting',
      status: 'KNOWN',
      lighting: '92% verified lighting fixtures',
      refuge: 'Sitabuldi Police Assistance Booth (320m)',
      isDecisionPoint: false,
    },
    {
      time: '02:28',
      label: 'Critical "Decide By" Gateway',
      description: candidate.plan_b
        ? `Pivot point: If primary mode stalls, activate Plan B (${candidate.plan_b.mode.toUpperCase()}) immediately.`
        : 'Last regular transit connection window.',
      status: 'PROBABLE',
      lighting: 'Signalised intersection',
      refuge: '24×7 Fuel Station & Convenience (410m)',
      isDecisionPoint: true,
    },
    {
      time: '02:37',
      label: 'Final Mile Approach Corridor',
      description: 'Transition from main road onto local neighborhood collector.',
      status: 'PROBABLE',
      lighting: 'Semi-lit residential streetlamps',
      refuge: 'Apollo 24×7 Pharmacy (480m)',
      isDecisionPoint: false,
    },
    {
      time: candidate.status === 'ROBUST' ? '02:44' : '02:52',
      label: 'Destination Doorstep',
      description: `Target deadline: ${deadlineTime} AM (${candidate.slack_min.expected} min slack buffer remaining).`,
      status: 'KNOWN',
      lighting: 'Home destination',
      refuge: 'Safe Arrival Check-in required',
      isDecisionPoint: false,
    },
  ];

  return (
    <div className="rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-noctra-accent" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-noctra-text">
            En-Route Waypoint Safety Timeline
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
        Waypoint safety breakdown: verified lighting corridors, refuge proximity, and
        the hard decide-by pivot gateway.
      </p>

      {/* Timeline Steps */}
      {isExpanded && (
        <div className="relative pl-6 space-y-4 pt-2 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-noctra-border">
          {stages.map((stage, idx) => (
            <div key={idx} className="relative group">
              {/* Dot Icon */}
              <span
                className={cn(
                  'absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[9px] font-bold',
                  stage.isDecisionPoint
                    ? 'border-noctra-accent bg-noctra-accent text-noctra-bg'
                    : idx === stages.length - 1
                    ? 'border-noctra-known bg-noctra-known/20 text-noctra-known'
                    : 'border-noctra-border bg-noctra-raised text-noctra-text'
                )}
              >
                {stage.isDecisionPoint ? '!' : idx + 1}
              </span>

              {/* Stage Content */}
              <div
                className={cn(
                  'p-2.5 rounded-lg border text-xs space-y-1',
                  stage.isDecisionPoint
                    ? 'border-noctra-accent/60 bg-noctra-accent/10'
                    : 'border-noctra-border/60 bg-noctra-raised/40'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-noctra-accent">
                      {stage.time}
                    </span>
                    <span className="font-semibold text-noctra-text">
                      {stage.label}
                    </span>
                  </div>

                  <span
                    className={cn(
                      'font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border',
                      stage.status === 'KNOWN'
                        ? 'border-noctra-known/40 bg-noctra-known/15 text-noctra-known'
                        : 'border-noctra-probable/40 bg-noctra-probable/15 text-noctra-probable'
                    )}
                  >
                    {stage.status}
                  </span>
                </div>

                <p className="text-noctra-muted text-[11px] leading-relaxed">
                  {stage.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-noctra-border/40 text-[10px] text-noctra-muted">
                  <div className="flex items-center gap-1">
                    <span className="text-noctra-known">💡</span>
                    <span className="truncate">{stage.lighting}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-noctra-accent shrink-0" />
                    <span className="truncate">{stage.refuge}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
