import type { PlanB } from '@noctra/contracts';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PlanBCardProps {
  planB: PlanB | null;
  className?: string;
}

export function PlanBCard({ planB, className }: PlanBCardProps) {
  if (!planB) return null;

  return (
    <div
      className={cn(
        'rounded-lg border border-noctra-border/60 bg-noctra-raised/40 p-3 text-xs space-y-1.5',
        className
      )}
    >
      <div className="flex items-center justify-between text-noctra-accent font-semibold">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" />
          Plan B Fallback ({planB.mode})
        </span>
        <span className="font-mono text-[11px] text-noctra-muted">
          Exp: {planB.eta.expected_min}m
        </span>
      </div>

      <p className="text-noctra-text leading-snug">{planB.description}</p>

      <div className="flex items-center gap-1 text-[11px] text-noctra-muted pt-1">
        <span className="text-noctra-at-risk font-medium">Trigger:</span>
        <span>{planB.trigger}</span>
      </div>
    </div>
  );
}
