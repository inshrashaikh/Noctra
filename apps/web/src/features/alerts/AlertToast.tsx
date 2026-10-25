import type { AlertEvent } from '@/types/domain';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';

interface AlertToastProps {
  alert: AlertEvent;
  onDismiss: () => void;
  className?: string;
}

export function AlertToast({ alert, onDismiss, className }: AlertToastProps) {
  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  return (
    <div
      className={cn(
        'flex items-start justify-between rounded-lg border p-3 text-xs shadow-md space-x-2',
        isCritical
          ? 'border-noctra-infeasible/50 bg-noctra-infeasible/15 text-noctra-text'
          : isWarning
          ? 'border-noctra-at-risk/50 bg-noctra-at-risk/15 text-noctra-text'
          : 'border-noctra-border bg-noctra-raised text-noctra-text',
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        {isCritical ? (
          <AlertCircle className="h-4 w-4 text-noctra-infeasible shrink-0 mt-0.5" />
        ) : isWarning ? (
          <AlertTriangle className="h-4 w-4 text-noctra-at-risk shrink-0 mt-0.5" />
        ) : (
          <Info className="h-4 w-4 text-noctra-probable shrink-0 mt-0.5" />
        )}

        <div>
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <span>{alert.title}</span>
            {alert.source_class === 'simulated' && <SimulatedBadge size="sm" />}
          </div>
          <p className="text-noctra-muted leading-relaxed">{alert.body}</p>
        </div>
      </div>

      {alert.dismissible && (
        <button
          onClick={onDismiss}
          className="text-noctra-muted hover:text-noctra-text shrink-0 p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
