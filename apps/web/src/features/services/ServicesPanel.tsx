import { useState } from 'react';
import type { Service, Evidence, NeedType } from '@noctra/contracts';
import { ShieldCheck, Filter, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ServiceRow } from './ServiceRow';
import { EvidenceDrawer } from '@/features/evidence/EvidenceDrawer';

interface ServicesPanelProps {
  services: Service[];
  className?: string;
  selectedNeed?: NeedType | 'all';
  onSelectNeed?: (need: NeedType | 'all') => void;
}

const NEED_TABS: { id: NeedType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'medicine', label: 'Medicine' },
  { id: 'food', label: 'Food / Dhaba' },
  { id: 'fuel', label: 'Fuel / EV' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'water', label: 'Water' },
];

export function ServicesPanel({
  services,
  className,
  selectedNeed: externalNeed,
  onSelectNeed: externalOnSelectNeed,
}: ServicesPanelProps) {
  const [internalNeed, setInternalNeed] = useState<NeedType | 'all'>('all');
  const activeNeed = externalNeed ?? internalNeed;
  const setNeed = externalOnSelectNeed ?? setInternalNeed;

  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const filtered = services.filter((s) => {
    if (activeNeed === 'all') return true;
    if (activeNeed === 'medicine') return s.kind === 'pharmacy' || s.kind === 'hospital';
    if (activeNeed === 'food') {
      return (
        s.kind === 'restaurant' ||
        s.kind === 'dhaba' ||
        s.kind === 'chai_stall' ||
        s.kind === 'canteen_24h'
      );
    }
    if (activeNeed === 'fuel') return s.kind === 'fuel';
    if (activeNeed === 'emergency') return s.kind === 'hospital' || s.kind === 'police';
    if (activeNeed === 'water') return s.kind === 'water' || s.kind === 'canteen_24h';
    return true;
  });

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
          <Filter className="h-3 w-3" /> Need
        </div>
      </div>

      {/* Need Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {NEED_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setNeed(id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border select-none min-h-[32px]',
              activeNeed === id
                ? 'border-noctra-accent bg-noctra-accent/15 text-noctra-accent font-semibold'
                : 'border-noctra-border bg-noctra-raised text-noctra-muted hover:text-noctra-text'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-noctra-border/60 bg-noctra-raised/50 p-4 text-center">
            <AlertCircle className="mx-auto h-5 w-5 text-amber-400 mb-1.5" />
            <p className="text-xs font-medium text-noctra-text">
              No sufficiently supported option found for this need
            </p>
            <p className="text-[11px] text-noctra-muted mt-0.5">
              No verified 24/7 locations match your arrival time and deadline bounds.
            </p>
          </div>
        ) : (
          filtered.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onSelectEvidence={setSelectedEvidence}
            />
          ))
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
