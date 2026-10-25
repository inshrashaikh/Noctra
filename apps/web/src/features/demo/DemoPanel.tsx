import {
  FastForward,
  WifiOff,
  Wifi,
  AlertOctagon,
  CheckCircle,
  Car,
  Clock,
  Sparkles,
} from 'lucide-react';
import { planService } from '@/services';
import { useConnectivity } from '@/features/connectivity/useConnectivity';
import { cn } from '@/lib/cn';

interface DemoPanelProps {
  onScenarioTriggered?: () => void;
  className?: string;
}

export function DemoPanel({ onScenarioTriggered, className }: DemoPanelProps) {
  const { setTier } = useConnectivity();

  const handleSim = async (type: string, payload?: any) => {
    if (type === 'network_kill' || type === 'feed_outage') {
      setTier(2);
    } else if (type === 'network_restore' || type === 'feed_restore' || type === 'clear_closure') {
      setTier(0);
    }

    if (planService.sendSimEvent) {
      await planService.sendSimEvent({ type: type as any, payload });
      onScenarioTriggered?.();
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-noctra-accent/40 bg-noctra-raised p-4 text-xs space-y-3 shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-noctra-border pb-2">
        <div className="flex items-center gap-1.5 font-bold text-noctra-accent">
          <Sparkles className="h-4 w-4" />
          Interactive Demo Controls (?demo=1)
        </div>
        <span className="font-mono text-[10px] text-noctra-muted">
          Scenario Simulator
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Road Closure */}
        <button
          onClick={() => handleSim('closure')}
          className="flex items-center gap-2 rounded-lg border border-noctra-at-risk/40 bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-at-risk transition-colors min-h-[44px]"
        >
          <AlertOctagon className="h-4 w-4 text-noctra-at-risk shrink-0" />
          <div>
            <div className="font-bold">Inject Closure</div>
            <div className="text-[10px] text-noctra-muted">Wardha Rd burst pipe</div>
          </div>
        </button>

        {/* Clear Closure */}
        <button
          onClick={() => handleSim('clear_closure')}
          className="flex items-center gap-2 rounded-lg border border-noctra-border bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-known transition-colors min-h-[44px]"
        >
          <CheckCircle className="h-4 w-4 text-noctra-known shrink-0" />
          <div>
            <div className="font-bold">Clear Hazard</div>
            <div className="text-[10px] text-noctra-muted">Restore direct route</div>
          </div>
        </button>

        {/* Ride Unknown */}
        <button
          onClick={() => handleSim('ride_unavailable')}
          className="flex items-center gap-2 rounded-lg border border-noctra-border bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-unknown transition-colors min-h-[44px]"
        >
          <Car className="h-4 w-4 text-noctra-unknown shrink-0" />
          <div>
            <div className="font-bold">Ride UNKNOWN</div>
            <div className="text-[10px] text-noctra-muted">Auto availability drops</div>
          </div>
        </button>

        {/* Ride Available */}
        <button
          onClick={() => handleSim('ride_available')}
          className="flex items-center gap-2 rounded-lg border border-noctra-border bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-accent transition-colors min-h-[44px]"
        >
          <Car className="h-4 w-4 text-noctra-accent shrink-0" />
          <div>
            <div className="font-bold">Ride Available</div>
            <div className="text-[10px] text-noctra-muted">Feeds respond normally</div>
          </div>
        </button>

        {/* Clock +10m */}
        <button
          onClick={() => handleSim('clock_advance', { minutes: 10 })}
          className="flex items-center gap-2 rounded-lg border border-noctra-border bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-accent transition-colors min-h-[44px]"
        >
          <Clock className="h-4 w-4 text-noctra-accent shrink-0" />
          <div>
            <div className="font-bold">Advance Clock +10m</div>
            <div className="text-[10px] text-noctra-muted">Decays fact freshness</div>
          </div>
        </button>

        {/* Clock +25m */}
        <button
          onClick={() => handleSim('clock_advance', { minutes: 25 })}
          className="flex items-center gap-2 rounded-lg border border-noctra-border bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-accent transition-colors min-h-[44px]"
        >
          <FastForward className="h-4 w-4 text-noctra-accent shrink-0" />
          <div>
            <div className="font-bold">Advance Clock +25m</div>
            <div className="text-[10px] text-noctra-muted">Triggers Plan B deadline</div>
          </div>
        </button>

        {/* Network Kill (Tier 2) */}
        <button
          onClick={() => handleSim('network_kill')}
          className="flex items-center gap-2 rounded-lg border border-noctra-infeasible/40 bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-infeasible transition-colors min-h-[44px]"
        >
          <WifiOff className="h-4 w-4 text-noctra-infeasible shrink-0" />
          <div>
            <div className="font-bold">Simulate Tier 2</div>
            <div className="text-[10px] text-noctra-muted">Offline + 112 mode</div>
          </div>
        </button>

        {/* Network Restore (Tier 0) */}
        <button
          onClick={() => handleSim('network_restore')}
          className="flex items-center gap-2 rounded-lg border border-noctra-known/40 bg-noctra-surface p-2.5 text-left text-noctra-text hover:border-noctra-known transition-colors min-h-[44px]"
        >
          <Wifi className="h-4 w-4 text-noctra-known shrink-0" />
          <div>
            <div className="font-bold">Restore Tier 0</div>
            <div className="text-[10px] text-noctra-muted">Back online</div>
          </div>
        </button>
      </div>
    </div>
  );
}
