import React from 'react';
import { cn } from '@/lib/cn';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-medium',
        'rounded border border-noctra-border bg-noctra-raised text-noctra-muted shadow-xs',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
