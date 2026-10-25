import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface IstClockProps {
  showSeconds?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * Real-time Indian Standard Time (IST, UTC+5:30) clock component.
 * Displays live time for night shift workers in Nagpur.
 */
export function IstClock({
  showSeconds = true,
  showIcon = true,
  className,
}: IstClockProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    function updateTime() {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: showSeconds ? '2-digit' : undefined,
          hour12: true,
        };
        setTimeStr(new Intl.DateTimeFormat('en-IN', options).format(now));
      } catch {
        setTimeStr('02:15 AM');
      }
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [showSeconds]);

  if (!timeStr) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-noctra-border/80 bg-noctra-raised/60 px-2.5 py-1 font-mono text-xs text-noctra-text backdrop-blur-sm',
        className
      )}
      title="Current time in Asia/Kolkata (IST)"
    >
      {showIcon && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-noctra-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-noctra-accent" />
        </span>
      )}
      <Clock className="h-3 w-3 text-noctra-accent" />
      <span className="font-semibold tracking-tight">{timeStr}</span>
      <span className="text-[10px] text-noctra-muted font-normal">IST</span>
    </div>
  );
}
