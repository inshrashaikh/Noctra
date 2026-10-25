import { cn } from '@/lib/cn';

interface RefugeGapStripProps {
  maxGapM: number;
  className?: string;
}

export function RefugeGapStrip({ maxGapM, className }: RefugeGapStripProps) {
  // Categorize gap risk
  const isHighGap = maxGapM > 1200;
  const isModerateGap = maxGapM > 600;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-[11px] text-noctra-muted font-mono">
        <span>24×7 Refuge Proximity</span>
        <span
          className={cn(
            isHighGap
              ? 'text-noctra-infeasible'
              : isModerateGap
              ? 'text-noctra-at-risk'
              : 'text-noctra-robust'
          )}
        >
          Max gap: {maxGapM}m
        </span>
      </div>

      <div className="flex h-1.5 w-full gap-0.5 rounded-full overflow-hidden bg-noctra-raised">
        <div className="h-full flex-1 bg-noctra-robust" title="Refuge within 300m" />
        <div className="h-full flex-1 bg-noctra-robust" title="Refuge within 300m" />
        <div
          className={cn(
            'h-full flex-1',
            isModerateGap ? 'bg-noctra-at-risk' : 'bg-noctra-robust'
          )}
          title="Refuge within 600m"
        />
        <div
          className={cn(
            'h-full flex-1',
            isHighGap
              ? 'bg-noctra-infeasible'
              : isModerateGap
              ? 'bg-noctra-at-risk'
              : 'bg-noctra-robust'
          )}
          title={isHighGap ? 'Refuge > 1200m' : 'Refuge within 600m'}
        />
      </div>
    </div>
  );
}
