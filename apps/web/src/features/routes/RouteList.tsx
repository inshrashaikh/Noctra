import type { Candidate } from '@noctra/contracts';
import { RouteCard } from './RouteCard';
import { useRouteSelection } from './useRouteSelection';
import { EmptyState } from '@/components/common/EmptyState';

interface RouteListProps {
  candidates: Candidate[];
  className?: string;
}

export function RouteList({ candidates, className }: RouteListProps) {
  const { selectedRouteId, setSelectedRouteId } = useRouteSelection();

  if (!candidates || candidates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-noctra-muted">
          Evaluated Route Options ({candidates.length})
        </h3>
        <span className="text-[11px] font-mono text-noctra-muted">
          Ordered by slack buffer
        </span>
      </div>

      <div className="space-y-3">
        {candidates.map((candidate) => (
          <RouteCard
            key={candidate.id}
            candidate={candidate}
            isSelected={candidate.id === selectedRouteId}
            onSelect={() => setSelectedRouteId(candidate.id)}
          />
        ))}
      </div>
    </div>
  );
}
