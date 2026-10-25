import { useAlerts } from './useAlerts';
import { AlertToast } from './AlertToast';
import { SimulatedBadge } from '@/components/common/SimulatedBadge';
import { X, Bell, Trash2 } from 'lucide-react';

export function AlertsDrawer() {
  const { alerts, isDrawerOpen, setIsDrawerOpen, dismissAlert, clearAll } = useAlerts();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div
        className="fixed inset-0"
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-noctra-border bg-noctra-surface text-noctra-text shadow-xl">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-noctra-border px-6">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-noctra-accent" />
            <h3 className="text-sm font-semibold tracking-wide text-noctra-text">
              Situational Alerts
            </h3>
            <SimulatedBadge size="sm" />
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-noctra-muted hover:bg-noctra-raised hover:text-noctra-text transition-colors"
            aria-label="Close alerts drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Subheader info note */}
        <div className="border-b border-noctra-border bg-noctra-raised/40 px-6 py-2.5 text-[11px] text-noctra-muted">
          Environmental risk proxy (not crime data). Real-time road closures, transit status, and lighting disruptions.
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-noctra-muted">
              <Bell className="h-8 w-8 text-noctra-dim mb-2 stroke-[1.5]" />
              <p className="text-xs">No active alerts at this time.</p>
              <p className="text-[11px] text-noctra-dim mt-1">Corridor monitoring is active.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertToast
                key={alert.id}
                alert={alert}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="flex items-center justify-between border-t border-noctra-border px-6 py-3 bg-noctra-surface">
            <span className="font-mono text-xs text-noctra-muted">
              {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-xs text-noctra-muted hover:text-noctra-text transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
