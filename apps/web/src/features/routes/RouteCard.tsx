import React from 'react';
import type { Candidate } from '@noctra/contracts';
import { Car, Bike, Footprints, Bus, Shield, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { ScenarioEtaBar } from './ScenarioEtaBar';
import { DeadlineBadge } from './DeadlineBadge';
import { PlanBCard } from './PlanBCard';
import { RefugeGapStrip } from './RefugeGapStrip';

interface RouteCardProps {
  candidate: Candidate;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

const MODE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  auto: Car,
  cab: Car,
  two_wheeler: Bike,
  walk: Footprints,
  transit: Bus,
};

export function RouteCard({
  candidate,
  isSelected = false,
  onSelect,
  className,
}: RouteCardProps) {
  const Icon = MODE_ICONS[candidate.mode] || Car;
  const isRejected = candidate.rejected;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative rounded-md border p-4 transition-colors cursor-pointer select-none space-y-3',
        isSelected
          ? 'border-noctra-accent bg-noctra-raised'
          : 'border-noctra-border bg-noctra-surface hover:bg-noctra-raised/50',
        isRejected && 'opacity-65 border-dashed bg-noctra-bg',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border',
              isSelected
                ? 'border-noctra-accent/50 bg-noctra-accent/15 text-noctra-accent'
                : 'border-noctra-border bg-noctra-raised text-noctra-text'
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold capitalize text-noctra-text">
                {candidate.mode.replace('_', ' ')}
              </h4>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-noctra-raised border border-noctra-border text-noctra-muted uppercase">
                {candidate.kind}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-noctra-muted">
              <span>{(candidate.distance_m / 1000).toFixed(1)} km journey</span>
              {candidate.fare_estimate_text && (
                <>
                  <span>•</span>
                  <span className="text-noctra-text font-medium">{candidate.fare_estimate_text}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <DeadlineBadge status={candidate.status} slack={candidate.slack_min} />
          {candidate.evidence.some((e) => e.simulated) && <SimulatedBadge size="sm" />}
        </div>
      </div>

      {/* Operating Availability & Last Service / Latest Departure */}
      {candidate.operating_note && (
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-xs border-t border-noctra-border/40">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border',
              candidate.operating_note.includes('UNKNOWN')
                ? 'border-dashed border-noctra-unknown/50 bg-noctra-unknown/15 text-noctra-unknown font-semibold'
                : candidate.rejected || candidate.operating_note.toLowerCase().includes('ended')
                ? 'border-noctra-infeasible/30 bg-noctra-infeasible/10 text-noctra-infeasible font-semibold'
                : 'border-noctra-border bg-noctra-raised text-noctra-accent font-semibold'
            )}
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span>{candidate.operating_note}</span>
          </span>

          {candidate.latest_feasible_departure_iso && (
            <span className="text-[11px] font-mono text-noctra-muted">
              Latest dep: <strong className="text-noctra-text">{candidate.latest_feasible_departure_iso.slice(11, 16)}</strong>
            </span>
          )}
        </div>
      )}

      {/* ETA Bars */}
      <ScenarioEtaBar eta={candidate.eta} />

      {/* Environmental Risk Proxy */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-noctra-border/50">
        <div className="flex items-center gap-1.5 text-noctra-muted text-[11px]">
          <Shield className="h-3.5 w-3.5 text-noctra-accent" />
          <span>Environmental risk proxy (not crime data):</span>
        </div>
        <span className="font-mono text-xs font-semibold text-noctra-text">
          {(candidate.risk.score * 100).toFixed(0)}/100
        </span>
      </div>

      {/* Refuge Gap Proximity Strip */}
      <RefugeGapStrip maxGapM={candidate.risk.max_gap_m} />

      {/* Plan B if exists */}
      {candidate.plan_b && <PlanBCard planB={candidate.plan_b} />}

      {/* Rejection notice if rejected */}
      {isRejected && candidate.reject_reasons.length > 0 && (
        <div className="rounded-lg bg-noctra-infeasible/10 p-2.5 text-xs text-noctra-infeasible flex items-start gap-2 border border-noctra-infeasible/20">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Rejected candidate: </span>
            {candidate.reject_reasons.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
