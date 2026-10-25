import type { Eta } from '@noctra/contracts';
import { cn } from '@/lib/cn';

interface ScenarioEtaBarProps {
  eta: Eta;
  className?: string;
}

export function ScenarioEtaBar({ eta, className }: ScenarioEtaBarProps) {
  // Max scale reference: e.g. 60 min or max pessimistic
  const maxRef = Math.max(eta.pessimistic_min * 1.25, 45);

  const optPct = Math.min(100, Math.round((eta.optimistic_min / maxRef) * 100));
  const expPct = Math.min(100, Math.round((eta.expected_min / maxRef) * 100));
  const pessPct = Math.min(100, Math.round((eta.pessimistic_min / maxRef) * 100));

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-[11px] font-mono text-noctra-muted">
        <span>Opt: {eta.optimistic_min}m</span>
        <span className="font-semibold text-noctra-text">Exp: {eta.expected_min}m</span>
        <span>Pess: {eta.pessimistic_min}m</span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-noctra-raised overflow-hidden">
        {/* Pessimistic band (wider, dim) */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-noctra-accent/30 rounded-full"
          style={{ width: `${pessPct}%` }}
        />
        {/* Expected band */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-noctra-accent rounded-full"
          style={{ width: `${expPct}%` }}
        />
        {/* Optimistic indicator */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-noctra-known rounded-full"
          style={{ width: `${optPct}%` }}
        />
      </div>
    </div>
  );
}
