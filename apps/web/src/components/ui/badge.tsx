import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-noctra-accent focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-noctra-accent text-noctra-bg shadow-sm',
        secondary:
          'border-noctra-border bg-noctra-raised text-noctra-text',
        outline: 'border-noctra-border text-noctra-text',
        robust:
          'border-noctra-robust/30 bg-noctra-robust/10 text-noctra-robust',
        atRisk:
          'border-noctra-at-risk/30 bg-noctra-at-risk/10 text-noctra-at-risk',
        infeasible:
          'border-noctra-infeasible/30 bg-noctra-infeasible/10 text-noctra-infeasible',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
