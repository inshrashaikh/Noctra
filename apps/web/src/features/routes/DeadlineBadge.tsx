import type { CandidateStatus, Slack } from '@noctra/contracts';
import { cn } from '@/lib/cn';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface DeadlineBadgeProps {
  status: CandidateStatus;
  slack: Slack;
  className?: string;
}

export function DeadlineBadge({ status, slack, className }: DeadlineBadgeProps) {
  if (status === 'ROBUST') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold',
          'bg-noctra-robust/10 border border-noctra-robust/30 text-noctra-robust',
          className
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>
          ON TIME, <strong className="font-mono">{slack.pessimistic} min</strong> spare (worst case)
        </span>
      </span>
    );
  }

  if (status === 'AT_RISK') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold',
          'bg-noctra-at-risk/10 border border-noctra-at-risk/30 text-noctra-at-risk',
          className
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>
          AT RISK, only <strong className="font-mono">{slack.pessimistic} min</strong> worst-case buffer
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold',
        'bg-noctra-infeasible/10 border border-noctra-infeasible/30 text-noctra-infeasible',
        className
      )}
    >
      <XCircle className="h-3.5 w-3.5" />
      <span>
        INFEASIBLE (<strong className="font-mono">{Math.abs(slack.pessimistic)} min</strong> past deadline)
      </span>
    </span>
  );
}
