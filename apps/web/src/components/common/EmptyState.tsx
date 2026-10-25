import React from 'react';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No routes calculated',
  description = 'Enter your shift end time and destination to discover feasible night routes.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-noctra-border bg-noctra-surface/40',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-noctra-raised text-noctra-accent mb-4">
        <Compass className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-noctra-text mb-1">{title}</h3>
      <p className="text-sm text-noctra-muted max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
