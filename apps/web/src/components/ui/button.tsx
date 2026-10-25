import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noctra-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none min-h-[44px]',
  {
    variants: {
      variant: {
        default:
          'bg-noctra-accent text-noctra-bg font-semibold hover:bg-noctra-accent-hover shadow-sm',
        secondary:
          'bg-noctra-raised text-noctra-text hover:bg-noctra-border border border-noctra-border',
        outline:
          'border border-noctra-border bg-transparent text-noctra-text hover:bg-noctra-surface hover:text-noctra-accent',
        ghost:
          'text-noctra-muted hover:text-noctra-text hover:bg-noctra-surface',
        link: 'text-noctra-accent underline-offset-4 hover:underline min-h-0 p-0',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
