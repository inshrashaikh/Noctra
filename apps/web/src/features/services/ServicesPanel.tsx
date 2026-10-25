import { useState } from 'react';
import type { Service, ServiceKind } from '@noctra/contracts';
import { ShieldCheck, Filter } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ServiceRow } from './ServiceRow';

interface ServicesPanelProps {
  services: Service[];
  className?: string;
}

const FILTER_KINDS: { id: ServiceKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'pharmacy', label: 'Pharmacies' },
  { id: 'police', label: 'Police' },
  { id: 'fuel', label: 'Fuel' },
];

export function ServicesPanel({ services, className }: ServicesPanelProps) {
  const [activeFilter, setActiveFilter] = useState<ServiceKind | 'all'>('all');

  const filtered =
    activeFilter === 'all'
      ? services
      : services.filter((s) => s.kind === activeFilter);

  return (
    <div
      className={cn(
        'rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-noctra-accent" />
          En-Route Safe Havens & Services ({filtered.length})
        </h4>
        <div className="flex items-center gap-1 text-[11px] text-noctra-muted">
          <Filter className="h-3 w-3" /> Filter
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_KINDS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveFilter(id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border select-none min-h-[32px]',
              activeFilter === id
                ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent'
                : 'border-noctra-border bg-noctra-raised text-noctra-muted hover:text-noctra-text'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
