import { useConnectivity } from './useConnectivity';
import { Wifi, AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';

export function TierBanner() {
  const { tier, isOnline } = useConnectivity();

  // Tier 0: Normal / Live
  if (tier === 0 && isOnline) {
    return (
      <aside aria-label="Connectivity status" className="flex items-center justify-between border-b border-noctra-border bg-noctra-surface px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-noctra-known animate-pulse" />
          <span className="font-medium text-noctra-text">Tier 0: Live Feed Active</span>
          <span className="text-noctra-muted text-[11px] font-mono">
            All telemetry streams operational (Nagpur Mesh)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-noctra-muted">
          <Wifi className="h-3 w-3 text-noctra-known" />
          <span>Connected</span>
        </div>
      </aside>
    );
  }

  // Tier 1: Feeds degraded
  if (tier === 1) {
    return (
      <aside aria-label="Connectivity warning" className="flex items-center justify-between border-b border-noctra-at-risk/40 bg-noctra-at-risk/10 px-4 py-2 text-xs text-noctra-at-risk">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
          <span className="font-bold">Tier 1: Partial Feed Outage</span>
          <span className="text-[11px] opacity-90">
            Falling back to cached baseline graphs. Timings marked OUTDATED.
          </span>
        </div>

        <span className="font-mono text-[11px] font-semibold">CACHED RECOVERY</span>
      </aside>
    );
  }

  // Tier 2: Offline / Server Unreachable
  return (
    <aside aria-label="Offline emergency alert" className="flex items-center justify-between border-b border-noctra-infeasible/50 bg-noctra-infeasible/15 px-4 py-2.5 text-xs text-noctra-infeasible animate-pulse">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        <span className="font-bold">Tier 2: Offline Mode (Server Unreachable)</span>
        <span className="text-[11px] opacity-90">
          Showing last known local plan. All dynamic confidence is UNKNOWN.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="tel:112"
          className="flex items-center gap-1.5 rounded bg-noctra-infeasible px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          Emergency: Call 112
        </a>
      </div>
    </aside>
  );
}
