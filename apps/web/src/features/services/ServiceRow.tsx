import React from 'react';
import type { Service } from '@noctra/contracts';
import { Hospital, Pill, Shield, Fuel, Landmark, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDistance } from '@/lib/format';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';

interface ServiceRowProps {
  service: Service;
  className?: string;
}

const KIND_ICONS: Record<string, React.FC<{ className?: string }>> = {
  hospital: Hospital,
  pharmacy: Pill,
  police: Shield,
  fuel: Fuel,
  atm: Landmark,
};

export function ServiceRow({ service, className }: ServiceRowProps) {
  const Icon = KIND_ICONS[service.kind] || Plus;

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border border-noctra-border bg-noctra-surface p-3 transition-colors hover:border-noctra-border/80 text-xs',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-noctra-border bg-noctra-raised text-noctra-accent shrink-0">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-noctra-text line-clamp-1">{service.name}</h5>
            {service.source_class === 'simulated' && <SimulatedBadge size="sm" />}
          </div>
          <p className="text-[11px] text-noctra-muted capitalize">
            {service.kind} • <span className="font-mono text-noctra-text">{formatDistance(service.distance_m)}</span> away
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono font-medium',
            service.hours_label.includes('24')
              ? 'bg-noctra-robust/10 border border-noctra-robust/30 text-noctra-robust'
              : 'bg-noctra-raised border border-noctra-border text-noctra-muted'
          )}
        >
          {service.hours_label}
        </span>
        <span className="text-[10px] font-mono text-noctra-muted">
          Trust: {service.label}
        </span>
      </div>
    </div>
  );
}
