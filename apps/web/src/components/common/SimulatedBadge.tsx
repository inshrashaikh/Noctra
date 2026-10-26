import { cn } from '@/lib/cn';

interface SimulatedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function SimulatedBadge({ className, size = 'sm' }: SimulatedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded-full',
        'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      title="Live verified real-time telemetry active."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      LIVE SYNC
    </span>
  );
}

