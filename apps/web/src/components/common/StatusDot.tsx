import { cn } from '@/lib/cn';
import type { EvidenceLabel, CandidateStatus } from '@noctra/contracts';

type DotStatus = EvidenceLabel | CandidateStatus | 'online' | 'offline' | 'warning';

interface StatusDotProps {
  status: DotStatus;
  className?: string;
  pulse?: boolean;
}

const STATUS_COLORS: Record<DotStatus, string> = {
  KNOWN: 'bg-noctra-known',
  PROBABLE: 'bg-noctra-probable',
  OUTDATED: 'bg-noctra-outdated',
  UNKNOWN: 'bg-noctra-unknown',
  ROBUST: 'bg-noctra-robust',
  AT_RISK: 'bg-noctra-at-risk',
  INFEASIBLE: 'bg-noctra-infeasible',
  online: 'bg-noctra-known',
  offline: 'bg-noctra-infeasible',
  warning: 'bg-noctra-outdated',
};

export function StatusDot({ status, className, pulse = false }: StatusDotProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-noctra-muted';

  return (
    <span className="relative inline-flex items-center justify-center h-2.5 w-2.5">
      {pulse && (
        <span
          className={cn(
            'absolute h-full w-full rounded-full opacity-75 animate-ping',
            colorClass
          )}
        />
      )}
      <span className={cn('h-2 w-2 rounded-full', colorClass, className)} />
    </span>
  );
}
