import { Moon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-noctra-raised border border-noctra-border">
        <Moon className="h-4 w-4 text-noctra-accent" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-noctra-text leading-tight">
            NOCTRA
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-noctra-muted leading-none">
            Night Decision Engine
          </span>
        </div>
      )}
    </div>
  );
}
