import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ErrorStateProps {
  title?: string;
  error?: string | Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Failed to load route decisions',
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-noctra-infeasible/30 bg-noctra-infeasible/5',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-noctra-infeasible/20 text-noctra-infeasible mb-4">
        <AlertCircle className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-noctra-text mb-1">{title}</h3>
      {errorMessage && (
        <p className="text-sm font-mono text-noctra-muted max-w-sm mb-4">
          {errorMessage}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-noctra-raised hover:bg-noctra-border text-noctra-text transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}
