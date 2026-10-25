import { useAlerts } from './useAlerts';
import { AlertToast } from './AlertToast';
import { Bell, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AlertCenterProps {
  className?: string;
}

export function AlertCenter({ className }: AlertCenterProps) {
  const { alerts, dismissAlert, clearAll } = useAlerts();

  if (alerts.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-xl border border-noctra-border bg-noctra-surface p-4 space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-noctra-muted flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-noctra-accent" />
          Active Situational Alerts ({alerts.length})
        </h4>
        <button
          onClick={clearAll}
          className="text-[11px] text-noctra-muted hover:text-noctra-text flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" /> Clear
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {alerts.map((alert) => (
          <AlertToast
            key={alert.id}
            alert={alert}
            onDismiss={() => dismissAlert(alert.id)}
          />
        ))}
      </div>
    </div>
  );
}
