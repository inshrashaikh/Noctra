import type { Evidence } from '@noctra/contracts';
import { Drawer } from 'vaul';
import { X, ShieldAlert, Clock, Database, Info } from 'lucide-react';
import { formatAge } from '@/lib/format';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';

interface EvidenceDrawerProps {
  evidence: Evidence | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceDrawer({ evidence, isOpen, onClose }: EvidenceDrawerProps) {
  if (!evidence) return null;

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl border-t border-noctra-border bg-noctra-surface max-h-[85vh] p-6 text-noctra-text focus:outline-none">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-noctra-border" />

          <div className="flex items-center justify-between pb-4 border-b border-noctra-border">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-noctra-accent" />
              <Drawer.Title className="text-base font-bold text-noctra-text">
                Evidence Provenance & Decay Audit
              </Drawer.Title>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-noctra-muted hover:bg-noctra-raised hover:text-noctra-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4 overflow-y-auto">
            {/* Subject */}
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-noctra-muted">
                Observed Fact / Subject
              </div>
              <div className="text-base font-semibold text-noctra-text">{evidence.subject}</div>
            </div>

            {/* Label & Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-noctra-border bg-noctra-raised p-3">
                <div className="text-xs text-noctra-muted mb-1">Assigned Trust Label</div>
                <div className="text-sm font-bold font-mono text-noctra-accent flex items-center gap-2">
                  <span>{evidence.label}</span>
                  {evidence.simulated && <SimulatedBadge size="sm" />}
                </div>
              </div>

              <div className="rounded-lg border border-noctra-border bg-noctra-raised p-3">
                <div className="text-xs text-noctra-muted mb-1">Calculated Confidence</div>
                <div className="text-sm font-bold font-mono text-noctra-text">
                  {(evidence.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Source & Age */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-noctra-muted">
                <Database className="h-4 w-4" />
                <span>
                  Source: <strong className="text-noctra-text">{evidence.source}</strong> ({evidence.source_class})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-noctra-muted">
                <Clock className="h-4 w-4" />
                <span>
                  Age since observation: <strong className="font-mono text-noctra-text">{formatAge(evidence.age_s)}</strong> ({evidence.age_s} seconds)
                </span>
              </div>
            </div>

            {/* Supporting Reasons */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Underlying Evidence Factors ({evidence.reasons.length})
              </div>
              <ul className="space-y-2">
                {evidence.reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-noctra-border/60 bg-noctra-raised/40 p-3 text-xs leading-relaxed text-noctra-text"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
