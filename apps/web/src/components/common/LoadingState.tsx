import { cn } from '@/lib/cn';

interface LoadingStateProps {
  className?: string;
  count?: number;
}

export function LoadingState({ className, count = 3 }: LoadingStateProps) {
  return (
    <div className={cn('space-y-4 w-full', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-noctra-border bg-noctra-surface p-5 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-noctra-raised" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-noctra-raised" />
                <div className="h-3 w-16 rounded bg-noctra-raised/60" />
              </div>
            </div>
            <div className="h-6 w-20 rounded bg-noctra-raised" />
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-5 w-full rounded bg-noctra-raised/80" />
            <div className="h-2 w-full rounded bg-noctra-raised/40" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-noctra-border/40">
            <div className="h-4 w-32 rounded bg-noctra-raised/60" />
            <div className="h-4 w-16 rounded bg-noctra-raised/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
