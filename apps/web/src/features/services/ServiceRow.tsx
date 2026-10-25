import React from 'react';
import type { Service, Evidence } from '@noctra/contracts';
import {
  Hospital,
  Pill,
  Shield,
  Fuel,
  Landmark,
  Utensils,
  Coffee,
  Droplet,
  Home,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDistance } from '@/lib/format';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';

interface ServiceRowProps {
  service: Service;
  className?: string;
  onSelectEvidence?: (evidence: Evidence) => void;
}

const KIND_ICONS: Record<string, React.FC<{ className?: string }>> = {
  hospital: Hospital,
  pharmacy: Pill,
  police: Shield,
  fuel: Fuel,
  atm: Landmark,
  restaurant: Utensils,
  dhaba: Utensils,
  chai_stall: Coffee,
  canteen_24h: Coffee,
  water: Droplet,
  shelter: Home,
};

export function ServiceRow({ service, className, onSelectEvidence }: ServiceRowProps) {
  const Icon = KIND_ICONS[service.kind] || MapPin;

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
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-noctra-border bg-noctra-surface p-3 transition-colors hover:border-noctra-border/80 text-xs',
        service.deadline_feasible === false && 'border-rose-500/30 bg-rose-950/10',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-noctra-border bg-noctra-raised text-noctra-accent shrink-0">
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h5 className="font-semibold text-noctra-text truncate max-w-[200px] sm:max-w-xs">
                {service.name}
              </h5>
              {service.source_class === 'simulated' && <SimulatedBadge size="sm" />}
              {service.verified_hours && (
                <span className="rounded bg-teal-500/10 border border-teal-500/30 px-1 py-0.2 text-[9px] font-mono text-teal-400">
                  VERIFIED
                </span>
              )}
            </div>
            <p className="text-[11px] text-noctra-muted capitalize">
              {service.kind.replace('_', ' ')} •{' '}
              <span className="font-mono text-noctra-text">
                {formatDistance(service.distance_m)}
              </span>{' '}
              away
              {service.detour_min !== undefined && (
                <span className="text-noctra-muted ml-1.5 font-mono">
                  (+{service.detour_min}m detour)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-medium border text-right',
              statusBadgeConfig.classes
            )}
          >
            {statusBadgeConfig.text}
          </span>
          {service.slack_impact_min !== undefined && (
            <span
              className={cn(
                'text-[10px] font-mono flex items-center gap-1',
                service.deadline_feasible === false ? 'text-rose-400' : 'text-noctra-muted'
              )}
            >
              {service.deadline_feasible === false && <AlertTriangle className="h-2.5 w-2.5" />}
              Slack: {service.slack_impact_min}m
            </span>
          )}
        </div>
      </div>

      {/* Epistemic Evidence Pills */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-noctra-border/50 text-[10px] font-mono text-noctra-muted">
        <div className="flex items-center gap-2">
          {service.listing_evidence && (
            <button
              type="button"
              onClick={() => onSelectEvidence?.(service.listing_evidence!)}
              className="hover:text-noctra-accent transition-colors underline decoration-dotted"
            >
              Listing: <span className="font-semibold text-noctra-text">{service.listing_evidence.label}</span>
            </button>
          )}
          {service.opening_evidence && (
            <button
              type="button"
              onClick={() => onSelectEvidence?.(service.opening_evidence!)}
              className="hover:text-noctra-accent transition-colors underline decoration-dotted"
            >
              Hours: <span className="font-semibold text-noctra-text">{service.opening_evidence.label}</span>
            </button>
          )}
        </div>
        <div className="truncate max-w-[200px] text-[10px] text-noctra-dim">
          {service.source}
        </div>
      </div>
    </div>
  );
}
